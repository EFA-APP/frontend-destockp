import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useObtenerMateriasPrimas } from "../../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import {
  EditarIcono,
  BuscadorIcono,
  ArcaIcono,
} from "../../../../assets/Icons";
import { ArrowRight, Package } from "lucide-react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";

/**
 * SeleccionarMateriaPrimaGestionPage: Interfaz para seleccionar que MATERIA PRIMA se va a editar.
 */
const SeleccionarMateriaPrimaGestionPage = () => {
  const navigate = useNavigate();
  const { data: matData, isLoading } = useObtenerMateriasPrimas({});
  const [searchTerm, setSearchTerm] = useState("");

  const items = useMemo(() => {
    return Array.isArray(matData) ? matData : [];
  }, [matData]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.nombre?.toLowerCase().includes(term) ||
        String(item.codigoSecuencial).includes(term),
    );
  }, [searchTerm, items]);

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta="Gestión de Artículos > Seleccionar Materia Prima"
        icono={<EditarIcono size={20} />}
        volver={true}
        redireccionAnterior={-1}
      />

      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/85 group-focus-within:text-blue-700  z-10">
            <BuscadorIcono size={18} color="white" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar materia prima por nombre o código para gestionar..."
            className="w-full bg-[var(--surface)] border border-black/10 rounded-md pl-12 pr-4 py-4 text-sm text-black focus:outline-none focus:border-blue-700/30  shadow-xl placeholder:text-black/10 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white/[0.02] border border-black/5 rounded-md "
              />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-20 bg-white/[0.01] border border-dashed border-black/5 rounded-md flex flex-col items-center justify-center text-black/10">
              <Package size={40} strokeWidth={1} className="mb-2 opacity-10" />
              <p className="text-[12px] font-black uppercase tracking-widest">
                No se encontraron materias primas
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.codigoSecuencial}
                onClick={() =>
                  navigate(
                    `/panel/inventario/materia-prima/${item.codigoSecuencial}/editar`,
                    { state: { materiaPrima: item } },
                  )
                }
                className="group bg-[var(--surface)] border border-black/5 rounded-md p-4 flex items-center justify-between   cursor-pointer hover:shadow-lg hover:border-emerald-700/30 hover:shadow-emerald-700/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-emerald-600/10 text-emerald-700 border border-emerald-700/10 group-hover:bg-emerald-600 group-hover:text-black flex items-center justify-center ">
                    <ArcaIcono size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-black/85 uppercase">
                        #{item.codigoSecuencial.toString().padStart(3, "0")}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-black/10" />
                      <span className="text-[11px] font-black text-emerald-700/50 uppercase tracking-widest">
                        MATERIA PRIMA
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-black uppercase  line-clamp-1 group-hover:text-black">
                      {item.nombre}
                    </h3>
                    <p className="text-[12px] text-black/85 font-medium">
                      Stock:{" "}
                      <span className="text-black/60">{item.stock || 0}</span>{" "}
                      {item.unidadMedida}
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-md bg-black/5 text-black/85 group-hover:bg-blue-600/20 group-hover:text-blue-400 ">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ContenedorSeccion>
  );
};

export default SeleccionarMateriaPrimaGestionPage;
