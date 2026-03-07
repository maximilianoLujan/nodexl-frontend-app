export default function FilterSection({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs text-slate-400 uppercase mb-3 tracking-wide">
        {icon}
        {title}
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}