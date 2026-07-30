import React from "react";

// rbac-normalizacion-secciones-permisos, Revisión 3 (R61-R63): la pestaña
// SECCIONES pasa de tabla plana (DataTable.jsx genérico) a vista
// jerárquica tipo árbol (TablaSecciones.jsx), que no soporta filas
// padre/hijo. Este archivo se reduce al helper visual del ícono de la
// fila padre (Sección), reutilizado tal cual desde la columna anterior.
export const renderIconoSeccion = (fila) => (
  <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-sm shrink-0">
    <span className="text-[12px] font-black text-orange-600">
      {fila.icono ? (
        fila.icono.substring(0, 2).toUpperCase()
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      )}
    </span>
  </div>
);
