const MenuDeAccionesGenerico = ({ acciones, fila }) => {
  return (
    <div className="flex gap-1">
      {acciones
        .filter((a) =>
          typeof a.visible === "function"
            ? a.visible(fila)
            : a.visible !== false,
        )
        .map((accion) => (
          <button
            key={accion.label}
            onClick={() => accion.onClick(fila)}
            title={accion.label}
            className={`
              cursor-pointer
               rounded-md! flex items-center
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
