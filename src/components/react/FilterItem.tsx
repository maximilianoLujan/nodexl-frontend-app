export default function FilterItem({
  filter,
  color,
  icon,
  onRemove
}: any) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color} transition`}
    >
      <div className="flex items-center gap-3 text-sm font-medium">
        {icon}
        {filter.label}
      </div>

      <button
        onClick={() => onRemove(filter)}
        className="text-slate-400 hover:text-red-400"
      >
        ✕
      </button>
    </div>
  );
}