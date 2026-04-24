import React, { useState } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { actualizarConfiguracionVisualApi } from "../../../Backend/Autenticacion/api/Usuario/authenticacion.api";
import { useAlertas } from "../../../store/useAlertas";

const ModalConfiguracionVisual = ({ isOpen, onClose }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const { agregarAlerta } = useAlertas();

  const [colorPrimario, setColorPrimario] = useState(
    usuario?.configuracionVisual?.colorPrimario || "#d11057",
  );
  const [colorSecundario, setColorSecundario] = useState(
    usuario?.configuracionVisual?.colorSecundario || "#10d127",
  );
  const [previewUrl, setPreviewUrl] = useState(
    usuario?.configuracionVisual?.logoUrl || "",
  );
  const [logoBase64, setLogoBase64] = useState("");
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.size > 1024 * 1024) {
      agregarAlerta({
        message: "La imagen no debe superar 1MB para un rendimiento óptimo.",
        type: "error",
      });
      return;
    }

    // Vista previa instantánea
    setPreviewUrl(URL.createObjectURL(archivo));

    // Base64 para guardar
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoBase64(event.target.result);
    };
    reader.readAsDataURL(archivo);
  };

  const manejarGuardar = async () => {
    try {
      setCargando(true);
      const payload = {
        colorPrimario,
        colorSecundario,
        logoUrl: logoBase64 || previewUrl,
      };

      await actualizarConfiguracionVisualApi(payload);

      setUsuario({
        ...usuario,
        configuracionVisual: payload,
      });

      agregarAlerta({
        message: "Configuración visual actualizada correctamente.",
        type: "success",
      });
      onClose();
    } catch (error) {
      console.error(error);
      agregarAlerta({
        message: error.message || "Error al actualizar configuración.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md   "
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden   ">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--border-subtle)] bg-[var(--primary-subtle)]/10">
          <h2 className="text-[17px] font-bold text-black uppercase tracking-wider mb-1">
            🎨 Personalización Visual
          </h2>
          <p className="text-[13px] text-[var(--text-muted)] font-medium">
            Personalizá la identidad de tu empresa, logo y paleta de colores.
          </p>
        </div>

        {/* Body */}
        <div className="p-8 h-[500px] overflow-y-auto scrollbar-thin space-y-8">
          {/* SECCION LOGO */}
          <div className="grid grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-[13px] font-black text-black uppercase tracking-[0.2em] border-l-2 border-[var(--primary)] pl-3">
                Logotipo Corporativo
              </h3>
              <p className="text-[13px] text-[var(--text-muted)] font-medium leading-relaxed">
                Este logo se utilizará en la barra lateral y en los comprobantes
                de venta oficiales.
              </p>

              <div className="relative group">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={manejarArchivo}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block px-5 py-2.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 hover:bg-[var(--primary)] text-[13px] font-black text-[var(--primary)] hover:text-black rounded-md cursor-pointer  uppercase tracking-widest shadow-sm"
                >
                  Subir Imagen
                </label>
                <p className="text-[11px] text-gray-700 mt-2 font-medium">
                  Recomendado: PNG/SVG con fondo transparente (Max 1MB)
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-subtle)] rounded-md bg-[var(--surface-hover)]/20 group hover:border-[var(--primary)]/50  min-h-[160px]">
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Previsualización"
                    className="max-h-24 object-contain drop-shadow-2xl   "
                  />
                  <button
                    onClick={() => {
                      setPreviewUrl("");
                      setLogoBase64("");
                    }}
                    className="absolute -top-2 -right-2 bg-rose-700 text-black w-6 h-6 rounded-md flex items-center justify-center text-[12px] shadow-lg opacity-0 group-hover:opacity-100 "
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-3xl opacity-20">🖼️</div>
                  <div className="text-[12px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                    Vista Previa
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--border-subtle)]" />

          {/* SECCION COLORES */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black text-black uppercase tracking-[0.2em] border-l-2 border-[var(--primary)] pl-3">
              Identidad de Marca
            </h3>

            <div className="grid grid-cols-2 gap-8">
              {/* Primario */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colorPrimario }}
                  />
                  Color Primario
                </label>
                <div className="flex items-center gap-3 bg-[var(--surface-hover)] p-3 border border-[var(--border-subtle)] rounded-md h-12 shadow-inner">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-8 h-8 rounded-md border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorPrimario.toUpperCase()}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="bg-transparent border-0 text-[15px] font-mono font-bold text-black focus:outline-none w-full"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Secundario */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colorSecundario }}
                  />
                  Color Secundario
                </label>
                <div className="flex items-center gap-3 bg-[var(--surface-hover)] p-3 border border-[var(--border-subtle)] rounded-md h-12 shadow-inner">
                  <input
                    type="color"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="w-8 h-8 rounded-md border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorSecundario.toUpperCase()}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="bg-transparent border-0 text-[15px] font-mono font-bold text-black focus:outline-none w-full"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* VISTA PREVIA ELEMENTOS */}
            <div className="p-6 border border-[var(--border-subtle)] rounded-md bg-[var(--surface-hover)]/30 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  Previsualización de UI
                </span>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colorPrimario }}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colorSecundario }}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="flex-1 py-2.5 rounded-md text-[13px] font-black text-black uppercase tracking-widest shadow-xl  hover:scale-[1.02]"
                  style={{ backgroundColor: colorPrimario }}
                >
                  Botón Principal
                </button>
                <button
                  className="flex-1 py-2.5 rounded-md text-[13px] font-black text-black uppercase tracking-widest shadow-xl  hover:scale-[1.02]"
                  style={{ backgroundColor: colorSecundario }}
                >
                  Botón Secundario
                </button>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-[var(--text-muted)] italic leading-relaxed font-medium bg-[var(--primary-subtle)]/5 p-4 rounded-md border-l-4 border-[var(--primary)]">
            * Estos cambios se aplicarán a toda la plataforma para todos los
            usuarios de la empresa (White-Labeling).
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[var(--surface-hover)]/80 border-t border-[var(--border-subtle)] flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            disabled={cargando}
            className="px-6 py-2.5 border border-[var(--border-subtle)] hover:bg-[var(--surface-active)] text-[13px] font-bold text-[var(--text-secondary)] rounded-md  uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            onClick={manejarGuardar}
            disabled={cargando}
            className="px-8 py-2.5 bg-[var(--surface)] text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-[13px] font-black rounded-md shadow-xl  flex items-center gap-3 uppercase tracking-widest"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full " />
                Guardando...
              </>
            ) : (
              "Aplicar Diseño"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfiguracionVisual;
