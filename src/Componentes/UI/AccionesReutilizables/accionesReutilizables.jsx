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
} from "../../../assets/Icons";

export const accionesReutilizables = {
  verDetalle: {
    key: "verDetalle",
    label: "Ver detalle",
    icono: (
      <div className="bg-green-500/10 p-1 rounded-md text-green-400! cursor-pointer! hover:bg-green-500/20 transition-colors">
        <OjosIcono size={18} />
      </div>
    ),
  },

  editar: {
    key: "editar",
    label: "Editar",
    icono: (
      <div className="bg-blue-500/10 p-1 rounded-md text-blue-400! cursor-pointer! hover:bg-blue-500/20 transition-colors">
        <EditarIcono size={18} />
      </div>
    ),
  },

  eliminar: {
    key: "eliminar",
    label: "Eliminar",
    icono: (
      <div className="bg-red-500/10 p-1 rounded-md text-red-400! cursor-pointer! hover:bg-red-500/20 transition-colors">
        <BorrarIcono size={18} />
      </div>
    ),
  },

  descargar: {
    key: "descargar",
    label: "Descargar",
    icono: (
      <div className="bg-blue-500/10 p-1 rounded-md text-blue-400! cursor-pointer! hover:bg-blue-500/20 transition-colors">
        <DescargarIcono size={18} />
      </div>
    ),
  },

  marcarObservado: {
    key: "marcarObservado",
    label: "Marcar observado",
    icono: (
      <div className="bg-yellow-500/10 p-1 rounded-md text-yellow-400! cursor-pointer! hover:bg-violet-500/20 transition-colors">
        <ErrorIcono size={18} />
      </div>
    ),
  },

  generarComprobante: {
    key: "generarComprobante",
    label: "Generar Comporbantes",
    icono: (
      <div className="bg-pink-500/10 p-1 rounded-md text-pink-400! cursor-pointer! hover:bg-violet-500/20 transition-colors ">
        <PagosIcono size={18} />
      </div>
    ),
  },

  asignarRol: {
    key: "asignarRol",
    label: "Asignar Rol",
    icono: (
      <div className="p-1 rounded-md bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors cursor-pointer">
        <UsuarioIcono size={18} />
      </div>
    ),
  },

  generarMovimientoProducto: {
    key: "generarMovimientoProducto",
    label: "Generar Movimiento",
    icono: (
      <div className="p-1 rounded-md bg-amber-500/10 text-amber-500! hover:bg-amber-500/20 transition-colors cursor-pointer">
        <MovimientoIcono size={18} />
      </div>
    ),
  },

  registrarProduccion: {
    key: "registrarProduccion",
    label: "Registrar Producción",
    icono: (
      <div className="p-1 rounded-md bg-purple-500/10 text-purple-500! hover:bg-purple-500/20 transition-colors cursor-pointer">
        <ProduccionIcono size={18} />
      </div>
    ),
  },

  verHistorial: {
    key: "verHistorial",
    label: "Ver Historial",
    icono: (
      <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-500! hover:bg-cyan-500/20 transition-colors cursor-pointer">
        <HistorialIcono size={18} />
      </div>
    ),
  },
};
