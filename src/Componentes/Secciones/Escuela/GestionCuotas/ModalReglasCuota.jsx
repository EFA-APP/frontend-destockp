import { useState, useEffect, useRef } from "react";
import { useReglasCuota } from "../../../../Backend/Escuela/hooks/useReglasCuota";
import { useConfiguracionCampos } from "../../../../Backend/Escuela/hooks/useConfiguracionCampos";
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
  tipoEntidadObligado,
  onClose,
}) => {
  const { reglas, cargandoReglas, crearRegla, actualizarRegla, eliminarRegla, procesando } =
    useReglasCuota(cuenta?.codigoSecuencial);
  const { campos: camposEntidad } = useConfiguracionCampos(tipoEntidadObligado);

  const [editando, setEditando] = useState(null); // codigo de la regla en edición, o "nueva"
  const [form, setForm] = useState(
    codigoContactoInicial
      ? { ...FORM_VACIO, tipoMatch: "CONTACTO", codigoContacto: String(codigoContactoInicial) }
      : FORM_VACIO,
  );
  const [error, setError] = useState("");

  // Atributo elegido en el select de "Atributo" (si hay campos configurados
  // para la entidad), usado para saber si "Valor esperado" debe mostrarse
  // como select (campo tipo LISTA) o como input libre.
  const campoAtributoSeleccionado = camposEntidad.find(
    (c) => c.claveCampo === form.atributoClave,
  );

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-800">{tituloModal}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Prioridad de match: Contacto específico &gt; Categoría &gt; Rango &gt; Default.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col">

        {!codigoContactoInicial && (
          <div className="flex justify-end">
            {editando === null && (
              <button
                onClick={iniciarNueva}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                Nueva regla
              </button>
            )}
          </div>
        )}

        {editando !== null && (
          <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Tipo de match
                </label>
                <select
                  value={form.tipoMatch}
                  disabled={editando !== "nueva" || !!codigoContactoInicial}
                  onChange={(e) => setForm((f) => ({ ...f, tipoMatch: e.target.value }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm disabled:opacity-60 transition-all"
                >
                  {TIPOS_MATCH.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Monto
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                />
              </div>
            </div>

            {form.tipoMatch === "CONTACTO" && (
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Código de contacto
                </label>
                <input
                  type="number"
                  value={form.codigoContacto}
                  disabled={!!codigoContactoInicial}
                  onChange={(e) => setForm((f) => ({ ...f, codigoContacto: e.target.value }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm disabled:opacity-60 transition-all"
                />
              </div>
            )}

            {(form.tipoMatch === "CATEGORIA" || form.tipoMatch === "RANGO") && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Atributo (ej: tipo_alumno)
                  </label>
                  {camposEntidad.length > 0 ? (
                    <select
                      value={form.atributoClave}
                      onChange={(e) => setForm((f) => ({ ...f, atributoClave: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                    >
                      <option value="">Seleccionar...</option>
                      {camposEntidad.map((c) => (
                        <option key={c.claveCampo} value={c.claveCampo}>
                          {c.nombreCampo}
                        </option>
                      ))}
                      {/* Si la regla ya tiene un atributo guardado que no matchea
                          ningún campo configurado hoy, lo dejamos como opción
                          extra para no vaciarlo silenciosamente al editar. */}
                      {form.atributoClave &&
                        !camposEntidad.some((c) => c.claveCampo === form.atributoClave) && (
                          <option value={form.atributoClave}>{form.atributoClave}</option>
                        )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.atributoClave}
                      onChange={(e) => setForm((f) => ({ ...f, atributoClave: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                    />
                  )}
                </div>
                {form.tipoMatch === "CATEGORIA" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Valor esperado
                    </label>
                    {Array.isArray(campoAtributoSeleccionado?.opciones) &&
                    campoAtributoSeleccionado.opciones.length > 0 ? (
                      <select
                        value={form.valorCategoria}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, valorCategoria: e.target.value }))
                        }
                        className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-semibold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        {campoAtributoSeleccionado.opciones.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        {/* Idem: si el valor guardado no matchea ninguna opción
                            vigente del campo, lo mostramos igual como opción extra. */}
                        {form.valorCategoria &&
                          !campoAtributoSeleccionado.opciones.includes(form.valorCategoria) && (
                            <option value={form.valorCategoria}>{form.valorCategoria}</option>
                          )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.valorCategoria}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, valorCategoria: e.target.value }))
                        }
                        className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                      />
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Desde
                      </label>
                      <input
                        type="number"
                        value={form.rangoDesde}
                        onChange={(e) => setForm((f) => ({ ...f, rangoDesde: e.target.value }))}
                        className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Hasta
                      </label>
                      <input
                        type="number"
                        value={form.rangoHasta}
                        onChange={(e) => setForm((f) => ({ ...f, rangoHasta: e.target.value }))}
                        className="px-3 py-2.5 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bugfix 2026-07-11: obligatoriedad de enteFacturacion marcada en
                la regla (no en el alumno) — aplica a cualquier tipoMatch. */}
            <label className="flex items-center justify-between cursor-pointer bg-white border border-gray-200 rounded-md px-4 py-3 mt-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
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
                className="w-4 h-4 cursor-pointer accent-gray-900 shrink-0 ml-3"
              />
            </label>

            {error && (
              <p className="text-rose-600 text-[11px] font-bold bg-rose-50 border border-rose-100 rounded-md p-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 mt-2">
              {!codigoContactoInicial && (
                <button
                  onClick={cancelarEdicion}
                  disabled={procesando}
                  className="px-4 py-2.5 rounded-md bg-white border border-gray-200 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleGuardar}
                disabled={procesando}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm bg-[#1FAE6D] hover:bg-[#178F58] disabled:opacity-50 cursor-pointer transition-all"
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
          <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md shadow-sm">
            {cargandoReglas ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : reglasFiltradas.length === 0 ? (
              <p className="text-center py-10 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Sin reglas cargadas para esta cuenta
              </p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Tipo
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Condición
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                      Monto
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                      Estado
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reglasFiltradas.map((r) => (
                    <tr
                      key={r.codigo}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                      onClick={() => iniciarEdicion(r)}
                    >
                      <td className="px-5 py-4 text-[11px] font-black tracking-widest text-gray-900 uppercase">{r.tipoMatch}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">
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
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200/60"
                            >
                              <UserCheck size={10} />
                              Requiere tutor
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-right text-gray-900 tracking-tight">
                        {formatearARS(r.monto)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                            r.activo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {r.activo && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {!r.activo && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                          {r.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
        </div>

        {!codigoContactoInicial && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalReglasCuota;
