import { useState } from "react";
import {
  BuscadorIcono,
  DesplegadorIcono,
  NotificacionesIcono,
  RefrescarIcono,
} from "../../../assets/Icons";

import MenuUsuario from "../MenuUsuario/MenuUsuario";
import { Link } from "react-router-dom";

const BarraNavegacion = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-2 bg-transparent">
      <nav className="px-2  rounded-none bg-[var(--fill)] py-4 sm:px-6">
        <div className="mx-auto flex flex-wrap items-center justify-between">
          <div className="flex gap-0 items-center relative"></div>

          {/* OTROS ICONOS */}
          <div className="flex items-center justify-center gap-2">

            {/* DEMO */}
            <Link to={"/panel/demo"} className="text-xs p-1 bg-[var(--primary)]/20! text-[var(--primary)]! border-[var(--primary)]/30! rounded-md border">
              DEMO
            </Link>
            {/* DEMO */}

            {/* VERIFICAR SI SE CONECTO A ARCA */}
            <div className="flex gap-2 justify-center items-center">
              <span className="cursor-pointer">
                <RefrescarIcono size={20} color={"gray"} />
              </span>
              <p className="text-white text-xs">ARCA:</p>
              <div className="relative flex justify-center">
                {/* Pulso */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>

                {/* Punto fijo */}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400  shadow-green-300"></span>
              </div>
            </div>
            {/* VERIFICAR SI SE CONECTO A ARCA */}

            <div className="relative group/menu">
              {/* NOTIFICACIONES */}
              <button className="">
                <span class="h-10 w-10 hover:bg-lightprimary text-darklink dark:text-white rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
                  <NotificacionesIcono color={"white"} />
                </span>
                {/* CONTADOR DE NOTIFICACIONES */}
                <span className="rounded-full absolute end-1 top-1 bg-[var(--primary)] text-[10px] h-4 w-4 flex justify-center items-center text-white">
                  5
                </span>
              </button>
            </div>
            {/* PERFIL */}
            <div className="relative">
              <div className="flex items-center gap-1 cursor-pointe text-white">
                <span className="h-8 w-8 hover:text-primary rounded-full flex justify-center items-center group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
                  <img src="/girl-icon.jpg" alt="" className="rounded-full" />
                </span>
                <button
                  className="text-white! hover:text-[var(--primary)]! cursor-pointer"
                  onClick={() => !setMenuAbierto(!menuAbierto)}
                >
                  <DesplegadorIcono />
                </button>
              </div>
            </div>
            {/* MENU DESPLEGABLE */}
            {menuAbierto && <MenuUsuario />}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
