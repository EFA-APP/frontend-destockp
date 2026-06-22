import React, { useMemo } from "react";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import {
  FileText,
  MinusCircle,
  PlusCircle,
  Coins,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

// Catalog of voucher types defined in memory
export const COMPROBANTES_METADATA = [
  // FISCALES
  {
    id: 1,
    label: "Factura A",
    permission: "FACTURA_A",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 6,
    label: "Factura B",
    permission: "FACTURA_B",
    icon: FileText,
    color: "text-green-500",
    bg: "bg-green-50 border-green-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 11,
    label: "Factura C",
    permission: "FACTURA_C",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-50 border-purple-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 3,
    label: "Nota de Crédito A",
    permission: "NOTA_CREDITO_A",
    icon: MinusCircle,
    color: "text-rose-500",
    bg: "bg-rose-50 border-rose-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 8,
    label: "Nota de Crédito B",
    permission: "NOTA_CREDITO_B",
    icon: MinusCircle,
    color: "text-rose-400",
    bg: "bg-rose-50 border-rose-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 13,
    label: "Nota de Crédito C",
    permission: "NOTA_CREDITO_C",
    icon: MinusCircle,
    color: "text-rose-300",
    bg: "bg-rose-50 border-rose-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 2,
    label: "Nota de Débito A",
    permission: "NOTA_DEBITO_A",
    icon: PlusCircle,
    color: "text-indigo-500",
    bg: "bg-indigo-50 border-indigo-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 7,
    label: "Nota de Débito B",
    permission: "NOTA_DEBITO_B",
    icon: PlusCircle,
    color: "text-indigo-400",
    bg: "bg-indigo-50 border-indigo-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },
  {
    id: 12,
    label: "Nota de Débito C",
    permission: "NOTA_DEBITO_C",
    icon: PlusCircle,
    color: "text-indigo-300",
    bg: "bg-indigo-50 border-indigo-200",
    tipo: "FISCAL",
    modo: "AMBOS",
  },

  // RECIBO y ORDEN DE PAGO (Fiscales en la tabla del usuario)
  {
    id: 992,
    label: "Recibo",
    permission: "RECIBO",
    icon: Coins,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    tipo: "FISCAL",
    modo: "VENTA",
  },
  {
    id: 993,
    label: "Orden de Pago",
    permission: "ORDEN_PAGO",
    icon: Coins,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    tipo: "FISCAL",
    modo: "COMPRA",
  },

  // INTERNOS
  {
    id: 991,
    label: "Factura Interna",
    permission: "FACTURA_INTERNA",
    icon: FileText,
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200",
    tipo: "INTERNO",
    modo: "AMBOS",
  },
  {
    id: 995,
    label: "Nota de Crédito Interna",
    permission: "NOTA_CREDITO_INTERNA",
    icon: MinusCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
    tipo: "INTERNO",
    modo: "AMBOS",
  },
  {
    id: 996,
    label: "Nota de Débito Interna",
    permission: "NOTA_DEBITO_INTERNA",
    icon: PlusCircle,
    color: "text-sky-500",
    bg: "bg-sky-50 border-sky-200",
    tipo: "INTERNO",
    modo: "AMBOS",
  },
];

export const getComprobanteMetadata = (tipoId, modo = "VENTA") => {
  if (tipoId === undefined || tipoId === null) {
    return {
      id: 0,
      label: "SELECCIONAR...",
      icon: FileText,
      color: "text-gray-400",
      bg: "bg-gray-50 border-gray-200",
    };
  }
  const code = Number(tipoId);
  const match = COMPROBANTES_METADATA.find(
    (c) => c.id === code && (c.modo === "AMBOS" || c.modo === modo),
  );
  if (match) return match;

  // Generic fallback
  return {
    id: code,
    label: `COMPROBANTE #${code}`,
    icon: FileText,
    color: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
  };
};

const SelectorTipoComprobante = ({
  modo, // "VENTA" | "COMPRA"
  tipo, // "FISCAL" | "INTERNO"
  value,
  onChange,
  isFilter = false,
  className = "",
  disabled = false,
}) => {
  const { tieneAccion } = usePermisosDeUsuario();

  // Filter options synchronously in memory using useMemo
  const options = useMemo(() => {
    const filtered = COMPROBANTES_METADATA.filter((item) => {
      // Filter by tipo ("FISCAL" | "INTERNO")
      if (item.tipo !== tipo) return false;

      // Filter by modo ("VENTA" | "COMPRA" vs "AMBOS")
      if (item.modo !== "AMBOS" && item.modo !== modo) {
        return false;
      }

      // Permission check
      return tieneAccion(item.permission);
    });

    const list = filtered.map((item) => ({
      valor: item.id,
      texto: item.label.toUpperCase(),
      icon: item.icon,
      color: item.color,
    }));

    if (isFilter) {
      return [
        {
          valor: "TODAS",
          texto: "TODOS LOS COMP.",
          icon: LayoutGrid,
          color: "text-gray-400",
        },
        ...list,
      ];
    }
    return list;
  }, [tipo, modo, tieneAccion, isFilter]);

  // Active option metadata
  const selectedMeta = useMemo(() => {
    if (value === "TODAS") {
      return {
        label: "TODOS LOS COMP.",
        icon: LayoutGrid,
        color: "text-gray-400",
      };
    }
    return getComprobanteMetadata(value, modo);
  }, [value, modo]);

  const SelectedIcon = selectedMeta.icon || FileText;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="relative group w-full">
        <div className="relative flex items-center">
          {/* Selected Icon decoration */}
          <SelectedIcon
            size={14}
            className={`absolute left-3 pointer-events-none ${selectedMeta.color} z-10`}
          />

          <select
            disabled={disabled}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "TODAS" ? "TODAS" : Number(val));
            }}
            className="w-full h-10 pl-9 pr-8 bg-white border border-gray-300 rounded-md text-xs font-black text-gray-800 focus:outline-none focus:border-[var(--primary)] transition appearance-none uppercase cursor-pointer"
          >
            {options.map((opt, i) => (
              <option
                key={`${opt.valor}-${i}`}
                value={opt.valor}
                className="bg-white text-gray-850 font-bold py-1.5"
              >
                {opt.texto}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="absolute right-3 pointer-events-none text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default SelectorTipoComprobante;
