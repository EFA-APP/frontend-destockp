import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useObtenerMovimientos } from "../../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI";
import { useCrearMovimiento } from "../../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import {
  MovimientoIcono,
  GuardarIcono,
  CheckIcono,
} from "../../../../assets/Icons";

import {
  User,
  Package,
  Calendar,
  FileText,
  Truck,
  ArrowUpRight,
  Ban,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import SearchableSelect from "../../../UI/Select/SearchableSelect";

const opcionesEtapas = [
  { value: "INGRESO", label: "INGRESO" },
  { value: "EN PROCESO", label: "EN PROCESO" },
  { value: "TERMINADO", label: "TERMINADO" },
  { value: "EGRESO", label: "EGRESO" },
  { value: "TERMINADO MOV. STOCK", label: "TERMINADO MOV. STOCK" },
];

const NuevoEgreso = () => {
  const navigate = useNavigate();

  const usuario = useAuthStore((state) => state.usuario);

  const { mutateAsync: crearMovimiento, isPending: guardando } =
    useCrearMovimiento();

  const { contactos = [] } = useContactos({ limite: 1000 });

  const { depositos = [] } = useDepositoUI();

  const { data: responseMovs } = useObtenerMovimientos(
    undefined,
    "MATERIA_PRIMA",
    undefined,
    undefined,
    undefined,
    1,
    100000,
  );

  const movimientos = useMemo(() => {
    return responseMovs?.movimientos || [];
  }, [responseMovs]);

  const lotesDisponibles = useMemo(() => {
    const lotesMap = {};

    movimientos.forEach((mov) => {
      let meta = {};

      try {
        if (mov.descripcion) {
          meta = JSON.parse(mov.descripcion);
        }
      } catch (e) {}

      const loteCod = meta.lote || mov.descripcion;

      if (!loteCod) return;

      if (!lotesMap[loteCod]) {
        lotesMap[loteCod] = {
          lote: loteCod,
          materiaPrimaId: mov.codigoMateriaPrima,
          materiaPrimaNombre:
            mov.materiaPrima?.nombre || mov.nombreArticulo || "Desconocido",
          depositoId: mov.codigoDeposito,
          depositoNombre: mov.deposito?.nombre || "Sin Ubicación",
          stock: 0,
          tipoEnvase: meta.tipoEnvase || "GRANEL",
          kgPorEnvase: meta.kgPorEnvase || 0,
          pano: meta.pano || "",
        };
      }

      if (mov.tipoMovimiento === "INGRESO") {
        lotesMap[loteCod].stock += mov.cantidad;
      } else if (mov.tipoMovimiento === "EGRESO") {
        lotesMap[loteCod].stock -= mov.cantidad;
      }
    });

    return Object.values(lotesMap).filter((l) => l.stock > 0);
  }, [movimientos]);

  const opcionesClientes = useMemo(() => {
    return (contactos || []).map((c) => {
      const nombreCompleto =
        c.razonSocial ||
        `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
        "Sin Nombre";

      return {
        value: String(c.codigoSecuencial),
        label: `${nombreCompleto.toUpperCase()} ${
          c.documento ? `(${c.documento})` : ""
        }`,
      };
    });
  }, [contactos]);

  const opcionesLotes = useMemo(() => {
    return lotesDisponibles.map((l) => ({
      value: l.lote,
      label: `${l.lote} - ${l.materiaPrimaNombre.toUpperCase()} (${l.stock} kg)`,
    }));
  }, [lotesDisponibles]);

  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [clienteId, setClienteId] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [kilos, setKilos] = useState("");
  const [etapa, setEtapa] = useState("EGRESO");

  const [chofer, setChofer] = useState("");
  const [transporte, setTransporte] = useState("");
  const [patente, setPatente] = useState("");
  const [cartaPorte, setCartaPorte] = useState("");
  const [facturaRef, setFacturaRef] = useState("");
  const [precioKg, setPrecioKg] = useState("");
  const [observacion, setObservacion] = useState("");

  const loteInfo = useMemo(() => {
    return lotesDisponibles.find((l) => l.lote === loteSeleccionado);
  }, [lotesDisponibles, loteSeleccionado]);

  const cantidadEnvases = useMemo(() => {
    if (!loteInfo || loteInfo.tipoEnvase === "GRANEL") return 1;

    const k = parseFloat(kilos);
    const kp = parseFloat(loteInfo.kgPorEnvase);

    if (!isNaN(k) && !isNaN(kp) && kp > 0) {
      return Math.ceil(k / kp);
    }

    return "";
  }, [kilos, loteInfo]);

  const stockExcedido = useMemo(() => {
    if (!loteInfo) return false;

    const k = parseFloat(kilos);

    if (isNaN(k)) return false;

    return k > loteInfo.stock;
  }, [kilos, loteInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId || !loteSeleccionado || !kilos || stockExcedido || !loteInfo)
      return;

    const clienteObj = contactos.find(
      (c) => String(c.codigoSecuencial) === String(clienteId),
    );

    const payloadLogistico = {
      lote: loteSeleccionado,
      cliente: clienteObj?.razonSocial || clienteObj?.nombre || "Sin Cliente",
      clienteId: clienteObj?.codigoSecuencial,
      etapa,
      chofer,
      transporte,
      patente,
      cartaPorte,
      facturaRef,
      precioKg: parseFloat(precioKg || 0),
      tipoEnvase: loteInfo.tipoEnvase,
      kgPorEnvase: loteInfo.kgPorEnvase,
      cantidadEnvases: parseInt(cantidadEnvases || 1),
      nombreDeposito: loteInfo.depositoNombre || "Sin Ubicación",
      depositoNombre: loteInfo.depositoNombre || "Sin Ubicación",
      pano: loteInfo.pano || "",
    };

    const payload = {
      codigoArticulo: parseInt(loteInfo.materiaPrimaId),
      tipoArticulo: "MATERIA_PRIMA",
      tipoMovimiento: "EGRESO",
      origenMovimiento: "DEPOSITO",
      cantidad: parseFloat(kilos),
      codigoDeposito: parseInt(loteInfo.depositoId),
      lote: loteSeleccionado,
      observacion: `Egreso Lote: ${loteSeleccionado} - ${
        observacion || "Sin notas"
      }`,
      descripcion: JSON.stringify(payloadLogistico),
      codigoUsuario: usuario?.codigoUsuario || usuario?.id || 1,
      nombreUsuario: usuario?.nombre || "Sistema",
    };

    try {
      await crearMovimiento(payload);
      navigate("/panel/movimeintos/historial-movimeitnos");
    } catch (err) {
      console.error("Error al registrar egreso:", err);
    }
  };

  const labelClasses =
    "text-sm font-semibold text-slate-700 uppercase mb-2 ml-0.5 flex items-center gap-2";

  const inputClasses =
    "w-full bg-red-100/50 focus:bg-white border border-slate-300 rounded-md px-4 py-3 text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all";

  const cardClasses =
    "bg-[#fcfcfd] border border-slate-300/70 rounded-md p-7 shadow-sm hover:shadow-md transition-all duration-200";

  return (
    <ContenedorSeccion className="px-6 py-5 bg-[#f3f6f9] min-h-screen">
      <EncabezadoSeccion
        ruta="Nuevo Egreso de Grano"
        icono={<MovimientoIcono size={22} className="text-rose-600" />}
        volver={true}
        redireccionAnterior={-1}
      />

      <form onSubmit={handleSubmit} className="w-full mt-6 space-y-7 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
          {/* PANEL PRINCIPAL */}
          <div className={`xl:col-span-8 ${cardClasses}`}>
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
              <div className="w-11 h-11 rounded-md bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <ArrowUpRight size={20} />
              </div>

              <div>
                <h2 className="text-[22px] font-black text-slate-800">
                  Identificación del Egreso
                </h2>

                <p className="text-[14px] text-slate-500 font-medium">
                  Información principal del movimiento de salida
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">
              <div>
                <label className={labelClasses}>
                  <Calendar size={16} className="text-rose-600" />
                  Fecha
                </label>

                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <FileText size={16} className="text-rose-600" />
                  Lote
                </label>

                <SearchableSelect
                  options={opcionesLotes}
                  value={loteSeleccionado}
                  onChange={(e) => {
                    setLoteSeleccionado(e.target.value);
                    setKilos("");
                  }}
                  placeholder="Buscar lote..."
                  className="text-[15px] font-bold"
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <FileText size={16} className="text-rose-600" />
                  Etapa
                </label>

                <SearchableSelect
                  options={opcionesEtapas}
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value)}
                  className="text-[15px] font-bold"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClasses}>
                <User size={16} className="text-rose-600" />
                Cliente / Destinatario
              </label>

              <SearchableSelect
                options={opcionesClientes}
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                placeholder="Buscar cliente..."
                className="text-[15px] font-bold"
              />
            </div>

            {loteInfo && (
              <div className="mt-7 bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <Package size={18} className="text-rose-600" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      Información del Lote
                    </h3>

                    <p className="text-sm text-slate-500">
                      Datos actuales del stock seleccionado
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-md border border-slate-200 p-4">
                    <p className="text-xs uppercase font-semibold text-slate-500">
                      Especie
                    </p>

                    <p className="text-[15px] font-semibold text-slate-800 mt-1">
                      {loteInfo.materiaPrimaNombre?.toUpperCase()}
                    </p>
                  </div>

                  <div className="bg-white rounded-md border border-slate-200 p-4">
                    <p className="text-xs uppercase font-semibold text-slate-500">
                      Stock Disponible
                    </p>

                    <p className="text-lg font-bold text-rose-600 mt-1">
                      {loteInfo.stock} KG
                    </p>
                  </div>

                  <div className="bg-white rounded-md border border-slate-200 p-4">
                    <p className="text-xs uppercase font-semibold text-slate-500">
                      Ubicación
                    </p>

                    <p className="text-[15px] font-semibold text-slate-800 mt-1">
                      {loteInfo.depositoNombre?.toUpperCase()}
                    </p>
                  </div>

                  <div className="bg-white rounded-md border border-slate-200 p-4">
                    <p className="text-xs uppercase font-semibold text-slate-500">
                      Tipo Envase
                    </p>

                    <p className="text-[15px] font-semibold text-slate-800 mt-1">
                      {loteInfo.tipoEnvase}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className={`xl:col-span-4 ${cardClasses}`}>
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
              <div className="w-11 h-11 rounded-md bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                <Package size={20} />
              </div>

              <div>
                <h2 className="text-[20px] font-black text-slate-800">
                  Control de Stock
                </h2>

                <p className="text-[14px] text-slate-500 font-medium">
                  Validación automática
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className={labelClasses}>Kilos a Egresar</label>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  disabled={!loteSeleccionado}
                  value={kilos}
                  onChange={(e) => setKilos(e.target.value)}
                  className={`${inputClasses} text-xl font-semibold pr-16 ${
                    stockExcedido
                      ? "border-red-500 ring-4 ring-red-500/10 text-red-600"
                      : ""
                  }`}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  KG
                </div>
              </div>
            </div>

            {loteInfo && loteInfo.tipoEnvase !== "GRANEL" && (
              <div className="mt-6">
                <label className={labelClasses}>Cantidad de Envases</label>

                <input
                  type="number"
                  disabled
                  value={cantidadEnvases}
                  className={`${inputClasses} text-center font-semibold bg-slate-50`}
                />
              </div>
            )}

            {stockExcedido && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-5">
                <div className="flex items-start gap-3">
                  <Ban size={18} className="text-red-600 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Stock insuficiente
                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Está intentando egresar más kilos de los disponibles en el
                      lote.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loteSeleccionado && !stockExcedido && kilos && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-md p-5">
                <div className="flex items-start gap-3">
                  <CheckIcono size={15} className="text-emerald-600 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Movimiento válido
                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Stock restante estimado:{" "}
                      <span className="font-bold text-slate-800">
                        {(loteInfo?.stock - parseFloat(kilos)).toFixed(2)} KG
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LOGISTICA */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
            <div className="w-11 h-11 rounded-md bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Truck size={20} />
            </div>

            <div>
              <h2 className="text-[20px] font-black text-slate-800">
                Logística y Facturación
              </h2>

              <p className="text-[14px] text-slate-500 font-medium">
                Información complementaria del egreso
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">
            <div>
              <label className={labelClasses}>Chofer</label>

              <input
                type="text"
                placeholder="Nombre chofer..."
                value={chofer}
                onChange={(e) => setChofer(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Transporte</label>

              <input
                type="text"
                placeholder="Empresa transporte..."
                value={transporte}
                onChange={(e) => setTransporte(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Patente</label>

              <input
                type="text"
                placeholder="AA000AA"
                value={patente}
                onChange={(e) => setPatente(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Carta Porte</label>

              <input
                type="text"
                placeholder="Número..."
                value={cartaPorte}
                onChange={(e) => setCartaPorte(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Factura</label>

              <input
                type="text"
                placeholder="Referencia..."
                value={facturaRef}
                onChange={(e) => setFacturaRef(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Precio por KG</label>

              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={precioKg}
                onChange={(e) => setPrecioKg(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className={labelClasses}>Observaciones</label>

            <textarea
              placeholder="Observaciones generales..."
              rows={4}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className={`${inputClasses} resize-none`}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              guardando ||
              !clienteId ||
              !loteSeleccionado ||
              !kilos ||
              stockExcedido
            }
            className="px-7 py-3 rounded-md bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GuardarIcono size={15} />
            )}

            {guardando ? "Registrando..." : "Confirmar Egreso"}
          </button>
        </div>
      </form>
    </ContenedorSeccion>
  );
};

export default NuevoEgreso;
