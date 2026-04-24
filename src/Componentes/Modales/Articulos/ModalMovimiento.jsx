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
        className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black "
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending || !formData.cantidad}
        className="flex items-center gap-2 px-5 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-md font-bold  shadow-lg shadow-amber-700/20"
      >
        <GuardarIcono size={18} />
        {isPending ? "Registrando..." : "Registrar Movimiento"}
      </button>
    </div>
  );

  const content = (
    <div
      className={`space-y-4 py-2 ${isStandalone ? "bg-[var(--surface)] border border-black/5 rounded-[22px] p-6" : ""}`}
    >
      {isStandalone && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-700/10 flex items-center justify-center border border-amber-700/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <MovimientoIcono size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black uppercase tracking-wider">
              Registrar Movimiento
            </h3>
            <p className="text-[12px] text-black/40 font-bold uppercase tracking-widest">
              Ajuste manual de stock para {articulo.nombre}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 py-2">
        {/* Info del Producto */}
        <div className="bg-black/5 rounded-md p-3 border border-black/10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[12px] text-black/40 uppercase font-bold tracking-widest">
                Artículo
              </div>
              <div className="text-sm font-bold text-black leading-tight">
                {articulo.nombre}
              </div>
              <div className="text-[13px] text-amber-700/80 font-bold mt-0.5">
                #{articulo.codigoSecuencial}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-black/40 uppercase font-bold tracking-widest">
                Stock Actual
              </div>
              <div className="text-sm font-bold text-black">
                {articulo.stock || 0}{" "}
                <span className="text-[12px] font-normal text-black/40">
                  {articulo.unidadMedida}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 flex justify-between items-center">
            <div className="text-[12px] text-black/30 font-medium italic">
              Fecha: {new Date().toLocaleDateString("es-AR")}
            </div>
            <div className="text-[12px] text-black/30 font-medium">
              {tipo.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo de Movimiento */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-black/50 uppercase ml-1">
              Tipo
            </label>
            <select
              name="tipoMovimiento"
              value={formData.tipoMovimiento}
              onChange={handleChange}
              className="w-full bg-[#1a1c1e] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-amber-700/50  cursor-pointer"
            >
              <option value="INGRESO" className="bg-[#1a1c1e]">
                Ingreso (+)
              </option>
              <option value="EGRESO" className="bg-[#1a1c1e]">
                Egreso (-)
              </option>
              <option value="AJUSTE" className="bg-[#1a1c1e]">
                Ajuste (Manual)
              </option>
            </select>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-black/50 uppercase ml-1">
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-[#1a1c1e] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-amber-700/50 "
            />
          </div>
        </div>

        {/* Origen */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-black/50 uppercase ml-1">
            Origen / Destino
          </label>
          <select
            name="origenMovimiento"
            value={formData.origenMovimiento}
            onChange={handleChange}
            className="w-full bg-[#1a1c1e] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-amber-700/50  cursor-pointer"
          >
            {formData.tipoMovimiento === "INGRESO" && (
              <>
                <option value="PRODUCCION" className="bg-[#1a1c1e]">
                  Producción
                </option>
                <option value="DEPOSITO" className="bg-[#1a1c1e]">
                  Depósito
                </option>
                <option value="INGRESO_FRUTA_MP" className="bg-[#1a1c1e]">
                  Ingreso Fruta (MP)
                </option>
              </>
            )}
            {formData.tipoMovimiento === "EGRESO" && (
              <>
                <option value="VENTA" className="bg-[#1a1c1e]">
                  Venta
                </option>
                <option value="DEPOSITO" className="bg-[#1a1c1e]">
                  Depósito
                </option>
              </>
            )}
            {formData.tipoMovimiento === "AJUSTE" && (
              <option value="AJUSTE_MANUAL" className="bg-[#1a1c1e]">
                Ajuste Manual
              </option>
            )}
          </select>
        </div>

        {/* Observación */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-black/50 uppercase ml-1">
            Observación (Opcional)
          </label>
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            rows="2"
            placeholder="Razon del movimiento..."
            className="w-full bg-[#1a1c1e] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-amber-700/50  resize-none"
          />
        </div>

        {isStandalone && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isPending || !formData.cantidad}
              className="flex items-center gap-2 px-8 py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl font-black text-[13px] uppercase tracking-widest  shadow-lg shadow-amber-700/20 active:scale-95"
            >
              <GuardarIcono size={16} />
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
