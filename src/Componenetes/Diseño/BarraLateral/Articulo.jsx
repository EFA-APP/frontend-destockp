import React from "react";

const Articulo = ({ nombre, icono, redireccion }) => {
  return (
    <li className="group relative  rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 w-full cursor-pointer">
      <a
        href={redireccion}
        className="flex items-center gap-2 text-xs  dark:text-gray-300 p-2 rounded-md w-full transition-all hover:text-[#f29222]! hover:bg-[#f291223a]"
      >
        {icono}

        <span className="truncate">{nombre}</span>
      </a>
    </li>
  );
};

export default Articulo;
