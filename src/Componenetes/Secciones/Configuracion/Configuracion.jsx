import { ConfiguracionIcono, CuentaIcono } from "../../../assets/Icons";
import Boton from "../../UI/Boton/Boton";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import InputReutilizable from "../../UI/InputReutilizable/InputReutilizable";

const Configuracion = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Configuración"}
        icono={<ConfiguracionIcono />}
      />

      {/* CONTENIDO */}
      <div className="w-full rounded-md p-6 border-0 no-inset no-ring bg-[var(--fill)] px-0 py-0 dark:shadow-dark-md shadow-md">
        <div className="w-full">
          {/* NAVEGACION MENU */}
          <div className="flex text-center -mb-px flex-wrap  w-full justify-start">
            {/* TAB 1 */}
            <button
              className="flex items-center gap-2 p-4 text-sm font-medium transition-all whitespace-nowrap
                    text-[var(--primary)]! border-b-2! border-[var(--primary)]!"
            >
              <CuentaIcono />
              <span className="text-white">Cuenta</span>
            </button>
          </div>
          {/* NAVEGACION MENU */}

          {/* CONTENIDO */}
          <div className="mt-2 p-6">
            {/* GRILLA */}
            <div className="grid grid-cols-12 gap-[30px]">
              {/* TARJETA DE CAMBIAR IMAGEN */}
              <div className="md:col-span-6 col-span-12">
                <div className="p-6 bg-[var(--fill2)] shadow-md card rounded-md">
                  <h5 className="leading-1 font-normal! text-white! text-lg!">
                    Cambiar Perfil
                  </h5>
                  <p className="leading-12 font-light text-white/50 text-md">
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
                  <div className="flex justify-center gap-3 py-10">
                    <Boton bg={"bg-[var(--primary)]!"} texto={"Subir"} />
                    <Boton bg={"bg-red-400!"} texto={"Borrar"} />
                  </div>
                </div>
              </div>
              {/* TARJETA DE CAMBIAR IMAGEN */}
              {/* TARJETA DE CAMBIAR TU CONTRASEÑA */}
              <div className="md:col-span-6 col-span-12">
                <div className="p-6 bg-[var(--fill2)] dark:bg-darkgray shadow-md  card h-full rounded-md">
                  <h5 className="leading-1 font-normal! text-white! text-lg!">
                    Cambiar la contraseña
                  </h5>
                  <p className="font-light text-white/50 text-md my-3">
                    Para cambiar su contraseña por favor confirme aquí.
                  </p>
                  {/* FORMULARIO PARA CAMBIAR LA CONTRASEÑA */}
                  <div className="flex flex-col gap-3 mt-10">
                    <InputReutilizable
                      label={"Contraseña Actual"}
                      tipo={"password"}
                    />
                    <InputReutilizable
                      label={"Nueva Contraseña"}
                      tipo={"password"}
                    />
                    <InputReutilizable
                      label={"Confirmar Contraseña"}
                      tipo={"password"}
                    />
                  </div>
                  {/* FORMULARIO PARA CAMBIAR LA CONTRASEÑA */}
                </div>
              </div>
              {/* TARJETA DE CAMBIAR TU CONTRASEÑA */}

              {/* DETALLE PERSONAL */}
              <div className="col-span-12">
                <div className="p-6 bg-[var(--fill2)] shadow-md card rounded-md">
                  <h5 className="leading-1 font-normal! text-white! text-lg!">
                    Detalle Personales
                  </h5>
                  <p className="leading-12 font-light text-white/50 text-md">
                    Cambia tus datos personales desde aquí.
                  </p>

                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                      <div className="flex flex-col gap-3 mt-3">
                        <InputReutilizable label={"Nombre"} tipo={""} />
                      </div>
                      <div className="flex flex-col gap-3 mt-3">
                        <InputReutilizable label={"Apellido"} tipo={""} />
                      </div>
                      <div className="flex flex-col gap-3 mt-3">
                        <InputReutilizable label={"Email"} tipo={""} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* DETALLE PERSONAL */}
            </div>
            {/* BOTONES */}
            <div className="flex justify-end gap-3 w-full pt-5">
              <Boton texto={"Guardar"} bg={"bg-[var(--primary)]!"} />
              <Boton texto={"Cancelar"} bg={"bg-red-400!"} />
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
