import React, { useState, useEffect } from "react";
import {
  CerrarIcono,
  UbicacionIcono,
  CheckIcono,
  RolIcono,
} from "../../../assets/Icons";
import { useObtenerUnidadesNegocio } from "../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { useAlertas } from "../../../store/useAlertas";
import { axiosInitial } from "../../../Backend/Config";

const ModalVincularUnidadesUsuario = ({
  isOpen,
  onClose,
  empresa,
  usuario,
}) => {
  const [unidadesVinculadas, setUnidadesVinculadas] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const { data: unidadesDisponibles, isLoading } = useObtenerUnidadesNegocio({
    codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
  });

  // Cargar vinculaciones actuales
  useEffect(() => {
    if (isOpen && usuario && empresa) {
      cargarVinculaciones();
    }
  }, [isOpen, usuario, empresa]);

  const cargarVinculaciones = async () => {
    try {
      const res = await axiosInitial.get(
        `/unidadesNegocio/usuario/${usuario.codigoSecuencial}`,
        {
          params: {
            codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
          },
        },
      );
      setUnidadesVinculadas(res.data || []);
    } catch (error) {
      console.error("Error al cargar vinculaciones", error);
    }
  };

  const isVinculada = (unidad) => {
    if (!unidad || !unidadesVinculadas || !Array.isArray(unidadesVinculadas))
      return false;
    return unidadesVinculadas.some((u) => {
      const uId = Number(u.codigoSecuencial || u.codigo || u.id);
      const unidadId = Number(
        unidad.codigoSecuencial || unidad.codigo || unidad.id,
      );
      return uId === unidadId;
    });
  };

  const toggleVinculacion = async (unidad) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const vinculada = isVinculada(unidad);
      const codigoEmpresa = Number(empresa.codigo || empresa.codigoSecuencial);
      const usuarioId = Number(usuario.codigoSecuencial);
      const unidadId = Number(unidad.codigoSecuencial);

      if (vinculada) {
        // Desvincular
        await axiosInitial.delete(
          `/unidadesNegocio/desvincularUsuario/${usuarioId}/${unidadId}`,
          {
            params: { codigoEmpresa },
          },
        );
        agregarAlerta({
          type: "success",
          message: `Acceso revocado: ${unidad.nombre}`,
        });
      } else {
        // Vincular
        await axiosInitial.post(
          `/unidadesNegocio/vincularUsuario`,
          {
            codigoUsuarioSecuencial: usuarioId,
            codigoUnidadNegocioSecuencial: unidadId,
          },
          {
            params: { codigoEmpresa },
          },
        );
        agregarAlerta({
          type: "success",
          message: `Acceso concedido: ${unidad.nombre}`,
        });
      }

      // Forzamos la recarga inmediata de vinculaciones y esperamos a que termine
      await cargarVinculaciones();
    } catch (error) {
      console.error("Error en vinculación:", error);
      agregarAlerta({
        type: "error",
        message: "No se pudo actualizar el permiso",
      });
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center shadow-md">
              <UbicacionIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Vincular Unidades
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Gestionar acceso de{" "}
                <span className="text-black">
                  {usuario.nombre} {usuario.apellido}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* LISTADO DE UNIDADES */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                Cargando unidades...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unidadesDisponibles?.map((unidad) => {
                const vinculada = isVinculada(unidad);
                return (
                  <div
                    key={unidad.codigoSecuencial}
                    onClick={() => !procesando && toggleVinculacion(unidad)}
                    className={`p-3.5 rounded-md border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                      vinculada
                        ? "border-black bg-black/[0.02] shadow-sm"
                        : "border-black/10 hover:border-black/20 bg-white shadow-none"
                    } ${procesando ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* CHECKBOX CUSTOM */}
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                          vinculada
                            ? "bg-black border-black text-white"
                            : "bg-white border-black/10 text-transparent group-hover:border-black/30"
                        }`}
                      >
                        <CheckIcono size={14} strokeWidth={4} />
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-[13px] font-black uppercase tracking-tight transition-colors ${
                            vinculada
                              ? "text-black"
                              : "text-black/40 group-hover:text-black/60"
                          }`}
                        >
                          {unidad.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-black/20 tracking-tighter uppercase">
                            ID: #
                            {String(unidad.codigoSecuencial).padStart(3, "0")}
                          </span>
                          {unidad.direccion && (
                            <span className="text-[9px] font-bold text-black/20 uppercase truncate max-w-[120px]">
                              • {unidad.direccion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {vinculada ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black text-white rounded-full scale-90 animate-in zoom-in-50">
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Activo
                        </span>
                      </div>
                    ) : (
                      <span className="text-[8px] font-black text-black/20 uppercase tracking-widest group-hover:text-black/40 transition-colors">
                        Sin Acceso
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-black/10 bg-black/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-black text-white rounded-md text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-black/80 transition-all active:scale-95"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVincularUnidadesUsuario;
