import InicioKPIs from "./InicioKPIs";
import {
  CarritoIcono,
  PagosIcono,
  ContableIcono,
  PersonaIcono,
  InventarioIcono,
  BuscadorIcono,
  InicioIcono,
  ListaIcono,
} from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-xl bg-[var(--fill)] p-4 border border-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ title }) => (
  <div className="flex justify-between items-center  border-b border-gray-300/10! pb-1">
    <h2 className="text-md font-medium">{title}</h2>
    <div className="w-8 h-8 rounded-md bg-black/40 flex items-center justify-center text-gray-400">
      <BuscadorIcono/>
    </div>
  </div>
);


const Movimiento = ({ icon, concepto, monto, negativo }) => (
  <li className="flex items-center justify-between gap-3 text-sm">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-black/40 flex items-center justify-center text-xs text-[var(--color-primary)]">
        {icon}
      </div>
      <span className="text-gray-300">{concepto}</span>
    </div>

    <span className={negativo ? "text-red-400" : "text-gray-100"}>
      {monto}
    </span>
  </li>
);


const QuickButton = ({ icon, label }) => (
  <button className="group bg-[var(--fill)]! hover:bg-[var(--fill)]/10 rounded-md! p-2 text-sm transition flex flex-col items-center gap-2 cursor-pointer">
    <div className="text-[var(--color-primary)] group-hover:scale-110 transition">
      {icon}
    </div>
    <span>{label}</span>
  </button>
);




const Inicio = () => {
  return (
    <div className="p-6 space-y-6 bg-[var(--fill2)] min-h-screen text-gray-200">

      {/* TÍTULO */}
      <EncabezadoSeccion ruta={"Inicio"} icono={<InicioIcono size={20}/>}/>

      {/* KPIs */}
      <InicioKPIs />

      {/* ZONA SUPERIOR */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ÚLTIMOS MOVIMIENTOS */}
        <GlassCard className="xl:col-span-1">
          <CardHeader title="Actividad Reciente" />

          <ul className="space-y-3 mt-3">
            <Movimiento icon="FC" concepto="Pago para FC 0001-000023" monto="$6.000,00" />
            <Movimiento icon="FC" concepto="FC A 0001-0000123" monto="$15.000,00" />
            <Movimiento icon="FC" concepto="FC A 0001-0000124" monto="$150.000,00" />
            <Movimiento icon="ND" concepto="ND A 0001-0000034" monto="$500,00" />
            <Movimiento icon="NC" concepto="NC B 0001-0000098" monto="-$2.500,00" negativo />
          </ul>
        </GlassCard>

        {/* ACCESOS */}
        <GlassCard>
          <CardHeader title="Accesos rápidos" />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <QuickButton icon={<CarritoIcono size={28} />} label="Punto de Venta" />
            <QuickButton icon={<PagosIcono size={28} />} label="Nueva Compra" />
            <QuickButton icon={<ContableIcono size={28} />} label="Nuevo Asiento" />
            <QuickButton icon={<InventarioIcono size={28} />} label="Productos" />
            <QuickButton icon={<PersonaIcono size={28} />} label="Nuevo Contacto" />
            <QuickButton icon={<ContableIcono size={28} />} label="Plan de Cuentas" />
          </div>
        </GlassCard>
        {/* ÚLTIMOS MOVIMIENTOS (SEGUNDA LISTA) */}
        <GlassCard className="xl:col-span-1">
          <CardHeader title="Últimos movimientos" />

          <ul className="space-y-3 mt-3 mb-2">
            <Movimiento icon="FC" concepto="FC A 0001-0000123 - Venta" monto="$15.000,00" />
            <Movimiento icon="ND" concepto="ND A 0001-0000034" monto="$300,00" />
            <Movimiento icon="NC" concepto="Descuento por pago anticipado" monto="-$2.500,00" negativo />
            <Movimiento icon="NC" concepto="Descuento por pago anticipado" monto="$2.500,00"  />
            <Movimiento icon="FC" concepto="FC A 0001-0000125 - Venta" monto="-$15.500,00" negativo />
          </ul>

        <div className="flex items-center w-full py-2 border-t border-b border-gray-300/10">
            <span className="p-[1px] bg-[var(--primary)]/20! text-[var(--primary)]! rounded-[2px] ">
                <ListaIcono size={20}/>
            </span>
          <button className=" cursor-pointer text-xs px-3 transition hover:text-[var(--primary)]!">
            Ver todos
          </button>
        </div>
        </GlassCard>
      </div>

      {/* ZONA INFERIOR */}
      <div className="grid grid-cols-1 gap-4">

        {/* RESUMEN MENSUAL */}
        <GlassCard className="">
          <CardHeader title="Resumen mensual" />

          <div className="h-40 mt-3 rounded-lg bg-black/40 flex items-center justify-center text-gray-400">
            Gráfico de ingresos / egresos
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-green-400">Ingresos: $39.100</span>
            <span className="text-red-400">Egresos: $25.900</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Inicio;
