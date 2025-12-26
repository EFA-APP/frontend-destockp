import { useState } from "react";
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
import { useTamañoBarraLateral } from "../../../api/zustand/useTamanoBarraLateral";

const BarraLateral = () => {
  const { isExpanded, setIsExpanded } = useTamañoBarraLateral();

  const handleArticuloClick = (e) => {
    if (!isExpanded) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(true);
    }
  };

  return (
    <div className="block ">
      <aside
        className={`bg-[var(--fill)]! md:bg-transparent! pt-2 fixed transition-all duration-300 ease-in-out start-3 top-0 rtl:pe-4 rtl:ps-0 flex flex-col  z-[99999] ${
          isExpanded ? "w-[180px]" : "w-[50px]"
        }`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* LOGO */}
        <div className="flex items-center py-2 px-2">
          <a href="/" data-discover="true">
            <img
              alt="logo"
              className="block w-10 rounded-full"
              src="/efa-logo.png"
            />
          </a>
        </div>

        {/* ITEMS */}
        <div className="relative h-[calc(100vh-85px)] ">
          <div className="mt-4 space-y-2 border-t pt-2 border-gray-400/10">
            <div className="min-w-full table">
              <div className="pe-4 rtl:pe-0 rtl:ps-4 list-none">
                <ul className="mt-4 space-y-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0 border-ld hide-menu">
                  <div className="mt-1 flex flex-col gap-2">
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Inicio" : ""}
                        icono={<InicioIcono />}
                        redireccion={"/panel"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* INVENTARIO CON SUBMENÚ */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Inventario" : ""}
                        icono={<InventarioIcono />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Productos",
                                  redireccion: "/panel/inventario/productos",
                                },
                                {
                                  nombre: "Materia Prima",
                                  redireccion:
                                    "/panel/inventario/materia-prima",
                                },
                              ]
                            : undefined
                        }
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Contactos" : ""}
                        icono={<PersonaIcono />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Clientes",
                                  redireccion: "/panel/contactos/clientes",
                                },
                                {
                                  nombre: "Proveedores",
                                  redireccion: "/panel/contactos/proveedores",
                                },
                              ]
                            : undefined
                        }
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Comprobantes" : ""}
                        icono={<ComprobanteIcono />}
                        redireccion={"/panel/comprobantes"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Pagos recibos" : ""}
                        icono={<PagosIcono />}
                        redireccion={"/panel/pagos-recibidos"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Proveedores" : ""}
                        icono={<ProveedoresIcono />}
                        redireccion={"/panel/proveedores"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Gastos" : ""}
                        icono={<GastosIcono />}
                        redireccion={"/panel/gastos"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Pagos realizados" : ""}
                        icono={<PagosIcono />}
                        redireccion={"/panel/pagos-realizados"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Reportes" : ""}
                        icono={<ReporteIcono />}
                        redireccion={"/panel/reportes"}
                        isCollapsed={!isExpanded}
                      />
                    </div>
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
