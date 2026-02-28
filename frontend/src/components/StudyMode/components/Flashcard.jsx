import { useState } from "react";

export default function Flashcard({ content = {} }) {
  const { front, back } = content;
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="bg-theme-bg-secondary rounded-lg p-6 my-2 border border-white/10 cursor-pointer min-h-[120px] flex items-center justify-center transition-all hover:border-white/30"
      onClick={() => setFlipped(!flipped)}
    >
      <div className="text-center">
        <p className="text-xs text-white/40 mb-2">
          {flipped ? "Answer" : "Question"} — Click to flip
        </p>
        <p className="text-white text-lg">{flipped ? back : front}</p>
      </div>
    </div>
  );
}
