import { useState, useMemo } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useListarAsientosQuery } from "../../../../Backend/Contabilidad/queries/useAsientos.query";
import {
  evaluarFormulaCuota,
  formatearReferenciaCuota,
  calcularEstadoCuota,
} from "../../../../utils/cuotaUtils";
import { formatearARS } from "../../../../utils/formatearMoneda";
import ModalEmitirIndividual from "./ModalEmitirIndividual";
import ModalDeudaAlumno from "./ModalDeudaAlumno";
import ModalCambioTipoAlumno from "./ModalCambioTipoAlumno";
import ModalSeleccionarCobro from "./ModalSeleccionarCobro";
import { Package } from "lucide-react";

const MESES_ES = [
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

const ChipEstado = ({ estado }) => {
  if (estado === "ABONADO") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
        ABONADO
      </span>
    );
  }
  if (estado === "PARCIALMENTE_ABONADO") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
        PARCIAL
      </span>
    );
  }
  if (estado === "VENCIDA") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200">
        VENCIDA
      </span>
    );
  }
  if (estado === "EMITIDA") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
        EMITIDA
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[var(--fill-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
      SIN EMITIR
    </span>
  );
};

const TablaCuotas = ({ alumnos, cargando, formula, mes, anio, refetch, tipoOpciones = [] }) => {
  const { usuario } = useAuthStore();
  const [alumnoEmitirIndividual, setAlumnoEmitirIndividual] = useState(null);
  const [alumnoDeuda, setAlumnoDeuda] = useState(null);
  const [alumnoCambioTipo, setAlumnoCambioTipo] = useState(null);
  const [alumnoCobrarComprobante, setAlumnoCobrarComprobante] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const periodoDate = useMemo(() => new Date(anio, mes - 1, 1), [anio, mes]);
  const hoy = new Date();

  const mesStr = String(mes).padStart(2, "0");

  const { data: asientosRaw = [] } = useListarAsientosQuery(
    usuario?.codigoEmpresa
      ? {
          codigoEmpresa: usuario.codigoEmpresa,
          origenModulo: "ESCUELA",
        }
      : {},
  );

  const asientos = useMemo(
    () =>
      asientosRaw.filter(
        (a) =>
          typeof a.referencia === "string" &&
          a.referencia.startsWith("CUOTA-") &&
          a.referencia.endsWith(`-${anio}-${mesStr}`),
      ),
    [asientosRaw, anio, mesStr],
  );  const filas = useMemo(() => {
    return alumnos.map((alumno) => {
      const tipoAlumno = alumno.atributos?.tipo_alumno ?? "";
      const curso = alumno.atributos?.curso ?? "";
      const monto = evaluarFormulaCuota(formula, tipoAlumno);
      const referencia = formatearReferenciaCuota(
        alumno.codigoSecuencial,
        anio,
        mes,
      );
      const estado = calcularEstadoCuota(
        referencia,
        asientos,
        periodoDate,
        hoy,
      );
      const saldo = alumno.atributos?.saldo ?? 0;
      const nombreCompleto =
        alumno.razonSocial ||
        `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();
      const ef = alumno.enteFacturacion;
      const tutorNombre = ef ? `${ef.nombre ?? ""} ${ef.apellido ?? ""}`.trim() : "";

      // Calcular deuda anterior y total a partir de asientosRaw
      const prefijoBusqueda = `CUOTA-${alumno.codigoSecuencial}-`;
      const asientosAlumno = asientosRaw.filter(
        (a) => typeof a.referencia === "string" && a.referencia.startsWith(prefijoBusqueda)
      );

      const saldosPorReferencia = {};
      for (const asiento of asientosAlumno) {
        const ref = asiento.referencia;
        if (!saldosPorReferencia[ref]) {
          saldosPorReferencia[ref] = { debe: 0, haber: 0 };
        }
        if (asiento.detalles) {
          for (const d of asiento.detalles) {
            if (
              d.codigoCuentaContable === 507 ||
              d.nombreCuentaContable?.includes("PADRE") ||
              d.nombreCuentaContable?.includes("Padre")
            ) {
              saldosPorReferencia[ref].debe += d.debe ?? 0;
              saldosPorReferencia[ref].haber += d.haber ?? 0;
            }
          }
        }
      }

      let deudaAnterior = 0;
      let totalDeuda = 0;

      for (const ref in saldosPorReferencia) {
        const partes = ref.split("-");
        const refAnio = Number(partes[partes.length - 2]);
        const refMes = Number(partes[partes.length - 1]);

        const saldoPendiente = Math.max(0, saldosPorReferencia[ref].debe - saldosPorReferencia[ref].haber);

        if (saldoPendiente > 0) {
          totalDeuda += saldoPendiente;

          // Si es anterior al mes seleccionado
          const esAnterior = refAnio < anio || (refAnio === anio && refMes < mes);
          if (esAnterior) {
            deudaAnterior += saldoPendiente;
          }
        }
      }

      return {
        ...alumno,
        tipoAlumno,
        curso,
        monto,
        referencia,
        estado,
        saldo,
        nombreCompleto,
        tutorNombre,
        deudaAnterior,
        totalDeuda,
      };
    });
  }, [alumnos, formula, anio, mes, asientos, asientosRaw, periodoDate]);

  const filasFiltradas = useMemo(() => {
    if (!filtroBusqueda.trim()) return filas;
    const query = filtroBusqueda.toLowerCase().trim();
    return filas.filter(
      (f) =>
        f.nombreCompleto?.toLowerCase().includes(query) ||
        f.tutorNombre?.toLowerCase().includes(query)
    );
  }, [filas, filtroBusqueda]);


  if (cargando) {
    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[var(--fill-secondary)]">
            <tr>
              {[
                "Alumno",
                "Tutor",
                "Tipo",
                "Curso",
                "Monto Cuota",
                "Estado",
                "Total Deuda",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-black/5 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] py-20 flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <Package size={40} className="opacity-20" />
        <p className="text-[13px] font-bold uppercase tracking-widest">
          No hay alumnos registrados
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Buscador */}
      <div className="flex items-center gap-2 max-w-sm mb-3">
        <input
          type="text"
          placeholder="Buscar por alumno o tutor..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
          className="w-full text-[11px] px-3 py-2 border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] rounded-md outline-none focus:border-[var(--primary)] transition-colors font-bold uppercase tracking-wider placeholder:text-[var(--text-muted)] placeholder:normal-case placeholder:font-normal"
        />
        {filtroBusqueda && (
          <button
            onClick={() => setFiltroBusqueda("")}
            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer px-2 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead className="bg-[var(--fill-secondary)] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">
                  Alumno
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">
                  Tutor
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">
                  Tipo
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left">
                  Curso
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                  Monto Cuota
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center">
                  Estado
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                  Total Deuda
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--text-muted)] text-[12px] font-bold uppercase tracking-widest">
                    No se encontraron coincidencias
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((fila) => (
                  <tr
                    key={fila.codigoSecuencial}
                    className={`border-b border-[var(--border-subtle)] transition-colors ${
                      fila.estado === "VENCIDA"
                        ? "border-l-4 border-l-rose-500 bg-rose-50/30"
                        : "hover:bg-[var(--fill-secondary)]/40"
                    }`}
                    data-estado={fila.estado}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase">
                          {fila.nombreCompleto ||
                            `Alumno #${fila.codigoSecuencial}`}
                        </span>
                        {fila.deudaAnterior > 0 && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200/50 rounded px-1.5 py-0.5 w-fit uppercase tracking-widest animate-pulse">
                            Deuda anterior: {formatearARS(fila.deudaAnterior)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                        {fila.tutorNombre || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                        {fila.tipoAlumno || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                        {fila.curso || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-bold text-[var(--text-primary)]">
                        {formatearARS(fila.monto)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ChipEstado estado={fila.estado} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-black text-[var(--text-primary)]">
                        {formatearARS(fila.totalDeuda)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {fila.estado === "SIN_EMITIR" && (
                          <button
                            onClick={() => setAlumnoEmitirIndividual(fila)}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all cursor-pointer"
                          >
                            Emitir
                          </button>
                        )}
                        {fila.totalDeuda > 0 && (
                          <button
                            onClick={() => setAlumnoCobrarComprobante(fila)}
                            className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/20 transition-all cursor-pointer"
                          >
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={() => setAlumnoDeuda(fila)}
                          className="px-3 py-1.5 bg-[var(--fill-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                        >
                          Ver deudas
                        </button>
                        <button
                          onClick={() => setAlumnoCambioTipo(fila)}
                          className="px-3 py-1.5 bg-[var(--fill-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                        >
                          Cambiar tipo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {alumnoEmitirIndividual && (
        <ModalEmitirIndividual
          alumno={alumnoEmitirIndividual}
          formula={formula}
          mes={mes}
          anio={anio}
          asientos={asientos}
          onClose={() => setAlumnoEmitirIndividual(null)}
          onExito={() => {
            setAlumnoEmitirIndividual(null);
            refetch();
          }}
        />
      )}

      {alumnoDeuda && (
        <ModalDeudaAlumno
          alumno={alumnoDeuda}
          onClose={() => setAlumnoDeuda(null)}
        />
      )}

      {alumnoCambioTipo && (
        <ModalCambioTipoAlumno
          alumno={alumnoCambioTipo}
          formula={formula}
          tipoOpciones={tipoOpciones}
          mes={mes}
          anio={anio}
          asientos={asientos}
          onClose={() => setAlumnoCambioTipo(null)}
          onExito={() => {
            setAlumnoCambioTipo(null);
            refetch();
          }}
        />
      )}

      {alumnoCobrarComprobante && (
        <ModalSeleccionarCobro
          alumno={alumnoCobrarComprobante}
          onClose={() => setAlumnoCobrarComprobante(null)}
        />
      )}
    </>
  );
};

export default TablaCuotas;
