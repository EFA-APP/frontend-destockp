import React, { useState } from "react";
import Input from "../../UI/InputReutilizable/InputReutilizable";
import { X } from "lucide-react";

const ModalBeneficio = ({ isOpen, onClose, onSubmit, comercios = [] }) => {
  const [formData, setFormData] = useState({
    codigoContactoComercio: "",
    titulo: "",
    descuento: "",
    descripcion: "",
    fechaInicioVigencia: "",
    fechaFinVigencia: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.codigoContactoComercio || !formData.titulo || !formData.descripcion) return;

    onSubmit({
      ...formData,
      codigoContactoComercio: Number(formData.codigoContactoComercio),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-lg font-black text-gray-900">Añadir Nuevo Beneficio</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Comercio Asociado
              </label>
              <select
                name="codigoContactoComercio"
                value={formData.codigoContactoComercio}
                onChange={handleChange}
                required
                className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm outline-none"
              >
                <option value="">Seleccione un comercio</option>
                {comercios.map((com) => (
                  <option key={com.codigoContactoComercio} value={com.codigoContactoComercio}>
                    {com.nombre || "Comercio sin nombre"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <Input
                  label="Título de la promoción"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: 20% OFF en toda la tienda"
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Descuento (Texto corto)"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleChange}
                  placeholder="Ej: 20% OFF"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm outline-none resize-none"
                />
              </div>
              <div>
                <Input
                  label="Inicio de vigencia"
                  type="date"
                  name="fechaInicioVigencia"
                  value={formData.fechaInicioVigencia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  label="Fin de vigencia"
                  type="date"
                  name="fechaFinVigencia"
                  value={formData.fechaFinVigencia}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Footer / Acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-md font-bold uppercase tracking-wider text-xs hover:bg-black shadow-sm transition-colors"
            >
              CREAR BENEFICIO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBeneficio;
