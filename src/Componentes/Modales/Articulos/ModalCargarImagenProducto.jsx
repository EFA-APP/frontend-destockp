import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useCargarImagenProducto } from "../../../Backend/Articulos/queries/Producto/useCargarImagenProducto.mutation";
import { useAlertas } from "../../../store/useAlertas";

const ModalCargarImagenProducto = ({ isOpen, onClose, producto }) => {
  const [imagenBase64, setImagenBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(producto?.imagen || null);
  const [fileSize, setFileSize] = useState(null);
  const fileInputRef = useRef(null);
  const { mutate: cargarImagen, isPending } = useCargarImagenProducto();
  const { agregarAlerta } = useAlertas();

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!isOpen) return null;

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Máximo 1200px de ancho/alto
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir al 70% de calidad
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileSize(file.size);
      const compressedBase64 = await compressImage(file);
      setImagenBase64(compressedBase64);
      setPreviewUrl(compressedBase64);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleGuardar = () => {
    if (!imagenBase64) {
      agregarAlerta({
        message: "Selecciona una imagen primero",
        type: "warning",
      });
      return;
    }

    if (fileSize > MAX_SIZE) {
      agregarAlerta({
        message: "La imagen supera el límite permitido de 5MB",
        type: "error",
      });
      return;
    }

    cargarImagen(
      {
        codigoEmpresa: producto.codigoEmpresa,
        codigoSecuencial: producto.codigoSecuencial,
        imagen: imagenBase64,
      },
      {
        onSuccess: () => {
          agregarAlerta({
            message: "Imagen actualizada correctamente",
            type: "success",
          });
          onClose();
        },
        onError: (error) => {
          const responseData = error.response?.data;
          const apiMessage =
            typeof responseData?.message === "object"
              ? responseData.message.message
              : responseData?.message || error.message;

          if (
            apiMessage?.includes("MAX_PAYLOAD_EXCEEDED") ||
            apiMessage?.includes("too large")
          ) {
            agregarAlerta({
              message:
                "La imagen es demasiado pesada para el servidor. Por favor, intenta con una imagen de menor resolución o más comprimida.",
              type: "error",
            });
          } else {
            agregarAlerta({
              message: "Error al cargar la imagen: " + apiMessage,
              type: "error",
            });
          }
        },
      },
    );
  };

  const handleEliminarImagen = () => {
    setImagenBase64(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-md shadow-2xl overflow-hidden border border-black/5 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-indigo-700 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">
              Imagen del Producto
            </h2>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
              {producto?.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
              ${previewUrl ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300"}`}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white font-black text-xs uppercase">
                    Cambiar Imagen
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">
                  Haz clic para subir
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  JPG, PNG o WEBP (Máx 5MB)
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {previewUrl && (
            <div className="mt-4 space-y-2">
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-md border ${fileSize > MAX_SIZE ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-100 text-gray-500"}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Tamaño del archivo:
                </span>
                <span
                  className={`text-xs font-black ${fileSize > MAX_SIZE ? "text-red-600" : "text-indigo-600"}`}
                >
                  {formatSize(fileSize)}
                </span>
              </div>

              {fileSize > MAX_SIZE && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter text-center animate-pulse">
                  ⚠️ El archivo es demasiado pesado (Máx 5MB)
                </p>
              )}

              <button
                onClick={handleEliminarImagen}
                className="w-full py-2 flex items-center justify-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} /> Quitar Imagen
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-md font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={isPending || !imagenBase64 || fileSize > MAX_SIZE}
            className={`flex-1 h-12 rounded-md font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all
              ${isPending || !imagenBase64 || fileSize > MAX_SIZE ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-95"}`}
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCargarImagenProducto;
