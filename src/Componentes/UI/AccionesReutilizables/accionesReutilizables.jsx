import {
  OjosIcono,
  DescargarIcono,
  EditarIcono,
  BorrarIcono,
  ErrorIcono,
  PagosIcono,
  UsuarioIcono,
} from "../../../assets/Icons";

export const accionesReutilizables = {
  verDetalle: {
    key: "verDetalle",
    label: "Ver detalle",
    icono: (
      <div className="bg-green-500/10 p-1 rounded-md text-green-400!">
        <OjosIcono size={18} />
      </div>
    ),
  },

  editar: {
    key: "editar",
    label: "Editar",
    icono: (
      <div className="bg-blue-500/10 p-1 rounded-md text-blue-400!">
        <EditarIcono size={18} />
      </div>
    ),
  },

  eliminar: {
    key: "eliminar",
    label: "Eliminar",
    icono: (
      <div className="bg-red-500/10 p-1 rounded-md text-red-400!">
        <BorrarIcono size={18} />
      </div>
    ),
  },

  descargar: {
    key: "descargar",
    label: "Descargar",
    icono: (
      <div className="bg-blue-500/10 p-1 rounded-md text-blue-400!">
        <DescargarIcono size={18} />
      </div>
    ),
  },

  marcarObservado: {
    key: "marcarObservado",
    label: "Marcar observado",
    icono: (
      <div className="bg-yellow-500/10 p-1 rounded-md text-yellow-400!">
        <ErrorIcono size={18} />
      </div>
    ),
  },

  generarComprobante: {
    key: "generarComprobante",
    label: "Generar Comporbantes",
    icono: (
      <div className="bg-pink-500/10 p-1 rounded-md text-pink-400!">
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
};
