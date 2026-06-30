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
        ruta={modoAdmin ? "CONFIGURACIÓN" : "CONTACTOS"}
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

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* BARRA LATERAL (ENTIDADES Y BOTÓN AGREGAR) */}
        {!modoAdmin && (
          <div className="w-full md:w-64 flex flex-col gap-4 p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm shrink-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mt-2 mb-1 px-2">Categorías</h3>
            <div className="flex flex-col gap-1">
            {cargandoEntidades ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-32 h-10 bg-black/5 animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : (
              entidades.map((ent) => {
                const isActive = entidadSeleccionada?.clave === ent.clave;
                return (
                  <button
                    key={ent.codigoSecuencial}
                    onClick={() => {
                      setEntidadSeleccionada(ent);
                      setFiltros((prev) => ({ ...prev, pagina: 1 }));
                    }}
                    className={`
                      w-full px-4 py-3 rounded-md text-[13px] font-bold tracking-wide transition-all duration-200 flex items-center gap-3 cursor-pointer
                      ${
                        isActive
                          ? "text-[var(--primary)] bg-[var(--primary)]/10"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--fill-secondary)]"
                      }
                    `}
                  >
                    <span className="truncate">{ent.nombre}</span>
                  </button>
                );
              })
            )}
            </div>
          </div>
        )}

        {/* Content Area Refinada */}
        <div className="flex-1 rounded-md flex flex-col ">
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
