import { useState, useEffect } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CuentaIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import ListaContactos from "./ListaContactos";
import GestionEntidades from "./GestionEntidades";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { FileSpreadsheet } from "lucide-react";
import ModalCargaMasivaContactos from "../../../Modales/Contactos/ModalCargaMasivaContactos";

const DashboardContactos = () => {
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [verImportar, setVerImportar] = useState(false);
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    busqueda: "",
  });

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

  return (
    <div className="flex flex-col h-screen bg-[var(--fill)] text-[var(--text-primary)] overflow-hidden p-4 lg:p-6 gap-4">
      <EncabezadoSeccion
        ruta={modoAdmin ? "CONTACTOS / CONFIGURACIÓN" : "GESTIÓN DE CONTACTOS"}
        icono={<CuentaIcono size={18} />}
      >
        <div className="flex items-center gap-3">
          {!modoAdmin && (
            <button
              onClick={() => setVerImportar(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              Carga Masiva
            </button>
          )}

          <TieneAccion accion="CONFIGURAR_CONTACTO">
            <button
              onClick={() => setModoAdmin(!modoAdmin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest transition-all cursor-pointer ${
                modoAdmin
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shadow-sm"
              }`}
            >
              <ConfiguracionIcono size={14} />
              {modoAdmin ? "VOLVER" : "CONFIGURAR"}
            </button>
          </TieneAccion>
        </div>
      </EncabezadoSeccion>

      <div className="flex-1 flex gap-4 lg:gap-6 overflow-hidden">
        {/* Sidebar Moderna */}
        <div className="w-64 shrink-0 flex flex-col gap-1.5 bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] p-4 overflow-y-auto custom-scrollbar shadow-sm">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-3 mb-3">
            Entidades
          </span>

          {cargandoEntidades ? (
            <div className="space-y-3 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-[var(--fill-secondary)] animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {entidades.map((ent) => {
                const isActive =
                  entidadSeleccionada?.clave === ent.clave && !modoAdmin;
                return (
                  <button
                    key={ent.codigoSecuencial}
                    onClick={() => {
                      setEntidadSeleccionada(ent);
                      setModoAdmin(false);
                      setFiltros((prev) => ({ ...prev, pagina: 1 }));
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md text-[12px] font-bold flex items-center justify-between group transition-all tracking-wide cursor-pointer ${
                      isActive
                        ? "bg-[var(--primary-subtle)] text-[var(--primary-emphasis)] border border-[var(--primary)]/20 shadow-sm"
                        : "text-[var(--text-secondary)] hover:bg-[var(--fill-secondary)] hover:text-[var(--text-primary)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: ent.color || "var(--primary)",
                        }}
                      />
                      <span className="uppercase">{ent.nombre}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Area Refinada */}
        <div className="flex-1 bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] overflow-hidden flex flex-col relative shadow-md">
          {modoAdmin ? (
            <GestionEntidades />
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
