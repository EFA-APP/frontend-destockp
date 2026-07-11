import { useState } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCrearMovimientoManualMutation } from "../../../../Backend/Tesoreria/queries/useCrearMovimientoManual.mutation";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { BilleteraIcono, GuardarIcono } from "../../../../assets/Icons";
import { SelectorCuentaImputable } from "../../../Modales/Tesoreria/SelectorCuentaImputable";

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

const hoyISO = () => new Date().toISOString().slice(0, 10);

const ModalIngresoEgresoCaja = ({ tipoOperacion, onClose }) => {
  const { usuario, unidadActiva } = useAuthStore();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  const { mutate: crearMovimientoManual, isPending } =
    useCrearMovimientoManualMutation();

  const [form, setForm] = useState({
    fecha: hoyISO(),
    monto: "",
    descripcion: "",
    cuentaImputada: null,
  });
  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};
    if (!form.fecha) nuevosErrores.fecha = "La fecha es obligatoria.";
    const montoNumerico = Number(form.monto);
    if (!form.monto || isNaN(montoNumerico) || montoNumerico <= 0) {
      nuevosErrores.monto = "El monto debe ser mayor a 0.";
    }
    if (!form.cuentaImputada) {
      nuevosErrores.cuentaImputada = "Debe seleccionar una cuenta.";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validar()) return;

    const payload = {
      fecha: form.fecha,
      tipoOperacion,
      monto: Number(form.monto),
      descripcion: form.descripcion.trim(),
      codigoCuentaImputada: form.cuentaImputada.codigo,
    };

    crearMovimientoManual(
      {
        payload,
        contexto: {
          codigoEmpresa: usuario?.codigoEmpresa,
          codigoUnidadNegocio: unidadActiva?.codigo,
        },
      },
      {
        onSuccess: () => {
          agregarAlerta({
            type: "success",
            message: "Movimiento registrado correctamente",
          });
          onClose();
        },
        onError: (error) => {
          agregarAlerta({
            type: "error",
            message:
              error?.response?.data?.message ||
              "Error al registrar el movimiento",
          });
        },
      }
    );
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full pt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-bold text-[#6B7472] hover:text-[#1A1D1C] hover:bg-[#F5F7F6] rounded-xl transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className={`flex items-center gap-2 px-6 py-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all cursor-pointer ${
          tipoOperacion === "INGRESO"
            ? "bg-[#1FAE6D] hover:bg-[#178F58]"
            : "bg-[#EF5A5A] hover:bg-red-600"
        }`}
      >
        <GuardarIcono size={18} />
        {isPending ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );

  const content = (
    <div className="space-y-5 py-2 px-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Fecha</FieldLabel>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fecha: e.target.value }))
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all"
          />
          {errores.fecha && (
            <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
              {errores.fecha}
            </p>
          )}
        </div>
        <div>
          <FieldLabel>Monto</FieldLabel>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, monto: e.target.value }))
              }
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white transition-all"
            />
          </div>
          {errores.monto && (
            <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
              {errores.monto}
            </p>
          )}
        </div>
      </div>
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <input
          type="text"
          value={form.descripcion}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, descripcion: e.target.value }))
          }
          placeholder="Motivo del movimiento..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white placeholder:text-slate-400 transition-all"
        />
        {errores.descripcion && (
          <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
            {errores.descripcion}
          </p>
        )}
      </div>
      <div>
        <SelectorCuentaImputable
          tipoOperacion={tipoOperacion}
          value={form.cuentaImputada}
          onChange={(cuenta) =>
            setForm((prev) => ({ ...prev, cuentaImputada: cuenta }))
          }
          codigoEmpresa={usuario?.codigoEmpresa}
        />
        {errores.cuentaImputada && (
          <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
            {errores.cuentaImputada}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ModalDetalleBase open onClose={onClose} allowOverflow={true}>
      <ModalDetalle
        title={`Registrar ${tipoOperacion === "INGRESO" ? "Ingreso" : "Egreso"} Manual`}
        icon={<BilleteraIcono size={20} />}
        onClose={onClose}
        footer={footer}
        allowOverflow={true}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalIngresoEgresoCaja;
