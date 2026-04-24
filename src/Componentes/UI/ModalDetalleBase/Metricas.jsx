const Metrica = ({ label, value, accentColor = "amber" }) => {
  const themes = {
    amber: {
      bg: "from-amber-700/[0.08]! border-amber-700/30! text-amber-700!",
      glow: "shadow-amber-700/10!",
    },
    emerald: {
      bg: "from-emerald-700/[0.08]! border-emerald-700/30! text-emerald-700!",
      glow: "shadow-emerald-700/10!",
    },
    blue: {
      bg: "from-blue-700/[0.08]! border-blue-700/30! text-blue-700!",
      glow: "shadow-blue-700/10!",
    },
    rose: {
      bg: "from-rose-700/[0.08]! border-rose-700/30! text-rose-700!",
      glow: "shadow-rose-700/10!",
    },
  };

  const theme = themes[accentColor] || themes.amber;

  return (
    <div
      className={`group relative flex flex-col p-3 md:p-4 rounded-md! border! bg-gradient-to-br ${theme.bg} to-transparent! backdrop-blur-xl! ! ! hover:bg-white/[0.05]! hover:scale-[1.02]! shadow-xl! ${theme.glow}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5 opacity-50 group-hover:opacity-100 !">
        <div className="w-1 h-1 rounded-full bg-current !" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-black! tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        <div className="w-1 h-1 rounded-full bg-current opacity-20" />
      </div>

      {/* Subtle indicator element */}
      <div className="absolute top-2 right-3 flex gap-1 items-center opacity-20">
        <div className="w-1 h-3 rounded-full bg-current" />
        <div className="w-1 h-1.5 rounded-full bg-current" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-10 group-hover:opacity-30 !" />
    </div>
  );
};

export default Metrica;
