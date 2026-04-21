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
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden p-4">
      <EncabezadoSeccion
        ruta={modoAdmin ? "CONTACTOS / CONFIGURACIÓN" : "GESTIÓN DE CONTACTOS"}
        icono={<CuentaIcono size={18} />}
      >
        <div className="flex items-center gap-2">
          {!modoAdmin && (
            <button
              onClick={() => setVerImportar(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black transition-all border uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
            >
              <FileSpreadsheet size={12} />
              Carga Masiva
            </button>
          )}

          <TieneAccion accion="CONFIGURAR_CONTACTO">
            <button
              onClick={() => setModoAdmin(!modoAdmin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black transition-all border uppercase tracking-widest ${
                modoAdmin
                  ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                  : "bg-white/[0.03] text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ConfiguracionIcono size={12} />
              {modoAdmin ? "VOLVER" : "CONFIGURAR"}
            </button>
          </TieneAccion>
        </div>
      </EncabezadoSeccion>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar Ultra-Compacta */}
        <div className="w-52 shrink-0 flex flex-col gap-1.5 bg-[#0a0a0a] rounded-md border border-white/5 p-3 overflow-y-auto custom-scrollbar">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-2 mb-2">
            Entidades
          </span>

          {cargandoEntidades ? (
            <div className="space-y-2 px-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 bg-white/5 animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            <>
              {entidades.map((ent) => (
                <button
                  key={ent.codigoSecuencial}
                  onClick={() => {
                    setEntidadSeleccionada(ent);
                    setModoAdmin(false);
                    setFiltros((prev) => ({ ...prev, pagina: 1 }));
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-between group tracking-wide ${
                    entidadSeleccionada?.clave === ent.clave && !modoAdmin
                      ? "bg-white/5 text-white border border-white/10"
                      : "text-white/40 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: ent.color || "var(--primary)" }}
                    />
                    <span className="uppercase">{ent.nombre}</span>
                  </div>
                  {entidadSeleccionada?.clave === ent.clave && !modoAdmin && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: ent.color || "var(--primary)" }}
                    />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content Area con Glassmorphism */}
        <div className="flex-1 bg-[#0a0a0a] rounded-md border border-white/5 overflow-hidden flex flex-col relative group/content shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
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
