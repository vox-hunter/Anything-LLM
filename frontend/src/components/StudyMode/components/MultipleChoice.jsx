import { useState } from "react";

export default function MultipleChoice({
  content = {},
  onSubmit,
  componentId,
}) {
  const { question, options = [], correct_answer } = content;
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    const isCorrect = selected === correct_answer;
    onSubmit?.({
      component_id: componentId,
      student_input: { answer: selected, isCorrect },
    });
  };

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      <p className="text-white font-semibold mb-3">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((option, idx) => {
          let optionClass =
            "p-3 rounded-md cursor-pointer border transition-all text-white/80 text-sm";
          if (submitted) {
            if (option === correct_answer) {
              optionClass += " border-green-500 bg-green-500/20";
            } else if (option === selected && option !== correct_answer) {
              optionClass += " border-red-500 bg-red-500/20";
            } else {
              optionClass += " border-white/10 opacity-50";
            }
          } else {
            optionClass +=
              selected === option
                ? " border-blue-500 bg-blue-500/20"
                : " border-white/10 hover:border-white/30";
          }
          return (
            <button
              key={idx}
              className={optionClass}
              onClick={() => !submitted && setSelected(option)}
              disabled={submitted}
            >
              {option}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm transition-all"
        >
          Submit Answer
        </button>
      )}
      {submitted && (
        <p
          className={`mt-3 text-sm font-medium ${selected === correct_answer ? "text-green-400" : "text-red-400"}`}
        >
          {selected === correct_answer ? "✓ Correct!" : "✗ Incorrect"}
        </p>
      )}
    </div>
  );
}
