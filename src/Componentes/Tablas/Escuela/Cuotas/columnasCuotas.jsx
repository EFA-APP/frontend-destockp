import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export const columnasCuotas = ({ periodoSeleccionado, formatCurrency }) => [
  {
    key: "nombre",
    etiqueta: "Alumno / Curso",
    renderizar: (val, alumno) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-black text-[15px] text-[var(--primary)]/80 uppercase tracking-tight">
          {alumno.nombre} {alumno.apellido}
        </span>
        <span className="text-[12px] font-bold text-[var(--primary)]/50 uppercase">
          {alumno.atributos?.curso || "Sin Curso"} •{" "}
          {alumno.atributos?.tipo_alumno || "EXTERNO"}
        </span>
      </div>
    ),
  },
  {
    key: "cuotaBase",
    etiqueta: "Cuota Base",
    renderizar: (_, alumno) => {
      const cuota = alumno.cuotas?.[periodoSeleccionado];
      // Mostramos el monto original del periodo, no el saldo pendiente
      return (
        <span className="font-bold text-[13px] text-[var(--primary)]/80">
          {formatCurrency(cuota?.montoOriginal || 0)}
        </span>
      );
    },
  },
  {
    key: "deudaAnterior",
    etiqueta: "Deuda Anterior",
    renderizar: (_, alumno) => {
      // Calculamos la deuda ANTERIOR al periodo seleccionado
      const deudaPrevia = Object.values(alumno.cuotas || {})
        .filter((c) => c.periodo < periodoSeleccionado && c.estado !== "pagado")
        .reduce((sum, c) => sum + c.monto, 0);

      return (
        <span
          className={`font-black text-[13px] ${deudaPrevia > 0 ? "text-rose-600" : "text-[var(--primary)]/30"}`}
        >
          {formatCurrency(deudaPrevia)}
        </span>
      );
    },
  },
  {
    key: "interes",
    etiqueta: "Interés",
    renderizar: (_, alumno) => {
      const cuota = alumno.cuotas?.[periodoSeleccionado];
      return (
        <span
          className={`font-bold text-[13px] ${cuota?.interes > 0 ? "text-amber-600" : "text-[var(--primary)]/30"}`}
        >
          {cuota?.interes > 0 ? `+ ${formatCurrency(cuota.interes)}` : "—"}
        </span>
      );
    },
  },
  {
    key: "total",
    etiqueta: "Total a Pagar",
    renderizar: (_, alumno) => {
      const cuota = alumno.cuotas?.[periodoSeleccionado];
      const deudaPrevia = Object.values(alumno.cuotas || {})
        .filter((c) => c.periodo < periodoSeleccionado && c.estado !== "pagado")
        .reduce((sum, c) => sum + c.monto, 0);

      const total = (cuota?.monto || 0) + deudaPrevia;
      return (
        <div className="flex flex-col">
          <span
            className={`font-black text-[15px] ${total > 0 ? "text-[var(--primary)]" : "text-[var(--primary)]/30"}`}
          >
            {formatCurrency(total)}
          </span>
          {cuota?.interes > 0 && (
            <span className="text-[9px] font-bold text-amber-600 uppercase">
              Incluye Mora
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "vencimiento",
    etiqueta: "Vencimiento",
    renderizar: (_, alumno) => {
      const cuota = alumno.cuotas?.[periodoSeleccionado];
      if (!cuota || !cuota.fechaVencimiento)
        return <span className="text-[var(--primary)]/30">—</span>;

      const [y, m, d] = cuota.fechaVencimiento.split("-");
      const fVto = `${d}/${m}/${y}`;

      return (
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Clock size={12} />
            <span className="text-[12px] font-bold text-[var(--primary)]/70">
              {fVto}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: "estado",
    etiqueta: "Estado",
    renderizar: (_, alumno) => {
      const cuota = alumno.cuotas?.[periodoSeleccionado];
      if (!cuota)
        return (
          <span className="px-2 py-1 rounded-md bg-black/5 text-[10px] font-black text-[var(--primary)]/30 uppercase">
            Sin Deuda
          </span>
        );

      const estados = {
        pagado: {
          text: "text-emerald-600",
          label: "Pagado",
          icon: <CheckCircle2 size={12} />,
        },
        vencido: {
          text: "text-rose-600",
          label: "Vencido",
          icon: <AlertCircle size={12} />,
        },
        pendiente: {
          text: "text-amber-600",
          label: "Pendiente",
          icon: <Clock size={12} />,
        },
        parcial: {
          text: "text-blue-600",
          label: "Parcial",
          icon: <TrendingUp size={12} />,
        },
      };

      const config = estados[cuota.estado] || estados.pendiente;
      const diasAtraso = cuota.diasAtraso || 0;

      return (
        <div className="w-full">
          <div className="flex justify-end">
            <div className={`flex gap-2 ${config.text} `}>
              {config.icon}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {config.label}
              </span>
            </div>
            {cuota.estado === "vencido" && diasAtraso > 0 && (
              <span className="text-[9px] font-bold text-rose-500/60 uppercase ml-2">
                {diasAtraso} {diasAtraso === 1 ? "día" : "días"} de mora
              </span>
            )}
          </div>
        </div>
      );
    },
  },
];
