import { useState, useEffect } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import {
  GuardarIcono,
  MovimientoIcono,
  ProduccionIcono,
} from "../../../assets/Icons";

const ModalMovimiento = ({
  open,
  onClose,
  articulo,
  tipo = "PRODUCTO",
  isStandalone = false,
}) => {
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
      setFormData((prev) => ({ ...prev, origenMovimiento: "AJUSTE_MANUAL" }));
    } else if (formData.tipoMovimiento === "EGRESO") {
      setFormData((prev) => ({ ...prev, origenMovimiento: "VENTA" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
      }));
    }
  }, [formData.tipoMovimiento, tipo]);

  if (!articulo || (!open && !isStandalone)) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) return;

    const payload = {
      codigoArticulo: articulo.codigo,
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
        className="px-5 py-2.5 text-[13px] font-bold text-[var(--color-neutral-text-main)] hover:bg-gray-100 rounded-[8px] transition-colors border border-transparent hover:border-[var(--color-neutral-border)]"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending || !formData.cantidad}
        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-[8px] font-bold text-[13px] uppercase tracking-wide transition-colors active:scale-95 shadow-sm"
      >
        <GuardarIcono size={18} />
        {isPending ? "Registrando..." : "Registrar Movimiento"}
      </button>
    </div>
  );

  const content = (
    <div
      className={`space-y-4 py-2 ${isStandalone ? "bg-white border border-[var(--color-neutral-border)] rounded-[16px] p-6 shadow-sm" : ""}`}
    >
      {isStandalone && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--color-brand-soft)] flex items-center justify-center border border-[var(--color-brand-primary)]/20 shadow-sm">
            <MovimientoIcono size={22} className="text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
              Registrar Movimiento
            </h3>
            <p className="text-[12px] text-[var(--color-neutral-text-muted)] font-semibold uppercase tracking-widest mt-0.5">
              Ajuste manual de stock para {articulo.nombre}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 py-2">
        {/* Info del Producto */}
        <div className="bg-gray-50 rounded-[12px] p-4 border border-[var(--color-neutral-border)]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[11px] text-[var(--color-neutral-text-muted)] uppercase font-bold tracking-wider">
                Artículo
              </div>
              <div className="text-[14px] font-bold text-[var(--color-neutral-text-main)] leading-tight mt-1">
                {articulo.nombre}
              </div>
              <div className="inline-flex items-center px-2 py-0.5 mt-2 rounded-[6px] bg-white border border-[var(--color-neutral-border)] text-[11px] font-mono font-bold text-[var(--color-neutral-text-muted)] uppercase shadow-sm">
                #{articulo.codigo}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[var(--color-neutral-text-muted)] uppercase font-bold tracking-wider">
                Stock Actual
              </div>
              <div className="text-[18px] font-bold text-[var(--color-neutral-text-main)] mt-1">
                {articulo.stock || 0}{" "}
                <span className="text-[13px] font-medium text-[var(--color-neutral-text-muted)]">
                  {articulo.unidadMedida}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-neutral-border)] flex justify-between items-center">
            <div className="text-[12px] text-[var(--color-neutral-text-muted)] font-medium italic">
              Fecha: {new Date().toLocaleDateString("es-AR")}
            </div>
            <div className="text-[12px] text-[var(--color-neutral-text-muted)] font-bold uppercase tracking-wider">
              {tipo.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo de Movimiento */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide ml-1">
              Tipo
            </label>
            <select
              name="tipoMovimiento"
              value={formData.tipoMovimiento}
              onChange={handleChange}
              className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] px-4 py-3 text-[14px] font-medium text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] cursor-pointer shadow-sm transition-colors"
            >
              <option value="INGRESO">Ingreso (+)</option>
              <option value="EGRESO">Egreso (-)</option>
              <option value="AJUSTE">Ajuste (Manual)</option>
            </select>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide ml-1">
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] px-4 py-3 text-[15px] font-bold text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] shadow-sm transition-colors"
            />
          </div>
        </div>

        {/* Origen */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide ml-1">
            Origen / Destino
          </label>
          <select
            name="origenMovimiento"
            value={formData.origenMovimiento}
            onChange={handleChange}
            className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] px-4 py-3 text-[14px] font-medium text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] cursor-pointer shadow-sm transition-colors"
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
          <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide ml-1">
            Observación (Opcional)
          </label>
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            rows="2"
            placeholder="Razón del movimiento..."
            className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] px-4 py-3 text-[14px] font-medium text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] resize-none shadow-sm transition-colors"
          />
        </div>

        {isStandalone && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isPending || !formData.cantidad}
              className="flex items-center gap-2 px-8 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-[8px] font-bold text-[13px] uppercase tracking-wide shadow-sm active:scale-95 transition-colors"
            >
              <GuardarIcono size={18} />
              {isPending ? "Registrando..." : "Registrar Movimiento"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isStandalone) return content;

  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <ModalDetalle
        title={`Registrar Movimiento`}
        icon={<ProduccionIcono size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalMovimiento;
