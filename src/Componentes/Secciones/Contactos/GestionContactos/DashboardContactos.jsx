import { useState, useEffect, useRef } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CuentaIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useContactoQuery } from "../../../../Backend/Contactos/hooks/useRelacionesContacto";
import ListaContactos from "./ListaContactos";
import ListaUsuariosContactos from "./ListaUsuariosContactos";
import ListaRelacionesContactos from "./ListaRelacionesContactos";
import GestionEntidades from "./GestionEntidades";
import GestionRelaciones from "./GestionRelaciones";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import {
  FileSpreadsheet,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import ModalCargaMasivaContactos from "../../../Modales/Contactos/ModalCargaMasivaContactos";

// Feature 33 (contactos-relaciones-ui), rediseño de layout aprobado el
// 2026-07-17 (design.md §1): buscador global + sidebar secundario
// colapsable + drill-down real con breadcrumb en estado local (NO en la
// URL/query params, ver design.md §1.4).
const DashboardContactos = () => {
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [verImportar, setVerImportar] = useState(false);

  // Feature 34 (contactos-habilitar-usuario-masivo, R1-R4): tab activo,
  // estado local de sesión (no URL/localStorage, mismo criterio ya
  // documentado para pilaBreadcrumb en la feature 33).
  const [tabActivo, setTabActivo] = useState("contactos");
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    busqueda: "",
  });

  // §1.3: sidebar colapsado por defecto (riel de íconos), no persistido.
  const [sidebarExpandido, setSidebarExpandido] = useState(false);

  // §1.4: pila de navegación de drill-down. Estado local de React,
  // deliberadamente NO reflejada en la URL/query params (ver design.md
  // §1.4 para la justificación completa contra router/Router.jsx).
  const [pilaBreadcrumb, setPilaBreadcrumb] = useState([]);

  // §1.2: buscador global de contactos (cross-tipo, sin tipoEntidad).
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [busquedaGlobalDebounced, setBusquedaGlobalDebounced] = useState("");
  const [mostrarDropdownGlobal, setMostrarDropdownGlobal] = useState(false);
  const buscadorGlobalRef = useRef(null);

  const { entidades, cargandoEntidades } = useEntidades();

  // Seleccionar la primera entidad automáticamente al cargar
  useEffect(() => {
    if (!entidadSeleccionada && entidades.length > 0 && !modoAdmin) {
      setEntidadSeleccionada(entidades[0]);
    }
  }, [entidades, entidadSeleccionada, modoAdmin]);

  const {
    contactos,
    total,
    paginas,
    paginaActual,
    cargandoContactos,
    eliminarContacto,
    refetch,
  } = useContactos({
    tipoEntidad: entidadSeleccionada?.clave,
    ...filtros,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaGlobalDebounced(busquedaGlobal.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaGlobal]);

  // R47-R49: reutiliza useContactos sin tipoEntidad — NO se crea ningún
  // endpoint nuevo (design.md §1.2, §7.4).
  const {
    contactos: resultadosBusquedaGlobal,
    cargandoContactos: cargandoBusquedaGlobal,
  } = useContactos({ busqueda: busquedaGlobalDebounced, pagina: 1, limite: 8 });

  // Cerrar el dropdown al hacer clic afuera.
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (
        buscadorGlobalRef.current &&
        !buscadorGlobalRef.current.contains(e.target)
      ) {
        setMostrarDropdownGlobal(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // §2.6, §3.1: contacto actualmente en foco (último paso de la pila),
  // elevado desde ListaContactos.jsx a este componente.
  const codigoContactoEnFoco =
    pilaBreadcrumb[pilaBreadcrumb.length - 1]?.contacto?.codigo;
  const { data: contactoEnFoco, isLoading: cargandoContactoEnFoco } =
    useContactoQuery(codigoContactoEnFoco);

  // §1.4: contrato de la pila de breadcrumb (abrirFicha/volverA/cerrarFicha).
  const abrirFicha = (contacto, { relacionOrigen, raiz = false } = {}) => {
    setPilaBreadcrumb((prev) =>
      raiz ? [{ contacto }] : [...prev, { contacto, relacionOrigen }],
    );
  };

  const volverA = (indice) => {
    setPilaBreadcrumb((prev) => prev.slice(0, indice + 1));
  };

  const cerrarFicha = () => setPilaBreadcrumb([]);

  const handleSeleccionarResultadoGlobal = (contacto) => {
    abrirFicha(contacto, { raiz: true });
    setMostrarDropdownGlobal(false);
    setBusquedaGlobal("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50/50 text-[var(--color-neutral-text-main)] overflow-hidden p-4 lg:p-6 gap-4">
      <EncabezadoSeccion
        ruta={modoAdmin ? "CONFIGURACIÓN" : "CONTACTOS"}
        icono={<CuentaIcono size={18} />}
      >
        <div className="flex items-center gap-3">
          {!modoAdmin && (
            <button
              onClick={() => setVerImportar(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[11px] font-bold border uppercase tracking-widest bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/20 hover:bg-[var(--color-brand-primary)]/10 transition-colors shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Carga Masiva
            </button>
          )}

          <TieneAccion accion="CONFIGURAR_CONTACTO">
            <button
              onClick={() => setModoAdmin(!modoAdmin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[11px] font-bold border uppercase tracking-widest transition-colors cursor-pointer shadow-sm ${
                modoAdmin
                  ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                  : "bg-white text-[var(--color-neutral-text-muted)] border-[var(--color-neutral-border)] hover:bg-gray-50 hover:text-[var(--color-neutral-text-main)]"
              }`}
            >
              <ConfiguracionIcono size={16} />
              {modoAdmin ? "VOLVER" : "CONFIGURAR"}
            </button>
          </TieneAccion>
        </div>
      </EncabezadoSeccion>

      {/* TABS 'Contactos'/'Usuarios' (Feature 34, R1-R4): arriba del buscador global */}
      {!modoAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTabActivo("contactos")}
            className={`px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
              tabActivo === "contactos"
                ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                : "bg-white text-[var(--color-neutral-text-muted)] border-[var(--color-neutral-border)] hover:bg-gray-50 hover:text-[var(--color-neutral-text-main)]"
            }`}
          >
            Contactos
          </button>
          <button
            onClick={() => setTabActivo("usuarios")}
            className={`px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
              tabActivo === "usuarios"
                ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                : "bg-white text-[var(--color-neutral-text-muted)] border-[var(--color-neutral-border)] hover:bg-gray-50 hover:text-[var(--color-neutral-text-main)]"
            }`}
          >
            Usuarios
          </button>
          {/* Feature 35 (contactos-tabs-usuarios-relaciones-globales, R15-R17) */}
          <button
            onClick={() => setTabActivo("relaciones")}
            className={`px-4 py-2 rounded-[8px] text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer border ${
              tabActivo === "relaciones"
                ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                : "bg-white text-[var(--color-neutral-text-muted)] border-[var(--color-neutral-border)] hover:bg-gray-50 hover:text-[var(--color-neutral-text-main)]"
            }`}
          >
            Relaciones
          </button>
        </div>
      )}

      {/* BUSCADOR GLOBAL (§1.2, R47-R49): punto de entrada principal, cross-tipo.
          Feature 36 (contactos-relaciones-agrupadas-por-contacto, R31, R32):
          oculto fuera del tab "Contactos" (los tabs "Usuarios"/"Relaciones"
          ya tienen su propio buscador local funcional). */}
      {!modoAdmin && tabActivo === "contactos" && (
        <div ref={buscadorGlobalRef} className="relative shrink-0">
          <div className="flex items-center bg-white border border-[var(--color-neutral-border)] rounded-[10px] px-4 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/20 transition-all max-w-xl">
            <Search
              size={16}
              className="text-[var(--color-neutral-text-muted)]"
            />
            <input
              type="text"
              value={busquedaGlobal}
              onChange={(e) => {
                setBusquedaGlobal(e.target.value);
                setMostrarDropdownGlobal(true);
              }}
              onFocus={() => setMostrarDropdownGlobal(true)}
              placeholder="Buscar cualquier contacto (Alumnos, Proveedores, Padres...)"
              className="bg-transparent border-none outline-none text-[13px] font-medium py-2.5 px-3 w-full text-[var(--color-neutral-text-main)]"
            />
            {busquedaGlobal && (
              <button
                onClick={() => setBusquedaGlobal("")}
                className="text-[var(--color-neutral-text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {mostrarDropdownGlobal && busquedaGlobalDebounced && (
            <div className="absolute top-full mt-1 left-0 w-full max-w-xl bg-white border border-[var(--color-neutral-border)] rounded-[10px] shadow-2xl z-50 p-1.5 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
              {cargandoBusquedaGlobal ? (
                <div className="px-4 py-3 text-[11px] text-[var(--color-neutral-text-muted)] text-center font-bold uppercase">
                  Buscando...
                </div>
              ) : resultadosBusquedaGlobal.length === 0 ? (
                <div className="px-4 py-3 text-[11px] text-[var(--color-neutral-text-muted)] text-center font-bold uppercase italic">
                  Sin resultados
                </div>
              ) : (
                resultadosBusquedaGlobal.map((c) => (
                  <button
                    key={c.codigo}
                    type="button"
                    onClick={() => handleSeleccionarResultadoGlobal(c)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-[var(--color-brand-soft)] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-brand-primary)]/20 flex items-center justify-center text-[var(--color-brand-primary)] font-black text-[12px] shrink-0 uppercase">
                      {(c.nombre || c.razonSocial || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-bold text-[var(--color-neutral-text-main)] truncate block">
                        {c.razonSocial ||
                          `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
                          "Sin Nombre"}
                      </span>
                      <span className="text-[10px] text-[var(--color-neutral-text-muted)] font-bold uppercase truncate block">
                        DNI/CUIT: {c.documento || "S/D"}
                      </span>
                    </div>
                    <span className="shrink-0 text-[9px] font-black uppercase px-2 py-1 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20">
                      {c.tipoEntidad}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* SIDEBAR SECUNDARIO/COLAPSABLE (§1.3, R22, R51-R53) — oculto en el
            tab 'Usuarios' (Feature 34, R3), no aplica cross-entidad.
            Feature 36 (contactos-relaciones-agrupadas-por-contacto, R4):
            visible también en el tab 'Relaciones', mismo comportamiento de
            selección de entidad. */}
        {!modoAdmin && (tabActivo === "contactos" || tabActivo === "relaciones") && (
          <div
            className={`flex flex-col bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-sm shrink-0 overflow-hidden transition-all duration-200 ${
              sidebarExpandido ? "w-full md:w-64" : "w-full md:w-14"
            }`}
          >
            <div
              className={`flex items-center shrink-0 p-2 ${sidebarExpandido ? "justify-between" : "justify-center"}`}
            >
              {sidebarExpandido && (
                <h3 className="text-[10px] font-bold uppercase text-[var(--color-neutral-text-muted)] tracking-wider px-2">
                  Categorías
                </h3>
              )}
              <button
                onClick={() => setSidebarExpandido((v) => !v)}
                title={sidebarExpandido ? "Colapsar" : "Expandir"}
                className="p-1.5 rounded-md text-[var(--color-neutral-text-muted)] hover:bg-gray-50 hover:text-[var(--color-neutral-text-main)] transition-colors cursor-pointer shrink-0"
              >
                {sidebarExpandido ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>

            <div className="flex flex-col gap-1 p-2 pt-0 overflow-y-auto custom-scrollbar">
              {cargandoEntidades
                ? [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full h-10 bg-black/5 animate-pulse rounded-md"
                    />
                  ))
                : entidades.map((ent) => {
                    const isActive = entidadSeleccionada?.clave === ent.clave;
                    return (
                      <button
                        key={ent.codigo}
                        onClick={() => {
                          setEntidadSeleccionada(ent);
                          setFiltros((prev) => ({ ...prev, pagina: 1 }));
                          cerrarFicha();
                        }}
                        title={ent.nombre}
                        className={`w-full rounded-[8px] text-[13px] font-bold tracking-wide transition-colors flex items-center gap-3 cursor-pointer ${
                          sidebarExpandido
                            ? "px-4 py-3 justify-start"
                            : "px-0 py-3 justify-center"
                        } ${
                          isActive
                            ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]"
                            : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
                        }`}
                      >
                        {sidebarExpandido ? (
                          <span className="truncate">{ent.nombre}</span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-white border border-[var(--color-neutral-border)] flex items-center justify-center text-[11px] font-black uppercase shrink-0">
                            {ent.nombre?.charAt(0)}
                          </span>
                        )}
                      </button>
                    );
                  })}
            </div>
          </div>
        )}

        {/* Content Area Refinada */}
        <div className="flex-1 rounded-md flex flex-col overflow-hidden">
          {modoAdmin ? (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-transparent">
              <GestionEntidades />
              <div className="border-t border-[var(--color-neutral-border)] px-6 pb-8 pt-2 lg:px-8">
                <GestionRelaciones />
              </div>
            </div>
          ) : tabActivo === "usuarios" ? (
            <ListaUsuariosContactos />
          ) : tabActivo === "relaciones" ? (
            <ListaRelacionesContactos entidad={entidadSeleccionada} />
          ) : (
            <ListaContactos
              entidad={entidadSeleccionada}
              contactos={contactos}
              cargando={cargandoContactos}
              filtros={filtros}
              setFiltros={setFiltros}
              total={total}
              paginas={paginas}
              eliminarContacto={eliminarContacto}
              contactoEnFoco={contactoEnFoco}
              cargandoContactoEnFoco={cargandoContactoEnFoco}
              fichaAbierta={pilaBreadcrumb.length > 0}
              pilaBreadcrumb={pilaBreadcrumb}
              onAbrirFicha={abrirFicha}
              onVolverA={volverA}
              onCerrarFicha={cerrarFicha}
            />
          )}
        </div>
      </div>

      <ModalCargaMasivaContactos
        open={verImportar}
        onClose={() => setVerImportar(false)}
        onExito={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default DashboardContactos;
