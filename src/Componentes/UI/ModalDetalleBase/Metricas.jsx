const Metrica = ({ label, value, accentColor = "amber" }) => {
  const themes = {
    amber: "bg-amber-500/[0.03] border-amber-500/10 group-hover:border-amber-500/30 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    emerald: "bg-emerald-500/[0.03] border-emerald-500/10 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    blue: "bg-blue-500/[0.03] border-blue-500/10 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    rose: "bg-rose-500/[0.03] border-rose-500/10 group-hover:border-rose-500/30 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    indigo: "bg-indigo-500/[0.03] border-indigo-500/10 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]",
  };

  const themeClass = themes[accentColor] || themes.amber;

  return (
    <div className={`flex flex-col border rounded-xl p-3 transition-all duration-300 group ${themeClass}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors mb-1">
        {label}
      </span>
      <span className="text-xl font-bold text-white tracking-tight">
        {value}
      </span>
    </div>
  );
};

export default Metrica;
