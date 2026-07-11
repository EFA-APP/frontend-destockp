import React, { useState, useEffect } from "react";
import { CerrarIcono, AccionesSistemaIcono } from "../../../assets/Icons";
import { useCrearUnidadNegocio } from "../../../Backend/Autenticacion/queries/UnidadNegocio/useCrearUnidadNegocio.mutation";
import { useActualizarUnidadNegocio } from "../../../Backend/Autenticacion/queries/UnidadNegocio/useActualizarUnidadNegocio.mutation";
import { usePuntosVenta } from "../../../Backend/Arca/queries/usePuntosVenta.query";

const ModalCrearUnidadNegocio = ({ isOpen, onClose, empresa, unidadAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    activo: true,
    configuracion: {},
    puntoVenta: "",
  });

  const [configuracionRaw, setConfiguracionRaw] = useState("{}");
  const [errorJson, setErrorJson] = useState(null);

  const { mutateAsync: crearUnidad, isPending: isCreando } = useCrearUnidadNegocio();
  const { mutateAsync: actualizarUnidad, isPending: isActualizando } = useActualizarUnidadNegocio();

  const { data: puntosVentaData, isLoading: isCargandoPuntosVenta } = usePuntosVenta(
    empresa?.codigo || empresa?.codigo
  );

  useEffect(() => {
    if (unidadAEditar) {
      setFormData({
        nombre: unidadAEditar.nombre || "",
        descripcion: unidadAEditar.descripcion || "",
        direccion: unidadAEditar.direccion || "",
        activo: unidadAEditar.activo ?? true,
        configuracion: unidadAEditar.configuracion || {},
        puntoVenta: unidadAEditar.puntoVenta ?? "",
      });
      setConfiguracionRaw(JSON.stringify(unidadAEditar.configuracion || {}, null, 2));
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        direccion: "",
        activo: true,
        configuracion: {},
        puntoVenta: "",
      });
      setConfiguracionRaw("{}");
    }
    setErrorJson(null);
  }, [unidadAEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar JSON final antes de enviar
    try {
      const configObj = JSON.parse(configuracionRaw);
      const dataFinal = {
        ...formData,
        configuracion: configObj,
        puntoVenta: formData.puntoVenta ? Number(formData.puntoVenta) : undefined,
      };

      if (unidadAEditar) {
        await actualizarUnidad({
          codigo: unidadAEditar.codigo,
          codigoEmpresa: Number(empresa.codigo || empresa.codigo),
          data: dataFinal,
        });
      } else {
        await crearUnidad({
          codigoEmpresa: Number(empresa.codigo || empresa.codigo),
          data: dataFinal,
        });
      }
      onClose();
    } catch (error) {
      setErrorJson("El formato JSON no es válido");
      console.error("Error al procesar unidad de negocio", error);
    }
  };

  const handleJsonChange = (val) => {
    setConfiguracionRaw(val);
    try {
      JSON.parse(val);
      setErrorJson(null);
    } catch (e) {
      setErrorJson("Formato inválido");
    }
  };

  const isCargando = isCreando || isActualizando;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center shadow-md">
              <AccionesSistemaIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                {unidadAEditar ? "Editar Unidad" : "Nueva Unidad"}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                {unidadAEditar ? "Modifica los datos de la sucursal" : "Define una nueva sucursal o vertical"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">
              Nombre de la Unidad
            </label>
            <input
              required
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
              placeholder="EJ: SUCURSAL CENTRO, FÁBRICA, VENTAS ONLINE..."
              className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">
              Dirección (Opcional)
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Dirección física de la unidad..."
              className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Breve descripción del propósito de esta unidad..."
              rows={3}
              className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all resize-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40">
                Configuración Adicional (JSON)
              </label>
              {errorJson && (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                  {errorJson}
                </span>
              )}
            </div>
            <textarea
              value={configuracionRaw}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='{"clave": "valor"}'
              rows={4}
              className={`w-full px-4 py-2.5 bg-black/[0.02] border rounded-md text-[12px] font-mono focus:outline-none transition-all resize-none ${
                errorJson ? "border-rose-500/50 bg-rose-500/5" : "border-black/10 focus:border-black/30"
              }`}
            />
            <p className="text-[9px] font-bold text-black/20 uppercase tracking-tighter">
              Utiliza este campo para parámetros técnicos específicos de esta unidad.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">
              Punto de Venta (Opcional)
            </label>
            {isCargandoPuntosVenta ? (
              <div className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold text-black/40">
                Cargando Puntos de Venta desde AFIP...
              </div>
            ) : (
              <select
                value={formData.puntoVenta}
                onChange={(e) => setFormData({ ...formData, puntoVenta: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all appearance-none"
              >
                <option value="">-- Sin asignar --</option>
                {puntosVentaData?.ResultGet?.PtoVenta?.map((pv) => {
                  const bloqueado = pv.Bloqueado === "S" || pv.FchBaja !== "NULL";
                  return (
                    <option key={pv.Nro} value={pv.Nro} disabled={bloqueado}>
                      {String(pv.Nro).padStart(4, "0")} - {pv.EmisionTipo} {bloqueado ? "(BLOQUEADO/BAJA)" : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div
              onClick={() => setFormData({ ...formData, activo: !formData.activo })}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${formData.activo ? 'bg-emerald-500' : 'bg-black/20'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${formData.activo ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-black/60">
              {formData.activo ? 'UNIDAD ACTIVA' : 'UNIDAD INACTIVA'}
            </span>
          </div>

          {/* FOOTER */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-black/10 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCargando}
              className="flex-1 py-3 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-lg hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCargando ? "Procesando..." : (unidadAEditar ? "Guardar Cambios" : "Crear Unidad")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearUnidadNegocio;
