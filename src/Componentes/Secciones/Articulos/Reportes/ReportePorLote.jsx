import { useState, useMemo } from "react";
import { useObtenerMovimientos } from "../../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { CajaIcono, HistorialIcono } from "../../../../assets/Icons";
import {
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Package,
  Layers,
  MapPin,
  ClipboardList,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable, { Highlight } from "../../../UI/DataTable/DataTable";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";

const ReportePorLote = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Cargamos hasta 2000 movimientos de materia prima para el análisis interactivo
  const { data: responseMovs, isLoading } = useObtenerMovimientos(
    undefined,
    "MATERIA_PRIMA",
    undefined,
    undefined,
    undefined,
    1,
    2000,
  );

  const movimientos = useMemo(() => {
    return responseMovs?.movimientos || [];
  }, [responseMovs]);

  // Procesamos los metadatos de los movimientos (lote, cliente, depósito, etc.)
  const movimientosProcesados = useMemo(() => {
    return movimientos
      .filter((mov) => mov.origenMovimiento !== "ALTA_SISTEMA") // Excluir movimientos automáticos
      .map((mov) => {
        let meta = {};
        try {
          if (mov.descripcion) {
            meta = JSON.parse(mov.descripcion);
          }
        } catch (e) {}

        return {
          ...mov,
          lote: meta.lote || mov.lote || "S/L",
          cliente: meta.cliente || mov.cliente || "S/D",
          pano: meta.pano || "",
          depositoNombre:
            mov.deposito?.nombre ||
            meta.nombreDeposito ||
            meta.depositoNombre ||
            "SIN GALPÓN",
        };
      });
  }, [movimientos]);

  const { contactos = [] } = useContactos({ limite: 1000 });

  // Obtenemos todos los clientes únicos disponibles en el historial
  const clientesUnicos = useMemo(() => {
    const clientes = movimientosProcesados
      .map((m) => m.cliente)
      .filter((c) => c && c !== "S/D");
    return Array.from(new Set(clientes)).sort();
  }, [movimientosProcesados]);

  const opcionesClientes = useMemo(() => {
    const opciones = (contactos || []).map((c) => {
      const nombreCompleto =
        c.razonSocial ||
        `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
        "Sin Nombre";
      return {
        value: nombreCompleto.toUpperCase(),
        label: `${nombreCompleto.toUpperCase()} ${
          c.documento ? `(${c.documento})` : ""
        }`,
      };
    });

    const nombresContactos = new Set(opciones.map((o) => o.value));
    clientesUnicos.forEach((c) => {
      const cUpper = c.toUpperCase();
      if (!nombresContactos.has(cUpper)) {
        opciones.push({
          value: c,
          label: `${cUpper} (HISTÓRICO)`,
        });
      }
    });

    return opciones.sort((a, b) => a.label.localeCompare(b.label));
  }, [contactos, clientesUnicos]);

  // Si no hay cliente seleccionado pero hay disponibles, tomamos el primero por defecto
  useMemo(() => {
    if (!clienteSeleccionado && opcionesClientes.length > 0) {
      setClienteSeleccionado(opcionesClientes[0].value);
    }
  }, [opcionesClientes, clienteSeleccionado]);

  // Filtramos movimientos para el cliente seleccionado
  const movimientosDelCliente = useMemo(() => {
    if (!clienteSeleccionado) return [];
    return movimientosProcesados.filter(
      (m) => m.cliente === clienteSeleccionado,
    );
  }, [movimientosProcesados, clienteSeleccionado]);

  // Agrupamos la información por Lote + Etapa + Especie + Paño + Depósito para el cliente seleccionado
  const resumenPorLote = useMemo(() => {
    if (!clienteSeleccionado) return [];

    const agrupado = {};

    movimientosDelCliente.forEach((m) => {
      const loteClave = m.lote;
      const etapa = m.etapa || "S/E";
      const especie = m.materiaPrima?.nombre || m.nombreArticulo || "S/N";
      const pano = m.pano || "";
      const ubicacion = m.depositoNombre;

      const clave = `${loteClave}-${etapa}-${especie}-${pano}-${ubicacion}`;
      const esIngreso = m.tipoMovimiento === "INGRESO";
      const cant = Number(m.cantidad) || 0;

      if (!agrupado[clave]) {
        agrupado[clave] = {
          id: clave,
          lote: loteClave,
          etapa: etapa,
          especie: especie,
          pano: pano,
          ubicacion: ubicacion,
          stockNeto: 0,
          movsRelacionados: [],
        };
      }

      if (esIngreso) {
        agrupado[clave].stockNeto += cant;
      } else {
        agrupado[clave].stockNeto -= cant;
      }
      agrupado[clave].movsRelacionados.push(m);
    });

    return Object.values(agrupado).filter((item) => {
      const searchStr =
        `${item.lote} ${item.etapa} ${item.especie} ${item.pano} ${item.ubicacion}`.toLowerCase();
      return searchStr.includes(busqueda.toLowerCase());
    });
  }, [movimientosDelCliente, clienteSeleccionado, busqueda]);

  // Métricas generales del cliente
  const metricasCliente = useMemo(() => {
    let ing = 0;
    let eg = 0;
    const lotes = new Set();

    movimientosDelCliente.forEach((m) => {
      const cant = Number(m.cantidad) || 0;
      if (m.tipoMovimiento === "INGRESO") {
        ing += cant;
      } else {
        eg += cant;
      }
      if (m.lote && m.lote !== "S/L") {
        lotes.add(m.lote);
      }
    });

    return {
      ingresado: ing,
      egresado: eg,
      neto: ing - eg,
      cantLotes: lotes.size,
    };
  }, [movimientosDelCliente]);

  const columnas = useMemo(
    () => [
      {
        key: "lote",
        etiqueta: "Lote",
        renderizar: (valor) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-md text-amber-800 border border-amber-100 font-bold text-xs uppercase">
              LOTE
            </div>
            <span className="font-bold text-slate-700 text-sm">
              <Highlight text={valor} term={busqueda} />
            </span>
          </div>
        ),
      },
      {
        key: "etapa",
        etiqueta: "Etapa",
        renderizar: (valor) => {
          if (!valor || valor === "S/E")
            return <span className="italic text-slate-400 text-xs">-</span>;

          let colorClase = "bg-slate-50 text-slate-600 border-slate-200";
          if (valor === "INGRESO")
            colorClase = "bg-emerald-50 text-emerald-700 border-emerald-100";
          else if (valor === "EGRESO")
            colorClase = "bg-rose-50 text-rose-700 border-rose-100";
          else if (valor === "EN PROCESO")
            colorClase = "bg-amber-50 text-amber-700 border-amber-100";
          else if (valor === "TERMINADO" || valor === "TERMINADO MOV. STOCK")
            colorClase = "bg-blue-50 text-blue-700 border-blue-100";

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClase} uppercase`}
            >
              {valor}
            </span>
          );
        },
      },
      {
        key: "especie",
        etiqueta: "Especie",
        renderizar: (valor) => (
          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            <Highlight text={valor} term={busqueda} />
          </span>
        ),
      },
      {
        key: "pano",
        etiqueta: "Paño",
        renderizar: (valor) => (
          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            {valor ? `PAÑO: ${valor}` : "S/P"}
          </span>
        ),
      },
      {
        key: "ubicacion",
        etiqueta: "Ubicación",
        renderizar: (valor) => (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="text-slate-600 text-sm font-medium">
              <Highlight text={valor} term={busqueda} />
            </span>
          </div>
        ),
      },
      {
        key: "stockNeto",
        etiqueta: "Kilos",
        renderizar: (valor) => (
          <span
            className={`font-bold text-sm ${
              valor >= 0 ? "text-slate-800" : "text-red-700"
            }`}
          >
            {valor.toLocaleString("es-AR")} kg
          </span>
        ),
      },
    ],
    [busqueda],
  );

  const renderDetalleMovimiento = (fila) => {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <ClipboardList size={16} className="text-slate-500" />
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Detalle de Operaciones Relacionadas del Cliente para este Lote
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Operación</th>
                <th className="py-2 px-3">Cantidad</th>
                <th className="py-2 px-3">Ubicación / Paño</th>
                <th className="py-2 px-3">Responsable</th>
                <th className="py-2 px-3">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {fila.movsRelacionados.map((m, idx) => {
                const esIngreso = m.tipoMovimiento === "INGRESO";
                const fecha = new Date(m.fecha).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr
                    key={idx}
                    className="border-b border-slate-200 hover:bg-slate-100/50"
                  >
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      {fecha} hs
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          esIngreso
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {m.tipoMovimiento}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 font-semibold ${esIngreso ? "text-green-600" : "text-red-500"}`}
                    >
                      {esIngreso ? "+" : "-"}
                      {m.cantidad.toLocaleString("es-AR")} kg
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {m.depositoNombre}
                      {m.pano ? ` / Paño ${m.pano}` : ""}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {m.nombreUsuario || "SISTEMA"}
                    </td>
                    <td
                      className="py-2 px-3 text-slate-500 italic max-w-xs truncate"
                      title={m.observacion}
                    >
                      {m.observacion || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <ContenedorSeccion className="px-5 py-4 bg-[#f8fafc] min-h-screen">
      <EncabezadoSeccion
        ruta="Agrupado por Lote"
        icono={<CajaIcono size={22} className="text-slate-700" />}
        volver={true}
        redireccionAnterior="/panel"
      />

      <div className="space-y-6 mt-6 pb-20">
        {/* FILTRO SUPERIOR */}
        <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1 w-full sm:w-80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">
              Seleccionar Cliente / Remitente
            </span>
            <SearchableSelect
              options={opcionesClientes}
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full font-semibold text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-50 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-md">
              Cliente Activo: {clienteSeleccionado || "-"}
            </span>
          </div>
        </div>

        {/* METRICAS DEL CLIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-50 rounded-md border border-green-100 text-green-700">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Ingresado Total
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasCliente.ingresado.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-50 rounded-md border border-red-100 text-red-700">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Egresado Total
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasCliente.egresado.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100 text-amber-800">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Stock Neto
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasCliente.neto.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-700">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Lotes Asociados
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasCliente.cantLotes}
              </h3>
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <DataTable
          id_tabla="reporte_granos_lote"
          llaveTituloMobile="lote"
          datos={resumenPorLote}
          columnas={columnas}
          mostrarAcciones={false}
          loading={isLoading}
          emptyMessage="Selecciona un cliente válido para visualizar sus lotes activos"
          renderDetalle={renderDetalleMovimiento}
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Filtrar por lote, grano, ubicaciones..."
        />
      </div>
    </ContenedorSeccion>
  );
};

export default ReportePorLote;
