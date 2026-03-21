import React, { useState } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { actualizarConfiguracionVisualApi } from "../../../Backend/Autenticacion/api/Usuario/authenticacion.api";
import { useAlertas } from "../../../store/useAlertas";

const ModalConfiguracionVisual = ({ isOpen, onClose }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const { agregarAlerta } = useAlertas();

  const [colorPrimario, setColorPrimario] = useState(usuario?.configuracionVisual?.colorPrimario || "#d11057");
  const [colorSecundario, setColorSecundario] = useState(usuario?.configuracionVisual?.colorSecundario || "#10d127");
  const [logoBase64, setLogoBase64] = useState(usuario?.configuracionVisual?.logoUrl || "");
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const manejarArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 1024 * 1024) { 
      agregarAlerta({ message: "La imagen no debe superar 1MB para un rendimiento óptimo.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      setLogoBase64(String(reader.result));
    };
  };

  const manejarGuardar = async () => {
    try {
      setCargando(true);
      const payload = {
        colorPrimario,
        colorSecundario,
        logoUrl: logoBase64
      };

      await actualizarConfiguracionVisualApi(payload);

      setUsuario({
        ...usuario,
        configuracionVisual: payload
      });

      agregarAlerta({ message: "Configuración visual actualizada correctamente.", type: "success" });
      onClose();
    } catch (error) {
      console.error(error);
      agregarAlerta({ message: error.message || "Error al actualizar configuración.", type: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--primary-subtle)]/10">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Diseño de la Empresa
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
            Logo y Colores Corporativos (White-Labeling)
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Logo */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Logo de la Empresa
            </label>
            <div className="flex items-center gap-4 bg-[var(--surface-hover)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <div className="shrink-0 w-12 h-12 rounded-lg border border-[var(--border-subtle)] bg-white flex items-center justify-center overflow-hidden">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Previsualización" className="object-contain w-full h-full p-1" />
                ) : (
                  <span className="text-[8px] text-gray-400">Sin Logo</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml" 
                  onChange={manejarArchivo}
                  className="hidden" 
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="inline-block px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 text-[10px] font-bold text-[var(--primary)] rounded-md cursor-pointer transition-all"
                >
                  Subir Imagen
                </label>
                <p className="text-[8px] text-gray-500 mt-1">Recomendado: PNG/SVG (Max 1MB)</p>
              </div>
            </div>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                Color Primario
              </label>
              <div className="flex items-center gap-2 bg-[var(--surface-hover)] px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] h-9">
                <input 
                  type="color" 
                  value={colorPrimario} 
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input 
                  type="text" 
                  value={colorPrimario.toUpperCase()} 
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-[11px] font-mono text-[var(--text-primary)] focus:outline-none"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorSecundario }} />
                Color Secundario
              </label>
              <div className="flex items-center gap-2 bg-[var(--surface-hover)] px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] h-9">
                <input 
                  type="color" 
                  value={colorSecundario} 
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input 
                  type="text" 
                  value={colorSecundario.toUpperCase()} 
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-[11px] font-mono text-[var(--text-primary)] focus:outline-none"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <p className="text-[9px] text-[var(--text-muted)] italic leading-relaxed">
            * Se recomiendan tonos vibrantes. El sistema ajustará automáticamente los hovers basados en estos códigos.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--surface-hover)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={cargando}
            className="px-4 py-1.5 border border-[var(--border-subtle)] hover:bg-[var(--surface-active)] text-[10px] font-bold text-[var(--text-secondary)] rounded-md transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={manejarGuardar}
            disabled={cargando}
            className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed text-[10px] font-bold text-white rounded-md shadow-sm transition-all"
          >
            {cargando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalConfiguracionVisual;
