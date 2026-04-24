import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  AgregarIcono,
  VentasIcono,
  UbicacionIcono,
  DescargarIcono,
} from "../../../../assets/Icons";
import { Building2, Trash2, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { useDepositosConStock } from "../../../../Backend/Articulos/queries/Deposito/useDepositosConStock.query";
import TarjetaDeposito from "./TarjetaDeposito.jsx";
import TablaDepositoStock from "../../../Tablas/Articulos/Deposito/TablaDepositoStock";
import StockDepositoPDF from "../../../Reportes/StockDepositoPDF.jsx";
import SkeletonTarjeta from "../../../UI/Skeletons/SkeletonTarjeta.jsx";

/**
 * Componente Deposito: Gestión de sucursales y stock global.
 */
const Deposito = () => {
  const [depositoAEliminar, setDepositoAEliminar] = useState(null);
  const [borrarStock, setBorrarStock] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const { depositos, cargando, eliminarDeposito } = useDepositoUI();
  const usuario = useAuthStore((state) => state.usuario);
  const { data: stockCompletoData, isFetching: cargandoStockCompleto } =
    useDepositosConStock({
      pagina: 1,
      limite: 100000,
      tipoArticulo: "PRODUCTO",
    });
  const { data: stockCompletoMpData, isFetching: cargandoStockCompletoMp } =
    useDepositosConStock({
      pagina: 1,
      limite: 100000,
      tipoArticulo: "MATERIA_PRIMA",
    });
  const navigate = useNavigate();

  const handleNuevaSucursal = useCallback(() => {
    navigate("/panel/inventario/depositos/nuevo");
  }, [navigate]);

  const handleEliminarSucursal = useCallback((suc) => {
    setDepositoAEliminar(suc);
  }, []);

  const handleConfirmarEliminar = useCallback(async () => {
    if (!depositoAEliminar) return;
    setProcesando(true);
    try {
      await eliminarDeposito(depositoAEliminar.codigoSecuencial, borrarStock);
      setDepositoAEliminar(null);
      setBorrarStock(false);
    } catch (e) {
      // Error se muestra en Alertas
    } finally {
      setProcesando(false);
    }
  }, [depositoAEliminar, borrarStock, eliminarDeposito]);

  const handleEditarSucursal = useCallback(
    (suc) => {
      navigate(
        `/panel/inventario/depositos/editar?codigoSecuencial=${suc.codigoSecuencial}`,
      );
    },
    [navigate],
  );

  const handleCerrarModalEliminar = useCallback(() => {
    setDepositoAEliminar(null);
    setBorrarStock(false);
  }, []);

  const matrizStockCompletaPDF = useMemo(() => {
    const data = Array.isArray(stockCompletoData?.data)
      ? stockCompletoData.data
      : [];
    const productosMap = {};

    data.forEach((producto) => {
      const prodCodigo = producto.codigoSecuencial;
      if (!productosMap[prodCodigo]) {
        productosMap[prodCodigo] = {
          ...producto,
          codigoProducto: prodCodigo,
        };
      }

      producto.stockPorDeposito?.forEach((sp) => {
        const depCodigo = sp.codigoDeposito;
        productosMap[prodCodigo][`dep_${depCodigo}`] =
          (productosMap[prodCodigo][`dep_${depCodigo}`] || 0) + (sp.stock || 0);
      });
    });

    return Object.values(productosMap);
  }, [stockCompletoData]);

  const stockPdfDocument = useMemo(
    () => (
      <StockDepositoPDF
        matrizStock={matrizStockCompletaPDF}
        depositos={depositos}
        empresaNombre={
          usuario?.nombreEmpresa || usuario?.datosFiscales?.razonSocial
        }
      />
    ),
    [matrizStockCompletaPDF, depositos],
  );
  const matrizStockCompletaPDFMp = useMemo(() => {
    const data = Array.isArray(stockCompletoMpData?.data)
      ? stockCompletoMpData.data
      : [];
    const productosMap = {};

    data.forEach((producto) => {
      const prodCodigo = producto.codigoSecuencial;
      if (!productosMap[prodCodigo]) {
        productosMap[prodCodigo] = {
          ...producto,
          codigoProducto: prodCodigo,
          codigoMateriaPrima: prodCodigo,
        };
      }

      producto.stockPorDeposito?.forEach((sp) => {
        const depCodigo = sp.codigoDeposito;
        productosMap[prodCodigo][`dep_${depCodigo}`] =
          (productosMap[prodCodigo][`dep_${depCodigo}`] || 0) + (sp.stock || 0);
      });
    });

    return Object.values(productosMap);
  }, [stockCompletoMpData]);

  const stockPdfDocumentMp = useMemo(
    () => (
      <StockDepositoPDF
        matrizStock={matrizStockCompletaPDFMp}
        depositos={depositos}
        empresaNombre={
          usuario?.nombreEmpresa || usuario?.datosFiscales?.razonSocial
        }
      />
    ),
    [
      matrizStockCompletaPDFMp,
      depositos,
      usuario?.nombreEmpresa,
      usuario?.datosFiscales?.razonSocial,
    ],
  );

  // Fuerza remount del PDFDownloadLink cuando cambia la data de origen
  // para evitar el primer blob vacío por cache interno del componente.
  const pdfLinkKey = useMemo(
    () =>
      `pdf-stock-${matrizStockCompletaPDF.length}-${depositos.length}-${usuario?.codigoEmpresa || "na"}`,
    [matrizStockCompletaPDF.length, depositos.length, usuario?.codigoEmpresa],
  );
  const pdfLinkKeyMp = useMemo(
    () =>
      `pdf-stock-mp-${matrizStockCompletaPDFMp.length}-${depositos.length}-${usuario?.codigoEmpresa || "na"}`,
    [matrizStockCompletaPDFMp.length, depositos.length, usuario?.codigoEmpresa],
  );

  return (
    <ContenedorSeccion className="px-3 py-2">
      {/* Header / Navigation Card */}
      <EncabezadoSeccion
        ruta={"Inventario > Depósitos   "}
        icono={<Building2 size={18} />}
      />

      <div className="space-y-8 pb-10">
        {/* Warehouse Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />
            <button
              onClick={handleNuevaSucursal}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary-subtle)] border border-[var(--primary)]/20! rounded-md! font-bold! text-[13px]! uppercase! tracking-wider! cursor-pointer! text-[var(--primary)]!"
            >
              <AgregarIcono size={10} className="group-hover:rotate-90  " />
              Nuevo Depósito
            </button>
          </div>

          <div className="flex flex-wrap items-center w-full gap-4">
            {cargando
              ? Array.from({ length: 2 }).map((_, n) => (
                  <SkeletonTarjeta key={n} />
                ))
              : depositos.map((suc) => (
                  <TarjetaDeposito
                    key={suc.codigoSecuencial}
                    suc={suc}
                    onEdit={handleEditarSucursal}
                    onDelete={handleEliminarSucursal}
                  />
                ))}
          </div>
        </section>

        {/* Stock Matrix Section - Productos */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            {/* PDF Download Button */}
            <PDFDownloadLink
              key={pdfLinkKey}
              document={stockPdfDocument}
              fileName={`Reporte_Stock_Productos_${new Date().toLocaleDateString()}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={
                    loading ||
                    cargando ||
                    cargandoStockCompleto ||
                    matrizStockCompletaPDF.length === 0
                  }
                  className="flex items-center gap-2.5 px-4 py-2 bg-black/5 hover:bg-white/[0.08] text-black/60 hover:text-black border border-black/10 hover:border-black/20 rounded-md font-bold text-[12px] uppercase tracking-widest  cursor-pointer active:scale-95 group/pdf disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || cargandoStockCompleto ? (
                    <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                  ) : (
                    <DescargarIcono
                      size={20}
                      className="group-hover:rotate-90"
                    />
                  )}

                  {loading || cargandoStockCompleto
                    ? "Preparando..."
                    : "Descargar Reporte"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
          <TablaDepositoStock
            tipoArticulo="PRODUCTO"
            titulo="Matriz de Inventario (Productos)"
          />
        </section>

        {/* Stock Matrix Section - Materia Prima */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />

            <PDFDownloadLink
              key={pdfLinkKeyMp}
              document={stockPdfDocumentMp}
              fileName={`Reporte_Stock_MateriaPrima_${new Date().toLocaleDateString()}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={
                    loading ||
                    cargando ||
                    cargandoStockCompletoMp ||
                    matrizStockCompletaPDFMp.length === 0
                  }
                  className="flex items-center gap-2.5 px-4 py-2 bg-black/5 hover:bg-white/[0.08] text-black/60 hover:text-black border border-black/10 hover:border-black/20 rounded-md font-bold text-[12px] uppercase tracking-widest  cursor-pointer active:scale-95 group/pdf disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || cargandoStockCompletoMp ? (
                    <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                  ) : (
                    <DescargarIcono
                      size={20}
                      className="group-hover:rotate-90"
                    />
                  )}
                  {loading || cargandoStockCompletoMp
                    ? "Preparando..."
                    : "Descargar Reporte"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
          <TablaDepositoStock
            tipoArticulo="MATERIA_PRIMA"
            titulo="Matriz de Inventario (Materia Prima)"
          />
        </section>
      </div>

      {/* Modal de Confirmación para Eliminar */}
      {depositoAEliminar && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-black/10 rounded-md max-w-md w-full p-6 shadow-2xl   ">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-700/10 border border-red-700/20 flex items-center justify-center mb-4">
                <Trash2 className="text-red-400" size={24} />
              </div>
              <h3 className="text-lg font-black text-black uppercase tracking-wider mb-2">
                ¿Eliminar Depósito?
              </h3>
              <p className="text-sm text-black/60 mb-6">
                Esta acción eliminará el depósito{" "}
                <strong className="text-black">
                  {depositoAEliminar.nombre}
                </strong>{" "}
                y todo su historial de stock local.
              </p>

              {/* Checkbox para borrar stock general */}
              <label className="flex items-center gap-3 w-full bg-black/5 p-4 rounded-md border border-black/5 hover:border-black/10  cursor-pointer mb-6 group/check">
                <input
                  type="checkbox"
                  checked={borrarStock}
                  onChange={(e) => setBorrarStock(e.target.checked)}
                  className="rounded border-black/20 bg-black/40 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-black block group-hover/check:text-[var(--primary)] ">
                    ¿Limpiar stock productos?
                  </span>
                  <span className="text-[12px] text-black/40 block mt-0.5">
                    Si activas esto, se reseteará a 0 el stock global de todos
                    los productos.
                  </span>
                </div>
              </label>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCerrarModalEliminar}
                  disabled={procesando}
                  className="flex-1 px-4 py-2.5 bg-black/5 hover:bg-black/10 text-black font-bold text-xs uppercase tracking-wider rounded-md  cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={procesando}
                  className="flex-1 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-black font-bold text-xs uppercase tracking-wider rounded-md  cursor-pointer shadow-lg shadow-red-700/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {procesando ? "Borrando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ContenedorSeccion>
  );
};

export default Deposito;
