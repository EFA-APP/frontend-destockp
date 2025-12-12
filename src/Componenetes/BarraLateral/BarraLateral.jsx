import React from "react";
import Articulo from "./Articulo";
import {
  Comprobante,
  Gastos,
  Inicio,
  Pagos,
  Persona,
  Producto,
  Proveedores,
  Reporte,
} from "../../assets/Icons";

const BarraLateral = () => {
  return (
    <div className="block ">
      <aside className="pt-2  fixed transition-all duration-[2s] ease-in-out  start-3 top-0  w-[162px]  dark:bg-darkgray rtl:pe-4 rtl:ps-0 flex flex-col ">
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
          <div className="mt-4 space-y-2 border-t pt-2 dark:border-gray-700">
            <div className="min-w-full table">
              <div className="pe-4 rtl:pe-0 rtl:ps-4   list-none">
                <ul className="mt-4 space-y-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700 border-ld hide-menu">
                  <div className="mt-1">
                    <h5 className=" text-white! font-semibold leading-8 tracking-wide text-[8px]">
                      Panel
                    </h5>
                    <Articulo nombre={"Inicio"} icono={<Inicio />} />
                    <h5 className=" text-white! font-semibold leading-6 tracking-wide text-[8px]">
                      Articulos
                    </h5>
                    <Articulo nombre={"Inventario"} icono={<Producto />} />
                    <h5 className=" text-white! font-semibold leading-6 tracking-wide text-[8px]">
                      Ventas
                    </h5>
                    <Articulo nombre={"Clientes"} icono={<Persona />} />
                    <Articulo nombre={"Comprobantes"} icono={<Comprobante />} />
                    <Articulo nombre={"Pagos recibos"} icono={<Pagos />} />
                    <h5 className=" text-white! font-semibold leading-6 tracking-wide text-[8px]">
                      Compras
                    </h5>
                    <Articulo nombre={"Proveedores"} icono={<Proveedores />} />
                    <Articulo nombre={"Gastos"} icono={<Gastos />} />
                    <Articulo nombre={"Comprobantes"} icono={<Comprobante />} />
                    <Articulo nombre={"Pagos realizados"} icono={<Pagos />} />
                    <h5 className=" text-white! font-semibold leading-6 tracking-wide text-[8px]">
                      Informes
                    </h5>
                    <Articulo nombre={"Reportes"} icono={<Reporte />} />
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
