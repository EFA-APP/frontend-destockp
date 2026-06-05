import { useState, useMemo } from "react";
import { useObtenerMovimientos } from "../../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { HistorialIcono, UbicacionIcono } from "../../../../assets/Icons";
import {
  MapPin,
  Package,
  Layers,
  User,
  Search,
  ChevronRight,
  TrendingUp,
  Tag,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import SearchableSelect from "../../../UI/Select/SearchableSelect";

const ReporteUbicacionGeneral = () => {
  const [busqueda, setBusqueda] = useState("");
  const [etapaFiltro, setEtapaFiltro] = useState("TODAS");

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

  // Procesamos los movimientos extrayendo metadatos serializados
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
          etapa: meta.etapa || mov.etapa || "S/E",
          tipoEnvase: meta.tipoEnvase || "GRANEL",
          depositoNombre:
            mov.deposito?.nombre ||
            meta.nombreDeposito ||
            meta.depositoNombre ||
            "SIN GALPÓN",
        };
      });
  }, [movimientos]);

  // Extraemos etapas únicas presentes en el historial para autocompletar filtros extra
  const etapasUnicas = useMemo(() => {
    const etapas = movimientosProcesados.map((m) => m.etapa).filter(Boolean);
    return Array.from(new Set(etapas)).sort();
  }, [movimientosProcesados]);

  // Opciones para el filtro principal por ETAPA
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

    // Añadimos etapas históricas que no estén contempladas
    const existingStages = new Set(defaultStages);
    etapasUnicas.forEach((e) => {
      if (!existingStages.has(e)) {
        opts.push({ value: e, label: e.toUpperCase() });
      }
    });

    return opts;
  }, [etapasUnicas]);

  // Agrupamos el inventario actual de forma jerárquica: Depósito -> Paño -> (Lote + Cliente + Especie + Envase + Etapa)
  const inventarioJerarquico = useMemo(() => {
    const mapa = {};

    movimientosProcesados.forEach((m) => {
      const dep = m.depositoNombre;
      const pan = m.pano || "SIN PAÑO";
      const grano = m.materiaPrima?.nombre || m.nombreArticulo || "S/N";
      const lote = m.lote;
      const cli = m.cliente;
      const esIngreso = m.tipoMovimiento === "INGRESO";
      const cant = Number(m.cantidad) || 0;

      // Filtro principal por Etapa
      if (etapaFiltro !== "TODAS" && m.etapa !== etapaFiltro) return;

      // Filtro de búsqueda textual (aplica a galpón, paño, lote, cliente, grano, tipoEnvase, etapa)
      if (busqueda) {
        const searchStr =
          `${dep} ${pan} ${grano} ${lote} ${cli} ${m.tipoEnvase} ${m.etapa}`.toLowerCase();
        if (!searchStr.includes(busqueda.toLowerCase())) return;
      }

      if (!mapa[dep]) {
        mapa[dep] = {
          nombre: dep,
          kilosTotales: 0,
          panos: {},
        };
      }

      if (!mapa[dep].panos[pan]) {
        mapa[dep].panos[pan] = {
          nombre: pan,
          kilosTotales: 0,
          granos: {},
        };
      }

      const claveGrano = `${grano}-${lote}-${cli}-${m.tipoEnvase}-${m.etapa}`;
      if (!mapa[dep].panos[pan].granos[claveGrano]) {
        mapa[dep].panos[pan].granos[claveGrano] = {
          especie: grano,
          lote: lote,
          cliente: cli,
          tipoEnvase: m.tipoEnvase || "GRANEL",
          etapa: m.etapa || "S/E",
          kilos: 0,
        };
      }

      const factor = esIngreso ? 1 : -1;
      mapa[dep].kilosTotales += cant * factor;
      mapa[dep].panos[pan].kilosTotales += cant * factor;
      mapa[dep].panos[pan].granos[claveGrano].kilos += cant * factor;
    });

    // Convertimos el mapa en estructuras de arrays ordenadas
    return Object.values(mapa)
      .map((dep) => ({
        ...dep,
        panosList: Object.values(dep.panos)
          .map((pan) => ({
            ...pan,
            granosList: Object.values(pan.granos).filter((g) => g.kilos > 0), // sólo con stock positivo
          }))
          .filter((pan) => pan.granosList.length > 0), // sólo paños con contenido
      }))
      .filter((dep) => dep.panosList.length > 0); // sólo galpones con contenido
  }, [movimientosProcesados, etapaFiltro, busqueda]);

  // Métricas generales consolidadas del mapa de stock
  const metricasGenerales = useMemo(() => {
    let kilosTotales = 0;
    let cantDepositos = 0;
    let cantPanos = 0;
    const lotes = new Set();

    inventarioJerarquico.forEach((dep) => {
      cantDepositos++;
      dep.panosList.forEach((pan) => {
        cantPanos++;
        pan.granosList.forEach((g) => {
          kilosTotales += g.kilos;
          if (g.lote !== "S/L") lotes.add(g.lote);
        });
      });
    });

    return {
      kilos: kilosTotales,
      cantDep: cantDepositos,
      cantPan: cantPanos,
      cantLotes: lotes.size,
    };
  }, [inventarioJerarquico]);

  return (
    <ContenedorSeccion className="px-5 py-4 bg-[#f8fafc] min-h-screen font-sans">
      <EncabezadoSeccion
        ruta="UBICACIÓN (Vista General del Galpón)"
        icono={<UbicacionIcono size={22} className="text-slate-700" />}
        volver={true}
        redireccionAnterior="/panel"
      />

      <div className="space-y-6 mt-6 pb-20">
        {/* BARRA DE FILTROS */}
        <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Buscador */}
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar en el galpón..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-10 pl-10 pr-4 text-sm w-full rounded-md bg-slate-50/60 border border-slate-200 text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] transition-all font-semibold"
              />
            </div>

            {/* Selector de Etapa */}
            <div className="flex flex-col gap-1 w-full sm:w-64">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">
                Filtrar por Etapa
              </span>
              <SearchableSelect
                options={opcionesEtapa}
                value={etapaFiltro}
                onChange={(e) => setEtapaFiltro(e.target.value)}
                placeholder="Seleccionar etapa..."
                className="w-full font-semibold text-slate-700"
              />
            </div>
          </div>

          {/* Indicador de Filtro Activo */}
          {etapaFiltro !== "TODAS" && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-50 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-md">
                Etapa: {etapaFiltro}
              </span>
            </div>
          )}
        </div>

        {/* METRICAS TOTALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100 text-amber-800">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Kilos en Planta
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasGenerales.kilos.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-700">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Galpones Activos
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasGenerales.cantDep}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-50 rounded-md border border-green-100 text-green-700">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Paños Ocupados
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasGenerales.cantPan}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-purple-50 rounded-md border border-purple-100 text-purple-700">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                Lotes Identificados
              </p>
              <h3 className="text-xl font-bold text-slate-700 mt-1">
                {metricasGenerales.cantLotes}
              </h3>
            </div>
          </div>
        </div>

        {/* MAPA DE GALPONES */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-4" />
            <p className="text-slate-500 font-medium text-sm">
              Cargando distribución de stock en galpones...
            </p>
          </div>
        ) : inventarioJerarquico.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-md shadow-sm">
            <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-700">
              No se encontraron ubicaciones de grano
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Intenta ajustando los filtros o buscando otros términos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {inventarioJerarquico.map((dep, dIdx) => (
              <div
                key={dIdx}
                className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300"
              >
                {/* Cabecera del Galpón */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 rounded-md text-amber-800 border border-amber-100">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                        {dep.nombre}
                      </h3>
                      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                        COMPARTIMENTOS: {dep.panosList.length}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                      STOCK TOTAL
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {dep.kilosTotales.toLocaleString("es-AR")} kg
                    </span>
                  </div>
                </div>

                {/* Contenido por Paños */}
                <div className="p-5 flex-1 space-y-5 overflow-y-auto max-h-[500px] custom-scrollbar">
                  {dep.panosList.map((pan, pIdx) => (
                    <div
                      key={pIdx}
                      className="border border-slate-200 rounded-md p-4 bg-slate-50 hover:bg-white transition-all duration-200"
                    >
                      {/* Título de Paño */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <span className="bg-slate-800 text-white font-bold text-xs uppercase px-2.5 py-0.5 rounded-md">
                          PAÑO: {pan.nombre}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {pan.kilosTotales.toLocaleString("es-AR")} kg
                        </span>
                      </div>

                      {/* Lista de Granos en el Paño */}
                      <div className="space-y-2">
                        {pan.granosList.map((g, gIdx) => (
                          <div
                            key={gIdx}
                            className="bg-white border border-slate-100 rounded-md p-3 flex flex-wrap items-center justify-between gap-2 shadow-xs hover:border-slate-200 transition-all"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
                                {g.especie}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-slate-700 font-bold text-xs flex items-center gap-1 flex-wrap">
                                  <ChevronRight
                                    size={10}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <span>LOTE: {g.lote}</span>
                                  {g.etapa && g.etapa !== "S/E" && (
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${
                                        g.etapa === "INGRESO"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : g.etapa === "EGRESO"
                                            ? "bg-rose-50 text-rose-700 border-rose-100"
                                            : g.etapa === "EN PROCESO"
                                              ? "bg-amber-50 text-amber-700 border-amber-100"
                                              : g.etapa === "TERMINADO" ||
                                                  g.etapa ===
                                                    "TERMINADO MOV. STOCK"
                                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                                : "bg-slate-50 text-slate-600 border-slate-200"
                                      } uppercase ml-1 shrink-0`}
                                    >
                                      {g.etapa}
                                    </span>
                                  )}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <User
                                      size={10}
                                      className="text-slate-400 shrink-0"
                                    />
                                    {g.cliente}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    •
                                  </span>
                                  <span className="bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded-md text-[9px] font-semibold uppercase tracking-wider shrink-0">
                                    {g.tipoEnvase}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-800 font-bold text-xs">
                                {g.kilos.toLocaleString("es-AR")} kg
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ContenedorSeccion>
  );
};

export default ReporteUbicacionGeneral;
