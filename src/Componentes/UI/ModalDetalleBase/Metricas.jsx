const Metrica = ({ label, value, accentColor = "amber" }) => {
  const themes = {
    amber: {
      bg: "from-amber-500/[0.08]! border-amber-500/30! text-amber-500!",
      glow: "shadow-amber-500/10!"
    },
    emerald: {
      bg: "from-emerald-500/[0.08]! border-emerald-500/30! text-emerald-500!",
      glow: "shadow-emerald-500/10!"
    },
    blue: {
      bg: "from-blue-500/[0.08]! border-blue-500/30! text-blue-500!",
      glow: "shadow-blue-500/10!"
    },
    rose: {
      bg: "from-rose-500/[0.08]! border-rose-500/30! text-rose-500!",
      glow: "shadow-rose-500/10!"
    },
  };

  const theme = themes[accentColor] || themes.amber;

  return (
    <div className={`group relative flex flex-col p-3 md:p-4 rounded-md! border! bg-gradient-to-br ${theme.bg} to-transparent! backdrop-blur-xl! transition-all! duration-500! hover:bg-white/[0.05]! hover:scale-[1.02]! shadow-xl! ${theme.glow}`}>
      <div className="flex items-center gap-1.5 mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity!">
        <div className="w-1 h-1 rounded-full bg-current animate-pulse!" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-white! tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        <div className="w-1 h-1 rounded-full bg-current opacity-20" />
      </div>

      {/* Subtle indicator element */}
      <div className="absolute top-2 right-3 flex gap-1 items-center opacity-20">
        <div className="w-1 h-3 rounded-full bg-current" />
        <div className="w-1 h-1.5 rounded-full bg-current" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-10 group-hover:opacity-30 transition-opacity!" />
    </div>
  );
};

export default Metrica;
