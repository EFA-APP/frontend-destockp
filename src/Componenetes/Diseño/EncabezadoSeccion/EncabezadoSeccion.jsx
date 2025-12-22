import { InicioIcono } from "../../../assets/Icons";

const EncabezadoSeccion = ({ ruta }) => {
  return (
    <div className="rounded-md p-6 text-bodytext border-0 no-inset no-ring bg-[var(--fill)] dark:bg-darkgray mb-[30px] py-4 dark:shadow-dark-md shadow-md">
      <div className="flex items-center justify-between">
        <h6 className="text-[15px] text-white">{ruta}</h6>
        <div className="flex items-center gap-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-bodytext sm:gap-2.5">
            <li>
              <a
                className="transition-colors hover:text-primary dark:hover:text-primary"
                href="/panel"
              >
                <InicioIcono />
              </a>
            </li>
            <li>
              <div className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">
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
