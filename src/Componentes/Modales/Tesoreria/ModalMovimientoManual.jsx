import { useEffect, useRef, useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useObtenerCuentasImputablesQuery } from "../../../Backend/Contabilidad/queries/useCuentas.query";
import { useCrearMovimientoManualMutation } from "../../../Backend/Tesoreria/queries/useCrearMovimientoManual.mutation";
import { useAlertas } from "../../../store/useAlertas";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, BilleteraIcono } from "../../../assets/Icons";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const estadoInicial = () => ({
  tipoOperacion: "INGRESO",
  fecha: hoyISO(),
  monto: "",
  descripcion: "",
  cuentaImputada: null,
});

const FieldLabel = ({ children }) => (
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
    {children}
  </span>
);

const CuentaAutocomplete = ({ tipoOperacion, value, onChange, codigoEmpresa }) => {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tipoCuenta =
    tipoOperacion === "EGRESO" ? "RESULTADO_NEGATIVO" : "RESULTADO_POSITIVO";

  const { data: cuentas = [], isFetching } = useObtenerCuentasImputablesQuery(
    tipoCuenta,
    busquedaDebounced || undefined,
    codigoEmpresa,
  );

  const seleccionar = (cuenta) => {
    onChange(cuenta);
    setBusqueda("");
    setBusquedaDebounced("");
    setAbierto(false);
  };

  return (
    <div ref={ref} className="relative">
      <FieldLabel>Cuenta a imputar</FieldLabel>
      {value ? (
        <div className="flex items-center gap-2 px-4 py-2.5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl min-h-[44px] shadow-sm transition-all">
          <span className="flex-1 text-sm font-bold text-slate-800 truncate leading-tight">
            {value.nombre}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            placeholder="Buscar cuenta contable..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white placeholder:text-slate-400 transition-all"
          />
          {abierto && busqueda && (
            <div className="absolute z-[200] left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 max-h-56 overflow-y-auto ring-1 ring-black/5">
              {isFetching ? (
                <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Buscando...
                </div>
              ) : cuentas.length === 0 ? (
                <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Sin resultados
                </div>
              ) : (
                cuentas.map((c) => (
                  <button
                    key={c.codigoSecuencial}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      seleccionar(c);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer transition-colors flex flex-col gap-0.5 group"
                  >
                    <div className="font-bold text-slate-700 group-hover:text-[var(--primary)] transition-colors">{c.nombre}</div>
                    <div className="text-xs font-medium text-slate-400">{c.codigo}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ModalMovimientoManual = ({ onClose }) => {
  const { usuario, unidadActiva } = useAuthStore();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  const { mutate: crearMovimientoManual, isPending } =
    useCrearMovimientoManualMutation();

  const [form, setForm] = useState(estadoInicial());
  const [errores, setErrores] = useState({});

  const cambiarTipoOperacion = (tipoOperacion) => {
    setForm((prev) => ({ ...prev, tipoOperacion, cuentaImputada: null }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.fecha) nuevosErrores.fecha = "La fecha es obligatoria.";
    const montoNumerico = Number(form.monto);
    if (!form.monto || isNaN(montoNumerico) || montoNumerico <= 0) {
      nuevosErrores.monto = "El monto debe ser mayor a 0.";
    }
    if (!form.descripcion || !form.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria.";
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
      tipoOperacion: form.tipoOperacion,
      monto: Number(form.monto),
      descripcion: form.descripcion.trim(),
      codigoCuentaImputada: form.cuentaImputada.codigoSecuencial,
    };

    crearMovimientoManual(
      {
        payload,
        contexto: {
          codigoEmpresa: usuario?.codigoEmpresa,
          codigoUnidadNegocio: unidadActiva?.codigoSecuencial,
        },
      },
      {
        onSuccess: () => {
          agregarAlerta({
            type: "success",
            message: "Movimiento registrado correctamente",
          });
          setForm(estadoInicial());
          setErrores({});
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
      },
    );
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full pt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <GuardarIcono size={18} />
        {isPending ? "Guardando..." : "Guardar Movimiento"}
      </button>
    </div>
  );

  const content = (
    <div className="space-y-5 py-2 px-1">
      {/* Tipo de operación */}
      <div>
        <FieldLabel>Tipo de movimiento</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cambiarTipoOperacion("INGRESO")}
            className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest border-2 transition-all duration-300 cursor-pointer ${
              form.tipoOperacion === "INGRESO"
                ? "bg-emerald-50 text-emerald-600 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]"
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ArrowUpCircle size={22} className={form.tipoOperacion === "INGRESO" ? "text-emerald-500" : "text-slate-300"} />
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => cambiarTipoOperacion("EGRESO")}
            className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-2xl text-sm font-black uppercase tracking-widest border-2 transition-all duration-300 cursor-pointer ${
              form.tipoOperacion === "EGRESO"
                ? "bg-rose-50 text-rose-600 border-rose-400 shadow-md shadow-rose-500/20 scale-[1.02]"
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ArrowDownCircle size={22} className={form.tipoOperacion === "EGRESO" ? "text-rose-500" : "text-slate-300"} />
            Egreso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha */}
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

        {/* Monto */}
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

      {/* Descripción */}
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <textarea
          value={form.descripcion}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, descripcion: e.target.value }))
          }
          rows="2"
          placeholder="Detalle del movimiento..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] focus:bg-white placeholder:text-slate-400 resize-none transition-all"
        />
        {errores.descripcion && (
          <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1">
            {errores.descripcion}
          </p>
        )}
      </div>

      {/* Cuenta a imputar */}
      <div>
        <CuentaAutocomplete
          tipoOperacion={form.tipoOperacion}
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
    <ModalDetalleBase open onClose={onClose}>
      <ModalDetalle
        title="Nuevo Movimiento Manual"
        icon={<BilleteraIcono size={20} />}
        onClose={onClose}
        footer={footer}
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalMovimientoManual;
