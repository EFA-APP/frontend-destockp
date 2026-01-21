const MenuDeAccionesGenerico = ({ acciones, fila }) => {
  return (
    <div className="flex gap-1">
      {acciones
        .filter((a) => (typeof a.visible === "function" ? a.visible(fila) : a.visible !== false))
        .map((accion) => (
          <button
            key={accion.key}
            onClick={() => accion.onClick(fila)}
            title={accion.label}
            className={`
              cursor-pointer
              px-2 py-2 rounded-md! flex items-center
              ${accion.bg}!
              ${accion.color}!
              hover:opacity-80
            `}
          >
            {accion.icono}
          </button>
        ))}
    </div>
  );
};

export default MenuDeAccionesGenerico;
