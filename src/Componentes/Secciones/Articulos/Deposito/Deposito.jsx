import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { createPortal } from "react-dom";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { DescargarIcono } from "../../../../assets/Icons";
import {
  Building2,
  Trash2,
  Loader2,
  Settings2,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { useDepositosConStock } from "../../../../Backend/Articulos/queries/Deposito/useDepositosConStock.query";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasDepositos } from "../../../Tablas/Articulos/Deposito/ColumnasDepositos";
import TablaDepositoStock from "../../../Tablas/Articulos/Deposito/TablaDepositoStock";
import StockDepositoPDF from "../../../Reportes/StockDepositoPDF.jsx";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion.jsx";

/**
 * Componente Deposito: Gestión de sucursales y stock global.
 */
const Deposito = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const esGalpon = location.pathname.includes("/inventario/galpones");
  const labelSingular = esGalpon ? "Galpón" : "Depósito";
  const labelPlural = esGalpon ? "Galpones" : "Depósitos";
  const baseRoute = esGalpon
    ? "/panel/inventario/galpones"
    : "/panel/inventario/depositos";

  const [depositoAEliminar, setDepositoAEliminar] = useState(null);
  const [borrarStock, setBorrarStock] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const { tieneAccion } = usePermisosDeUsuario();
  const { depositos, cargando, eliminarDeposito } = useDepositoUI();
  const usuario = useAuthStore((state) => state.usuario);
  const [activarDescarga, setActivarDescarga] = useState(false);
  const [activarDescargaMp, setActivarDescargaMp] = useState(false);
  const [modalDescarga, setModalDescarga] = useState({
    isOpen: false,
    tipoArticulo: null,
  });
  const [incluirCerosNegativos, setIncluirCerosNegativos] = useState(true);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedIdsMp, setSelectedIdsMp] = useState(new Set());
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const [depositosOrdenadosCustom, setDepositosOrdenadosCustom] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Sincronizar lista al abrir modal
  useEffect(() => {
    if (modalDescarga.isOpen) {
      setDepositosOrdenadosCustom([...depositos]);
    }
  }, [modalDescarga.isOpen, depositos]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, overIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === overIndex) return;

    const items = [...depositosOrdenadosCustom];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(overIndex, 0, draggedItem);

    setDraggedIndex(overIndex);
    setDepositosOrdenadosCustom(items);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const descargarPDFAutomatico = async (tipo) => {
    try {
      setGenerandoPdf(true);

      const esProd = tipo === "PRODUCTO";
      const doc = esProd ? stockPdfDocument : stockPdfDocumentMp;

      // Generar el blob usando la API imperativa de @react-pdf/renderer
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      // Crear elemento de descarga programático
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Stock_${esProd ? "Productos" : "MateriaPrima"}_${new Date().toLocaleDateString("es-AR")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
    } finally {
      // Resetear estados y cerrar modal
      setGenerandoPdf(false);
      setActivarDescarga(false);
      setActivarDescargaMp(false);
      setModalDescarga({ isOpen: false, tipoArticulo: null });
    }
  };

  const {
    data: stockCompletoData,
    isFetching: cargandoStockCompleto,
    isSuccess: listoStock,
  } = useDepositosConStock(
    {
      pagina: 1,
      limite: 100000,
      tipoArticulo: "PRODUCTO",
      codigosArticulos: Array.from(selectedIds).join(","),
    },
    { enabled: activarDescarga && selectedIds.size > 0 },
  );

  const {
    data: stockCompletoMpData,
    isFetching: cargandoStockCompletoMp,
    isSuccess: listoStockMp,
  } = useDepositosConStock(
    {
      pagina: 1,
      limite: 100000,
      tipoArticulo: "MATERIA_PRIMA",
      codigosArticulos: Array.from(selectedIdsMp).join(","),
    },
    { enabled: activarDescargaMp && selectedIdsMp.size > 0 },
  );

  // Disparar la descarga automática cuando los datos estén listos
  useEffect(() => {
    if (activarDescarga && listoStock && stockCompletoData) {
      descargarPDFAutomatico("PRODUCTO");
    }
  }, [activarDescarga, listoStock, stockCompletoData]);

  useEffect(() => {
    if (activarDescargaMp && listoStockMp && stockCompletoMpData) {
      descargarPDFAutomatico("MATERIA_PRIMA");
    }
  }, [activarDescargaMp, listoStockMp, stockCompletoMpData]);
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
      navigate(`${baseRoute}/editar?codigoSecuencial=${suc.codigoSecuencial}`);
    },
    [navigate, baseRoute],
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
          (productosMap[prodCodigo][`dep_${depCodigo}`] || 0) + Number(sp.stock || 0);
      });
    });

    let result = Object.values(productosMap);
    if (!incluirCerosNegativos) {
      result = result.filter((item) => (item.stock || 0) > 0);
    }
    return [...result].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "", "es"),
    );
  }, [stockCompletoData, incluirCerosNegativos]);

  const stockPdfDocument = useMemo(
    () => (
      <StockDepositoPDF
        matrizStock={matrizStockCompletaPDF}
        depositos={depositosOrdenadosCustom}
        empresaNombre={
          usuario?.nombreEmpresa || usuario?.datosFiscales?.razonSocial
        }
      />
    ),
    [matrizStockCompletaPDF, depositosOrdenadosCustom],
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
          (productosMap[prodCodigo][`dep_${depCodigo}`] || 0) + Number(sp.stock || 0);
      });
    });

    let result = Object.values(productosMap);
    if (!incluirCerosNegativos) {
      result = result.filter((item) => (item.stock || 0) > 0);
    }
    return [...result].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "", "es"),
    );
  }, [stockCompletoMpData, incluirCerosNegativos]);

  const stockPdfDocumentMp = useMemo(
    () => (
      <StockDepositoPDF
        matrizStock={matrizStockCompletaPDFMp}
        depositos={depositosOrdenadosCustom}
        empresaNombre={
          usuario?.nombreEmpresa || usuario?.datosFiscales?.razonSocial
        }
      />
    ),
    [
      matrizStockCompletaPDFMp,
      depositosOrdenadosCustom,
      usuario?.nombreEmpresa,
      usuario?.datosFiscales?.razonSocial,
    ],
  );

  const orderKey = useMemo(() => {
    return depositosOrdenadosCustom.map((d) => d.codigoSecuencial).join("-");
  }, [depositosOrdenadosCustom]);

  // Fuerza remount del PDFDownloadLink cuando cambia la data de origen
  // para evitar el primer blob vacío por cache interno del componente.
  const pdfLinkKey = useMemo(
    () =>
      `pdf-stock-${matrizStockCompletaPDF.length}-${depositosOrdenadosCustom.length}-${orderKey}-${usuario?.codigoEmpresa || "na"}`,
    [
      matrizStockCompletaPDF.length,
      depositosOrdenadosCustom.length,
      orderKey,
      usuario?.codigoEmpresa,
    ],
  );
  const pdfLinkKeyMp = useMemo(
    () =>
      `pdf-stock-mp-${matrizStockCompletaPDFMp.length}-${depositosOrdenadosCustom.length}-${orderKey}-${usuario?.codigoEmpresa || "na"}`,
    [
      matrizStockCompletaPDFMp.length,
      depositosOrdenadosCustom.length,
      orderKey,
      usuario?.codigoEmpresa,
    ],
  );

  const columnasDinamicas = useMemo(() => {
    return columnasDepositos.map((col) => {
      if (col.key === "nombre") {
        return { ...col, etiqueta: labelSingular };
      }
      return col;
    });
  }, [columnasDepositos, labelSingular]);

  return (
    <ContenedorSeccion className="px-3 py-2">
      {/* Header / Navigation Card */}
      <EncabezadoSeccion
        ruta={`${labelPlural}   `}
        icono={<Building2 size={18} />}
      />

      <div className="space-y-8 pb-10">
        {/* Warehouse Table Section */}
        <section>
          <div className="flex items-center justify-between px-2">
            <div className="h-[1px] flex-1 mr-4 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <DataTable
            id_tabla="depositos_gestion"
            columnas={columnasDinamicas}
            datos={depositos}
            loading={cargando}
            llaveTituloMobile="nombre"
            mostrarAcciones={true}
            acciones={[
              {
                icono: <Settings2 size={16} />,
                label: "Configurar",
                onClick: handleEditarSucursal,
              },
              {
                icono: <Trash2 size={16} className="text-red-500" />,
                label: "Eliminar",
                onClick: handleEliminarSucursal,
              },
            ]}
            botonAgregar={{
              texto: "Crear",
              ruta: `${baseRoute}/nuevo`,
              tieneAccion: "CREAR_DEPOSITO",
            }}
            emptyMessage={`No se encontraron ${labelPlural.toLowerCase()} registrados`}
          />
        </section>

        {/* Stock Matrix Section - Productos */}
        <TieneAccion accion="DEPOSITO_PRODUCTOS">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <button
                disabled={selectedIds.size === 0}
                onClick={() =>
                  setModalDescarga({ isOpen: true, tipoArticulo: "PRODUCTO" })
                }
                className={`flex items-center gap-2.5 px-4 py-2 border rounded-[8px] font-semibold text-[13px] transition-all active:scale-95 group/pdf ${
                  selectedIds.size > 0
                    ? "bg-white hover:bg-emerald-50 text-[var(--color-neutral-text-main)] border-[var(--color-neutral-border)] cursor-pointer shadow-sm"
                    : "bg-gray-50 text-[var(--color-neutral-text-muted)] border-[var(--color-neutral-border)] cursor-not-allowed"
                }`}
              >
                <DescargarIcono
                  size={18}
                  className={
                    selectedIds.size > 0
                      ? "text-emerald-600 group-hover:-translate-y-0.5 transition-transform"
                      : "text-[var(--color-neutral-text-muted)] opacity-50"
                  }
                />
                Descargar Reporte{" "}
                {selectedIds.size > 0 && `(${selectedIds.size} seleccionados)`}
              </button>
            </div>
            <TablaDepositoStock
              tipoArticulo="PRODUCTO"
              titulo="Productos"
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </section>
        </TieneAccion>
        {/* Stock Matrix Section - Materia Prima */}
        <TieneAccion accion="DEPOSITO_MATERIA_PRIMA">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <button
                disabled={selectedIdsMp.size === 0}
                onClick={() =>
                  setModalDescarga({
                    isOpen: true,
                    tipoArticulo: "MATERIA_PRIMA",
                  })
                }
                className={`flex items-center gap-2.5 px-4 py-2 border rounded-md font-bold text-[12px] uppercase tracking-widest transition-all active:scale-95 group/pdf ${
                  selectedIdsMp.size > 0
                    ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border-emerald-600/20 cursor-pointer shadow-md"
                    : "bg-black/5 text-black/30 border-black/5 cursor-not-allowed"
                }`}
              >
                <DescargarIcono
                  size={20}
                  className={
                    selectedIdsMp.size > 0
                      ? "group-hover:rotate-90 text-emerald-700"
                      : "text-black/30"
                  }
                />
                Descargar Reporte{" "}
                {selectedIdsMp.size > 0 &&
                  `(${selectedIdsMp.size} seleccionados)`}
              </button>
            </div>
            <TablaDepositoStock
              tipoArticulo="MATERIA_PRIMA"
              titulo="Materia Prima"
              selectedIds={selectedIdsMp}
              setSelectedIds={setSelectedIdsMp}
            />
          </section>
        </TieneAccion>
      </div>

      {/* Modal de Confirmación para Eliminar */}
      {depositoAEliminar &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] max-w-md w-full p-8 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-[16px] bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                  <Trash2 className="text-rose-600" size={28} />
                </div>
                <h3 className="text-[20px] font-bold text-[var(--color-neutral-text-main)] mb-2">
                  ¿Eliminar {labelSingular}?
                </h3>
                <p className="text-sm text-black/60 mb-6">
                  Esta acción eliminará el {labelSingular.toLowerCase()}{" "}
                  <strong className="text-black">
                    {depositoAEliminar.nombre}
                  </strong>{" "}
                  y todo su historial de stock local.
                </p>

                {/* Checkbox para borrar stock general */}
                <label className="flex items-start gap-3 w-full bg-gray-50 p-4 rounded-[12px] border border-[var(--color-neutral-border)] cursor-pointer mb-6 group/check hover:bg-gray-100 transition-colors">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={borrarStock}
                      onChange={(e) => setBorrarStock(e.target.checked)}
                      className="rounded border-[var(--color-neutral-border)] text-rose-600 focus:ring-rose-200 cursor-pointer w-4 h-4"
                    />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-[13px] font-semibold text-[var(--color-neutral-text-main)] block">
                      ¿Limpiar stock de productos?
                    </span>
                    <span className="text-[12px] text-[var(--color-neutral-text-muted)] block mt-1 leading-relaxed">
                      Si activas esto, se reseteará a 0 el stock global de todos
                      los productos en este {labelSingular.toLowerCase()}.
                    </span>
                  </div>
                </label>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCerrarModalEliminar}
                    disabled={procesando}
                    className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] font-semibold text-[13px] rounded-[10px] cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarEliminar}
                    disabled={procesando}
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[13px] rounded-[10px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {procesando ? "Borrando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal de Configuración de Reporte PDF */}
      {modalDescarga.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] max-w-md w-full p-8 shadow-[0_4px_24px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-[16px] bg-[var(--color-brand-soft)] border border-[var(--color-brand-primary)]/20 flex items-center justify-center mb-6 text-[var(--color-brand-primary)]">
                  <DescargarIcono size={28} />
                </div>
                <h3 className="text-[20px] font-bold text-[var(--color-neutral-text-main)] mb-2">
                  Configurar Reporte
                </h3>
                <p className="text-[14px] text-[var(--color-neutral-text-muted)] mb-6 leading-relaxed">
                  Personaliza el alcance del documento PDF para el stock de{" "}
                  <strong className="text-[var(--color-neutral-text-main)]">
                    {modalDescarga.tipoArticulo === "PRODUCTO"
                      ? "Productos"
                      : "Materias Primas"}
                  </strong>
                  .
                </p>

                {/* Lista de Sucursales Drag & Drop */}
                <div className="flex flex-col gap-2 w-full text-left mb-6">
                  <label className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] flex items-center gap-1.5 ml-1">
                    <GripVertical
                      size={14}
                      className="text-[var(--color-brand-primary)]"
                    />
                    Arrastrar para Reordenar Columnas
                  </label>
                  <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1 select-none border border-[var(--color-neutral-border)] p-3 rounded-[12px] bg-gray-50/50 custom-scrollbar">
                    {depositosOrdenadosCustom.length === 0 ? (
                      <div className="text-center text-[13px] text-[var(--color-neutral-text-muted)] py-4">
                        No hay sucursales disponibles
                      </div>
                    ) : (
                      depositosOrdenadosCustom.map((dep, index) => (
                        <div
                          key={dep.codigoSecuencial}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between border rounded-[8px] p-2.5 px-3 bg-white text-[13px] font-semibold text-[var(--color-neutral-text-main)] border-[var(--color-neutral-border)] cursor-grab hover:bg-gray-50 transition-all select-none active:cursor-grabbing shadow-sm ${
                            draggedIndex === index
                              ? "opacity-50 border-dashed border-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical
                              size={14}
                              className="text-[var(--color-neutral-text-muted)] cursor-grab"
                            />
                            <span>{dep.nombre}</span>
                          </div>
                          {dep.principal && (
                            <span className="text-[11px] font-bold text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)] px-2 py-0.5 rounded-[4px]">
                              Principal
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Opción Premium: Incluir/Excluir Ceros y Negativos */}
                <button
                  type="button"
                  onClick={() =>
                    setIncluirCerosNegativos(!incluirCerosNegativos)
                  }
                  className={`flex items-center gap-4 w-full p-4 rounded-md border text-left cursor-pointer transition-all mb-6 select-none ${
                    incluirCerosNegativos
                      ? "bg-[var(--primary)]/[0.03] border-[var(--primary)]/40 shadow-sm"
                      : "bg-black/5 border-transparent hover:border-black/10"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={incluirCerosNegativos}
                      readOnly
                      className="rounded border-black/20 bg-black/40 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer pointer-events-none w-4 h-4"
                    />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-black block uppercase tracking-wider ${incluirCerosNegativos ? "text-[var(--primary)]" : "text-black"}`}
                    >
                      Incluir stock cero o negativo
                    </span>
                    <span className="text-[11px] text-black/40 block mt-0.5 font-medium">
                      {incluirCerosNegativos
                        ? "El PDF incluirá todos los artículos registrados, incluso sin existencias."
                        : "El PDF solo listará los artículos con stock real disponible (> 0)."}
                    </span>
                  </div>
                </button>

                <div className="flex gap-3 w-full mt-2">
                  <button
                    disabled={
                      generandoPdf || activarDescarga || activarDescargaMp
                    }
                    onClick={() => {
                      setModalDescarga({ isOpen: false, tipoArticulo: null });
                      setActivarDescarga(false);
                      setActivarDescargaMp(false);
                    }}
                    className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] font-semibold text-[13px] rounded-[10px] cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  {(() => {
                    const tipo = modalDescarga.tipoArticulo;
                    const esProd = tipo === "PRODUCTO";
                    const activar = esProd
                      ? activarDescarga
                      : activarDescargaMp;
                    
                    if (!activar && !generandoPdf) {
                      return (
                        <button
                          onClick={() => {
                            if (esProd) setActivarDescarga(true);
                            else setActivarDescargaMp(true);
                          }}
                          className="flex-1 px-4 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold text-[13px] rounded-[10px] cursor-pointer transition-colors shadow-sm"
                        >
                          Generar PDF
                        </button>
                      );
                    }

                    return (
                      <button
                        disabled
                        className="flex-1 px-4 py-3 bg-[var(--color-brand-primary)] text-white/90 font-semibold text-[13px] rounded-[10px] flex items-center justify-center gap-2 opacity-70"
                      >
                        <Loader2 size={16} className="animate-spin" />
                        {generandoPdf
                          ? "Generando PDF..."
                          : "Cargando Datos..."}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ContenedorSeccion>
  );
};

export default Deposito;
