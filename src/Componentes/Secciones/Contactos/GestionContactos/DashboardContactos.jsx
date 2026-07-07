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

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* BARRA LATERAL (ENTIDADES Y BOTÓN AGREGAR) */}
        {!modoAdmin && (
          <div className="w-full md:w-64 flex flex-col gap-4 p-4 bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-sm shrink-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-[11px] font-bold uppercase text-[var(--color-neutral-text-muted)] tracking-wider mt-2 mb-1 px-2">Categorías</h3>
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
                      w-full px-4 py-3 rounded-[8px] text-[13px] font-bold tracking-wide transition-colors flex items-center gap-3 cursor-pointer
                      ${
                        isActive
                          ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]"
                          : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-50"
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
