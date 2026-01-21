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
    icono: <OjosIcono size={18} />,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },

  editar: {
    key: "editar",
    label: "Editar",
    icono: <EditarIcono size={18} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },

  eliminar: {
    key: "eliminar",
    label: "Eliminar",
    icono: <BorrarIcono size={18} />,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },

  importarAFIP: {
    key: "importarAFIP",
    label: "Importar",
    icono: <DescargarIcono size={18} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },

  marcarObservado: {
    key: "marcarObservado",
    label: "Marcar observado",
    icono: <ErrorIcono size={18} />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },

  generarComprobante: {
    key: "generarComprobante",
    label: "Generar Comporbantes",
    icono: <PagosIcono size={20} />,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
};
