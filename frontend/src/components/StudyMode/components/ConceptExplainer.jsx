export default function ConceptExplainer({ content = {} }) {
  const { title, explanation, key_points = [] } = content;

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      {title && (
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      )}
      {explanation && (
        <p className="text-white/80 text-sm mb-3 leading-relaxed">
          {explanation}
        </p>
      )}
      {key_points.length > 0 && (
        <div className="mt-2">
          <p className="text-white/60 text-xs font-semibold mb-1">
            Key Points:
          </p>
          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
            {key_points.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
