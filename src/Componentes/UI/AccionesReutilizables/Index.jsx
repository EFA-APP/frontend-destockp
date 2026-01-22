import {
  OjosIcono,
  DescargarIcono,
  EditarIcono,
  BorrarIcono,
  ErrorIcono,
  OrdenDeVentaIcono,
  PagosIcono,
} from "../../../assets/Icons";

export const accionesReutilizables = {
  verDetalle: {
    key: "verDetalle",
    label: "Ver detalle",
    icono: (
      <div className="bg-green-500/10 p-2 rounded-md text-green-400!">
        <OjosIcono size={20} />
      </div>
    ),
  },

  editar: {
    key: "editar",
    label: "Editar",
    icono: (
      <div className="bg-blue-500/10 p-2 rounded-md text-blue-400!">
        <EditarIcono size={20} />
      </div>
    ),
  },

  eliminar: {
    key: "eliminar",
    label: "Eliminar",
    icono: (
      <div className="bg-red-500/10 p-2 rounded-md text-red-400!">
        <BorrarIcono size={20} />
      </div>
    ),
  },

  importarAFIP: {
    key: "importarAFIP",
    label: "Importar",
    icono: (
      <div className="bg-blue-500/10 p-2 rounded-md text-blue-400!">
        <DescargarIcono size={20} />
      </div>
    ),
  },

  marcarObservado: {
    key: "marcarObservado",
    label: "Marcar observado",
    icono: (
      <div className="bg-yellow-500/10 p-2 rounded-md text-yellow-400!">
        <ErrorIcono size={20} />
      </div>
    ),
  },

  generarComprobante: {
    key: "generarComprobante",
    label: "Generar Comporbantes",
    icono: (
      <div className="bg-pink-500/10 p-2 rounded-md text-pink-400!">
        <PagosIcono size={24} />
      </div>
    ),
  },
};
