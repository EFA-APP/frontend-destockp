import { InventarioIcono } from "../../../../assets/Icons";
import Metrica from "../../../UI/ModalDetalleBase/Metricas";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../../UI/ModalDetalleBase/ModalDetalle";


const ModalDetalleProducto = ({ open, onClose, producto }) => {
  if (!producto) return null;
    console.log(producto)
  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <ModalDetalle
        title="Detalle del producto"
        icon={<InventarioIcono size={18} />}
        onClose={onClose}
        width="max-w-4xl"
      >
        {/* CONTENIDO */}
        <div className="space-y-4 text-white">
          <div>
            <p className="text-xs text-gray-400">Producto</p>
            <p className="text-lg font-semibold">{producto.nombre}</p>
            <p className="text-sm text-[var(--primary)]">
              Código: {producto.codigo}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Metrica label="Stock" value={producto.stock} />
            <Metrica label="Paquetes" value={producto.paquetes} />
            <Metrica label="Peso total" value={`${producto.pesoTotal} kg`} />
            <Metrica
              label="Valor total"
              value={`$${producto.precioTotal}`}
            />
          </div>
        </div>
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalDetalleProducto;