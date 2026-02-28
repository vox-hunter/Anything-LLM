import { useState } from "react";

export default function FillInBlank({ content = {}, onSubmit, componentId }) {
  const { sentence, blank_answer } = content;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    const isCorrect =
      answer.trim().toLowerCase() === (blank_answer || "").trim().toLowerCase();
    onSubmit?.({
      component_id: componentId,
      student_input: { answer, isCorrect },
    });
  };

  // Split sentence at ___ to show the blank
  const parts = (sentence || "").split("___");

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      <p className="text-white/60 text-xs font-semibold mb-2">
        Fill in the blank:
      </p>
      <div className="text-white text-sm mb-3 leading-relaxed">
        {parts[0]}
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="..."
          className={`inline-block mx-1 px-2 py-1 rounded border text-sm bg-theme-settings-input-bg focus:outline-none ${
            submitted
              ? answer.trim().toLowerCase() ===
                (blank_answer || "").trim().toLowerCase()
                ? "border-green-500 text-green-400"
                : "border-red-500 text-red-400"
              : "border-white/20 text-white focus:border-blue-500"
          }`}
          style={{ width: `${Math.max(80, (blank_answer || "").length * 12)}px` }}
        />
        {parts[1] || ""}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm transition-all"
        >
          Submit
        </button>
      )}
      {submitted && (
        <p
          className={`text-sm font-medium ${
            answer.trim().toLowerCase() ===
            (blank_answer || "").trim().toLowerCase()
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {answer.trim().toLowerCase() ===
          (blank_answer || "").trim().toLowerCase()
            ? "✓ Correct!"
            : `✗ The answer was: ${blank_answer}`}
        </p>
      )}
    </div>
  );
}
