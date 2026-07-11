import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CuotasIcono,
  ConfiguracionIcono,
  EmitirCuotasIcono,
} from "../../../../assets/Icons";
import { useConfigCuota } from "../../../../Backend/Escuela/hooks/useConfigCuota";
import { useCuentasTipoCuota } from "../../../../Backend/Escuela/hooks/useCuentasTipoCuota";
import { useListarCuotas } from "../../../../Backend/Escuela/hooks/useListarCuotas";
import { useReglasCuota } from "../../../../Backend/Escuela/hooks/useReglasCuota";
import { useUltimoLoteCuotas } from "../../../../Backend/Escuela/hooks/useUltimoLoteCuotas";
import { useLoteCuotas } from "../../../../Backend/Escuela/hooks/useLoteCuotas";
import TablaCuotas from "./TablaCuotas";
import ModalEmitirLote from "./ModalEmitirLote";
import ModalReglasCuota from "./ModalReglasCuota";
import ModalProgresoLoteCuotas from "./ModalProgresoLoteCuotas";
import BannerLoteCuotas from "./BannerLoteCuotas";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const anioActual = new Date().getFullYear();
const ANIOS = [
  anioActual - 2,
  anioActual - 1,
  anioActual,
  anioActual + 1,
  anioActual + 2,
];

const TIPO_ENTIDAD_OBLIGADO = "ALUM";

const GestionCuotas = () => {
  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(hoy.getFullYear());
  const [verModalLote, setVerModalLote] = useState(false);
  const [verModalReglas, setVerModalReglas] = useState(false);
  const [codigoUnidadNegocio, setCodigoUnidadNegocio] = useState("");
  const [codigoCuentaContable, setCodigoCuentaContable] = useState("");
  const [codigoLoteDetalle, setCodigoLoteDetalle] = useState(null);
  const [loteDescartadoCodigo, setLoteDescartadoCodigo] = useState(null);
  const { usuario } = useAuthStore();
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  // Autoselección de la primera Unidad de Negocio del usuario (mismo patrón
  // que ListadoComprobante.jsx) — esta pantalla ya no ofrece "Todas las
  // Unidades", siempre opera sobre una unidad real.
  useEffect(() => {
    if (unidadesNegocio.length > 0 && !codigoUnidadNegocio) {
      setCodigoUnidadNegocio(String(unidadesNegocio[0].codigo));
    }
  }, [unidadesNegocio]);

  const { cuentas, cargandoCuentas } = useCuentasTipoCuota();
  const cuentaSeleccionada = useMemo(
    () => cuentas.find((c) => String(c.codigoSecuencial) === String(codigoCuentaContable)),
    [cuentas, codigoCuentaContable],
  );

  const { items, cargandoCuotas, errorCuotas, refetch } = useListarCuotas({
    codigoCuentaContable,
    tipoEntidadObligado: TIPO_ENTIDAD_OBLIGADO,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
    codigoUnidadNegocio,
  });

  // Historial de lotes del scope exacto (R48), para no perder el
  // progreso/resultado de "Generar cuotas para todos" al cambiar de
  // sección — fuente de verdad siempre el backend, ver
  // progress/impl_cuotas-lote-persistencia-refetch.md.
  const { ultimoLote, refetchUltimoLote } = useUltimoLoteCuotas({
    codigoCuentaContable,
    codigoUnidadNegocio,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
  });

  // Mientras el lote más reciente conocido siga EN_PROCESO, se pollea en
  // vivo (mismo hook que usa el modal de detalle) para poder disparar un
  // refetch automático de la tabla de cuotas apenas termine, sin depender
  // de que el usuario tenga el modal abierto ni haga clic en "Cerrar".
  const loteEnProcesoCodigo =
    ultimoLote?.estado === "EN_PROCESO" ? ultimoLote.codigo : null;
  const { lote: loteEnProceso } = useLoteCuotas(loteEnProcesoCodigo);

  const loteMostrado = useMemo(() => {
    if (!ultimoLote) return null;
    if (loteEnProceso && loteEnProceso.codigo === ultimoLote.codigo) {
      return loteEnProceso;
    }
    return ultimoLote;
  }, [ultimoLote, loteEnProceso]);

  const estadoLoteAnteriorRef = useRef(null);
  useEffect(() => {
    if (!loteMostrado) return;
    if (
      estadoLoteAnteriorRef.current === "EN_PROCESO" &&
      loteMostrado.estado === "FINALIZADO"
    ) {
      refetch();
      refetchUltimoLote();
    }
    estadoLoteAnteriorRef.current = loteMostrado.estado;
  }, [loteMostrado?.codigo, loteMostrado?.estado]);

  const { reglas } = useReglasCuota(codigoCuentaContable);
  const contactosConReglaPropia = useMemo(
    () =>
      new Set(
        (reglas ?? [])
          .filter((r) => r.tipoMatch === "CONTACTO")
          .map((r) => r.codigoContacto),
      ),
    [reglas],
  );

  // R101/R109: `formula`/`tipoAlumnoOpciones` (ConfiguracionCampoContacto)
  // se conservan SOLO para no romper `ModalCambioTipoAlumno.jsx` (fuera de
  // alcance explícito de esta sesión, ver progress/impl_cuotas-rediseno-contable.md);
  // la edición de `formula` ya no está expuesta en esta pantalla (reemplazada
  // por ModalReglasCuota.jsx).
  const { formula, tipoAlumnoOpciones } = useConfigCuota();

  const filas = useMemo(
    () =>
      items.map((item) => ({
        ...item.contacto,
        codigo: item.codigoContacto,
        estado: item.estado,
        codigoComprobante: item.codigoComprobante,
        puntoVenta: item.puntoVenta,
        numeroComprobante: item.numeroComprobante,
        total: item.total,
        saldoPendiente: item.saldoPendiente,
        fechaVto: item.fechaVto,
        montoSugerido: item.montoSugerido,
        tieneReglaContacto: contactosConReglaPropia.has(item.codigoContacto),
      })),
    [items, contactosConReglaPropia],
  );

  if (errorCuotas) {
    return (
      <div className="w-full py-6 px-6">
        <EncabezadoSeccion ruta="CUOTAS" icono={<CuotasIcono size={20} />} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-rose-600 font-bold text-[13px] uppercase tracking-widest">
            Error al cargar cuotas
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:brightness-110 transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-6 flex flex-col gap-4">
      <EncabezadoSeccion ruta="CUOTAS" icono={<CuotasIcono size={20} />}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerModalReglas(true)}
            disabled={!cuentaSeleccionada}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
          >
            <ConfiguracionIcono size={14} />
            Reglas de monto
          </button>

          <button
            onClick={() => setVerModalLote(true)}
            disabled={!cuentaSeleccionada}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <EmitirCuotasIcono size={14} />
            Generar cuotas para todos
          </button>
        </div>
      </EncabezadoSeccion>

      {/* Selectores de período + tipo de cuota + unidad de negocio: agrupados
          en un panel propio, con jerarquía visual (etiqueta + control más
          grande) para diferenciarlos del resto de los filtros de la
          sección. */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-mes"
              className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Mes
            </label>
            <select
              id="cuotas-mes"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              className="text-[13px] font-black uppercase bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5 outline-none cursor-pointer hover:bg-[var(--surface-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-[var(--text-primary)]"
            >
              {MESES.map((nombre, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-anio"
              className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Año
            </label>
            <select
              id="cuotas-anio"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              className="text-[13px] font-black uppercase bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5 outline-none cursor-pointer hover:bg-[var(--surface-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-[var(--text-primary)]"
            >
              {ANIOS.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-tipo"
              className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Tipo de Cuota
            </label>
            <select
              id="cuotas-tipo"
              value={codigoCuentaContable}
              onChange={(e) => setCodigoCuentaContable(e.target.value)}
              className="text-[13px] font-black uppercase bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5 outline-none cursor-pointer hover:bg-[var(--surface-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-[var(--text-primary)]"
            >
              <option value="">
                {cargandoCuentas ? "Cargando cuentas..." : "Seleccionar tipo de cuota"}
              </option>
              {cuentas.map((c) => (
                <option key={c.codigoSecuencial} value={c.codigoSecuencial}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-unidad"
              className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Unidad de Negocio
            </label>
            <select
              id="cuotas-unidad"
              value={codigoUnidadNegocio}
              onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
              className="text-[13px] font-black uppercase bg-white border border-[var(--border-subtle)] rounded-md px-3 py-2.5 outline-none cursor-pointer hover:bg-[var(--surface-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-[var(--text-primary)]"
            >
              {unidadesNegocio.map((u) => (
                <option key={u.codigo} value={u.codigo}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!cuentaSeleccionada && !cargandoCuentas && (
          <p className="text-rose-500 text-[11px] font-bold uppercase tracking-widest mt-3">
            Elegí un tipo de cuota (cuenta contable) para ver y emitir cuotas
          </p>
        )}
      </div>

      {loteMostrado && loteMostrado.codigo !== loteDescartadoCodigo && (
        <BannerLoteCuotas
          lote={loteMostrado}
          onVerDetalle={() => setCodigoLoteDetalle(loteMostrado.codigo)}
          onDescartar={() => setLoteDescartadoCodigo(loteMostrado.codigo)}
        />
      )}

      <TablaCuotas
        filas={filas}
        cargando={cargandoCuotas}
        cuentaSeleccionada={cuentaSeleccionada}
        tipoEntidadObligado={TIPO_ENTIDAD_OBLIGADO}
        mes={mesSeleccionado}
        anio={anioSeleccionado}
        codigoUnidadNegocio={codigoUnidadNegocio}
        refetch={refetch}
        formula={formula}
        tipoOpciones={tipoAlumnoOpciones}
      />

      {verModalLote && cuentaSeleccionada && (
        <ModalEmitirLote
          filas={filas}
          cuenta={cuentaSeleccionada}
          tipoEntidadObligado={TIPO_ENTIDAD_OBLIGADO}
          mes={mesSeleccionado}
          anio={anioSeleccionado}
          codigoUnidadNegocio={codigoUnidadNegocio}
          onClose={() => {
            setVerModalLote(false);
            // El cierre dispara este handler tanto si el lote ya terminó
            // como si el usuario eligió "Seguir en segundo plano" — en
            // ambos casos refrescamos el historial para que el banner
            // persistente (R48) recoja de inmediato un lote recién creado
            // que siga EN_PROCESO en el servidor, sin depender de
            // desmontar/remontar esta pantalla.
            refetchUltimoLote();
          }}
          onExito={() => {
            setVerModalLote(false);
            setLoteDescartadoCodigo(null);
            refetch();
            refetchUltimoLote();
          }}
        />
      )}

      {/* Reapertura del detalle de un lote ya conocido (banner "Ver
          progreso"/"Ver detalle"), desacoplada del flujo de disparo de
          ModalEmitirLote.jsx — mismo componente, `codigoLote` ya conocido
          de antemano en vez de recién emitido en este montaje. */}
      {codigoLoteDetalle && (
        <ModalProgresoLoteCuotas
          codigoLote={codigoLoteDetalle}
          onClose={() => setCodigoLoteDetalle(null)}
          onFinalizado={() => {
            refetch();
            refetchUltimoLote();
          }}
        />
      )}

      {verModalReglas && cuentaSeleccionada && (
        <ModalReglasCuota
          cuenta={cuentaSeleccionada}
          onClose={() => {
            setVerModalReglas(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default GestionCuotas;
