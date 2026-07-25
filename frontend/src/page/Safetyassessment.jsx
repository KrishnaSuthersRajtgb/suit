import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  markVideoComplete,
  submitQuiz,
  getActiveQuestions,
  getActiveVideo,
} from "../services/api";

const PASS_MARK = 0.8; // kept in sync with the backend's ASSESSMENT_PASS_THRESHOLD
const MAX_ATTEMPTS = 3; // Passed → pass issued · Failed → retry, up to 3 attempts total

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

// ── Video URL helpers ─────────────────────────────────────────────────────────
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

function OptionButton({ label, text, selected, revealed, isCorrect, onClick }) {
  let base = "w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200 ";

  if (!revealed) {
    base += selected
      ? "bg-blue-600/20 border-blue-500 text-white cursor-pointer"
      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white cursor-pointer";
  } else {
    if (isCorrect) {
      base += "bg-emerald-600/20 border-emerald-500 text-emerald-300 cursor-default";
    } else if (selected && !isCorrect) {
      base += "bg-red-600/20 border-red-500 text-red-300 cursor-default";
    } else {
      base += "bg-slate-800/30 border-slate-800 text-slate-500 cursor-default";
    }
  }

  return (
    <button className={base} onClick={onClick} disabled={revealed}>
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
          ${!revealed && selected ? "bg-blue-500 text-white" : ""}
          ${revealed && isCorrect ? "bg-emerald-500 text-white" : ""}
          ${revealed && selected && !isCorrect ? "bg-red-500 text-white" : ""}
          ${(!revealed && !selected) || (revealed && !selected && !isCorrect) ? "bg-slate-700 text-slate-400" : ""}
        `}
      >
        {label}
      </span>
      <span className="text-sm font-medium leading-snug flex-1">{text}</span>
      {revealed && isCorrect && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400 shrink-0">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {revealed && selected && !isCorrect && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400 shrink-0">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

// ── Video Step — shown before the quiz, if an induction video is configured ──
function VideoStep({ video, onContinue, submitting }) {
  const url = video?.url ? resolveVideoUrl(video.url) : null;
  const embedUrl = url && isYouTubeUrl(url) ? getYouTubeEmbedUrl(url) : null;

  return (
    <div className="flex flex-col px-1 py-4 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Step 1 of 2 — Safety Induction Video
        </span>
        <h2 className="text-lg font-semibold text-white leading-snug mt-2">
          {video?.title || "Site Safety Induction"}
        </h2>
      </div>

      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 mb-6">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Safety induction video"
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : url ? (
          <video src={url} controls className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
            No video available
          </div>
        )}
      </div>

      <button
        onClick={onContinue}
        disabled={submitting}
        className="self-start flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
      >
        {submitting ? (
          "Loading…"
        ) : (
          <>
            Continue to Assessment
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

// ── Result Screen — no retake, just score + one action button ─────────────────
function ResultScreen({ score, total, submitting, submitError, attempts, maxAttempts, onProceed, onRetry }) {
  const passed = score / total >= PASS_MARK;
  const pct    = Math.round((score / total) * 100);
  const attemptsRemaining = maxAttempts - attempts;
  const canRetry = !passed && attemptsRemaining > 0;
  const blocked  = !passed && attemptsRemaining <= 0;

  return (
    <div className="flex flex-col items-center text-center px-6 py-14 max-w-lg mx-auto">

      {/* Score ring */}
      <div
        className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 mb-8 shadow-2xl
          ${passed
            ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-900/40"
            : "border-red-500 bg-red-500/10 shadow-red-900/40"
          }`}
      >
        <span className={`text-5xl font-extrabold ${passed ? "text-emerald-400" : "text-red-400"}`}>
          {pct}%
        </span>
        <span className="text-xs text-slate-400 mt-1">{score} / {total} correct</span>
      </div>

      <h2 className={`text-2xl font-bold mb-3 ${passed ? "text-emerald-300" : "text-red-300"}`}>
        {passed ? "Assessment Passed!" : "Assessment Failed"}
      </h2>

      <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-xs">
        {passed
          ? "You have completed the safety assessment. You are now cleared to enter the site."
          : blocked
          ? `You scored ${pct}%. You've used all ${maxAttempts} attempts. Please contact the site safety officer.`
          : `You scored ${pct}%. A minimum of ${Math.round(PASS_MARK * 100)}% is required. You have ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`}
      </p>

      {submitError && (
        <p className="text-amber-400 text-xs mb-6 max-w-xs leading-relaxed">
          Couldn't save your result to the server ({submitError}). You can still continue — try again later if the pass doesn't show up.
        </p>
      )}

      <div className="flex items-center gap-3">
        {canRetry && (
          <button
            onClick={onRetry}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm transition shadow-lg bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Retry Assessment ({attemptsRemaining} left)
          </button>
        )}
        <button
          onClick={onProceed}
          disabled={submitting}
          className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
            ${passed
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300 shadow-slate-900/30"
            }`}
        >
          {submitting ? (
            "Saving result…"
          ) : passed ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Enter Site
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
// Anything at or past this stage means the backend won't accept a fresh
// video/quiz submission for this visitor — mirrors the same list in App.jsx.
const ALREADY_INDUCTED_STATUSES = [
  "ASSESSMENT_PASSED",
  "PASS_GENERATED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CLOSED",
];

export default function SafetyAssessment({ visitor, onPass }) {
  const navigate = useNavigate();

  // ── Content loaded from the backend (Admin-managed) ──────────────────────
  const [phase, setPhase]           = useState("loading"); // loading | video | quiz
  const [initError, setInitError]   = useState("");
  const [video, setVideo]           = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [continuing, setContinuing] = useState(false); // "Continue to Assessment" button

  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState([]);
  const [finished, setFinished] = useState(false);

  // Result of POST /visitors/:id/assessment (stage: "quiz") — the backend is
  // the source of truth for whether the visitor passed (frontend calc is
  // used as a fallback display only, in case the request fails).
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [backendPassed, setBackendPassed] = useState(null);
  const [attempts, setAttempts]         = useState(visitor?.induction?.attempts || 0);

  const q     = questions[current];
  const total = questions.length;
  const score = answers.filter((a) => a.correct).length;

  const alreadyInducted = ALREADY_INDUCTED_STATUSES.includes(visitor?.status);

  // Stale/duplicate visit — visitor already passed induction on a previous
  // check-in. Don't re-run the quiz against a backend that will 409 the
  // out-of-order transition; just send them straight to their pass.
  useEffect(() => {
    if (!alreadyInducted) return;
    onPass?.();
    navigate("/pass", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyInducted]);

  // Load the active induction video + active quiz questions for this
  // visitor's plant (falls back to global content if nothing plant-specific
  // is set — see getActiveVideo/getActiveQuestions on the backend).
  useEffect(() => {
    if (alreadyInducted || !visitor?._id) return;

    let cancelled = false;
    const plantId = visitor?.plant?._id || visitor?.plant;

    (async () => {
      setPhase("loading");
      setInitError("");
      try {
        const [videoData, questionsData] = await Promise.all([
          getActiveVideo(plantId).catch(() => null), // no video configured is non-fatal
          getActiveQuestions(plantId),
        ]);
        if (cancelled) return;

        setVideo(videoData);
        setQuestions(questionsData || []);

        if (!questionsData || questionsData.length === 0) {
          setInitError("No safety assessment questions are configured yet. Please contact the site administrator.");
          return;
        }

        if (videoData && videoData.url) {
          setPhase("video");
        } else {
          // No video configured — mirror the previous behaviour and mark
          // the video stage complete immediately, then go straight to the quiz.
          markVideoComplete(visitor._id).catch(() => {});
          setPhase("quiz");
        }
      } catch (err) {
        if (!cancelled) setInitError(err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitor?._id, alreadyInducted]);

  // Fires once the quiz is finished — reports the score to the backend so
  // it's persisted against the visitor record (and the pass can later be
  // issued only to visitors who actually passed).
  useEffect(() => {
    if (!finished) return;
    if (!visitor?._id) {
      setSubmitError("No visitor record found.");
      return;
    }

    let cancelled = false;
    setSubmitting(true);
    setSubmitError("");

    (async () => {
      try {
        const data = await submitQuiz(visitor._id, score, total);
        if (!cancelled) {
          setBackendPassed(data.passed);
          setAttempts(data.visitor?.induction?.attempts ?? attempts + 1);
        }
      } catch (err) {
        if (!cancelled) setSubmitError(err.message);
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const handleContinueFromVideo = async () => {
    setContinuing(true);
    try {
      await markVideoComplete(visitor._id);
    } catch (err) {
      // Non-fatal — if this silently fails, the quiz submit below will
      // surface a clearer error (backend will reject an out-of-order quiz).
    } finally {
      setContinuing(false);
      setPhase("quiz");
    }
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const handleNext = () => {
    const isCorrect = selected === q.correct;
    const updated   = [...answers, { correct: isCorrect }];
    setAnswers(updated);

    if (current + 1 < total) {
      setCurrent(current + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  // Failed but has attempts left — backend allows FAILED_ASSESSMENT →
  // VIDEO_COMPLETED (see TRANSITIONS in visitorController.js), so re-run
  // that transition, then reset the quiz locally for another attempt.
  const handleRetry = async () => {
    setSubmitError("");
    try {
      await markVideoComplete(visitor._id);
    } catch (err) {
      setSubmitError(err.message);
      return; // don't reset the quiz if the backend refused the retry
    }
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
    setBackendPassed(null);
  };

  // Prefer the backend's verdict; fall back to the local calc if the
  // request failed so the visitor isn't stuck.
  const passed = backendPassed !== null ? backendPassed : score / total >= PASS_MARK;

  const handleProceed = () => {
    if (passed) {
      onPass?.();
      navigate("/pass", { replace: true });
    } else {
      navigate("/visitor", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Nav */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-emerald-400"><ShieldIcon /></span>
          <span className="text-lg font-semibold text-white">
            SafeGuard <span className="text-emerald-400">EHS</span>
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">
          Safety Assessment
        </span>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-6 py-10">

        {initError ? (
          <div className="text-center text-red-300 text-sm bg-red-950/60 border border-red-800 rounded-xl px-4 py-6 max-w-md mx-auto">
            {initError}
          </div>
        ) : phase === "loading" ? (
          <p className="text-center text-slate-500 text-sm py-20">Loading safety assessment…</p>
        ) : phase === "video" ? (
          <VideoStep video={video} onContinue={handleContinueFromVideo} submitting={continuing} />
        ) : finished ? (
          <ResultScreen
            score={score}
            total={total}
            submitting={submitting}
            submitError={submitError}
            attempts={attempts}
            maxAttempts={MAX_ATTEMPTS}
            onProceed={handleProceed}
            onRetry={handleRetry}
          />
        ) : (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Question {current + 1} of {total}
                </span>
                <span className="text-xs text-slate-500">
                  {Math.round(PASS_MARK * 100)}% required to pass
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300
                      ${i < current ? "bg-emerald-500" : i === current ? "bg-blue-500" : "bg-slate-700"}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {answers.map((a, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center
                      ${a.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {a.correct ? (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-2.5 h-2.5">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-2.5 h-2.5">
                        <path d="M3 3l6 6M9 3l-6 6" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">
                Safety Knowledge
              </p>
              <h2 className="text-lg font-semibold text-white leading-snug">{q.question}</h2>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-8">
              {q.options.map((opt, idx) => (
                <OptionButton
                  key={idx}
                  label={String.fromCharCode(65 + idx)}
                  text={opt}
                  selected={selected === idx}
                  revealed={revealed}
                  isCorrect={idx === q.correct}
                  onClick={() => handleSelect(idx)}
                />
              ))}
            </div>

            {/* Feedback + Next */}
            {revealed && (
              <div className="flex items-center justify-between gap-4">
                <div className={`flex items-center gap-2 text-sm font-medium ${selected === q.correct ? "text-emerald-400" : "text-red-400"}`}>
                  {selected === q.correct ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Correct answer!
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Incorrect — see highlighted answer
                    </>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-900/30"
                >
                  {current + 1 < total ? "Next Question" : "See Results"}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {!revealed && (
              <p className="text-center text-slate-600 text-sm">Select an answer to continue</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}