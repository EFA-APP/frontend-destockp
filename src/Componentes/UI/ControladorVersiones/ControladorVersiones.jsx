import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { axiosInitial } from "../../../Backend/Config";

export const ControladorVersiones = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [versionInfo, setVersionInfo] = useState({
    titulo: "Actualización",
    mensaje: "",
  });

  useEffect(() => {
    const consultarEstado = async () => {
      if (!window.location.pathname.includes("/panel")) {
        setMostrarModal(false);
        return;
      }

      try {
        const response = await axiosInitial.get("/version/ultima", {
          showLoader: false,
        });
        const ultima = response.data;

        if (ultima) {
          console.log(
            "[Version] El usuario requiere actualización. Mostrando modal.",
          );
          setVersionInfo({
            titulo: ultima.titulo || "Sistema Actualizado",
            mensaje: `${ultima.version || ""} - ${ultima.mensaje || "Se han aplicado mejoras críticas."}`,
          });
          setMostrarModal(true);
        }
      } catch (error) {
        // Silenciar errores en interval (ej. 401 si se desloguea)
      }
    };

    consultarEstado(); // Ejecutar al cargar

    // Polling cada 20 segundos
    const interval = setInterval(consultarEstado, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRecargar = async () => {
    setCargando(true);
    try {
      await axiosInitial.post("/version/usuario/actualizado", {
        showLoader: false,
      });
      window.location.reload();
    } catch (error) {
      console.error("[Version] Error al registrar actualización:", error);
      window.location.reload();
    }
  };

  if (!mostrarModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--surface)] p-6 rounded-lg shadow-2xl border border-[var(--border-medium)] max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
          <RefreshCw size={24} className="animate-spin-slow" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">
          {versionInfo.titulo}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          {versionInfo.mensaje ||
            "Se han aplicado mejoras críticas. Es necesario recargar la página para continuar."}
        </p>
        <button
          onClick={handleRecargar}
          disabled={cargando}
          className="w-full py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-subtle)] hover:from-[var(--primary)] hover:to-[var(--primary)] text-white font-bold rounded-md shadow-lg shadow-[var(--primary)]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
        >
          {cargando ? "Actualizando..." : <>Recargar Página</>}
        </button>
      </div>
    </div>
  );
};
