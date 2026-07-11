import { useState, useEffect, useRef } from "react";
import { useReglasCuota } from "../../../../Backend/Escuela/hooks/useReglasCuota";
import { formatearARS } from "../../../../utils/formatearMoneda";
import { Trash2, Plus, X, UserCheck } from "lucide-react";

const TIPOS_MATCH = [
  { valor: "CONTACTO", etiqueta: "Contacto específico (máxima prioridad)" },
  { valor: "CATEGORIA", etiqueta: "Categoría exacta de un atributo" },
  { valor: "RANGO", etiqueta: "Rango numérico de un atributo" },
  { valor: "DEFAULT", etiqueta: "Default (si ninguna otra aplica)" },
];

const FORM_VACIO = {
  tipoMatch: "CATEGORIA",
  codigoContacto: "",
  atributoClave: "",
  valorCategoria: "",
  rangoDesde: "",
  rangoHasta: "",
  monto: "",
  requiereEnteFacturacion: false,
};

/**
 * CRUD de `ReglaCuotaCuenta` (§5, R62-R64) para la cuenta contable
 * seleccionada — reemplaza a `ModalEditarCuota.jsx` (fórmula única
 * interno/externo) y, cuando se abre prefiltrada por `codigoContactoInicial`
 * (T56), reemplaza también a `ModalOverrideCuota.jsx` (override persistente
 * por alumno, ahora modelado como una regla `CONTACTO`).
 */
const ModalReglasCuota = ({
  cuenta,
  codigoContactoInicial,
  nombreContactoInicial,
  onClose,
}) => {
  const { reglas, cargandoReglas, crearRegla, actualizarRegla, eliminarRegla, procesando } =
    useReglasCuota(cuenta?.codigoSecuencial);

  const [editando, setEditando] = useState(null); // codigo de la regla en edición, o "nueva"
  const [form, setForm] = useState(
    codigoContactoInicial
      ? { ...FORM_VACIO, tipoMatch: "CONTACTO", codigoContacto: String(codigoContactoInicial) }
      : FORM_VACIO,
  );
  const [error, setError] = useState("");

  // Si se abrió prefiltrado por un alumno (T56, "Cuota fija"), arrancamos
  // directamente en el formulario de alta/edición de SU regla CONTACTO
  // (si ya existe una, la precargamos para editarla) — corre una sola vez,
  // apenas la primera carga de `reglas` llega (guard con useRef para no
  // pisar lo que el usuario esté tipeando en cargas/refetches posteriores).
  const yaPrecargadoRef = useRef(false);
  useEffect(() => {
    if (!codigoContactoInicial || cargandoReglas || yaPrecargadoRef.current) return;
    yaPrecargadoRef.current = true;
    const existente = reglas?.find(
      (r) => r.tipoMatch === "CONTACTO" && r.codigoContacto === codigoContactoInicial,
    );
    if (existente) {
      setEditando(existente.codigo);
      setForm({
        tipoMatch: "CONTACTO",
        codigoContacto: String(existente.codigoContacto ?? ""),
        atributoClave: existente.atributoClave ?? "",
        valorCategoria: existente.valorCategoria ?? "",
        rangoDesde: existente.rangoDesde ?? "",
        rangoHasta: existente.rangoHasta ?? "",
        monto: String(existente.monto ?? ""),
        requiereEnteFacturacion: !!existente.requiereEnteFacturacion,
      });
    } else {
      setEditando("nueva");
    }
  }, [codigoContactoInicial, cargandoReglas, reglas]);

  const reglasFiltradas = codigoContactoInicial
    ? (reglas ?? []).filter(
        (r) => r.tipoMatch === "CONTACTO" && r.codigoContacto === codigoContactoInicial,
      )
    : reglas ?? [];

  const iniciarNueva = () => {
    setForm(FORM_VACIO);
    setEditando("nueva");
    setError("");
  };

  const iniciarEdicion = (regla) => {
    setForm({
      tipoMatch: regla.tipoMatch,
      codigoContacto: String(regla.codigoContacto ?? ""),
      atributoClave: regla.atributoClave ?? "",
      valorCategoria: regla.valorCategoria ?? "",
      rangoDesde: regla.rangoDesde ?? "",
      rangoHasta: regla.rangoHasta ?? "",
      monto: String(regla.monto ?? ""),
      requiereEnteFacturacion: !!regla.requiereEnteFacturacion,
    });
    setEditando(regla.codigo);
    setError("");
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError("");
  };

  const validar = () => {
    const monto = parseFloat(form.monto);
    if (!form.monto || isNaN(monto) || monto <= 0) {
      return "El monto debe ser un número mayor a cero.";
    }
    if (form.tipoMatch === "CONTACTO" && !form.codigoContacto) {
      return "Ingresá el código del contacto.";
    }
    if (form.tipoMatch === "CATEGORIA" && (!form.atributoClave || !form.valorCategoria)) {
      return "Ingresá el atributo y el valor de categoría.";
    }
    if (form.tipoMatch === "RANGO") {
      if (!form.atributoClave || form.rangoDesde === "" || form.rangoHasta === "") {
        return "Ingresá el atributo y el rango (desde/hasta).";
      }
      if (Number(form.rangoDesde) > Number(form.rangoHasta)) {
        return "El rango 'desde' no puede ser mayor que 'hasta'.";
      }
    }
    return "";
  };

  const handleGuardar = async () => {
    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }
    const dto = {
      codigoCuentaContable: cuenta.codigoSecuencial,
      tipoMatch: form.tipoMatch,
      monto: parseFloat(form.monto),
      codigoContacto: form.tipoMatch === "CONTACTO" ? Number(form.codigoContacto) : undefined,
      atributoClave:
        form.tipoMatch === "CATEGORIA" || form.tipoMatch === "RANGO"
          ? form.atributoClave
          : undefined,
      valorCategoria: form.tipoMatch === "CATEGORIA" ? form.valorCategoria : undefined,
      rangoDesde: form.tipoMatch === "RANGO" ? Number(form.rangoDesde) : undefined,
      rangoHasta: form.tipoMatch === "RANGO" ? Number(form.rangoHasta) : undefined,
      requiereEnteFacturacion: !!form.requiereEnteFacturacion,
    };

    try {
      if (editando === "nueva") {
        await crearRegla(dto);
      } else {
        const { codigoCuentaContable, tipoMatch, ...dtoActualizar } = dto;
        await actualizarRegla({ codigo: editando, dto: dtoActualizar });
      }
      if (codigoContactoInicial) {
        onClose();
      } else {
        cancelarEdicion();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error al guardar la regla.");
    }
  };

  const handleEliminar = async (codigo) => {
    setError("");
    try {
      await eliminarRegla(codigo);
      if (codigoContactoInicial) {
        cancelarEdicion();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error al eliminar la regla.");
    }
  };

  const tituloModal = codigoContactoInicial
    ? `Cuota fija — ${nombreContactoInicial ?? `Contacto #${codigoContactoInicial}`}`
    : `Reglas de monto — ${cuenta?.nombre ?? ""}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-3xl w-full p-7 shadow-2xl flex flex-col gap-6 max-h-[85vh]">
        <div className="flex flex-col gap-1 pr-8 relative">
          <h2 className="text-xl font-black tracking-tight text-gray-800">{tituloModal}</h2>
          <p className="text-xs font-semibold text-gray-500">
            Prioridad de match: Contacto específico &gt; Categoría &gt; Rango &gt; Default.
          </p>
          <button
            onClick={onClose}
            className="absolute -top-2 right-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {!codigoContactoInicial && (
          <div className="flex justify-end">
            {editando === null && (
              <button
                onClick={iniciarNueva}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Nueva regla
              </button>
            )}
          </div>
        )}

        {editando !== null && (
          <div className="flex flex-col gap-3 bg-gray-50/70 border border-[var(--border-subtle)] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Tipo de match
                </label>
                <select
                  value={form.tipoMatch}
                  disabled={editando !== "nueva" || !!codigoContactoInicial}
                  onChange={(e) => setForm((f) => ({ ...f, tipoMatch: e.target.value }))}
                  className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] disabled:opacity-60"
                >
                  {TIPOS_MATCH.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Monto
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                  className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {form.tipoMatch === "CONTACTO" && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Código de contacto
                </label>
                <input
                  type="number"
                  value={form.codigoContacto}
                  disabled={!!codigoContactoInicial}
                  onChange={(e) => setForm((f) => ({ ...f, codigoContacto: e.target.value }))}
                  className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] disabled:opacity-60"
                />
              </div>
            )}

            {(form.tipoMatch === "CATEGORIA" || form.tipoMatch === "RANGO") && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Atributo (ej: tipo_alumno)
                  </label>
                  <input
                    type="text"
                    value={form.atributoClave}
                    onChange={(e) => setForm((f) => ({ ...f, atributoClave: e.target.value }))}
                    className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                {form.tipoMatch === "CATEGORIA" ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Valor esperado
                    </label>
                    <input
                      type="text"
                      value={form.valorCategoria}
                      onChange={(e) => setForm((f) => ({ ...f, valorCategoria: e.target.value }))}
                      className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Desde
                      </label>
                      <input
                        type="number"
                        value={form.rangoDesde}
                        onChange={(e) => setForm((f) => ({ ...f, rangoDesde: e.target.value }))}
                        className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Hasta
                      </label>
                      <input
                        type="number"
                        value={form.rangoHasta}
                        onChange={(e) => setForm((f) => ({ ...f, rangoHasta: e.target.value }))}
                        className="px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-white text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bugfix 2026-07-11: obligatoriedad de enteFacturacion marcada en
                la regla (no en el alumno) — aplica a cualquier tipoMatch. */}
            <label className="flex items-center justify-between cursor-pointer bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5">
              <span className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-700">
                  Requiere ente facturador (tutor)
                </span>
                <span className="text-[10px] text-gray-500">
                  Si el alumno no tiene un tutor cargado, la emisión se rechaza
                  ("No tiene tutor") en vez de facturar a nombre del alumno.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.requiereEnteFacturacion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiereEnteFacturacion: e.target.checked }))
                }
                className="w-4 h-4 cursor-pointer accent-[var(--primary)] shrink-0 ml-3"
              />
            </label>

            {error && (
              <p className="text-rose-600 text-[11px] font-bold bg-rose-50 border border-rose-100 rounded-md p-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              {!codigoContactoInicial && (
                <button
                  onClick={cancelarEdicion}
                  disabled={procesando}
                  className="px-4 py-2 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleGuardar}
                disabled={procesando}
                className="px-4 py-2 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 cursor-pointer"
              >
                {procesando ? "Guardando..." : "Guardar regla"}
              </button>
              {editando !== "nueva" && (
                <button
                  onClick={() => handleEliminar(editando)}
                  disabled={procesando}
                  className="px-3 py-2 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {!codigoContactoInicial && (
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-lg">
            {cargandoReglas ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : reglasFiltradas.length === 0 ? (
              <p className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Sin reglas cargadas para esta cuenta
              </p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50/80 sticky top-0 border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Tipo
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Condición
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Monto
                    </th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Estado
                    </th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {reglasFiltradas.map((r) => (
                    <tr
                      key={r.codigo}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => iniciarEdicion(r)}
                    >
                      <td className="px-4 py-2.5 text-xs font-bold text-gray-700">{r.tipoMatch}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          <span>
                            {r.tipoMatch === "CONTACTO" && `Contacto #${r.codigoContacto}`}
                            {r.tipoMatch === "CATEGORIA" &&
                              `${r.atributoClave} = ${r.valorCategoria}`}
                            {r.tipoMatch === "RANGO" &&
                              `${r.atributoClave} entre ${r.rangoDesde} y ${r.rangoHasta}`}
                            {r.tipoMatch === "DEFAULT" && "—"}
                          </span>
                          {r.requiereEnteFacturacion && (
                            <span
                              title="Requiere ente facturador (tutor) cargado para emitir"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-sky-100 text-sky-700 border border-sky-200"
                            >
                              <UserCheck size={10} />
                              Requiere tutor
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-black text-right text-gray-800">
                        {formatearARS(r.monto)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                            r.activo
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {r.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEliminar(r.codigo)}
                          className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!codigoContactoInicial && (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalReglasCuota;
