import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveVideo } from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

// ── Video URL helpers ─────────────────────────────────────────────────────────
// Mirrors the logic in SafetyAssessment.jsx exactly, so both pages treat the
// Admin-managed induction video identically.
const isYouTubeUrl = (url) => /youtu\.?be/i.test(url || "");

const getYouTubeEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
};

// Resolves a video URL against the backend's origin when it's a relative
// path (i.e. an uploaded file, served at /uploads/videos/... from the
// backend) — YouTube/external links are already absolute and pass through
// unchanged. Without this, uploaded videos 404 because the browser
// resolves a relative src against the frontend's own origin instead.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");
const resolveVideoUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // already absolute
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
};

// ── Safety Video Modal ─────────────────────────────────────────────────────────
function SafetyVideoModal({ plantId, onClose, onComplete }) {
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [video, setVideo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getActiveVideo(plantId);
        if (!cancelled) setVideo(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plantId]);

  const rawUrl = video?.url || null;
  const url = rawUrl ? resolveVideoUrl(rawUrl) : null;
  const embedUrl = url && isYouTubeUrl(url) ? getYouTubeEmbedUrl(url) : null;

  // No video configured at all — don't block the visitor indefinitely.
  const noVideoConfigured = !loading && !loadError && !url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onWheel={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-3xl mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-400" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {video?.title || "Site Safety Induction Video"}
              </h3>
              <p className="text-slate-400 text-xs">Mandatory — watch before entering the site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-700 text-slate-400 hover:text-red-400 text-xs font-medium transition"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancel
          </button>
        </div>

        {/* Video */}
        <div
          className="relative bg-black overflow-hidden flex items-center justify-center"
          style={{ aspectRatio: "16/9" }}
          onWheel={(e) => e.stopPropagation()}
        >
          {loading ? (
            <p className="text-slate-500 text-sm">Loading induction video…</p>
          ) : loadError ? (
            <p className="text-red-400 text-sm px-6 text-center">Couldn't load the induction video ({loadError}).</p>
          ) : noVideoConfigured ? (
            <p className="text-slate-500 text-sm px-6 text-center">No induction video is configured yet.</p>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title="Site Safety Induction"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              onLoad={() => {
                setTimeout(() => setWatched(true), 5000);
              }}
            />
          ) : (
            <video
              src={url}
              controls
              autoPlay
              className="absolute inset-0 w-full h-full"
              onEnded={() => setWatched(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700 bg-slate-900/80">
          <p className="text-slate-500 text-xs">
            {noVideoConfigured
              ? "✅ You may proceed to the assessment."
              : watched
              ? "✅ You may now proceed to the assessment."
              : "⏳ Please watch the full video before proceeding."}
          </p>
          <button
            onClick={onComplete}
            disabled={!watched && !noVideoConfigured}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-500 text-sm font-semibold transition"
          >
            Confirm & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-white mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}

// ── Visitor Dashboard ──────────────────────────────────────────────────────────
export default function VisitorDashboard({ visitor, inducted, onSignOut }) {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const v = visitor || {
    name: "Guest Visitor",
    phone: "—",
    company: "",
    purpose: "Meeting",
    host: "—",
  };

  const plantId = v?.plant?._id || v?.plant;

  // Use the real check-in/registration timestamp from the backend rather than "now".
  const checkInMoment = new Date(v.checkedInAt || v.registeredAt || Date.now());
  const checkInTime = checkInMoment.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const checkInDate = checkInMoment.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const handleSignOut = () => {
    onSignOut?.();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showVideo && (
        <SafetyVideoModal
          plantId={plantId}
          onClose={() => setShowVideo(false)}
          onComplete={() => {
            setShowVideo(false);
            navigate("/assessment"); // ✅ navigate to assessment after video
          }}
        />
      )}

      {/* Top nav */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <ShieldIcon />
          <span className="text-lg font-semibold text-white">
            SafeGuard <span className="text-emerald-400">EHS</span>
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Sign Out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-900/50 to-slate-800 border border-blue-800/50 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0">
            👤
          </div>
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Visitor Check-in</p>
            <h1 className="text-xl font-bold text-white">Welcome, {v.name}!</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Checked in at {checkInTime} · {checkInDate}
            </p>
          </div>
          {inducted && (
            <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-600/40 rounded-full px-3 py-1.5 text-emerald-400 text-xs font-semibold shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Inducted
            </div>
          )}
        </div>

        {/* Visitor details card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Visit Details</h2>
          <InfoRow
            label="Full Name"
            value={v.name}
            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>}
          />
          <InfoRow
            label="Phone"
            value={v.phone}
            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>}
          />
          <InfoRow
            label="Company / Organisation"
            value={v.company}
            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>}
          />
          <InfoRow
            label="Host Employee"
            value={v.host}
            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
          />
          <InfoRow
            label="Purpose of Visit"
            value={v.purpose}
            icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
          />
        </div>

        {/* Induction card */}
        <div className={`rounded-2xl border p-6 ${inducted ? "bg-emerald-950/40 border-emerald-800/50" : "bg-amber-950/30 border-amber-800/50"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inducted ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
              {inducted ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-400">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-base ${inducted ? "text-emerald-300" : "text-amber-300"}`}>
                {inducted ? "Safety Induction Complete" : "Safety Induction Required"}
              </h3>
              <p className={`text-sm mt-1 ${inducted ? "text-emerald-400/70" : "text-amber-400/70"}`}>
                {inducted
                  ? "You have completed the mandatory safety induction. You are cleared to enter the site."
                  : "All visitors must complete a safety induction before entering the site. Please watch the safety video below."}
              </p>
              {inducted ? (
                <button
                  onClick={() => navigate("/pass")}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                  </svg>
                  View / Print Visitor Pass
                </button>
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-900/30"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                  Start Induction
                </button>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}