export default function Diagram({ content = {} }) {
  const { title, description, elements = [] } = content;

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      {title && (
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-white/80 text-sm mb-3">{description}</p>
      )}
      {elements.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {elements.map((element, idx) => (
            <div
              key={idx}
              className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-md text-white/80 text-sm"
            >
              {element}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
