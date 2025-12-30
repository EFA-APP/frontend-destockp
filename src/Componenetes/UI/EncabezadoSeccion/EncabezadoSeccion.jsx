import { Link } from "react-router-dom";
import { InicioIcono, VolverIcono } from "../../../assets/Icons";

const EncabezadoSeccion = ({
  ruta,
  icono,
  volver = false,
  redireccionAnterior,
}) => {
  return (
    <div className="rounded-md p-6 border-0 no-inset no-ring bg-[var(--fill)] mb-[20px] py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex justify-center items-center gap-2">
          <span className="text-[var(--primary)]">{icono}</span>
          <h6 className="text-[14px] text-white">{ruta}</h6>
        </div>
        <div className="flex items-center gap-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-bodytext sm:gap-2.5">
            <li>
              <Link
                className="transition-colors dark:hover:text-[var(--primary)]! text-white! "
                to={`${volver ? redireccionAnterior : "/panel"}`}
              >
                {volver ? <VolverIcono size={22} /> : <InicioIcono />}
              </Link>
            </li>
            <li>
              <div className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-[var(--primary-opacity-10)] text-[var(--primary)]">
                {ruta.toUpperCase()}
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EncabezadoSeccion;
