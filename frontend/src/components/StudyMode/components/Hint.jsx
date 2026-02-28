export default function Hint({ content = {} }) {
  const { message } = content;

  return (
    <div className="bg-yellow-500/10 rounded-lg p-4 my-2 border border-yellow-500/30">
      <p className="text-yellow-300 text-xs font-semibold mb-1">💡 Hint</p>
      <p className="text-white/80 text-sm">{message}</p>
    </div>
  );
}
