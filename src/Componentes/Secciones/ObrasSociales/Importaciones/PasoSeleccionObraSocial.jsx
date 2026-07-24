import { useEffect } from "react";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";

const PasoSeleccionObraSocial = ({
  obraSocial,
  setObraSocial,
  unidadNegocio,
  setUnidadNegocio,
  puntoVenta,
  setPuntoVenta,
  periodo,
  setPeriodo,
  onSiguiente,
  isIntegrated = false
}) => {
  const { contactos, cargandoContactos } = useContactos({ tipoEntidad: "OBRA", limite: 200 });

  // R24: el punto de venta usado para pedir el CAE se resuelve desde la
  // Unidad de Negocio elegida, mismo mecanismo que ya usa
  // `useCabeceraComprobante.js` (frontend/src/Backend/Comprobantes/useCabeceraComprobante.js)
  // en el resto del sistema — no un selector de PDV directo.
  const usuario = useAuthStore((state) => state.usuario);
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  // Autoselección de la única Unidad de Negocio del usuario (mismo patrón
  // que GestionCuotas.jsx / GestionCuotasSocios.jsx) — si tiene más de una,
  // el usuario elige manualmente y el selector se muestra.
  useEffect(() => {
    if (unidadesNegocio.length > 0 && !unidadNegocio) {
      setUnidadNegocio(String(unidadesNegocio[0].codigo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadesNegocio]);

  useEffect(() => {
    if (!unidadNegocio) {
      setPuntoVenta("");
      return;
    }
    const seleccionada = unidadesNegocio.find(
      (u) => String(u.codigo) === String(unidadNegocio)
    );
    setPuntoVenta(seleccionada?.puntoVenta ? String(seleccionada.puntoVenta) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadNegocio, unidadesNegocio]);

  const handleChangeObraSocial = (e) => {
    const selected = contactos.find(c => String(c.codigo) === e.target.value);
    setObraSocial(selected || null);
  };

  // R25: si la Unidad de Negocio elegida no tiene un punto de venta
  // configurado, se avisa al usuario y se bloquea "Continuar".
  const faltaPuntoVenta = !!unidadNegocio && !puntoVenta;

  const handleContinuar = () => {
    if (!obraSocial || !unidadNegocio || !periodo || faltaPuntoVenta) return;
    onSiguiente();
  };

  return (
    <div className="flex flex-col h-full relative">
      {!isIntegrated && (
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-[20px] font-bold text-[var(--color-neutral-text-main)]">1. Seleccionar Obra Social</h2>
          <p className="text-[14px] text-[var(--color-neutral-text-muted)] max-w-2xl">
            Seleccione la Obra Social de la cual recibió el archivo de liquidación. El sistema verificará si existe una configuración de formato asociada a la entidad.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Obra Social
            </label>
            <select
              value={obraSocial ? obraSocial.codigo : ""}
              onChange={handleChangeObraSocial}
              disabled={cargandoContactos}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all text-gray-900"
            >
              <option value="">
                {cargandoContactos ? "Cargando obras sociales..." : "Seleccione una Obra Social"}
              </option>
              {contactos.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.razonSocial || `${c.nombre} ${c.apellido}`.trim()} {c.documento ? `(${c.documento})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Período
            </label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all text-gray-900"
            />
          </div>
        </div>
        
        {unidadesNegocio.length > 1 && (
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Unidad de Negocio
            </label>
            <select
              value={unidadNegocio}
              onChange={(e) => setUnidadNegocio(e.target.value)}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all text-gray-900"
            >
              <option value="">Seleccione Unidad de Negocio</option>
              {unidadesNegocio.map((u) => (
                <option key={u.codigo} value={u.codigo}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {obraSocial && (!obraSocial.atributos || !obraSocial.atributos.adaptadorImportacion) && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-semibold text-red-800 leading-relaxed">
              <strong className="font-bold block uppercase tracking-wide">Falta configuración</strong>
              Esta Obra Social no tiene el atributo `adaptadorImportacion` configurado. Ve a Gestión de Entidades y asígnalo.
            </p>
          </div>
        )}

        {faltaPuntoVenta && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-semibold text-red-800 leading-relaxed">
              <strong className="font-bold block uppercase tracking-wide">Sin punto de venta</strong>
              La Unidad de Negocio seleccionada no tiene un punto de venta configurado. Configurala antes de continuar.
            </p>
          </div>
        )}
      </div>

      {!isIntegrated && (
        <div className="mt-auto pt-8 flex border-t border-[var(--color-neutral-border)] mt-8">
          <button
            onClick={handleContinuar}
            disabled={!obraSocial || !obraSocial.atributos?.adaptadorImportacion || !unidadNegocio || !periodo || faltaPuntoVenta}
            className="ml-auto bg-[var(--color-brand-primary)] text-white px-8 py-3 rounded-[var(--radius-base)] font-bold hover:bg-[var(--color-brand-hover)] transition-all shadow-[var(--shadow-card)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
          >
            Continuar
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PasoSeleccionObraSocial;
