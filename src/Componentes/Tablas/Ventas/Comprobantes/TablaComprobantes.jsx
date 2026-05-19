import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasComprobantes } from "./ColumnaComprobantes";
import React, { useMemo, useState, useEffect } from "react";

const Highlight = ({ text, term }) => {
  if (!term || !text) return text;
  const parts = String(text).split(new RegExp(`(${term})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-400/40 text-[var(--primary)] px-0.5 rounded font-black italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { accionesComprobantes } from "./AccionesComprobantes";
import {
  LayoutGrid,
  DollarSign,
  Search,
  Filter,
  Calendar,
  FileText,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "./ComprobantePDF";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import { useNavigate } from "react-router-dom";

import DetalleComprobanteDrawer from "./DetalleComprobanteDrawer";
import { formatPrice } from "../../../../utils/formatters";

// Helper para evaluar fórmulas de forma segura con contexto dinámico
const evaluarFormula = (formula, contexto) => {
  try {
    // Si no hay fórmula, devolvemos 0
    if (!formula) return 0;

    // Extraer todas las posibles variables de la fórmula (ej: aplicar10, total, etc)
    // Usamos regex para encontrar palabras que no sean operadores matemáticos
    const clavesUsadas =
      formula.match(/[a-zA-ZáéíóúÁÉÍÓÚ_][a-zA-Z0-9áéíóúÁÉÍÓÚ_]*/g) || [];
    const contextoSeguro = { ...contexto };

    // Aseguramos que todas las variables usadas tengan al menos un valor 0
    clavesUsadas.forEach((clave) => {
      if (contextoSeguro[clave] === undefined) {
        contextoSeguro[clave] = 0;
      }
    });

    const keys = Object.keys(contextoSeguro);
    const values = Object.values(contextoSeguro);

    // Creamos la función dinámica inyectando las claves como argumentos
    const fn = new Function(...keys, `return ${formula}`);
    const resultado = fn(...values);

    return isNaN(resultado) ? 0 : resultado;
  } catch (e) {
    console.error("Error evaluando fórmula:", formula, e);
    return 0;
  }
};

const TablaComprobantes = () => {
  const navigate = useNavigate();
  const { usuario, unidadActiva } = useAuthStore();
  const {
    facturas,
    meta,
    isLoading,
    isFetching,
    pagina,
    setPagina,
    limite,
    setLimite,
    busqueda,
    setBusqueda,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,
    setIsFiscal,
    condicionVenta,
    setCondicionVenta,
    unidadNegocio,
    setUnidadNegocio,
    tipoFactura,
    setTypeFactura,
  } = useFacturas("venta_", "VENTA");

  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  useEffect(() => {
    const cargarTipos = async () => {
      setCargandoTipos(true);
      try {
        const res = await ObtenerTiposComprobanteApi();
        const raw = Array.isArray(res) ? res : res?.data || [];

        const mapeados = raw.map((v) => ({
          valor: v.Id,
          texto: v.Desc,
        }));

        // Agregar Internos
        const internos = [
          { valor: 991, texto: "COMPROBANTE VENTA (I)" },
          { valor: 992, texto: "RECIBO COBRO (I)" },
          { valor: 993, texto: "NOTA CRÉDITO (I)" },
          { valor: 994, texto: "NOTA DÉBITO (I)" },
        ];

        setTiposComprobante([
          { valor: "TODAS", texto: "TODOS LOS COMP." },
          ...mapeados,
          ...internos,
        ]);
      } catch (error) {
        console.error("Error cargando tipos comprobante:", error);
        setTiposComprobante([
          { valor: "TODAS", texto: "TODOS LOS COMP." },
          { valor: 991, texto: "COMPROBANTE VENTA (I)" },
          { valor: 992, texto: "RECIBO COBRO (I)" },
          { valor: 993, texto: "NOTA CRÉDITO (I)" },
          { valor: 994, texto: "NOTA DÉBITO (I)" },
        ]);
      } finally {
        setCargandoTipos(false);
      }
    };
    cargarTipos();
  }, []);

  const opcionesUnidad = useMemo(() => {
    return (usuario?.unidadesNegocio || []).map((un) => ({
      valor: un.codigoSecuencial,
      texto: un.nombre,
    }));
  }, [usuario]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  // --- LÓGICA DE COLUMNAS DINÁMICAS ---
  const columnasFinales = useMemo(() => {
    // 1. Inyectamos la búsqueda en las funciones de renderizado para el resaltado
    return columnasComprobantes.map((col) => ({
      ...col,
      renderizar: col.renderizar
        ? (valor, fila) => col.renderizar(valor, fila, busqueda)
        : undefined,
    }));
  }, [columnasComprobantes, busqueda]);

  // --- SUBCOMPONENTE DE TABS PREMIUM ---
  const CondicionVentaTabs = () => {
    const options = [
      { id: "TODAS", label: "Todos", icon: null },
      { id: "contado", label: "Contado", icon: null },
      { id: "cuenta_corriente", label: "Cta. Cte.", icon: null },
    ];

    return (
      <div className="flex">
        {options.map((opt) => {
          const active = condicionVenta === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setCondicionVenta(opt.id)}
              className={`
                relative px-4  py-1.5 rounded-md text-[12px] font-black uppercase tracking-widest   cursor-pointer
                ${
                  active
                    ? "text-[var(--primary)] shadow-xl shadow-[var(--primary)]/10"
                    : "text-[var(--primary)]/60 hover:text-[var(--primary)]/60 hover:bg-[var(--primary)]/5"
                }
              `}
            >
              {active && (
                <div className="absolute inset-0 bg-[var(--primary)]/10 rounded-md border-2 border-[var(--primary)]/20" />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  const handleVerDetalle = (fila) => {
    setSeleccionado(fila);
    setModalAbierto(true);
  };

  const handleVerAdjuntos = async (fila) => {
    // Generar PDF y descargar usando implementación nativa
    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={fila} usuario={usuario} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${fila.cae || "SIN_CAE"}-${String(fila.puntoVenta || 1).padStart(5, "0")}-${String(fila.numeroComprobante || 0).padStart(8, "0")}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  };

  // 2. Lógica de visibilidad del filtro fiscal (Detección Real)
  const tieneConexionArca = useMemo(() => {
    return !!usuario?.conexionArca;
  }, [usuario]);

  const handleEmitirPago = (fila, modo = "PAGO") => {
    navigate("/panel/ventas/comprobantes", {
      state: {
        comprobanteAsociado: fila,
        emitirPago: modo === "PAGO",
        emitirNC: modo === "NC",
        emitirND: modo === "ND",
      },
    });
  };

  const renderResumenSuperior = () => {
    if (!facturas || facturas.length === 0) return null;

    // Calcular acumulados de forma profunda (incluyendo detalles para filtros por metadatos)
    const acumulados = facturas.reduce(
      (acc, f) => {
        // 1. Acumulados de cabecera
        acc.total += f.total || 0;
        acc.subtotal += f.subtotal || 0;
        acc.iva += f.iva || 0;
        acc.saldoPendiente += f.saldoPendiente || 0;

        // 2. Acumulados por metadatos de items
        if (Array.isArray(f.detalles)) {
          f.detalles.forEach((det) => {
            const sub = det.subtotal || 0;
            const meta = det.metadata || {};

            const activeBooleans = [];
            const numericValues = {};

            // Buscamos valores en el metadata para acumular
            Object.keys(meta).forEach((key) => {
              // Normalizar la clave para que sea una variable válida (ej: "Mi Atributo" -> "Mi_Atributo")
              const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
              const valorMeta = meta[key];

              if (valorMeta === true || valorMeta === "true") {
                activeBooleans.push(safeKey);
                // Si es un flag booleano explícito, acumulamos el subtotal del ítem
                acc[safeKey] = (acc[safeKey] || 0) + sub;
              } else if (!isNaN(parseFloat(valorMeta)) && isFinite(valorMeta)) {
                // Si es un número (ej: ganancia: 500 unitario)
                const numVal = parseFloat(valorMeta);
                const cantidad = det.cantidad || 1;
                const totalVal = numVal * cantidad;

                numericValues[safeKey] = totalVal;

                // Por defecto, asumimos que si usan la variable (ej: "ganancia")
                // quieren el total real de esa línea (valor * cantidad)
                acc[safeKey] = (acc[safeKey] || 0) + totalVal;

                // Extra: dejamos disponible la versión estrictamente unitaria sin multiplicar
                acc[`${safeKey}_unitario`] =
                  (acc[`${safeKey}_unitario`] || 0) + numVal;
              }
            });

            // Cruzamos las variables booleanas activas con los valores numéricos
            // Ej: si 'aplicar10' está activo y 'ganancia' vale 50000, acumulamos 50000 en 'aplicar10_ganancia'
            activeBooleans.forEach((boolKey) => {
              Object.keys(numericValues).forEach((numKey) => {
                const intersectionKey = `${boolKey}_${numKey}`;
                acc[intersectionKey] =
                  (acc[intersectionKey] || 0) + numericValues[numKey];
              });
            });
          });
        }

        return acc;
      },
      { total: 0, subtotal: 0, iva: 0, saldoPendiente: 0 },
    );

    const unidadSeleccionada =
      usuario?.unidadesNegocio?.find(
        (u) => Number(u.codigoSecuencial) === Number(unidadNegocio),
      ) || unidadActiva;
    const extras = unidadSeleccionada?.configuracion?.columnasExtra || [];

    // Si no hay columnas extra configuradas, no renderizamos el panel de resumen
    if (!Array.isArray(extras) || extras.length === 0) return null;

    return (
      <div className="bg-white border border-[var(--primary)]/10 rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
          {/* TOTAL PRINCIPAL - COMPACTO */}
          <div className="bg-[var(--primary)]/[0.03] px-6 py-4 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-[var(--primary)]/10">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-none mb-1">
                Total Facturado
              </h4>
              <span className="text-[22px] font-black text-black tracking-tighter tabular-nums">
                {formatPrice(acumulados.total)}
              </span>
            </div>
          </div>

          {/* GRID DE CÁLCULOS EXTRAS - COMPACTO Y DISTRIBUIDO */}
          <div className="flex-1 px-6 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-3">
            {Array.isArray(extras) &&
              extras.map((colExtra, idx) => {
                const resultadoTotal = evaluarFormula(
                  colExtra.formula,
                  acumulados,
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 border-r border-[var(--primary)]/5 last:border-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/30 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] leading-none truncate mb-1">
                        {colExtra.etiqueta || colExtra.label}
                      </span>
                      <span className="text-[16px] font-black text-[var(--primary)] tracking-tight tabular-nums">
                        {formatPrice(resultadoTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* BADGE DE ESTADO - MINI */}
          <div className="px-6 py-4 flex items-center lg:justify-end border-t lg:border-t-0 lg:border-l border-[var(--primary)]/10 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                Consolidado
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderizarDetalles = (fila) => {
    const formatearMonto = (monto) => {
      return Number(monto || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const saldoPendiente =
      fila.saldoPendiente !== undefined
        ? fila.saldoPendiente
        : fila.total -
          (fila.pagos?.reduce((a, p) => a + (p.monto || 0), 0) || 0);

    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] overflow-hidden shadow-sm m-2">
        {!fila.detalles || fila.detalles.length === 0 ? (
          <div className="text-center py-4 text-[var(--text-muted)] font-medium text-[13px]">
            No hay productos asociados a este comprobante.
          </div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--primary)]/5 text-[10px] text-[var(--primary)]/60 font-black uppercase tracking-widest border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-center">Cant.</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {fila.detalles.map((item, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-[var(--primary)]/5 transition-colors"
                >
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-black text-black">
                      <Highlight text={item.nombre} term={busqueda} />
                    </p>
                    <p className="text-[10px] font-bold text-[var(--primary)]/60 uppercase tracking-widest">
                      Descripción:{" "}
                      <Highlight text={item.descripcion} term={busqueda} />
                    </p>
                    <p className="text-[10px] font-bold text-[var(--primary)]/60 uppercase tracking-widest">
                      P. Unitario: ${formatearMonto(item.precioUnitario)}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-[var(--text-muted)]">
                    {item.cantidad}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-[var(--primary)] tabular-nums">
                    ${formatearMonto(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (!unidadNegocio) {
    return (
      <div className="space-y-8">
        <div className="rounded-md">
          <DataTable
            id_tabla="comprobantes_placeholder"
            columnas={[]}
            datos={[]}
            loading={false}
            mostrarBuscador={false}
            todasExpandidas={true}
            elementosSuperior={
              <div className="flex flex-wrap items-center gap-4 bg-zinc-950/40 backdrop-blur-md border border-black/5 p-2 rounded-2xl shadow-2xl">
                <div className="min-w-[220px]">
                  <Select
                    valor={unidadNegocio}
                    setValor={setUnidadNegocio}
                    options={[
                      { valor: null, texto: "SELECCIONE UNA UNIDAD" },
                      ...opcionesUnidad,
                    ]}
                  />
                </div>
              </div>
            }
          />
        </div>

        <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-zinc-950/20 border border-black/5 border-dashed">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-md flex items-center justify-center mb-6 border border-[var(--primary)]/20 rotate-3">
            <LayoutGrid size={40} className="text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-black text-black italic tracking-tighter mb-2">
            Contexto <span className="text-[var(--primary)]">Requerido</span>
          </h2>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em] max-w-[300px] text-center">
            Debe seleccionar una unidad de negocio para visualizar el listado de
            comprobantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 ">
      <DetalleComprobanteDrawer
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        usuario={usuario}
      />

      {/* Resumen Compacto de Métricas (Ancho Completo) */}
      {renderResumenSuperior()}

      {/* Tabla Maestra con Diseño Identitario */}
      <DataTable
        id_tabla="comprobantes_final_v1"
        llaveTituloMobile="numeroComprobante"
        columnas={columnasFinales}
        datos={facturas}
        loading={isLoading}
        isFetching={isFetching}
        meta={meta}
        onPageChange={(p) => setPagina(p)}
        onLimitChange={(l) => {
          setLimite(l);
          setPagina(1);
        }}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={true}
        acciones={accionesComprobantes({
          handleEmitirPago,
          handleVerDetalle,
          handleVerAdjuntos,
        })}
        mostrarFiltros={false}
        todasExpandidas={!!busqueda}
        renderDetalle={renderizarDetalles}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3">
            {/* SELECTOR DE UNIDAD DE NEGOCIO */}
            <div className="w-[180px]">
              <Select
                valor={unidadNegocio}
                setValor={setUnidadNegocio}
                options={[
                  { valor: null, texto: "SIN UNIDAD SELECCIONADA" },
                  ...opcionesUnidad,
                ]}
                placeholder="Elegir Unidad..."
              />
            </div>

            {/* TIPO DE COMPROBANTE */}
            <div className="w-[180px]">
              <Select
                valor={tipoFactura}
                setValor={setTypeFactura}
                options={tiposComprobante}
                loading={cargandoTipos}
              />
            </div>

            {/* SELECTORES FISCALES */}
            {tieneConexionArca && (
              <div className="w-[160px]">
                <Select
                  valor={isFiscal}
                  setValor={setIsFiscal}
                  options={[
                    { valor: "TODAS", texto: "TODOS LOS REG." },
                    { valor: "FISCAL", texto: "VÍA AFIP" },
                    { valor: "INTERNA", texto: "INTERNAS" },
                  ]}
                />
              </div>
            )}

            {/* TABS DE CONDICIÓN DE VENTA */}
            <CondicionVentaTabs />

            {/* RANGO DE FECHAS */}
            <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border-subtle)] px-2 rounded-md h-[42px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[var(--primary)]/30 transition-colors">
              <FechaInput
                value={fechaDesde}
                onChange={setFechaDesde}
                size="sm"
                className="bg-transparent! border-none! shadow-none! min-w-[110px] text-xs!"
              />
              <div className="w-px h-4 bg-black/10"></div>
              <FechaInput
                value={fechaHasta}
                onChange={setFechaHasta}
                size="sm"
                className="bg-transparent! border-none! shadow-none! min-w-[110px] text-xs!"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default TablaComprobantes;
