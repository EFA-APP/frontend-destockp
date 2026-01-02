const Select = ({ label, valor, setValor, options }) => {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-white pl-1 pb-1">{label}</p>
      <select
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-auto px-3 h-8 rounded-md text-sm border-2 bg-orange-500/20 text-orange-400 border-orange-400/30 focus:border-[var(--primary)]"
      >
        {options.map((option) => (
          <option
            key={option.valor}
            className="bg-[var(--fill)] text-white"
            value={option.valor}
          >
            {option.texto}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
