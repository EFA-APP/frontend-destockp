import { useState, useMemo } from "react";
import { useObtenerMovimientos } from "../../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { HistorialIcono, InventarioIcono } from "../../../../assets/Icons";
import {
  MapPin,
  Layers,
  User,
  Package,
  ArrowDownLeft,
  ListFilter,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable, { Highlight } from "../../../UI/DataTable/DataTable";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { useObtenerMateriasPrimas } from "../../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";

const ReporteUbicacionProducto = () => {
  const [etapaSeleccionada, setEtapaSeleccionada] = useState("TODAS");
  const [especieSeleccionada, setEspecieSeleccionada] = useState("TODAS");
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

  // Procesamos los metadatos de los movimientos
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
          etapa: meta.etapa || "",
          tipoEnvase: meta.tipoEnvase || "GRANEL",
          depositoNombre:
            mov.deposito?.nombre ||
            meta.nombreDeposito ||
            meta.depositoNombre ||
            "SIN GALPÓN",
        };
      });
  }, [movimientos]);

  const { data: materiasPrimasRaw = [] } = useObtenerMateriasPrimas({});

  const materiasPrimas = useMemo(() => {
    return Array.isArray(materiasPrimasRaw)
      ? materiasPrimasRaw
      : Array.isArray(materiasPrimasRaw.data)
        ? materiasPrimasRaw.data
        : [];
  }, [materiasPrimasRaw]);

  // Extraemos especies únicas del historial
  const especiesUnicas = useMemo(() => {
    const especies = movimientosProcesados
      .map((m) => m.materiaPrima?.nombre || m.nombreArticulo)
      .filter(Boolean);
    return Array.from(new Set(especies)).sort();
  }, [movimientosProcesados]);

  // Extraemos etapas únicas del historial
  const etapasUnicas = useMemo(() => {
    const etapas = movimientosProcesados.map((m) => m.etapa).filter(Boolean);
    return Array.from(new Set(etapas)).sort();
  }, [movimientosProcesados]);

  // Construimos las opciones para las etapas (SearchableSelect)
  const opcionesEtapa = useMemo(() => {
    const defaultStages = [
      "INGRESO",
      "EN PROCESO",
      "TERMINADO",
      "EGRESO",
      "TERMINADO MOV. STOCK",
    ];

    const opts = [{ value: "TODAS", label: "TODAS LAS ETAPAS" }];

    // Agregamos las etapas estándar por defecto
    defaultStages.forEach((stage) => {
      opts.push({ value: stage, label: stage });
    });

    // Añadimos cualquier otra etapa histórica adicional que figure en la base de datos
    const existingStages = new Set(defaultStages);
    etapasUnicas.forEach((e) => {
      if (!existingStages.has(e)) {
        opts.push({ value: e, label: e.toUpperCase() });
      }
    });

    return opts;
  }, [etapasUnicas]);

  // Construimos las opciones para las especies / granos (SearchableSelect)
  const opcionesEspecie = useMemo(() => {
    const opts = [{ value: "TODAS", label: "TODAS LAS ESPECIES / GRANOS" }];

    // Añadir materias primas del backend
    materiasPrimas.forEach((mp) => {
      if (mp.activo) {
        opts.push({ value: mp.nombre, label: mp.nombre.toUpperCase() });
      }
    });

    // Agregar especies históricas si no están ya en la lista
    const nombresExistentes = new Set(opts.map((o) => o.value));
    especiesUnicas.forEach((esp) => {
      if (!nombresExistentes.has(esp)) {
        opts.push({ value: esp, label: `${esp.toUpperCase()} (HISTÓRICO)` });
      }
    });

    return opts;
  }, [materiasPrimas, especiesUnicas]);

  // Agrupamos y calculamos el stock por ubicación (Depósito + Paño + Lote + Cliente + Tipo Envase) con filtros aplicados
  const stockPorUbicaciones = useMemo(() => {
    const agrupado = {};

    movimientosProcesados.forEach((m) => {
      // Filtrado por Etapa
      if (etapaSeleccionada !== "TODAS" && m.etapa !== etapaSeleccionada)
        return;

      // Filtrado por Especie
      const nombreEspecie = m.materiaPrima?.nombre || m.nombreArticulo || "S/N";
      if (
        especieSeleccionada !== "TODAS" &&
        nombreEspecie !== especieSeleccionada
      )
        return;

      const clave = `${m.depositoNombre}-${m.pano}-${m.lote}-${m.cliente}-${m.tipoEnvase}`;
      const esIngreso = m.tipoMovimiento === "INGRESO";
      const cant = Number(m.cantidad) || 0;

      if (!agrupado[clave]) {
        agrupado[clave] = {
          id: clave,
          ubicacion: m.depositoNombre,
          pano: m.pano,
          lote: m.lote,
          cliente: m.cliente,
          especie: nombreEspecie,
          tipoEnvase: m.tipoEnvase || "GRANEL",
          etapa: m.etapa || "S/E",
          kilos: 0,
        };
      }

      if (esIngreso) {
        agrupado[clave].kilos += cant;
      } else {
        agrupado[clave].kilos -= cant;
      }
    });

    // Filtramos y convertimos a array
    return Object.values(agrupado).filter((item) => {
      const searchStr =
        `${item.ubicacion} ${item.pano} ${item.lote} ${item.cliente} ${item.especie} ${item.tipoEnvase}`.toLowerCase();
      return searchStr.includes(busqueda.toLowerCase());
    });
  }, [movimientosProcesados, etapaSeleccionada, especieSeleccionada, busqueda]);

  // Métricas generales filtradas
  const metricasFiltradas = useMemo(() => {
    let kilosTotales = 0;
    const ubiSet = new Set();
    const loteSet = new Set();
    const clienteSet = new Set();

    stockPorUbicaciones.forEach((item) => {
      kilosTotales += item.kilos;
      ubiSet.add(`${item.ubicacion}-${item.pano}`);
      if (item.lote !== "S/L") loteSet.add(item.lote);
      if (item.cliente !== "S/D") clienteSet.add(item.cliente);
    });

    return {
      kilos: kilosTotales,
      cantUbi: ubiSet.size,
      cantLotes: loteSet.size,
      cantClientes: clienteSet.size,
    };
  }, [stockPorUbicaciones]);

  const columnas = useMemo(
    () => [
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
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-500">
              <MapPin size={14} />
            </div>
            <span className="font-semibold text-slate-700 text-sm">
              <Highlight text={valor} term={busqueda} />
            </span>
          </div>
        ),
      },
      {
        key: "lote",
        etiqueta: "Lote",
        renderizar: (valor) => (
          <span className="text-slate-700 font-bold text-sm">
            <Highlight text={valor} term={busqueda} />
          </span>
        ),
      },
      {
        key: "cliente",
        etiqueta: "Cliente",
        renderizar: (valor) => (
          <span className="text-slate-600 text-sm font-medium">
            <Highlight text={valor} term={busqueda} />
          </span>
        ),
      },
      {
        key: "tipoEnvase",
        etiqueta: "Tipo Envase",
        renderizar: (valor) => (
          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md text-xs font-semibold uppercase">
            {valor}
          </span>
        ),
      },
      {
        key: "kilos",
        etiqueta: "Kilos",
        renderizar: (valor) => (
          <span
            className={`font-bold text-sm ${valor >= 0 ? "text-slate-800" : "text-red-700"}`}
          >
            {valor.toLocaleString("es-AR")} kg
          </span>
        ),
      },
    ],
    [busqueda],
  );

  return (
    <ContenedorSeccion className="px-5 py-4 bg-[#f8fafc] min-h-screen">
      <EncabezadoSeccion
        ruta="Ubicación por Producto"
        icono={<InventarioIcono size={22} className="text-slate-700" />}
        volver={true}
        redireccionAnterior="/panel"
      />

      <div className="space-y-6 mt-6 pb-20">
        {/* CONTROLADORES DE FILTRO */}
        <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-wrap gap-4 shadow-sm">
          {/* Selector de Etapa */}
          <div className="flex flex-col gap-1 w-full sm:w-64">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">
              Filtrar por Etapa
            </span>
            <SearchableSelect
              options={opcionesEtapa}
              value={etapaSeleccionada}
              onChange={(e) => setEtapaSeleccionada(e.target.value)}
              placeholder="Seleccionar etapa..."
              className="w-full font-semibold text-slate-700"
            />
          </div>

          {/* Selector de Especie */}
          <div className="flex flex-col gap-1 w-full sm:w-64">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">
              Filtrar por Especie / Grano
            </span>
            <SearchableSelect
              options={opcionesEspecie}
              value={especieSeleccionada}
              onChange={(e) => setEspecieSeleccionada(e.target.value)}
              placeholder="Buscar especie..."
              className="w-full font-semibold text-slate-700"
            />
          </div>

          {/* Botón de Reajuste */}
          {(etapaSeleccionada !== "TODAS" ||
            especieSeleccionada !== "TODAS") && (
            <button
              onClick={() => {
                setEtapaSeleccionada("TODAS");
                setEspecieSeleccionada("TODAS");
              }}
              className="h-10 mt-auto px-4 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-all cursor-pointer flex items-center justify-center"
            >
              Resetear Filtros
            </button>
          )}
        </div>

        {/* TARJETAS DE INDICADORES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100 text-amber-800">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Stock Neto Total
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasFiltradas.kilos.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-slate-100 rounded-md border border-slate-200 text-slate-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Ubicaciones Activas
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasFiltradas.cantUbi}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-700">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Lotes Distribuidos
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasFiltradas.cantLotes}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-50 rounded-md border border-green-100 text-green-700">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Clientes Propietarios
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasFiltradas.cantClientes}
              </h3>
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <DataTable
          id_tabla="reporte_ubicacion_producto"
          llaveTituloMobile="ubicacion"
          datos={stockPorUbicaciones}
          columnas={columnas}
          mostrarAcciones={false}
          loading={isLoading}
          emptyMessage="No se encontraron ubicaciones de producto que cumplan los filtros seleccionados"
          mostrarBuscador={true}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar por galpón, lote, cliente, grano..."
        />
      </div>
    </ContenedorSeccion>
  );
};

export default ReporteUbicacionProducto;
