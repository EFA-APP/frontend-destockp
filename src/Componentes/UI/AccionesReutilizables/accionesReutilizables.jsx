import {
  OjosIcono,
  DescargarIcono,
  EditarIcono,
  BorrarIcono,
  ErrorIcono,
  PagosIcono,
  UsuarioIcono,
  ProduccionIcono,
  MovimientoIcono,
  HistorialIcono,
  DetalleIcono,
  BloquearUsuarioIcono,
  DuplicarIcono,
  AdjuntoIcono,
} from "../../../assets/Icons";

export const accionesReutilizables = {
  verDetalle: {
    key: "verDetalle",
    label: "Ver detalle",
    icono: (
      <div className="bg-green-700/10 p-1 rounded-md text-green-400! cursor-pointer! hover:bg-green-700/20 ">
        <OjosIcono size={18} />
      </div>
    ),
  },

  editar: {
    key: "editar",
    label: "Editar",
    icono: (
      <div className="bg-blue-700/10 p-1 rounded-md text-blue-400! cursor-pointer! hover:bg-blue-700/20 ">
        <EditarIcono size={18} />
      </div>
    ),
  },

  duplicar: {
    key: "duplicar",
    label: "Duplicar",
    icono: (
      <div className="bg-amber-700/10 p-1 rounded-md text-amber-700! cursor-pointer! hover:bg-amber-700/20  flex items-center justify-center">
        <DuplicarIcono size={16} />
      </div>
    ),
  },

  eliminar: {
    key: "eliminar",
    label: "Eliminar",
    icono: (
      <div className="bg-red-700/10 p-1 rounded-md text-red-400! cursor-pointer! hover:bg-red-700/20 ">
        <BorrarIcono size={18} />
      </div>
    ),
  },

  bloquear: {
    key: "bloquear",
    label: "Bloquear",
    icono: (
      <div className="bg-[var(--surface-hover)] p-1 rounded-md text-black! cursor-pointer! hover:bg-[var(--surface)]! ">
        <BloquearUsuarioIcono size={18} />
      </div>
    ),
  },

  descargar: {
    key: "descargar",
    label: "Descargar",
    icono: (
      <div className="bg-blue-700/10 p-1 rounded-md text-blue-400! cursor-pointer! hover:bg-blue-700/20 ">
        <DescargarIcono size={18} />
      </div>
    ),
  },

  marcarObservado: {
    key: "marcarObservado",
    label: "Marcar observado",
    icono: (
      <div className="bg-yellow-700/10 p-1 rounded-md text-yellow-400! cursor-pointer! hover:bg-violet-700/20 ">
        <ErrorIcono size={18} />
      </div>
    ),
  },

  generarComprobante: {
    key: "generarComprobante",
    label: "Generar Comprobantes",
    icono: (
      <div className="bg-pink-700/10 p-1 rounded-md text-pink-400! cursor-pointer! hover:bg-violet-700/20  ">
        <PagosIcono size={18} />
      </div>
    ),
  },

  asignarRol: {
    key: "asignarRol",
    label: "Asignar Rol",
    icono: (
      <div className="p-1 rounded-md bg-violet-700/10 text-violet-700 hover:bg-violet-700/20  cursor-pointer">
        <UsuarioIcono size={18} />
      </div>
    ),
  },

  generarMovimientoProducto: {
    key: "generarMovimientoProducto",
    label: "Generar Movimiento",
    icono: (
      <div className="p-1 rounded-md bg-amber-700/10 text-amber-700! hover:bg-amber-700/20  cursor-pointer">
        <MovimientoIcono size={18} />
      </div>
    ),
  },

  registrarProduccion: {
    key: "registrarProduccion",
    label: "Registrar Producción",
    icono: (
      <div className="p-1 rounded-md bg-purple-700/10 text-purple-700! hover:bg-purple-700/20  cursor-pointer">
        <ProduccionIcono size={18} />
      </div>
    ),
  },

  verHistorial: {
    key: "verHistorial",
    label: "Ver Historial",
    icono: (
      <div className="p-1 rounded-md bg-cyan-700/10 text-cyan-700! hover:bg-cyan-700/20  cursor-pointer">
        <HistorialIcono size={18} />
      </div>
    ),
  },

  gestionar: {
    key: "gestionar",
    label: "Gestionar",
    icono: (
      <div className="p-1 rounded-md bg-yellow-700/10 text-yellow-700! hover:bg-yellow-700/20  cursor-pointer">
        <DetalleIcono size={18} />
      </div>
    ),
  },

  verAdjuntos: {
    key: "verAdjuntos",
    label: "Ver adjuntos",
    icono: (
      <div className="p-1 rounded-md bg-violet-700/10 text-violet-700 hover:bg-violet-700/20 ">
        <AdjuntoIcono size={18} />
      </div>
    ),
  },
};
