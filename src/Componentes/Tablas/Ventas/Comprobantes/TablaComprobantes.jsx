import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasComprobantes } from "./ColumnaComprobantes";
import { useMemo, useState, useEffect } from "react";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { facturaConfig } from "../../../Modales/Ventas/ConfigFactura";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";

const TablaComprobantes = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const {
    facturas,
    meta,
    isLoading,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTypeFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,
    setIsFiscal,
  } = useFacturas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  // Datos dinámicos de ARCA
  const [tiposARCA, setTiposARCA] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  // 1. Carga de Tipos de Comprobante Dinámicos
  useEffect(() => {
    const fetchTipos = async () => {
      // Cargamos si hay conexión ARCA habilitada
      if (usuario?.conexionArca) {
        setCargandoTipos(true);
        try {
          const res = await ObtenerTiposComprobanteApi();
          // Mapeo robusto: Buscamos el array en .data o el objeto directo
          const dataRaw = Array.isArray(res) ? res : (res?.data || []);
          const vouchersReal = Array.isArray(dataRaw) ? dataRaw : (dataRaw?.data || []);

          if (Array.isArray(vouchersReal)) {
            setTiposARCA(vouchersReal.map(t => ({ valor: String(t.Id), texto: t.Desc })));
          }
        } catch (e) {
          console.error("Error cargando tipos ARCA:", e);
        } finally {
          setCargandoTipos(false);
        }
      }
    };
    fetchTipos();
  }, [usuario?.id]);

  // 2. Lógica de visibilidad del filtro fiscal (Detección Real)
  const tieneConexionArca = useMemo(() => {
    return !!usuario?.conexionArca;
  }, [usuario]);

  // 3. Totales
  const totalFacturadoFacturas = useMemo(() => {
    return facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0;
  }, [facturas]);

  // 4. Opciones de Clase (Mezcla estáticas + ARCA)
  const opcionesClase = useMemo(() => {
    if (tiposARCA.length > 0) {
      return [{ valor: "TODAS", texto: "TODOS LOS COMPROBANTES" }, ...tiposARCA];
    }
    return [
      { valor: "TODAS", texto: "Todos los Comprobantes" },
      { valor: "99", texto: "Ticket No Fiscal" },
    ];
  }, [tiposARCA]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...facturaConfig}
      />

      {/* Tarjetas con Colores de Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TarjetaInformacion
          titulo="Facturación Vista"
          color="text-[var(--primary)]"
          valorMoneda
          numero={totalFacturadoFacturas}
          cargando={isLoading}
          estiloExtra="border-l-4 border-[var(--primary)] bg-[var(--surface)] shadow-2xl p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300"
        />

        <TarjetaInformacion
          titulo="Total Registros"
          color="text-indigo-400"
          numero={meta.totalItems || 0}
          cargando={isLoading}
          estiloExtra="bg-[var(--surface)] shadow-xl p-6 rounded-2xl border border-[var(--border-subtle)]"
        />

        <TarjetaInformacion
          titulo="Monto Filtrado"
          color="text-amber-400"
          valorMoneda
          numero={totalFacturadoFacturas}
          cargando={isLoading}
          estiloExtra="bg-[var(--surface)] shadow-xl p-6 rounded-2xl border border-[var(--border-subtle)]"
        />
      </div>

      {/* Tabla Maestra con Diseño Identitario */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-medium)] bg-[var(--fill)]">
        <DataTable
          id_tabla="comprobantes_final_v1"
          llaveTituloMobile="numeroComprobante"
          columnas={columnasComprobantes}
          datos={facturas}
          cargando={isLoading}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarAcciones={false}
          placeholderBuscador="Factura, Receptor, Fecha..."
          botonAgregar={{
            texto: "Nueva Venta",
            ruta: "/panel/ventas/facturas/nueva",
          }}
          mostrarFiltros={true}
          textoFiltros="Opciones de Busqueda"
          filtrosAbiertosInicial={false}
          filtrosElementos={
            <div className="flex flex-wrap items-center gap-8 p-6 bg-[var(--fill-secondary)] rounded-2xl border border-[var(--border-medium)] mt-4 shadow-inner">

              {/* SELECTORES CON COLORES DINÁMICOS - SOLO SI HAY AFIP */}
              {tieneConexionArca && (
                <>
                  {isFiscal !== "INTERNA" && (
                    <div className="flex-1 min-w-[240px]">
                      <Select
                        valor={tipoFactura}
                        label={"Tipo de Comprobante / Clase:"}
                        setValor={setTypeFactura}
                        options={opcionesClase}
                        cargando={cargandoTipos}
                      />
                    </div>
                  )}

                  <div className="min-w-[220px]">
                    <Select
                      valor={isFiscal}
                      label={"Condición Fiscal:"}
                      setValor={setIsFiscal}
                      options={[
                        { valor: "TODAS", texto: "Fiscal e Interno" },
                        { valor: "FISCAL", texto: "Emitidos vía AFIP" },
                        { valor: "INTERNA", texto: "Ventas Internas" },
                      ]}
                    />
                  </div>
                </>
              )}

              {/* RANGO DE FECHAS PREMIUM */}
              <div className={`flex flex-col gap-2 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-gray)] shadow-sm ${!tieneConexionArca ? 'flex-1' : ''}`}>
                <span className="text-[11px] text-[var(--primary)] font-bold uppercase tracking-wider ml-1 opacity-80">Período de Facturación</span>
                <div className="flex items-center gap-4">
                  <FechaInput
                    label="Desde"
                    value={fechaDesde}
                    onChange={setFechaDesde}
                    size="sm"
                  />
                  <div className="h-6 w-px bg-[var(--border-medium)]"></div>
                  <FechaInput
                    label="Hasta"
                    value={fechaHasta}
                    onChange={setFechaHasta}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TablaComprobantes;
