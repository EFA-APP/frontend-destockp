const Metrica = ({ label, value }) => (
  <div className="flex justify-between  ">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

export default Metrica;
