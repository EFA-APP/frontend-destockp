import Articulo from "./Articulo";
import {
  ComprobanteIcono,
  GastosIcono,
  InicioIcono,
  InventarioIcono,
  PagosIcono,
  PersonaIcono,
  ProveedoresIcono,
  ReporteIcono,
} from "../../../assets/Icons";

const BarraLateral = () => {
  return (
    <div className="block ">
      <aside className="pt-2  fixed transition-all duration-[2s] ease-in-out  start-3 top-0  w-[180px]  dark:bg-darkgray rtl:pe-4 rtl:ps-0 flex flex-col ">
        {/* LOGO */}
        <div className="flex items-center py-2">
          <a href="/" data-discover="true">
            <img
              alt="logo"
              className="block w-10  rounded-full"
              src="/efa-logo.png"
            />
          </a>
        </div>

        {/* ITEMS */}
        <div className="relative h-[calc(100vh-85px)] overflow-scroll custom-scrollbar">
          <div className="mt-4 space-y-2 border-t pt-2 border-gray-400/10">
            <div className="min-w-full table">
              <div className="pe-4 rtl:pe-0 rtl:ps-4   list-none">
                <ul className="mt-4 space-y-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0  border-ld hide-menu">
                  <div className="mt-1 flex flex-col gap-2">
                    <Articulo nombre={"Inicio"} icono={<InicioIcono />} />

                    <Articulo
                      nombre={"Inventario"}
                      icono={<InventarioIcono />}
                      redireccion={"/panel/inventario"}
                    />
                    <Articulo
                      nombre={"Comprobantes"}
                      icono={<ComprobanteIcono />}
                    />
                    <Articulo
                      nombre={"Clientes"}
                      icono={<PersonaIcono />}
                      redireccion={"/panel/clientes"}
                    />
                    <Articulo nombre={"Pagos recibos"} icono={<PagosIcono />} />

                    <Articulo
                      nombre={"Proveedores"}
                      icono={<ProveedoresIcono />}
                    />
                    <Articulo nombre={"Gastos"} icono={<GastosIcono />} />
                    <Articulo
                      nombre={"Comprobantes"}
                      icono={<ComprobanteIcono />}
                    />
                    <Articulo
                      nombre={"Pagos realizados"}
                      icono={<PagosIcono />}
                    />

                    <Articulo nombre={"Reportes"} icono={<ReporteIcono />} />
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BarraLateral;
