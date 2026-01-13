const Metrica = ({ label, value }) => (
  <div className="rounded-lg bg-black/30 p-3 border border-white/5">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

export default Metrica;