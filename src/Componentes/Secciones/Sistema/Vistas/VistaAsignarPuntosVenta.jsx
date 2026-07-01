import React, { useState, useEffect } from "react";
import { useObtenerUnidadesNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { actualizarUnidadNegocioApi } from "../../../../Backend/Autenticacion/api/UnidadNegocio/unidadesNegocio.api";
import { ObtenerPuntosVentaApi } from "../../../../Backend/Arca/api/arca.api";
import { useAlertas } from "../../../../store/useAlertas";
import { VolverIcono } from "../../../../assets/Icons";

const VistaAsignarPuntosVenta = ({ empresa, onClose }) => {
  const codigoEmpresa = empresa.codigo || empresa.codigoSecuencial;
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const { data: unidades, isLoading, refetch } = useObtenerUnidadesNegocio({
    codigoEmpresa,
  });

  const [puntosVentaAfip, setPuntosVentaAfip] = useState([]);
  const [loadingPv, setLoadingPv] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cambios, setCambios] = useState({});

  const cargarPuntosVenta = async () => {
    setLoadingPv(true);
    try {
      const resultado = await ObtenerPuntosVentaApi({ codigoEmpresa });
      const lista = resultado?.data ?? resultado ?? [];
      setPuntosVentaAfip(Array.isArray(lista) ? lista : []);
    } catch (error) {
      agregarAlerta({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Error al obtener los puntos de venta de AFIP",
      });
    } finally {
      setLoadingPv(false);
    }
  };

  useEffect(() => {
    cargarPuntosVenta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoEmpresa]);

  const handleSelectChange = (codigoSecuencial, val) => {
    setCambios((prev) => ({
      ...prev,
      [codigoSecuencial]: val === "" ? null : Number(val),
    }));
  };

  const handleGuardar = async () => {
    const codigosConCambio = Object.keys(cambios);
    if (codigosConCambio.length === 0) return;

    setGuardando(true);
    try {
      await Promise.all(
        codigosConCambio.map((cs) =>
          actualizarUnidadNegocioApi(Number(cs), codigoEmpresa, {
            puntoVenta: cambios[cs],
          })
        )
      );
      agregarAlerta({
        type: "success",
        message: "Puntos de venta asignados correctamente",
      });
      setCambios({});
      refetch();
    } catch (error) {
      agregarAlerta({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Error al guardar los puntos de venta",
      });
    } finally {
      setGuardando(false);
    }
  };

  const hayCambios = Object.keys(cambios).length > 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-all group"
          >
            <VolverIcono
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
              Puntos de Venta
            </h1>
            <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-1">
              Asignación por unidad de{" "}
              <span className="text-black">{empresa.nombre}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarPuntosVenta}
            disabled={loadingPv}
            className="px-4 py-2 bg-white border border-black/10 rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/5 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingPv ? "Cargando..." : "Actualizar PVs AFIP"}
          </button>
          <button
            onClick={handleGuardar}
            disabled={!hayCambios || guardando}
            className="px-4 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-xl hover:bg-black/80 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Cargando unidades...
            </div>
          ) : !unidades || unidades.length === 0 ? (
            <div className="p-8 text-center text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              No hay unidades de negocio para esta empresa.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.02]">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Descripcion
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    PV Actual
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Asignar PV
                  </th>
                </tr>
              </thead>
              <tbody>
                {unidades.map((unidad) => {
                  const cs = unidad.codigoSecuencial;
                  const pvActual = unidad.puntoVenta;
                  const selectValue =
                    cs in cambios
                      ? cambios[cs] === null
                        ? ""
                        : String(cambios[cs])
                      : pvActual != null
                      ? String(pvActual)
                      : "";

                  return (
                    <tr
                      key={cs}
                      className="border-b border-black/5 last:border-0 hover:bg-black/[0.01] transition-colors"
                    >
                      <td className="px-4 py-3 text-[13px] font-bold text-black">
                        {unidad.nombre}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">
                        {unidad.descripcion || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {pvActual != null ? (
                          <span className="text-[11px] font-black uppercase tracking-widest bg-violet-100 text-violet-700 px-2 py-1 rounded">
                            {pvActual}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[var(--text-muted)] bg-black/5 px-2 py-1 rounded">
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={selectValue}
                          onChange={(e) =>
                            handleSelectChange(cs, e.target.value)
                          }
                          disabled={loadingPv}
                          className="px-3 py-2 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all disabled:opacity-50 min-w-[200px]"
                        >
                          <option value="">Sin asignar</option>
                          {puntosVentaAfip.map((pv) => (
                            <option key={pv.nro} value={String(pv.nro)}>
                              {pv.nro} — {pv.emisionTipo}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {puntosVentaAfip.length === 0 && !loadingPv && (
          <p className="mt-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">
            No se cargaron puntos de venta de AFIP. Presiona "Actualizar PVs
            AFIP" para intentarlo.
          </p>
        )}
      </div>
    </div>
  );
};

export default VistaAsignarPuntosVenta;
