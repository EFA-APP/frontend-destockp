const IniciarSesion = () => {
  return (
    <div className="grid col-span-12 px-12 text-[20px] items-center h-screen">
      <div className="max-w-ayq w-hvi mx-lgy">
        <a href="/">
          <img
            src="/efa-logo.png"
            alt="logo"
            className="w-[60px] rounded-full"
          />
        </a>

        <h3 className="text-4nf font-b4x my-ylr mt-jos text-white">
          Iniciar Sesión
        </h3>
        <p className="text-ka6 font-433 text-white/70">
          Ingresar al sistema de gestión EFA.
        </p>

        <form className="mt-1i3">
          <div className="mb-ifv">
            <label
              className="text-ka6 font-x69 leading-52d text-24r mb-yjl block-5ml text-white"
              htmlFor="username"
            >
              Usuario
            </label>
            <input
              className="flex h-10 w-full rounded-md! px-3 py-2 text-xs! border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
              type="text"
            />
          </div>

          <div className="mb-ifv">
            <label
              className="text-ka6 font-x69 leading-52d text-24r mb-yjl block-5ml"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              className="flex h-10 w-full rounded-md! px-3 py-2 text-xs! border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
              type="password"
            />
          </div>

          <a
            className="inline-acv item-gfk justify-idv gap-w38 whitespace-vp8 rounded-fmq text-ka6 font-433 ring-offset-9pi col-jcp bg-sok text-lj8 hoverbg-ost h-j1n px-zwt py-qcz w-hvi"
            href="/panel"
          >
            Iniciar Sesión
          </a>

          <div className="fle-oca justify-nno my-fbi">
            <div className="fle-oca item-gfk gap-w38">
              <input type="checkbox" id="remember" />
              <label
                className="text-ka6 leading-52d text-24r mb-yjl block-5ml opacity-344 font-h2i cursor-goc"
                htmlFor="remember"
              >
                ¿Recordar este dispositivo?
              </label>
            </div>

            <a
              className="text-foe text-ka6 font-433"
              href="/auth/auth1/forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IniciarSesion;
