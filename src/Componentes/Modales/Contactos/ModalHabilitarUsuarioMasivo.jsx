import { useEffect, useState } from "react";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { CandadoIcono } from "../../../assets/Icons";
import { CheckCircle2, XCircle, MailX } from "lucide-react";
import { useRolesUI } from "../../../Backend/Autenticacion/hooks/Rol/useRolesUI";
import { useContactos } from "../../../Backend/Contactos/hooks/useContactos";

const ETIQUETAS_GRUPO = {
  SIN_EMAIL: { label: "Sin email", icon: MailX, className: "text-gray-500" },
  HABILITADO: {
    label: "Habilitado",
    icon: CheckCircle2,
    className: "text-emerald-600",
  },
  ERROR: { label: "Error", icon: XCircle, className: "text-rose-600" },
};

/**
 * Modal de habilitación masiva de usuarios (Feature 34,
 * contactos-habilitar-usuario-masivo, design.md §3). Paralelo a
 * ModalHabilitarUsuario.jsx (flujo individual, feature 20), sin
 * reemplazarlo ni modificarlo. Recibe la lista de contactos ya
 * seleccionados (checkbox de ListaUsuariosContactos.jsx) y pide un único
 * rol para todo el lote.
 */
const ModalHabilitarUsuarioMasivo = ({ open, onClose, contactos = [] }) => {
  const { roles, cargandoRol: cargandoRoles } = useRolesUI();
  const { habilitarUsuarioMasivoContacto } = useContactos();
  const [codigoRol, setCodigoRol] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null); // null | { resultados, totales }

  // Al reabrir el modal con una selección nueva, se limpia el resultado de
  // la corrida anterior.
  useEffect(() => {
    if (open) {
      setCodigoRol("");
      setError(null);
      setResultado(null);
    }
  }, [open]);

  const handleClose = () => {
    setCodigoRol("");
    setError(null);
    setResultado(null);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (enviando) return;
    if (!codigoRol) {
      setError("Seleccioná un rol para el lote.");
      return;
    }
    if (contactos.length === 0) {
      setError("No hay contactos seleccionados.");
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      const respuesta = await habilitarUsuarioMasivoContacto({
        codigosContacto: contactos.map((c) => c.codigo),
        codigoRol: Number(codigoRol),
      });
      // R33: el modal no se cierra automáticamente, pasa a mostrar el
      // resultado por grupos.
      setResultado(respuesta);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo procesar la habilitación masiva.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const contenidoSeleccion = (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <label className="text-[12px] font-black text-black/30 uppercase tracking-[0.2em] ml-1">
          Contactos seleccionados ({contactos.length})
        </label>
        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 border border-gray-200 rounded-md p-2">
          {contactos.map((c) => (
            <div
              key={c.codigo}
              className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 rounded-md"
            >
              <span className="text-[13px] font-bold text-gray-900 truncate">
                {c.razonSocial ||
                  `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
                  "Sin Nombre"}
              </span>
              <span className="text-[11px] text-gray-500 truncate">
                {c.correoElectronico}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-black text-black/30 uppercase tracking-[0.2em] ml-1">
          Rol del sistema (aplicado a todo el lote)
        </label>
        {cargandoRoles ? (
          <p className="text-xs text-gray-500 italic py-2">
            Cargando roles...
          </p>
        ) : (
          <select
            value={codigoRol}
            onChange={(e) => setCodigoRol(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-[14px] font-medium text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all cursor-pointer shadow-sm"
          >
            <option value="">Seleccioná un rol...</option>
            {roles.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="bg-rose-700/10 border border-rose-700/20 rounded-md p-3 text-rose-500 text-xs font-bold">
          {error}
        </div>
      )}
    </div>
  );

  const contenidoResultado = resultado && (
    <div className="space-y-6 py-2">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-emerald-50 border border-emerald-200">
          <span className="text-[20px] font-black text-emerald-700">
            {resultado.totales?.habilitados ?? 0}
          </span>
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-widest">
            Habilitados
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-gray-50 border border-gray-200">
          <span className="text-[20px] font-black text-gray-500">
            {resultado.totales?.sinEmail ?? 0}
          </span>
          <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
            Sin email
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-rose-50 border border-rose-200">
          <span className="text-[20px] font-black text-rose-600">
            {resultado.totales?.errores ?? 0}
          </span>
          <span className="text-[10px] font-bold uppercase text-rose-600 tracking-widest">
            Errores
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1.5">
        {(resultado.resultados || []).map((item) => {
          const meta = ETIQUETAS_GRUPO[item.grupo] || ETIQUETAS_GRUPO.ERROR;
          const Icon = meta.icon;
          return (
            <div
              key={item.codigoContacto}
              className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 rounded-md border border-gray-100"
            >
              <Icon size={16} className={`${meta.className} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-gray-900 truncate">
                    {item.nombre}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
                {item.correoElectronico && (
                  <span className="text-[11px] text-gray-500 block truncate">
                    {item.correoElectronico}
                  </span>
                )}
                {item.grupo === "ERROR" && item.motivo && (
                  <span className="text-[11px] text-rose-600 font-medium block mt-1">
                    {item.motivo}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const footerSeleccion = (
    <div className="flex items-center justify-end gap-3 w-full mt-2">
      <button
        onClick={handleClose}
        className="px-[20px] py-[10px] bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm rounded-md font-semibold text-[13px] transition-all cursor-pointer"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={enviando}
        className="flex items-center gap-2 px-[20px] py-[10px] bg-[#1FAE6D] hover:bg-[#178F58] shadow-sm text-white disabled:opacity-50 rounded-md font-semibold text-[13px] transition-all active:scale-95 cursor-pointer"
      >
        {enviando ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <CandadoIcono size={16} />
        )}
        {enviando ? "Procesando..." : "Confirmar"}
      </button>
    </div>
  );

  const footerResultado = (
    <div className="flex items-center justify-end gap-3 w-full mt-2">
      <button
        onClick={handleClose}
        className="px-[20px] py-[10px] bg-gray-900 text-white hover:bg-black rounded-md font-semibold text-[13px] transition-all cursor-pointer"
      >
        Cerrar
      </button>
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={handleClose} width="max-w-lg">
      <ModalDetalle
        title={
          resultado
            ? "Resultado de la habilitación masiva"
            : "Habilitar Acceso de Usuario (Masivo)"
        }
        icon={<CandadoIcono size={20} />}
        onClose={handleClose}
        footer={resultado ? footerResultado : footerSeleccion}
      >
        {resultado ? contenidoResultado : contenidoSeleccion}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalHabilitarUsuarioMasivo;
