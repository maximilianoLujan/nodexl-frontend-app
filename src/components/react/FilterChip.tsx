export default function FilterChip({ filter, onRemove }: any) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700">
      <span>{filter.label}</span>

      <button
        onClick={() => onRemove(filter)}
        className="text-slate-400 hover:text-red-400 transition"
      >
        ✕
      </button>
    </div>
  );
}