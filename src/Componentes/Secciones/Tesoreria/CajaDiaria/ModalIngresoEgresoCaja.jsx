import { useState } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCrearMovimientoManualMutation } from "../../../../Backend/Tesoreria/queries/useCrearMovimientoManual.mutation";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { SelectorCuentaImputable } from "../../../Modales/Tesoreria/SelectorCuentaImputable";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2">
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
      descripcion: form.descripcion.trim() || `${tipoOperacion} - ${form.cuentaImputada?.nombre || ''}`,
      codigoCuentaImputada: form.cuentaImputada.codigoSecuencial || form.cuentaImputada.codigo,
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
    <div className="flex justify-end gap-3 w-full pt-4 border-t border-gray-200 mt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors uppercase tracking-wider"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className={`flex items-center gap-2 px-6 py-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${
          tipoOperacion === "INGRESO"
            ? "bg-[#1FAE6D] hover:bg-[#178F58]"
            : "bg-rose-600 hover:bg-rose-700"
        }`}
      >
        {isPending ? "Guardando..." : "Confirmar Movimiento"}
      </button>
    </div>
  );

  const content = (
    <div className="space-y-6 py-4 px-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Fecha</FieldLabel>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fecha: e.target.value }))
            }
            className="w-full h-11 bg-white border border-gray-300 rounded-md px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
          />
          {errores.fecha && (
            <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">
              {errores.fecha}
            </p>
          )}
        </div>
        <div>
          <FieldLabel>Monto</FieldLabel>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, monto: e.target.value }))
              }
              placeholder="0.00"
              className="w-full h-11 bg-white border border-gray-300 rounded-md pl-9 pr-4 text-sm font-black text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-300"
            />
          </div>
          {errores.monto && (
            <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">
              {errores.monto}
            </p>
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <SelectorCuentaImputable
          tipoOperacion={tipoOperacion}
          value={form.cuentaImputada}
          onChange={(cuenta) =>
            setForm((prev) => ({ ...prev, cuentaImputada: cuenta }))
          }
          codigoEmpresa={usuario?.codigoEmpresa}
        />
        {errores.cuentaImputada && (
          <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">
            {errores.cuentaImputada}
          </p>
        )}
      </div>

      <div>
        <FieldLabel>Descripción (Opcional)</FieldLabel>
        <input
          type="text"
          value={form.descripcion}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, descripcion: e.target.value }))
          }
          placeholder="Motivo del movimiento..."
          className="w-full h-11 bg-white border border-gray-300 rounded-md px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-400"
        />
        {errores.descripcion && (
          <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">
            {errores.descripcion}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ModalDetalleBase open onClose={onClose} allowOverflow={true} width="max-w-[480px]">
      <ModalDetalle
        title={`Registrar ${tipoOperacion === "INGRESO" ? "Ingreso" : "Egreso"} Manual`}
        icon={tipoOperacion === "INGRESO" ? <ArrowDownToLine size={20} className="text-emerald-600" /> : <ArrowUpFromLine size={20} className="text-rose-600" />}
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
