import { Link } from "react-router-dom";
import { InicioIcono } from "../assets/Icons";

const Error = () => {
  return (
    <div className="bg-[var(--fill)]! min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Imagen */}
      <img src="/error404.png" alt="404 Error" className="w-[320px] mb-8" />

      {/* Texto */}
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Página no encontrada
      </h1>

      <p className="text-gray-300 text-center max-w-md mb-6">
        La página que estás buscando no existe o fue movida.
      </p>

      {/* Botón */}
      <Link
        to="/panel"
        className="px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md"
        style={{ backgroundColor: "#f29222" }}
      >
        <InicioIcono />
      </Link>
    </div>
  );
};

export default Error;
