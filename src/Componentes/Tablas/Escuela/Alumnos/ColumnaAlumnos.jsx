const tipoEstadoStyles = {
  activo: "bg-green-500/20 text-green-400 border-green-400/30",
  suspendido: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  egresado: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  baja: "bg-red-500/20 text-red-400 border-red-400/30",
};

const estadoCuotaStyles = {
  al_dia: "bg-green-500/20 text-green-400 border-green-400/30",
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  vencido: "bg-red-500/20 text-red-400 border-red-400/30",
};

export const columnasAlumnos = [
  {
    key: "nombre",
    etiqueta: "Alumno",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-medium text-sm">
          {fila.nombre} {fila.apellido}
        </div>
        <div className="text-xs opacity-60">
          {fila.curso} • DNI: {fila.dni}
        </div>
      </div>
    ),
  },
  {
    key: "responsableNombre",
    etiqueta: "Responsable",
    renderizar: (valor, fila) => (
      <div>
        <div className="text-sm font-medium">{valor}</div>
        <div className="text-xs opacity-60">
          {fila.responsableTelefono || "Sin teléfono"}
        </div>
      </div>
    ),
  },
  {
    key: "montoCuota",
    etiqueta: "Cuota Mensual",
    renderizar: (valor, fila) => (
      <div>
        <div className="font-mono text-sm font-semibold">
          ${valor?.toLocaleString("es-AR") || "0"}
        </div>
        {fila.descuento > 0 && (
          <div className="text-xs text-green-400">Dto: {fila.descuento}%</div>
        )}
      </div>
    ),
  },
  {
    key: "estadoCuota",
    etiqueta: "Estado de Pago",
    renderizar: (valor, fila) => {
      // Calcular estado basado en última cuota
      const estado = valor || "al_dia";
      const etiquetas = {
        al_dia: "Al día",
        pendiente: "Pendiente",
        vencido: "Vencido",
      };

      return (
        <div>
          <span
            className={`px-2 py-0.5 text-xs rounded-full border ${estadoCuotaStyles[estado]}`}
          >
            {etiquetas[estado]}
          </span>
          {fila.cuotasAdeudadas > 0 && (
            <div className="text-xs mt-1 opacity-70">
              Adeuda: {fila.cuotasAdeudadas} cuota
              {fila.cuotasAdeudadas > 1 ? "s" : ""}
            </div>
          )}
        </div>
      );
    },
  },
  // {
  //   key: "diaVencimiento",
  //   etiqueta: "Vencimiento",
  //   renderizar: (valor) => (
  //     <div className="text-sm">
  //       <span className="opacity-60">Día</span>{" "}
  //       <span className="font-semibold">{valor || 10}</span>
  //     </div>
  //   ),
  // },
  {
    key: "estado",
    etiqueta: "Estado Alumno",
    renderizar: (valor) => {
      const etiquetas = {
        activo: "Activo",
        suspendido: "Suspendido",
        egresado: "Egresado",
        baja: "Baja",
      };

      return (
        <span
          className={`px-2 py-0.5 text-xs rounded-full border ${tipoEstadoStyles[valor]}`}
        >
          {etiquetas[valor] || valor.toUpperCase()}
        </span>
      );
    },
  },
];
