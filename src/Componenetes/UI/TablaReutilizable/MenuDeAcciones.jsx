import {
  BorrarIcono,
  DescargarIcono,
  EditarIcono,
  OjosIcono,
} from "../../../assets/Icons";

const MenuDeAcciones = ({
  permisos = { ver: true, editar: true, eliminar: true, descargar: true },
  onVer,
  onDescargar,
  onEditar,
  onEliminar,
  fila,
  setMenuAbiertoId,
}) => {
  return (
    <div>
      <div className="w-full flex gap-1  rounded-r-md  text-white text-[10px]!">
        {/* VER */}
        {permisos.ver && onVer && (
          <button
            onClick={() => {
              onVer && onVer(fila);
              setMenuAbiertoId(null);
            }}
            className=" px-2 py-2 text-green-400! rounded-md! bg-green-500/10! flex items-center gap-2 cursor-pointer hover:bg-green-400/5!"
          >
            <OjosIcono size={18} color={""} />
          </button>
        )}
        {/* DESCARGAR */}
        {permisos.descargar && onDescargar && (
          <button
            onClick={() => {
              onDescargar && onDescargar(fila);
              setMenuAbiertoId(null);
            }}
            className=" px-2 py-2 text-left text-violet-400! rounded-md! bg-violet-500/10! flex items-center gap-2 cursor-pointer hover:bg-violet-400/5!"
          >
            <DescargarIcono size={18} color={""} />
          </button>
        )}

        {/* EDITAR */}
        {permisos.editar && onEditar && (
          <button
            onClick={() => {
              onEditar && onEditar(fila);
              setMenuAbiertoId(null);
            }}
            className="px-2 py-2 text-left text-blue-400! bg-blue-400/20! hover:bg-blue-400/10! flex items-center gap-2 cursor-pointer rounded-md!"
          >
            <EditarIcono size={18} />
          </button>
        )}
        {/* ELIMINAR */}
        {permisos.eliminar && onEliminar && (
          <button
            onClick={() => {
              onEliminar && onEliminar(fila.id);
              setMenuAbiertoId(null);
            }}
            className="px-2 py-2 text-left text-red-400! bg-red-400/20! hover:bg-red-400/10! flex items-center gap-2 cursor-pointer rounded-md!"
          >
            <BorrarIcono size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuDeAcciones;
