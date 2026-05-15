import React, { useState } from "react";
import { X, Plus, Save, Trash2, Settings2, GripVertical } from "lucide-react";
import { useAlertas } from "../../../../store/useAlertas";
import { useConfiguracionProducto } from "../../../../Backend/Articulos/queries/Producto/useConfiguracionProducto.query";
import { useCrearConfiguracion } from "../../../../Backend/Articulos/queries/Producto/useCrearConfiguracion.mutation";
import { useEffect } from "react";
import { BorrarIcono } from "../../../../assets/Icons";

const VistaConfiguracionCampos = ({ empresa, onClose }) => {
  const { agregarAlerta } = useAlertas();

  const { data: configuracionBackend, isLoading: cargandoConfig } =
    useConfiguracionProducto({
      codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
    });

  const { mutateAsync: crearConfiguracion, isLoading: guardando } =
    useCrearConfiguracion();

  const [campos, setCampos] = useState([]);

  // Cargar campos desde el backend al iniciar
  useEffect(() => {
    if (configuracionBackend) {
      const camposMapeados = configuracionBackend.map((c) => ({
        id: c.codigoSecuencial,
        nombre: c.nombreCampo,
        clave: c.claveCampo,
        tipo:
          c.tipoDato === "TEXTO"
            ? "string"
            : c.tipoDato === "NUMERO"
              ? "number"
              : c.tipoDato === "BOOLEANO"
                ? "boolean"
                : "lista",
        requerido: c.requerido,
        formula: c.formula || "",
        opciones: c.opciones || "",
      }));
      setCampos(camposMapeados);
    }
  }, [configuracionBackend]);

  const handleAgregarCampo = () => {
    const nuevo = {
      id: Date.now(),
      nombre: "",
      clave: "",
      tipo: "string",
      requerido: false,
      formula: "",
      opciones: "",
    };
    setCampos([...campos, nuevo]);
  };

  const handleEliminarCampo = (id) => {
    setCampos(campos.filter((c) => c.id !== id));
  };

  const handleUpdateCampo = (id, field, value) => {
    setCampos(campos.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleGuardar = async () => {
    try {
      const payload = {
        entidad: "PRODUCTO",
        campos: campos.map((c) => ({
          name: c.clave,
          type: c.tipo,
          label: c.nombre,
          requerido: c.requerido,
          formula: c.formula,
          opciones: c.opciones,
        })),
      };

      await crearConfiguracion({
        data: payload,
        params: { codigoEmpresa: empresa.codigo || empresa.codigoSecuencial },
      });

      agregarAlerta({
        message: "Configuración de campos guardada con éxito",
        type: "success",
      });
      onClose();
    } catch (error) {
      agregarAlerta({
        message: "Error al guardar la configuración",
        type: "error",
      });
    }
  };

  return (
    <div className="mt-8 border-t-2 border-black/5 pt-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-md shadow-xl border border-black/5 overflow-hidden">
        {/* Header de la Vista */}
        <div className="bg-indigo-700 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">
                Configuración de Campos Dinámicos
              </h2>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                Empresa: {empresa.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {cargandoConfig ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-700/20 border-t-indigo-700 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                Cargando configuración...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-wider">
                    Campos del Producto
                  </h3>
                  <p className="text-[10px] text-black/40 font-bold uppercase">
                    Define los atributos adicionales que tendrán los productos
                    de esta empresa
                  </p>
                </div>
                <button
                  onClick={handleAgregarCampo}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
                >
                  <Plus size={16} /> Agregar Campo
                </button>
              </div>

              <div className="space-y-3">
                {campos.map((campo) => (
                  <div
                    key={campo.id}
                    className="group flex flex-col gap-4 p-4 bg-gray-50 border border-gray-100 rounded-md border-indigo-200  shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                            <Settings2 size={10} /> Nombre del Campo
                          </label>
                          <input
                            type="text"
                            value={campo.nombre}
                            onChange={(e) =>
                              handleUpdateCampo(
                                campo.id,
                                "nombre",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: Talle, Color..."
                            className="bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                            <Settings2 size={10} /> Clave (Sistema)
                          </label>
                          <input
                            type="text"
                            value={campo.clave}
                            onChange={(e) =>
                              handleUpdateCampo(
                                campo.id,
                                "clave",
                                e.target.value,
                              )
                            }
                            placeholder="ej_clave"
                            className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                            <Settings2 size={10} /> Tipo de Dato
                          </label>
                          <select
                            value={campo.tipo}
                            onChange={(e) =>
                              handleUpdateCampo(
                                campo.id,
                                "tipo",
                                e.target.value,
                              )
                            }
                            className="bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                          >
                            <option value="string">TEXTO</option>
                            <option value="number">NÚMERO</option>
                            <option value="boolean">SÍ/NO</option>
                            <option value="lista">LISTA DE OPCIONES</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 md:pt-4">
                          <label className="flex items-center gap-2 cursor-pointer group/check">
                            <input
                              type="checkbox"
                              checked={campo.requerido}
                              onChange={(e) =>
                                handleUpdateCampo(
                                  campo.id,
                                  "requerido",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                            />
                            <span className="text-[10px] font-black text-gray-500 uppercase group-hover/check:text-indigo-600 transition-colors">
                              Requerido
                            </span>
                          </label>
                          <div className="flex items-center gap-1 border-l border-gray-100 pl-4 ml-2">
                            <button
                              onClick={() => handleEliminarCampo(campo.id)}
                              title="Eliminar Campo"
                              className="p-2 text-red-500 bg-red-50 rounded-md cursor-pointer"
                            >
                              <BorrarIcono size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Fórmula (Solo si es número) */}
                    {campo.tipo === "number" && (
                      <div className="pl-9 pt-2 border-t border-gray-100 flex flex-col gap-2">
                        <label className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px]">
                            fx
                          </div>
                          Fórmula de Cálculo (Opcional)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={campo.formula}
                            onChange={(e) =>
                              handleUpdateCampo(
                                campo.id,
                                "formula",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: {precioCompra} * 1.21"
                            className="flex-1 bg-indigo-50/30 border border-indigo-100 rounded-md px-3 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                          />
                          <div className="text-[10px] text-gray-400 font-medium italic">
                            Usa {"{clave}"} para referenciar otros campos
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sección de Opciones (Solo si es lista) */}
                    {campo.tipo === "lista" && (
                      <div className="pl-9 pt-2 border-t border-gray-100 flex flex-col gap-2">
                        <label className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-2">
                          <Settings2 size={10} /> Opciones de la Lista (Separadas por coma)
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={campo.opciones}
                            onChange={(e) =>
                              handleUpdateCampo(
                                campo.id,
                                "opciones",
                                e.target.value,
                              )
                            }
                            placeholder="Ej: GAMMING,PEDRITO,OFICINA"
                            className="flex-1 bg-amber-50/30 border border-amber-100 rounded-md px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-300 transition-all"
                          />
                          <div className="text-[10px] text-gray-400 font-medium italic">
                            Los valores aparecerán como opciones en el selector
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {campos.length === 0 && (
                  <div className="py-12 text-center bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold uppercase text-xs">
                      No hay campos configurados
                    </p>
                    <button
                      onClick={handleAgregarCampo}
                      className="text-indigo-600 font-black text-[10px] uppercase mt-2 hover:underline"
                    >
                      Click aquí para comenzar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || cargandoConfig}
            className="flex items-center gap-2 px-8 py-2 bg-black text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VistaConfiguracionCampos;
