const TarjetaInformacion = ({
  titulo,
  color,
  numero,
  descripcion,
  valorMoneda,
}) => {
  return (
    <div className="px-6 py-2 bg-[var(--fill)] shadow-md rounded-md border border-gray-100/10">
      <div className="text-gray-100/50 text-sm">{titulo}</div>
      <div className={`text-[18px] font-bold ${color} mt-1`}>
        {valorMoneda && "$"}
        {numero.toLocaleString("es-AR")}
      </div>
      <div className="text-xs text-gray-100/50 mt-1">{descripcion}</div>
    </div>
  );
};

export default TarjetaInformacion;
