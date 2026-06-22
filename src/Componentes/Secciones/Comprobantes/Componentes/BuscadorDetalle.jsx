import { useState } from "react";
import { useDetalleComprobante } from "../../../../Backend/Comprobantes/useDetalleComprobante";
import { CajaIcono } from "../../../../assets/Icons";
import { getPrecio } from "../../Ventas/Comprobantes/utils/fiscal.utils";
import SelectorArticuloModal from "./SelectorArticuloModal";
import CarritoDetalle from "./CarritoDetalle";
import DetallePago from "./DetallePago";

const BuscadorDetalle = ({ tipoOperacion }) => {
  const {
    tipoDetalle,
    setTipoDetalle,
    codigoBusqueda,
    setCodigoBusqueda,
    resultadosBusqueda,
    cargandoBusqueda,
    columnaPrecioSeleccionada,
    items,
    agregarItem,
    actualizarCantidadItem,
    actualizarPrecioItem,
    actualizarTasaIvaItem,
    quitarItem,
    subtotalSinIva,
    totalIva,
    totalGeneral,
  } = useDetalleComprobante(tipoOperacion);

  // Estado local para controlar el modal
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* SELECTOR TIPO DETALLE */}
      <div className="flex p-1 px-4 rounded-md border-b border-gray-700/20  w-auto mb-1 gap-2">
        <div className="flex w-full bg-gray-300 rounded-md">
          {tipoOperacion === "EGRESO" && (
            <button
              type="button"
              onClick={() => setTipoDetalle("MATERIA_PRIMA")}
              className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "MATERIA_PRIMA" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
            >
              Materia Prima
            </button>
          )}
          <button
            type="button"
            onClick={() => setTipoDetalle("PRODUCTO")}
            className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "PRODUCTO" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
          >
            Producto
          </button>
          <button
            type="button"
            onClick={() => setTipoDetalle("CUENTA_CONTABLE")}
            className={`flex-1 py-2 rounded-md text-md font-semibold uppercase tracking-wider transition-all ${tipoDetalle === "CUENTA_CONTABLE" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"}`}
          >
            Cuenta Contable
          </button>
        </div>
      </div>

      {/* AGREGAR DETALLE */}
      <div className="relative flex justify-center items-center  focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[50px] items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-md bg-[var(--primary)]/10 bg-[var(--primary)] text-[var(--primary)] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
          title="Agregar detalle manualmente"
        >
          <CajaIcono className="w-5 h-5" />
          <p className="font-bold">Agregar Detalle</p>
        </button>
      </div>

      {/* CARRITO: lo que ya se agregó, editable, con sus 3 totales */}
      <CarritoDetalle
        items={items}
        actualizarCantidadItem={actualizarCantidadItem}
        actualizarPrecioItem={actualizarPrecioItem}
        actualizarTasaIvaItem={actualizarTasaIvaItem}
        quitarItem={quitarItem}
        subtotalSinIva={subtotalSinIva}
        totalIva={totalIva}
        totalGeneral={totalGeneral}
      />

      {/* PAGO: métodos de pago + vuelto */}
      <DetallePago totalComprobante={totalGeneral} tipoOperacion={tipoOperacion} />

      {/* MODAL: uno solo, se adapta a Producto / Materia Prima / Cuenta Contable */}
      <SelectorArticuloModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tipoDetalle={tipoDetalle}
        articulos={resultadosBusqueda}
        cargando={cargandoBusqueda}
        codigoBusqueda={codigoBusqueda}
        setCodigoBusqueda={setCodigoBusqueda}
        agregarItem={agregarItem}
        getPrecio={getPrecio}
        columnaPrecioSeleccionada={columnaPrecioSeleccionada}
      />
    </>
  );
};

export default BuscadorDetalle;
