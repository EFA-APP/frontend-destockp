import { useEffect, useState } from "react";
import { useAuthStore } from "../Autenticacion/store/authenticacion.store";

export const useCabeceraComprobante = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const conexionArca = usuario?.conexionArca || false;
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  // Estados para manejar las fechas de manera controlada
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  // Estados para las reglas de activación
  const [esFiscal, setEsFiscal] = useState(conexionArca); // Inicializa según la config del usuario
  const [esPresupuesto, setEsPresupuesto] = useState(false); // false = Oficial/Estándar, true = Presupuesto

  // Clientes / Proveedores
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Tipo de comprobante (controlado para detectar notas de crédito/débito)
  const [tipoComprobante, setTipoComprobante] = useState("");

  // Comprobante asociado (para notas de crédito/débito)
  const [comprobanteAsociado, setComprobanteAsociado] = useState({
    numeroComprobanteOrigen: "",
    puntoVenta: "",
    codigoTipoComprobanteAsociado: "",
    importeAplicado: "",
  });

  // Codes que requieren vincular un comprobante origen
  const TIPOS_CON_ASOCIADO = [2, 3, 7, 8, 12, 13, 994, 995];
  const esNotaAsociada = TIPOS_CON_ASOCIADO.includes(Number(tipoComprobante));

  useEffect(() => {
    // 1. Obtener la fecha actual (Hoy)
    const hoy = new Date();

    // 2. Calcular la fecha de vencimiento (Hoy + 30 días)
    const vencimiento = new Date();
    vencimiento.setDate(hoy.getDate() + 30);

    // Función auxiliar para formatear la fecha a YYYY-MM-DD en la zona horaria del cliente
    const formatearFecha = (date) => {
      const year = date.getFullYear();
      // Aseguramos dos dígitos para el mes y el día
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // 3. Asignar los valores por defecto a los estados
    setFechaInicio(formatearFecha(hoy));
    setFechaVencimiento(formatearFecha(vencimiento));
  }, []); // [] asegura que solo se ejecute una vez al cargar el componente

  return {
    fechaInicio,
    setFechaInicio,
    fechaVencimiento,
    setFechaVencimiento,
    esFiscal,
    setEsFiscal,
    esPresupuesto,
    setEsPresupuesto,
    unidadesNegocio,
    // Retornamos las nuevas propiedades para que el componente las consuma sin errores
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    setClienteSeleccionado,
    tipoComprobante,
    setTipoComprobante,
    comprobanteAsociado,
    setComprobanteAsociado,
    esNotaAsociada,
  };
};
