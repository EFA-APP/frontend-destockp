import { Building2 } from "lucide-react";
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
  DineroIcono,
  NotaCreditoIcono,
  NotaDebitoIcono,
  ComprobanteIcono,
  AumentarCuotaIcono,
  GestionUsuariosIcono,
  CajaIcono,
  ConfiguracionIcono,
  ProveedoresIcono,
  RolIcono,
  VincularRolUsuarioIcono,
  AccionesSistemaIcono,
  ImagenIcono,
  TablaConfiguracionIcono,
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
    label: "Generar pago",
    icono: (
      <div className="bg-amber-700/10 p-1 rounded-md text-amber-400! cursor-pointer! hover:bg-violet-700/20  ">
        <DineroIcono size={18} />
      </div>
    ),
  },

  generarComprobanteDeVenta: {
    key: "generarComprobanteDeVenta",
    label: "Generar Comprobante",
    icono: (
      <div className="bg-violet-700/10 p-1 rounded-md text-violet-400! cursor-pointer! hover:bg-violet-700/20  ">
        <ComprobanteIcono size={18} />
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

  notaCredito: {
    key: "notaCredito",
    label: "Nota de Crédito",
    icono: (
      <div className="p-1 rounded-md bg-rose-700/10 text-rose-700 hover:bg-rose-700/20 ">
        <NotaCreditoIcono size={18} />
      </div>
    ),
  },

  notaDebito: {
    key: "notaDebito",
    label: "Nota de Débito",
    icono: (
      <div className="p-1 rounded-md bg-orange-700/10 text-orange-700 hover:bg-orange-700/20 ">
        <NotaDebitoIcono size={18} />
      </div>
    ),
  },

  aumentarCuota: {
    key: "aumentarCuota",
    label: "Emitir Cuota Individual",
    icono: (
      <div className="p-1 rounded-md bg-green-700/10 text-green-700! hover:bg-green-700/20  cursor-pointer">
        <AumentarCuotaIcono size={18} />
      </div>
    ),
  },

  usuarios: {
    key: "usuarios",
    label: "Usuarios",
    icono: (
      <div className="p-1 rounded-md bg-violet-700/10 text-violet-700 hover:bg-violet-700/20 ">
        <ProveedoresIcono size={18} />
      </div>
    ),
  },

  unidadesNegocio: {
    key: "unidadesNegocio",
    label: "Unidades de Negocio",
    icono: (
      <div className="p-1 rounded-md bg-amber-700/10 text-amber-700 hover:bg-amber-700/20 ">
        <Building2 size={18} />
      </div>
    ),
  },

  roles: {
    key: "roles",
    label: "Roles y Permisos",
    icono: (
      <div className="p-1 rounded-md bg-indigo-700/10 text-indigo-700 hover:bg-indigo-700/20 ">
        <RolIcono size={18} />
      </div>
    ),
  },
  bloquear: {
    key: "bloquear",
    label: "Bloquear Empresa",
    icono: (
      <div className="p-1 rounded-md bg-red-700/10 text-red-700 hover:bg-red-700/20 ">
        <BloquearUsuarioIcono size={18} />
      </div>
    ),
  },

  vincularRolUsuario: {
    key: "vincularRolUsuario",
    label: "Vincular Rol",
    icono: (
      <div className="p-1 rounded-md bg-indigo-700/10 text-indigo-700 hover:bg-indigo-700/20 ">
        <VincularRolUsuarioIcono size={18} />
      </div>
    ),
  },
  gestionarAcciones: {
    key: "gestionarAcciones",
    label: "Gestionar Acciones",
    icono: (
      <div className="p-1 rounded-md bg-indigo-700/10 text-indigo-700 hover:bg-indigo-700/20 ">
        <AccionesSistemaIcono size={18} />
      </div>
    ),
  },
  agregarImagen: {
    key: "agregarImagen",
    label: "Agregar Imagen",
    icono: (
      <div className="p-1 rounded-md bg-indigo-700/10 text-indigo-700 hover:bg-indigo-700/20 ">
        <ImagenIcono size={18} />
      </div>
    ),
  },
  configurarCampos: {
    key: "configurarCampos",
    label: "Configurar Campos",
    icono: (
      <div className="p-1 rounded-md bg-indigo-700/10 text-indigo-700 hover:bg-indigo-700/20 ">
        <TablaConfiguracionIcono size={18} />
      </div>
    ),
  },
};
