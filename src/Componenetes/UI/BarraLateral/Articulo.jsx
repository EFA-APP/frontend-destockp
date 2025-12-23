import { useLocation } from "react-router-dom";

const Articulo = ({ nombre, icono, redireccion }) => {
  const location = useLocation();
  const estaActivado = location.pathname === redireccion;

  return (
    <li
      className={`group relative  rounded-md transition-all duration-200 ease-in-out w-full cursor-pointer ${
        estaActivado ? "translate-x-1" : "hover:translate-x-1"
      }`}
    >
      <a
        href={redireccion}
        className={`flex items-center gap-2 text-md  text-white p-2 rounded-md w-full py-2 transition-all hover:text-[var(--primary)]! hover:bg-[#f291223a] ${
          estaActivado ? "text-[var(--primary)]! bg-[var(--primary)]/20" : ""
        }`}
      >
        {icono}

        <span className="truncate ">{nombre}</span>
      </a>
    </li>
  );
};

export default Articulo;
