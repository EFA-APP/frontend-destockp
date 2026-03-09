import { useState, useEffect } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, ProduccionIcono } from "../../../assets/Icons";

const ModalMovimiento = ({ open, onClose, articulo, tipo = "PRODUCTO" }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const { mutate: crearMovimiento, isPending } = useCrearMovimiento();

  const [formData, setFormData] = useState({
    tipoMovimiento: "INGRESO",
    origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
    cantidad: "",
    observacion: "",
  });

  // Resetear origen según el tipo de movimiento
  useEffect(() => {
    if (formData.tipoMovimiento === "AJUSTE") {
      setFormData(prev => ({ ...prev, origenMovimiento: "AJUSTE_MANUAL" }));
    } else if (formData.tipoMovimiento === "EGRESO") {
        setFormData(prev => ({ ...prev, origenMovimiento: "VENTA" }));
    } else {
        setFormData(prev => ({ ...prev, origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO" }));
    }
  }, [formData.tipoMovimiento, tipo]);

  if (!articulo || !open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) return;

    const payload = {
      codigoArticulo: articulo.codigoSecuencial,
      tipoArticulo: tipo,
      ...formData,
      cantidad: parseFloat(formData.cantidad),
      codigoUsuario: usuario?.id || 1, // Fallback por seguridad
      nombreUsuario: usuario?.nombre || "Sistema",
    };

    crearMovimiento(payload, {
      onSuccess: () => {
        onClose();
        setFormData({
          tipoMovimiento: "INGRESO",
          origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
          cantidad: "",
          observacion: "",
        });
      },
    });
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending || !formData.cantidad}
        className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-bold transition-all shadow-lg shadow-amber-500/20"
      >
        <GuardarIcono size={18} />
        {isPending ? "Registrando..." : "Registrar Movimiento"}
      </button>
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <ModalDetalle
        title={`Registrar Movimiento`}
        icon={<ProduccionIcono size={20} />}
        onClose={onClose}
        footer={footer}
      >
        <div className="space-y-4 py-2">
          {/* Info del Producto */}
          <div className="bg-white/5 rounded-md p-3 border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Artículo</div>
                <div className="text-sm font-bold text-white leading-tight">{articulo.nombre}</div>
                <div className="text-[11px] text-amber-500/80 font-bold mt-0.5">#{articulo.codigoSecuencial}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Stock Actual</div>
                <div className="text-sm font-bold text-white">{articulo.stock || 0} <span className="text-[10px] font-normal text-white/40">{articulo.unidadMedida}</span></div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
               <div className="text-[10px] text-white/30 font-medium italic">
                  Fecha: {new Date().toLocaleDateString('es-AR')}
               </div>
               <div className="text-[10px] text-white/30 font-medium">
                  {tipo.replace('_', ' ')}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Movimiento */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Tipo</label>
              <select
                name="tipoMovimiento"
                value={formData.tipoMovimiento}
                onChange={handleChange}
                className="w-full bg-[#1a1c1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                <option value="INGRESO">Ingreso (+)</option>
                <option value="EGRESO">Egreso (-)</option>
                <option value="AJUSTE">Ajuste (Manual)</option>
              </select>
            </div>

            {/* Cantidad */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-[#1a1c1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Origen */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Origen / Destino</label>
            <select
              name="origenMovimiento"
              value={formData.origenMovimiento}
              onChange={handleChange}
              className="w-full bg-[#1a1c1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              {formData.tipoMovimiento === "INGRESO" && (
                <>
                  <option value="PRODUCCION">Producción</option>
                  <option value="DEPOSITO">Depósito</option>
                  <option value="INGRESO_FRUTA_MP">Ingreso Fruta (MP)</option>
                </>
              )}
              {formData.tipoMovimiento === "EGRESO" && (
                <>
                  <option value="VENTA">Venta</option>
                  <option value="DEPOSITO">Depósito</option>
                </>
              )}
              {formData.tipoMovimiento === "AJUSTE" && (
                <option value="AJUSTE_MANUAL">Ajuste Manual</option>
              )}
            </select>
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Observación (Opcional)</label>
            <textarea
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              rows="2"
              placeholder="Razon del movimiento..."
              className="w-full bg-[#1a1c1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>
        </div>
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalMovimiento;
