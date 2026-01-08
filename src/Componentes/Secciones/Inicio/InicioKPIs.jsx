
import { BolsaDeDineroIcono, CarritoIcono, PagosIcono, VentasIcono } from "../../../assets/Icons";
import TarjetaKpi from "./TarjetasKpi";

const InicioKPIs = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      
      <TarjetaKpi
        icon={<BolsaDeDineroIcono size={16}/>}
        title="Saldo"
        value="$52.300,50"
        subtitle={
          <span className="text-white/75">
            Caja: $12.300,50 <br />
            Bancos: $40.000,00
          </span>
        }
        trend="neutral"
      />

      <TarjetaKpi
        icon={<VentasIcono size={16} />}
        title="Ventas del Mes"
        value="$33.500,00"
        footer="+20%"
        trend="up"
        actionLabel="Ver ventas"
      />

      <TarjetaKpi
        icon={<CarritoIcono size={16} />}
        title="Compras del Mes"
        value="$25.800,00"
        footer="-15%"
        trend="down"
        actionLabel="Ver compras"
      />

      <TarjetaKpi
        icon={<PagosIcono size={16} />}
        title="Cobros Pendientes"
        value="$18.750,00"
        subtitle="12 facturas pendientes de cobro"
        trend="neutral"
        actionLabel="Ver facturas"
      />
    </div>
  );
};

export default InicioKPIs;
