import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../Autenticacion/store/authenticacion.store";

export const useCabeceraComprobante = (initialValues = {}) => {
  const usuario = useAuthStore((state) => state.usuario);
  const conexionArca = usuario?.conexionArca || false;
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  const [fechaInicio, setFechaInicio] = useState(initialValues.fecha ?? "");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [esFiscal, setEsFiscal] = useState(initialValues.esFiscal ?? conexionArca);
  const [esPresupuesto, setEsPresupuesto] = useState(false);

  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [tipoComprobante, setTipoComprobante] = useState(
    initialValues.codigoTipo != null
      ? String(initialValues.codigoTipo)
      : conexionArca ? "11" : "991"
  );

  const [comprobanteAsociado, setComprobanteAsociado] = useState(null);

  // Campos controlados para el payload
  const [condicionComprobante, setCondicionComprobante] = useState("CONTADO");
  const [unidadNegocioSeleccionada, setUnidadNegocioSeleccionada] = useState("");
  const [puntoVenta, setPuntoVenta] = useState(
    initialValues.puntoVenta != null ? String(initialValues.puntoVenta) : "1"
  );
  const [observaciones, setObservaciones] = useState("");

  const [otrosTributos, setOtrosTributos] = useState(initialValues.otrosTributos ?? 0);

  // Solo EGRESO
  const [numeroComprobanteEgreso, setNumeroComprobanteEgreso] = useState(
    initialValues.numeroComprobante != null ? String(initialValues.numeroComprobante) : ""
  );
  const [cae, setCae] = useState(initialValues.cae ?? "");
  const [vtoCae, setVtoCae] = useState(initialValues.vtoCae ?? "");

  // Refs para proteger valores inicializados via initialValues de ser
  // sobreescritos por los useEffect existentes en el primer render.
  const skipFechaInicioRef = useRef(!!initialValues.fecha);
  const skipTipoComprobanteRef = useRef(initialValues.codigoTipo != null);
  const skipPuntoVentaRef = useRef(initialValues.puntoVenta != null);

  const TIPOS_CON_ASOCIADO = [2, 3, 7, 8, 12, 13, 994, 995];
  const esNotaAsociada = TIPOS_CON_ASOCIADO.includes(Number(tipoComprobante));

  useEffect(() => {
    const hoy = new Date();
    const vencimiento = new Date();
    vencimiento.setDate(hoy.getDate() + 30);
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!skipFechaInicioRef.current) setFechaInicio(fmt(hoy));
    setFechaVencimiento(fmt(vencimiento));
  }, []);

  useEffect(() => {
    if (unidadesNegocio.length > 0 && !unidadNegocioSeleccionada) {
      setUnidadNegocioSeleccionada(String(unidadesNegocio[0].codigoSecuencial));
    }
  }, [unidadesNegocio]);

  useEffect(() => {
    if (!unidadNegocioSeleccionada) return;
    if (skipPuntoVentaRef.current) {
      skipPuntoVentaRef.current = false;
      return;
    }
    const selected = unidadesNegocio.find(
      (u) => String(u.codigoSecuencial) === String(unidadNegocioSeleccionada)
    );
    if (selected?.puntoVenta) {
      setPuntoVenta(String(selected.puntoVenta));
    } else {
      setPuntoVenta(""); // triggers modal in UI if empty
    }
  }, [unidadNegocioSeleccionada, unidadesNegocio]);

  useEffect(() => {
    if (skipTipoComprobanteRef.current) return;
    setTipoComprobante(esFiscal ? "11" : "991");
  }, [esFiscal]);

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
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    setClienteSeleccionado,
    tipoComprobante,
    setTipoComprobante,
    comprobanteAsociado,
    setComprobanteAsociado,
    esNotaAsociada,
    condicionComprobante,
    setCondicionComprobante,
    unidadNegocioSeleccionada,
    setUnidadNegocioSeleccionada,
    puntoVenta,
    setPuntoVenta,
    observaciones,
    setObservaciones,
    numeroComprobanteEgreso,
    setNumeroComprobanteEgreso,
    cae,
    setCae,
    vtoCae,
    setVtoCae,
    otrosTributos,
    setOtrosTributos,
  };
};
