import { useState } from "react";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  {
    id: 1,
    question: "What should you do before entering a restricted area on site?",
    options: [
      "Walk in if the gate is open",
      "Obtain a valid permit and wear required PPE",
      "Ask a colleague to accompany you",
      "Check your phone for instructions",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "Which colour hard hat is typically worn by site visitors?",
    options: [
      "Yellow – General workers",
      "Blue – Supervisors",
      "White – Engineers",
      "Green – Visitors / new inductees",
    ],
    correct: 3,
  },
  {
    id: 3,
    question: "What is the first action when you discover a fire on site?",
    options: [
      "Try to extinguish it immediately",
      "Raise the alarm and evacuate the area",
      "Call a colleague first",
      "Wait to confirm it is a real fire",
    ],
    correct: 1,
  },
  {
    id: 4,
    question: "When must a visitor report an injury or near-miss?",
    options: [
      "Only if the injury is severe",
      "At the end of the work day",
      "Immediately to the site safety officer",
      "When filling out the exit form",
    ],
    correct: 2,
  },
  {
    id: 5,
    question: "Which of the following is NOT acceptable on this site?",
    options: [
      "Wearing steel-toed boots",
      "Carrying a valid visitor badge",
      "Using a mobile phone in a hazardous zone",
      "Attending a safety briefing",
    ],
    correct: 2,
  },
];

const PASS_MARK = 0.8;
const LABELS = ["A", "B", "C", "D"];

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

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

// ── Result Screen — no retake, just score + one action button ─────────────────
function ResultScreen({ score, total, onProceed }) {
  const passed = score / total >= PASS_MARK;
  const pct    = Math.round((score / total) * 100);

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

      <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-xs">
        {passed
          ? "You have completed the safety assessment. You are now cleared to enter the site."
          : `You scored ${pct}%. A minimum of ${Math.round(PASS_MARK * 100)}% is required. Please contact the site safety officer.`}
      </p>

      <button
        onClick={onProceed}
        className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm transition shadow-lg
          ${passed
            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30"
            : "bg-slate-700 hover:bg-slate-600 text-slate-300 shadow-slate-900/30"
          }`}
      >
        {passed ? (
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
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SafetyAssessment({ visitor, onPass }) {
  const navigate = useNavigate();

  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState([]);
  const [finished, setFinished] = useState(false);

  const q     = QUESTIONS[current];
  const total = QUESTIONS.length;

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

  const score  = answers.filter((a) => a.correct).length;
  const passed = score / total >= PASS_MARK;

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

        {finished ? (
          <ResultScreen
            score={score}
            total={total}
            onProceed={handleProceed}
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
                {QUESTIONS.map((_, i) => (
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
                  label={LABELS[idx]}
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