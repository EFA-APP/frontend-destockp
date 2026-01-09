import Articulo from "./Articulo";
import {
  CarritoIcono,
  ColegioIcono,
  ComprobanteIcono,
  ContableIcono,
  GastosIcono,
  InicioIcono,
  InventarioIcono,
  PagosIcono,
  PersonaIcono,
  ProveedoresIcono,
  ReporteIcono,
  VentasIcono,
} from "../../../assets/Icons";
import { useTamañoBarraLateral } from "../../../store/useTamanoBarraLateral";
import { useState } from "react";
import { Link } from "react-router-dom";

const BarraLateral = () => {
  const { isExpanded, setIsExpanded } = useTamañoBarraLateral();
  const [openItem, setOpenItem] = useState(null);

  const handleArticuloClick = (e, itemId) => {
    if (!isExpanded) {
      // Si está colapsado, expande y abre el submenú
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(true);
    }
  };

  const toggleItem = (id) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setOpenItem(id);
    } else {
      setOpenItem(openItem === id ? null : id);
    }
  };

  return (
    <div className="block ">
      <aside
        className={`bg-[var(--fill)]! md:bg-transparent! pt-2 fixed transition-all duration-300 ease-in-out start-3 top-0 rtl:pe-4 rtl:ps-0 flex flex-col  z-[99999999] ${
          isExpanded ? "w-[180px] " : "w-[50px] items-start"
        }`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* LOGO */}
        <div className="flex items-center py-2 px-2">
          <Link to="/" data-discover="true">
            <img
              alt="logo"
              className="block w-10 rounded-full"
              src="/efa-logo.png"
            />
          </Link>
        </div>

        {/* ITEMS */}
        <div className="relative h-[calc(100vh-85px)] bg-[var(--fill)]!">
          <div className="mt-4 space-y-2 border-t pt-2 border-gray-400/10">
            <div className="min-w-full table">
              <div className="pe-4 rtl:pe-0 rtl:ps-4 list-none">
                <div className="mt-4 space-y-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0 border-ld hide-menu">
                  <div className="mt-1 flex flex-col">
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Inicio" : ""}
                        icono={<InicioIcono size={18} />}
                        redireccion={"/panel/"}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* INVENTARIO CON SUBMENÚ */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Inventario" : ""}
                        icono={<InventarioIcono size={20} />}
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
                        isOpen={openItem === "inventario"}
                        onToggle={() => toggleItem("inventario")}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* CONTACTO */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Contactos" : ""}
                        icono={<PersonaIcono size={20} />}
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
                        isOpen={openItem === "contactos"}
                        onToggle={() => toggleItem("contactos")}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* VENTA */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Ventas" : ""}
                        icono={<VentasIcono size={18} />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Facturas",
                                  redireccion: "/panel/ventas/facturas",
                                },
                                {
                                  nombre: "Notas de Créditos",
                                  redireccion: "/panel/ventas/notas-creditos",
                                },
                                {
                                  nombre: "Notas de Débito",
                                  redireccion: "/panel/ventas/notas-debitos",
                                },
                                {
                                  nombre: "Orden de venta",
                                  redireccion: "/panel/ventas/orden-ventas",
                                },
                              ]
                            : undefined
                        }
                        isOpen={openItem === "ventas"}
                        onToggle={() => toggleItem("ventas")}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* COMPRAS */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Compras" : ""}
                        icono={<CarritoIcono size={19} />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Facturas de proveedor",
                                  redireccion:
                                    "/panel/compras/facturas-proveedores",
                                },
                                {
                                  nombre: "Notas de Créditos",
                                  redireccion: "/panel/compras/notas-creditos",
                                },
                              ]
                            : undefined
                        }
                        isOpen={openItem === "compras"}
                        onToggle={() => toggleItem("compras")}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* ESCUELA */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Escuela" : ""}
                        icono={<ColegioIcono size={19} />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Alumnos",
                                  redireccion: "/panel/escuela/alumnos",
                                },
                                {
                                  nombre: "Cuotas",
                                  redireccion: "/panel/escuela/cuotas",
                                },
                                {
                                  nombre: "Recibos",
                                  redireccion: "/panel/escuela/recibos",
                                },
                              ]
                            : undefined
                        }
                        isOpen={openItem === "colegio"}
                        onToggle={() => toggleItem("colegio")}
                        isCollapsed={!isExpanded}
                      />
                    </div>

                    {/* CONTABILIDAD */}
                    <div onClick={handleArticuloClick}>
                      <Articulo
                        nombre={isExpanded ? "Contabilidad" : ""}
                        icono={<ContableIcono size={18} />}
                        submenu={
                          isExpanded
                            ? [
                                {
                                  nombre: "Plan de Cuentas",
                                  redireccion: "/panel/contabilidad/cuentas",
                                },
                                {
                                  nombre: "Asientos",
                                  redireccion: "/panel/contabilidad/asientos",
                                },
                                {
                                  nombre: "Libro Diario",
                                  redireccion:
                                    "/panel/contabilidad/libro-diario",
                                },
                                {
                                  nombre: "Libro Mayor",
                                  redireccion:
                                    "/panel/contabilidad/libro-mayor",
                                },
                                {
                                  nombre: "Balance",
                                  redireccion: "/panel/contabilidad/balance",
                                },
                              ]
                            : undefined
                        }
                        isOpen={openItem === "contabilidad"}
                        onToggle={() => toggleItem("contabilidad")}
                        isCollapsed={!isExpanded}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BarraLateral;
