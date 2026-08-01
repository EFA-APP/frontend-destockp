import React from "react";

export const ESTADOS_BENEFICIO = {
  PENDING: {
    clase: "bg-amber-50 border-amber-200 text-amber-700",
    punto: "bg-amber-500",
    label: "PENDIENTE",
  },
  ACTIVE: {
    clase: "bg-emerald-50 border-emerald-200 text-emerald-700",
    punto: "bg-emerald-500",
    label: "ACTIVO",
  },
  PAUSED: {
    clase: "bg-gray-100 border-gray-300 text-gray-700",
    punto: "bg-gray-500",
    label: "PAUSADO",
  },
  RECHAZADO: {
    clase: "bg-red-50 border-red-200 text-red-700",
    punto: "bg-red-500",
    label: "RECHAZADO",
  },
};

export const columnasBeneficios = [
  {
    key: "codigoEmpresa",
    etiqueta: "COMERCIO",
    renderizar: (val) => val || "N/A",
  },
  {
    key: "titulo",
    etiqueta: "TÍTULO",
    renderizar: (val, fila) => (
      <span className="font-bold text-gray-900">{fila.titulo}</span>
    ),
  },
  {
    key: "descuento",
    etiqueta: "DESCUENTO",
    renderizar: (val, fila) => (
      <span className="text-gray-900 font-semibold">{fila.descuento || "-"}</span>
    ),
  },
  {
    key: "estado",
    etiqueta: "ESTADO",
    renderizar: (val, fila) => {
      const estadoConfig = ESTADOS_BENEFICIO[fila.estado] || ESTADOS_BENEFICIO.PENDING;
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${estadoConfig.clase}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${estadoConfig.punto}`} />
          {estadoConfig.label}
        </div>
      );
    },
  },
];
