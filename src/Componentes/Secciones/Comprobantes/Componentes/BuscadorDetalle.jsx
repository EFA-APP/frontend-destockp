import { useState } from "react";
import { CajaIcono } from "../../../../assets/Icons";
import { getPrecio } from "../../../../Backend/Comprobantes/fiscal.utils";
import SelectorArticuloModal from "./SelectorArticuloModal";
import CarritoDetalle from "./CarritoDetalle";
import DetallePago from "./DetallePago";

const CODIGOS_NOTA_CREDITO = [3, 8, 13, 994];

const BuscadorDetalle = ({
  tipoOperacion,
  detalle,
  pagos,
  setPagos,
  vueltos,
  setVueltos,
  codigoTipoComprobante,
  montoPreCargado = null,
  montosSugeridos = [],
  otrosTributos = 0,
  setOtrosTributos,
  condicionComprobante = null,
}) => {
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
    actualizarTipoFiscalItem,
    actualizarDevolverAStockItem,
    quitarItem,
    subtotalSinIva,
    totalIva,
    totalGeneral,
  } = detalle;

  const [isOpen, setIsOpen] = useState(false);
  const precioUnitarioInicial = montoPreCargado > 0 ? montoPreCargado : "";
  const esNotaCredito = CODIGOS_NOTA_CREDITO.includes(
    Number(codigoTipoComprobante),
  );

  const totalRecargo = pagos.reduce((sum, p) => {
    const r = parseFloat(p.datosTarjeta?.recargo) || 0;
    if (r <= 0) return sum;
    return sum + p.monto - p.monto / (1 + r / 100);
  }, 0);

  return (
    <div className="flex flex-col gap-4 p-6 mt-5 bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-sm">
      {/* SELECTOR TIPO DETALLE */}
      <div className="flex w-full sm:w-fit bg-gray-50 p-1.5 rounded-[12px] border border-[var(--color-neutral-border)] shadow-sm gap-1 mb-2">
        {tipoOperacion === "EGRESO" && (
          <button
            type="button"
            onClick={() => setTipoDetalle("MATERIA_PRIMA")}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${tipoDetalle === "MATERIA_PRIMA" ? "bg-white text-[var(--color-brand-primary)] shadow-sm border border-[var(--color-neutral-border)]" : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-100/50"}`}
          >
            Materia Prima
          </button>
        )}
        <button
          type="button"
          onClick={() => setTipoDetalle("PRODUCTO")}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${tipoDetalle === "PRODUCTO" ? "bg-white text-[var(--color-brand-primary)] shadow-sm border border-[var(--color-neutral-border)]" : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-100/50"}`}
        >
          Producto
        </button>
        <button
          type="button"
          onClick={() => setTipoDetalle("CUENTA_CONTABLE")}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer ${tipoDetalle === "CUENTA_CONTABLE" ? "bg-white text-[var(--color-brand-primary)] shadow-sm border border-[var(--color-neutral-border)]" : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-100/50"}`}
        >
          Servicios
        </button>
      </div>

      {/* AGREGAR DETALLE */}
      <div className="relative flex items-center mb-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-[8px] bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-[var(--color-brand-primary)]/20 uppercase tracking-widest text-[11px]"
          title="Agregar detalle manualmente"
        >
          <CajaIcono className="w-5 h-5" />
          <span className="font-bold">Agregar Detalle</span>
        </button>
      </div>

      {/* CARRITO */}
      <CarritoDetalle
        items={items}
        actualizarCantidadItem={actualizarCantidadItem}
        actualizarPrecioItem={actualizarPrecioItem}
        actualizarTasaIvaItem={actualizarTasaIvaItem}
        actualizarTipoFiscalItem={actualizarTipoFiscalItem}
        actualizarDevolverAStockItem={actualizarDevolverAStockItem}
        quitarItem={quitarItem}
        subtotalSinIva={subtotalSinIva}
        totalIva={totalIva}
        totalGeneral={totalGeneral}
        totalRecargo={totalRecargo}
        codigoTipoComprobante={codigoTipoComprobante}
        esNotaCredito={esNotaCredito}
        otrosTributos={otrosTributos}
        setOtrosTributos={setOtrosTributos}
      />

      {/* PAGO */}
      <DetallePago
        totalComprobante={totalGeneral}
        tipoOperacion={tipoOperacion}
        pagos={pagos}
        setPagos={setPagos}
        vueltos={vueltos}
        setVueltos={setVueltos}
        condicionComprobante={condicionComprobante}
      />

      {/* MODAL */}
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
        montoPreCargado={precioUnitarioInicial}
        montosSugeridos={montosSugeridos}
      />
    </div>
  );
};

export default BuscadorDetalle;
