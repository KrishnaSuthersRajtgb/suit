import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { issuePass } from "../services/api";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
      <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

export default function VisitorPass({ visitor }) {
  const navigate = useNavigate();

  const v = visitor || {
    name: "Guest Visitor",
    phone: "—",
    company: "—",
    purpose: "Meeting",
    host: "—",
  };

  // The pass is issued (or fetched, if already issued) by the backend so the
  // QR code always reflects a persisted, verifiable record.
  const [pass, setPass]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!v?._id) {
      setError("No visitor record found.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await issuePass(v._id);
        if (!cancelled) setPass(data.visitor.pass);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?._id]);

  const qrValue = pass
    ? JSON.stringify({
        passId: pass.passId,
        name: v.name,
        company: v.company,
        host: v.host,
        purpose: v.purpose,
        issuedAt: pass.issuedAt,
        status: "INDUCTED",
      })
    : "";

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-slate-950 text-white print:bg-white print:text-black">

      {/* Nav — hidden when printing */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <ShieldIcon />
          <span className="text-lg font-semibold text-white">
            SafeGuard <span className="text-emerald-400">EHS</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/visitor")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 py-10 print:max-w-full print:px-0 print:py-0">

        {/* Title — hidden when printing */}
        <div className="text-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-white">Visitor Pass</h1>
          <p className="text-slate-400 text-sm mt-1">Show this pass to security on request, or print a copy</p>
        </div>

        {loading && (
          <div className="text-center text-slate-500 text-sm py-16 print:hidden">Issuing your pass…</div>
        )}

        {!loading && error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3 print:hidden">
            {error}
          </div>
        )}

        {!loading && !error && pass && (
          <>
            {/* Pass card */}
            <div className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 print:border-2 print:border-slate-900 print:shadow-none">

              {/* Card header */}
              <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between print:bg-white print:border-b-2 print:border-slate-900">
                <div className="flex items-center gap-2 text-white print:text-slate-900">
                  <ShieldIcon />
                  <div>
                    <p className="font-bold text-sm leading-tight">SafeGuard EHS</p>
                    <p className="text-xs opacity-80 leading-tight">Site Visitor Pass</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 print:bg-emerald-100 print:text-emerald-800 rounded-full px-3 py-1 text-xs font-bold text-white">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  INDUCTED
                </div>
              </div>

              {/* Visitor name */}
              <div className="px-6 pt-6 pb-4 text-center border-b border-dashed border-slate-300">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-3">
                  👤
                </div>
                <h2 className="text-xl font-bold">{v.name}</h2>
                <p className="text-sm text-slate-500">{v.company || "—"}</p>
              </div>

              {/* QR + details */}
              <div className="px-6 py-5 flex flex-col items-center gap-4">
                <div className="p-2 bg-white border border-slate-200 rounded-xl">
                  <QRCodeSVG value={qrValue} size={140} />
                </div>
                <p className="text-xs text-slate-400 -mt-1">Scan at the gate for verification</p>

                <div className="w-full mt-2">
                  <DetailRow label="Pass ID" value={pass.passId} />
                  <DetailRow label="Phone" value={v.phone} />
                  <DetailRow label="Host Employee" value={v.host} />
                  <DetailRow label="Purpose" value={v.purpose} />
                  <DetailRow label="Issued" value={`${formatDate(pass.issuedAt)}, ${formatTime(pass.issuedAt)}`} />
                  <DetailRow label="Valid Until" value={`${formatDate(pass.validUntil)}, ${formatTime(pass.validUntil)}`} />
                </div>
              </div>

              {/* Footer note */}
              <div className="bg-slate-50 px-6 py-3 text-center print:bg-white">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This pass must be worn and visible at all times on site.
                  Report to the Site Safety Officer for any queries.
                </p>
              </div>
            </div>

            {/* Action buttons — hidden when printing */}
            <div className="flex gap-3 mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Pass
              </button>
              <button
                onClick={() => navigate("/visitor")}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition border border-slate-700"
              >
                Done
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}