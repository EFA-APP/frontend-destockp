import { Link } from "react-router-dom";
import { CerrarSesionIcono, ConfiguracionIcono } from "../../../assets/Icons";

const MenuUsuario = () => {
  return (
    <div className="shadow-md fixed right-5 top-15 mt-3 z-50 w-auto rounded-sm bg-[var(--fill)] p-2 border border-gray-50/40">
      <div className="px-1">
        <div className="flex items-center gap-6 pb-3 border-b border-gray-50/40 mt-5 mb-3">
          <img
            src="/man-icon.jpg"
            alt="User Avatar"
            className="rounded-full w-8 h-8"
          />
          <div className="text-xs!">
            <h5 className="text-white! font-semibold">
              José Chocobar ●
              <span className="ml-[2px] text-green-400">Admin</span>
            </h5>
            <p className="text-[var(--primary-light)]! ">
              josechocobar@joseguma.com
            </p>
          </div>
        </div>
      </div>

      <div className="px-2 mb-2">
        <Link
          to="/panel/configuracion "
          className="relative select-none gap-2 text-xs outline-none transition-colors [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 px-3 py-2 flex justify-between items-center  group/link w-full rounded-md cursor-pointer focus:bg-hover flex items-center w-full hover:bg-[var(--primary)]/30"
        >
          <div className="flex items-center gap-2 w-full text-white">
            <span>
              <ConfiguracionIcono size={16} color={"var(--primary)"} />
            </span>
            <h5 className="text-xs font-normal!">Configuración</h5>
          </div>
        </Link>
      </div>

      <div className="px-2 mb-2">
        <Link
          to="/"
          className="relative select-none gap-2 text-xs outline-none transition-colors [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 px-3 py-2 flex justify-between items-center  group/link w-full rounded-md cursor-pointer focus:bg-hover flex items-center w-full bg-red-700/40 hover:bg-white/20"
        >
          <div className="flex items-center gap-2 w-full text-white">
            <span>
              <CerrarSesionIcono size={16} />
            </span>
            <h5 className="font-normal!">Cerrar Sesión</h5>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MenuUsuario;
