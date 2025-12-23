import { ConfiguracionIcono, CuentaIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
const Configuracion = () => {
  return (
    <div className="w-full py-6 px-6">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Configuración"}
        icono={<ConfiguracionIcono />}
      />
      {/* CONTENIDO */}
      <div className="rounded-md p-6 border-0 no-inset no-ring bg-[var(--fill)] px-0 py-0 dark:shadow-dark-md shadow-md">
        <div className="w-full">
          {/* NAVEGACION MENU */}
          <div className="flex text-center -mb-px flex-wrap  w-full  justify-start">
            {/* TAB 1 */}
            <button
              className="flex items-center gap-2 p-4 text-sm font-medium transition-all whitespace-nowrap
                    text-[var(--primary)]! border-b-2! border-[var(--primary)]!"
            >
              <CuentaIcono />
              Cuenta
            </button>
          </div>
          {/* NAVEGACION MENU */}
          {/* CONTENIDO */}
          <div className="mt-2 ring-offset-border dark:ring-offset-darkborder border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-none p-6">
            {/* GRILLA */}
            <div className="grid grid-cols-12 gap-[30px]">
              {/* TARJETA DE CAMBIAR IMAGEN */}
              <div className="md:col-span-6 col-span-12 text-bodytext">
                <div className="p-6 bg-[var(--fill2)] dark:bg-darkgray shadow-md dark:shadow-dark-md card undefined border-1! border-[var(--fill2)]! rounded-md">
                  <h5 className="leading-1 font-normal! text-white!">
                    Cambiar Perfil
                  </h5>
                  <p className="leading-12 font-light text-white/50 text-xs">
                    Cambia tu foto de perfil desde aquí.
                  </p>
                  <div className="mx-auto text-center mt-5">
                    <img
                      width={"120"}
                      height={"120"}
                      src="/girl-icon.jpg"
                      alt=""
                      className="rounded-full mx-auto"
                    />
                  </div>
                  <div className="flex justify-center gap-3 py-6">
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer bg-[var(--primary)]! text-white! hover:bg-primaryemphasis h-8 px-4 py-1">
                      Subir
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer bg-red-400! text-white! hover:bg-primaryemphasis h-8 px-4 py-1">
                      Reiniciar
                    </button>
                  </div>
                </div>
              </div>
              {/* TARJETA DE CAMBIAR IMAGEN */}
              {/* TARJETA DE CAMBIAR TU CONTRASEÑA */}
              <div className="md:col-span-6 col-span-12">
                <div className="p-6 text-bodytext bg-[var(--fill2)] shadow-md card h-full  rounded-md border-none">
                  <h5 className="leading-1 font-normal! text-white!">
                    Cambiar la contraseña
                  </h5>
                  <p className="font-light text-white/50 text-xs my-3">
                    Para cambiar su contraseña por favor confirme aquí.
                  </p>
                  {/* FORMULARIO PARA CAMBIAR LA CONTRASEÑA */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs mb-2 block font-normal text-white">
                        Contraseña actual
                      </label>
                      <input
                        className="flex h-8 w-full rounded-md! px-3 py-2 text-sm border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
                        type="password"
                      />
                    </div>
                    <div>
                      -
                      <label className="text-xs mb-2 block font-normal text-white">
                        Nueva Contraseña
                      </label>
                      <input
                        className="flex h-8 w-full rounded-md! px-3 py-2 text-sm border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
                        type="password"
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-2 block font-normal text-white">
                        Confirmar Contraseña
                      </label>
                      <input
                        className="flex h-8 w-full rounded-md! px-3 py-2 text-sm border-[0.2px]! border-gray-200/10! text-[var(--primary)]!"
                        type="password"
                      />
                    </div>
                  </div>
                  {/* FORMULARIO PARA CAMBIAR LA CONTRASEÑA */}
                </div>
              </div>
              {/* TARJETA DE CAMBIAR TU CONTRASEÑA */}
            </div>
            {/* BOTONES */}
            <div className="flex justify-end gap-3 w-full pt-5">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer bg-[var(--primary)]! text-white! hover:bg-primaryemphasis h-8 px-4 py-1">
                Guardar
              </button>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer bg-red-400! text-white! hover:bg-primaryemphasis h-8 px-4 py-1">
                Cancelar
              </button>
            </div>
            {/* BOTONES */}
          </div>
          {/* CONTENIDO */}
        </div>
      </div>
      {/* CONTENIDO */}
    </div>
  );
};

export default Configuracion;
