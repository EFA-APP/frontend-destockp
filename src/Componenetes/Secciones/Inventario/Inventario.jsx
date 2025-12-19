import React from "react";
import EncabezadoSeccion from "../../Diseño/EncabezadoSeccion/EncabezadoSeccion";
import { BuscadorIcono } from "../../../assets/Icons";

const Inventario = () => {
  return (
    <div className="w-full py-6 px-6">
      {/* CABEZERA */}
      <EncabezadoSeccion ruta={"Inventario"} />

      <div className="px-6 py-4 text-bodytext border-0 card no-inset no-ring bg-[var(--fill)] dark:bg-darkgray  dark:shadow-dark-md shadow-md ">
        <div>
          {/* BUSCADOR Y AGREGAR PRODUCTO */}
          <div className="flex justify-between items-center mb-4 gap-4">
            {/* AGREGAR ARTICULO */}
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-8 px-4 py-1">
              Agregar producto
            </button>

            {/* BUSCADOR */}
            <div className="relative sm:max-w-60 max-w-full w-full">
              <BuscadorIcono props="absolute left-3 top-5 transform -translate-y-1/2 text-gray-100" />
              <input
                type="text"
                className="border-[.5px]! border-gray-100/10! flex h-10  rounded-md! px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-0 border-ld  placeholder:text-gray-100/50! focus-visible:ring-0 z-10 w-full  pl-10 pr-20 text-sm text-[var(--primary)]! focus:outline-none "
                placeholder="Ingrese el producto a buscar"
              />
            </div>
          </div>

          {/* TABLA PRODUCTOS */}
          <div
            className="overflow-x-auto"
            style={{ opacity: 1, transform: "none" }}
          >
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b border-ld">
                  <tr className="border-b border-ld transition-colors data-[state=selected]:bg-neutral-100 dark:data-[state=selected]:bg-neutral-800">
                    <th className="h-12 px-4 text-left align-middle text-ld [&:has([role=checkbox])]:pr-0 text-base font-semibold py-3 whitespace-nowrap">
                      ID
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
