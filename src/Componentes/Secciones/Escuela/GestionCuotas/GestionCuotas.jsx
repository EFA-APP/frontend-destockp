import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CuotasIcono,
  ConfiguracionIcono,
  EmitirCuotasIcono,
} from "../../../../assets/Icons";
import { useCuotas } from "../../../../Backend/Escuela/hooks/useCuotas";
import { useConfigCuota } from "../../../../Backend/Escuela/hooks/useConfigCuota";
import TablaCuotas from "./TablaCuotas";
import ModalEmitirLote from "./ModalEmitirLote";
import ModalEditarCuota from "./ModalEditarCuota";

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

const GestionCuotas = () => {
  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(hoy.getFullYear());
  const [verModalLote, setVerModalLote] = useState(false);
  const [verModalEditar, setVerModalEditar] = useState(false);

  const { alumnos, cargandoAlumnos, errorAlumnos, refetch } = useCuotas();
  const { formula, cargandoConfig, codigoSecuencial, actualizarCuota, tipoAlumnoOpciones } =
    useConfigCuota();

  if (errorAlumnos) {
    return (
      <div className="w-full py-6 px-6">
        <EncabezadoSeccion ruta="CUOTAS" icono={<CuotasIcono size={20} />} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-rose-600 font-bold text-[13px] uppercase tracking-widest">
            Error al cargar alumnos
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
            onClick={() => setVerModalEditar(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shadow-sm transition-all cursor-pointer"
          >
            Editar valor de cuota
          </button>

          <button
            onClick={() => setVerModalLote(true)}
            disabled={!formula}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <EmitirCuotasIcono size={14} />
            Generar cuotas para todos
          </button>
        </div>
      </EncabezadoSeccion>

      {/* Selectores de período */}
      <div className="flex items-center gap-3">
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(Number(e.target.value))}
          aria-label="Mes"
          className="text-[11px] font-bold uppercase bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]"
        >
          {MESES.map((nombre, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {nombre}
            </option>
          ))}
        </select>

        <select
          value={anioSeleccionado}
          onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
          aria-label="Año"
          className="text-[11px] font-bold uppercase bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]"
        >
          {ANIOS.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>

        {!formula && !cargandoConfig && (
          <span className="text-rose-500 text-[11px] font-bold uppercase tracking-widest">
            Configure el valor de cuota antes de emitir
          </span>
        )}
      </div>

      <TablaCuotas
        alumnos={alumnos}
        cargando={cargandoAlumnos}
        formula={formula}
        mes={mesSeleccionado}
        anio={anioSeleccionado}
        refetch={refetch}
        tipoOpciones={tipoAlumnoOpciones}
      />

      {verModalLote && (
        <ModalEmitirLote
          alumnos={alumnos}
          formula={formula}
          mes={mesSeleccionado}
          anio={anioSeleccionado}
          onClose={() => setVerModalLote(false)}
          onExito={() => {
            setVerModalLote(false);
            refetch();
          }}
        />
      )}

      {verModalEditar && (
        <ModalEditarCuota
          formula={formula}
          mes={mesSeleccionado}
          anio={anioSeleccionado}
          actualizarCuota={actualizarCuota}
          onClose={() => setVerModalEditar(false)}
        />
      )}
    </div>
  );
};

export default GestionCuotas;
