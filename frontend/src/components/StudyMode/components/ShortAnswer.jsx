import { useState } from "react";

export default function ShortAnswer({ content = {}, onSubmit, componentId }) {
  const { question, expected_keywords = [] } = content;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    const lowerAnswer = answer.toLowerCase();
    const matchedKeywords = expected_keywords.filter((kw) =>
      lowerAnswer.includes(kw.toLowerCase())
    );
    const isCorrect =
      expected_keywords.length === 0 ||
      matchedKeywords.length >= Math.ceil(expected_keywords.length / 2);

    onSubmit?.({
      component_id: componentId,
      student_input: { answer, isCorrect },
    });
  };

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      <p className="text-white font-semibold mb-3">{question}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer here..."
        className="w-full p-3 rounded-md bg-theme-settings-input-bg text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
        rows={3}
      />
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm transition-all"
        >
          Submit Answer
        </button>
      )}
      {submitted && (
        <p className="mt-2 text-sm text-blue-400">Answer submitted ✓</p>
      )}
    </div>
  );
}
