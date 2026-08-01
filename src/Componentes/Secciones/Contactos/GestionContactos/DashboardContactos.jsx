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
  Users,
  Key,
  Share2,
  FolderOpen,
} from "lucide-react";
import ModalCargaMasivaContactos from "../../../Modales/Contactos/ModalCargaMasivaContactos";

const DashboardContactos = () => {
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [verImportar, setVerImportar] = useState(false);

  const [tabActivo, setTabActivo] = useState("contactos");
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    busqueda: "",
  });

  const [pilaBreadcrumb, setPilaBreadcrumb] = useState([]);

  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [busquedaGlobalDebounced, setBusquedaGlobalDebounced] = useState("");
  const [mostrarDropdownGlobal, setMostrarDropdownGlobal] = useState(false);
  const buscadorGlobalRef = useRef(null);

  const { entidades, cargandoEntidades } = useEntidades();

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

  const {
    contactos: resultadosBusquedaGlobal,
    cargandoContactos: cargandoBusquedaGlobal,
  } = useContactos({ busqueda: busquedaGlobalDebounced, pagina: 1, limite: 8 });

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

  const codigoContactoEnFoco =
    pilaBreadcrumb[pilaBreadcrumb.length - 1]?.contacto?.codigo;
  const { data: contactoEnFoco, isLoading: cargandoContactoEnFoco } =
    useContactoQuery(codigoContactoEnFoco);

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
    setModoAdmin(false);
    setTabActivo("contactos");
    abrirFicha(contacto, { raiz: true });
    setMostrarDropdownGlobal(false);
    setBusquedaGlobal("");
  };

  const handleChangeTab = (tab) => {
    setModoAdmin(false);
    setTabActivo(tab);
    if (tab !== "contactos") {
      cerrarFicha();
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col text-gray-900 py-8 px-6 lg:px-8 gap-6">
      <EncabezadoSeccion
        ruta={modoAdmin ? "CONFIGURACIÓN DE CONTACTOS" : "CONTACTOS"}
        icono={<CuentaIcono size={18} />}
      />

      <div className="flex-1 flex flex-col md:flex-row gap-6 items-start overflow-hidden">
        {/* PANEL IZQUIERDO: Navegación & Filtros */}
        <aside className="w-full md:w-[280px] shrink-0 flex flex-col gap-6">
          {/* Buscador Global (Siempre visible en el menú lateral) */}
          <div ref={buscadorGlobalRef} className="relative z-50">
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#1FAE6D]/20 focus-within:border-[#1FAE6D] transition-all">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={busquedaGlobal}
                onChange={(e) => {
                  setBusquedaGlobal(e.target.value);
                  setMostrarDropdownGlobal(true);
                }}
                onFocus={() => setMostrarDropdownGlobal(true)}
                placeholder="Búsqueda global..."
                className="bg-transparent border-none outline-none text-[13px] font-semibold py-0.5 px-3 w-full text-gray-800 placeholder:font-normal placeholder:text-gray-400"
              />
              {busquedaGlobal && (
                <button
                  onClick={() => setBusquedaGlobal("")}
                  className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {mostrarDropdownGlobal && busquedaGlobalDebounced && (
              <div className="absolute top-full mt-2 left-0 w-[350px] bg-white border border-gray-200 rounded-md shadow-xl p-1.5 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                {cargandoBusquedaGlobal ? (
                  <div className="px-4 py-4 text-[11px] text-gray-500 text-center font-bold uppercase tracking-widest">
                    Buscando...
                  </div>
                ) : resultadosBusquedaGlobal.length === 0 ? (
                  <div className="px-4 py-4 text-[11px] text-gray-500 text-center font-bold uppercase tracking-widest italic">
                    Sin resultados
                  </div>
                ) : (
                  resultadosBusquedaGlobal.map((c) => (
                    <button
                      key={c.codigo}
                      type="button"
                      onClick={() => handleSeleccionarResultadoGlobal(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1FAE6D]/10 border border-[#1FAE6D]/20 flex items-center justify-center text-[#1FAE6D] font-black text-[12px] shrink-0 uppercase">
                        {(c.nombre || c.razonSocial || "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-bold text-gray-800 truncate block">
                          {c.razonSocial ||
                            `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
                            "Sin Nombre"}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate block">
                          DNI/CUIT: {c.documento || "S/D"}
                        </span>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest bg-gray-50 border-gray-200 text-gray-600">
                        {c.tipoEntidad}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="flex flex-col bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            {/* Directorio */}
            <div className="flex flex-col">
              <button
                onClick={() => handleChangeTab("contactos")}
                className={`flex items-center gap-3 px-4 py-4 text-left font-bold text-[12px] uppercase tracking-widest transition-colors cursor-pointer border-l-4 ${
                  !modoAdmin && tabActivo === "contactos"
                    ? "bg-[#1FAE6D]/5 text-[#1FAE6D] border-[#1FAE6D]"
                    : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FolderOpen size={16} />
                Directorio
              </button>

              {/* Submenú de Entidades (solo visible si estamos en Directorio) */}
              {!modoAdmin && tabActivo === "contactos" && (
                <div className="flex flex-col px-3 pb-3 gap-1 bg-white">
                  {cargandoEntidades
                    ? [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-full h-8 bg-gray-100 animate-pulse rounded-md"
                        />
                      ))
                    : entidades.map((ent) => {
                        const isActive =
                          entidadSeleccionada?.clave === ent.clave;
                        return (
                          <button
                            key={ent.codigo}
                            onClick={() => {
                              setEntidadSeleccionada(ent);
                              setFiltros((prev) => ({ ...prev, pagina: 1 }));
                              cerrarFicha();
                            }}
                            className={`w-full rounded-md text-[12px] font-bold tracking-wide transition-colors flex items-center px-4 py-2.5 cursor-pointer ${
                              isActive
                                ? "text-[#1FAE6D] bg-[#1FAE6D]/10"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {ent.nombre}
                          </button>
                        );
                      })}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-gray-100" />

            {/* Usuarios */}
            <button
              onClick={() => handleChangeTab("usuarios")}
              className={`flex items-center gap-3 px-4 py-4 text-left font-bold text-[12px] uppercase tracking-widest transition-colors cursor-pointer border-l-4 ${
                !modoAdmin && tabActivo === "usuarios"
                  ? "bg-[#1FAE6D]/5 text-[#1FAE6D] border-[#1FAE6D]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Key size={16} />
              Accesos
            </button>

            <div className="h-[1px] bg-gray-100" />

            {/* Relaciones */}
            <button
              onClick={() => handleChangeTab("relaciones")}
              className={`flex items-center gap-3 px-4 py-4 text-left font-bold text-[12px] uppercase tracking-widest transition-colors cursor-pointer border-l-4 ${
                !modoAdmin && tabActivo === "relaciones"
                  ? "bg-[#1FAE6D]/5 text-[#1FAE6D] border-[#1FAE6D]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Share2 size={16} />
              Vínculos
            </button>
            <TieneAccion accion="CONFIGURAR_CONTACTO">
              <button
                onClick={() => setModoAdmin(true)}
                className={`flex items-center gap-3 px-4 py-4 text-left font-bold text-[12px] uppercase tracking-widest transition-colors cursor-pointer border-l-4 ${
                  modoAdmin
                    ? "bg-gray-900 text-white border-gray-900 hover:bg-black"
                    : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <ConfiguracionIcono size={24} />
                Configuración
              </button>
            </TieneAccion>
          </nav>
        </aside>

        {/* PANEL DERECHO: Área Principal de Trabajo */}
        <main className="flex-1 w-full bg-white border border-gray-200 rounded-md shadow-sm min-h-[600px] flex flex-col overflow-hidden">
          {/* Cabecera dinámica del panel */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
            <div>
              <h2 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">
                {modoAdmin
                  ? "Configuración Avanzada"
                  : tabActivo === "contactos"
                    ? `Directorio > ${entidadSeleccionada?.nombre || ""}`
                    : tabActivo === "usuarios"
                      ? "Gestión de Accesos"
                      : "Gestión de Vínculos"}
              </h2>
              <p className="text-[11px] text-gray-500 font-bold mt-1">
                {modoAdmin
                  ? "Administra entidades y configuraciones de relaciones del sistema."
                  : tabActivo === "contactos"
                    ? "Gestiona la base de datos de personas y organizaciones."
                    : tabActivo === "usuarios"
                      ? "Habilita credenciales de acceso para los contactos."
                      : "Visualiza y administra las relaciones entre distintas entidades."}
              </p>
            </div>

            {/* Acciones de Cabecera */}
            {!modoAdmin && tabActivo === "contactos" && (
              <button
                onClick={() => setVerImportar(true)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900 uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
              >
                <FileSpreadsheet size={16} />
                Carga Masiva
              </button>
            )}
          </div>

          {/* Contenido (Renderizado Condicional) */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            {modoAdmin ? (
              <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-transparent">
                <GestionEntidades />
                <div className="border-t border-gray-200 px-6 pb-8 pt-2 lg:px-8">
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
        </main>
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
