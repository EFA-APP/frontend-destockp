const Metrica = ({ label, value, accentColor = "amber" }) => {
  const themes = {
    amber: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40 hover:shadow-amber-500/10",
    emerald: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    blue: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40 hover:shadow-blue-500/10",
    rose: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 shadow-rose-500/5 hover:border-rose-500/40 hover:shadow-rose-500/10",
    indigo: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40 hover:shadow-indigo-500/10",
  };

  const themeClass = themes[accentColor] || themes.amber;

  return (
    <div className={`flex flex-col border rounded-2xl p-4 transition-all duration-500 group bg-gradient-to-br backdrop-blur-sm relative overflow-hidden ${themeClass}`}>
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 blur-2xl rounded-full -mr-6 -mt-6 group-hover:bg-white/10 transition-colors" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors mb-2">
        {label}
      </span>
      <span className="text-2xl font-black text-white tracking-tighter group-hover:scale-105 transform origin-left transition-transform duration-500">
        {value}
      </span>
    </div>
  );
};

export default Metrica;
