import { Link } from "react-router-dom";

const IniciarSesion = () => {
  return (
    <div className="grid col-span-12 px-12 text-[20px] items-center h-screen">
      <div className="max-w-ayq w-hvi mx-lgy">
        <Link href="/">
          <img
            src="/efa-logo.png"
            alt="logo"
            className="w-[60px] rounded-full"
          />
        </Link>

        <h3 className="text-4nf font-b4x my-ylr mt-jos text-white">
          Iniciar Sesión
        </h3>
        <p className="text-ka6 font-433 text-white/70">
          Ingresar al sistema de gestión EFA.
        </p>

        <form className="mt-1i3">
          <div className="mb-ifv">
            <label className="text-[17px]  text-white" htmlFor="username">
              Usuario
            </label>
            <input
              className="flex h-10 w-full rounded-md! px-3  text-xs! border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
              type="text"
            />
          </div>

          <div className="mb-ifv">
            <label className="text-[17px]  text-white" htmlFor="password">
              Contraseña
            </label>
            <input
              className="flex h-10 w-full rounded-md! px-3 py-2 text-xs! border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
              type="password"
            />

            <div className="flex mt-2 justify-end">
              <Link
                className="text-sm text-[var(--primary)] cursor-pointer hover:text-[var(--primary-light)]"
                to="/auth/auth1/forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <Link
            className="inline-acv item-gfk justify-idv gap-w38 whitespace-vp8 rounded-fmq text-ka6 font-433 ring-offset-9pi col-jcp bg-sok text-lj8 hoverbg-ost h-j1n px-zwt py-qcz w-hvi"
            to="/panel"
          >
            Iniciar Sesión
          </Link>
        </form>
      </div>
    </div>
  );
};

export default IniciarSesion;
