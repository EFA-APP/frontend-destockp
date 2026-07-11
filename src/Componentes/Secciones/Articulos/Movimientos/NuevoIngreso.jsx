import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useObtenerMateriasPrimas } from "../../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI";
import { useCrearMovimiento } from "../../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import {
  GuardarIcono,
  MovimientosIcono,
  NuevoContactoIcono,
} from "../../../../assets/Icons";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import FormularioMateriaPrima from "../../../Modales/Articulos/FormularioMateriaPrima";

import {
  Building2,
  User,
  Package,
  Calendar,
  FileText,
  Truck,
  ArrowDownLeft,
} from "lucide-react";

import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import SearchableSelect from "../../../UI/Select/SearchableSelect";

const opcionesKgEnvase = [
  { value: "25", label: "25 kg" },
  { value: "50", label: "50 kg" },
  { value: "11.5", label: "11.5 kg" },
  { value: "22.7", label: "22.7 kg" },
  { value: "1000", label: "1000 kg" },
  { value: "800", label: "800 kg" },
  { value: "1250", label: "1250 kg" },
  { value: "850", label: "850 kg" },
  { value: "500", label: "500 kg" },
  { value: "560", label: "560 kg" },
  { value: "750", label: "750 kg" },
  { value: "657", label: "657 kg" },
  { value: "577", label: "577 kg" },
  { value: "966", label: "966 kg" },
  { value: "799", label: "799 kg" },
  { value: "839", label: "839 kg" },
  { value: "VARIOS", label: "VARIOS" },
];

const opcionesPanos = [
  { value: "AFUERA", label: "AFUERA" },
  { value: "SILO 1", label: "SILO 1" },
  { value: "SILO 2", label: "SILO 2" },
  { value: "SILO 3", label: "SILO 3" },
  { value: "D2", label: "D2" },

  ...Array.from({ length: 60 }, (_, i) => ({
    value: `PAÑO ${i + 1}`,
    label: `PAÑO ${i + 1}`,
  })),
];

const opcionesEtapas = [
  { value: "INGRESO", label: "INGRESO" },
  { value: "EN PROCESO", label: "EN PROCESO" },
  { value: "TERMINADO", label: "TERMINADO" },
  { value: "EGRESO", label: "EGRESO" },
  { value: "TERMINADO MOV. STOCK", label: "TERMINADO MOV. STOCK" },
];

const NuevoIngreso = () => {
  const navigate = useNavigate();

  const usuario = useAuthStore((state) => state.usuario);

  const { mutateAsync: crearMovimiento, isPending: guardando } =
    useCrearMovimiento();

  const { data: materiasPrimasRaw = [] } = useObtenerMateriasPrimas({});

  const { contactos = [] } = useContactos({ limite: 1000 });

  const { depositos = [] } = useDepositoUI();

  const materiasPrimas = useMemo(() => {
    return Array.isArray(materiasPrimasRaw)
      ? materiasPrimasRaw.filter((mp) => mp.activo)
      : Array.isArray(materiasPrimasRaw.data)
        ? materiasPrimasRaw.data.filter((mp) => mp.activo)
        : [];
  }, [materiasPrimasRaw]);

  const opcionesClientes = useMemo(() => {
    return (contactos || []).map((c) => {
      const nombreCompleto =
        c.razonSocial ||
        `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
        "Sin Nombre";

      return {
        value: String(c.codigo),
        label: `${nombreCompleto.toUpperCase()} ${
          c.documento ? `(${c.documento})` : ""
        }`,
      };
    });
  }, [contactos]);

  const opcionesEspecies = useMemo(() => {
    return materiasPrimas.map((mp) => ({
      value: String(mp.codigo),
      label: mp.nombre?.toUpperCase(),
    }));
  }, [materiasPrimas]);

  const opcionesGalpones = useMemo(() => {
    return depositos.map((d) => ({
      value: String(d.codigo),
      label: d.nombre?.toUpperCase(),
    }));
  }, [depositos]);

  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [clienteId, setClienteId] = useState("");
  const [mostrarFormularioContacto, setMostrarFormularioContacto] =
    useState(false);
  const [mostrarFormularioMateriaPrima, setMostrarFormularioMateriaPrima] =
    useState(false);
  const [especieId, setEspecieId] = useState("");
  const [lote, setLote] = useState("");
  const [etapa, setEtapa] = useState("INGRESO");

  useEffect(() => {
    if (!especieId || !clienteId) {
      setLote("");
      return;
    }

    const especieObj = materiasPrimas.find(
      (m) => String(m.codigo) === especieId,
    );

    const clienteObj = contactos.find(
      (c) => String(c.codigo) === String(clienteId),
    );

    const especieStr = (especieObj?.nombre || "ESPECIE")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);

    const clienteStr = (
      clienteObj?.razonSocial ||
      clienteObj?.nombre ||
      "CLIENTE"
    )
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);

    const anio = fecha
      ? new Date(fecha).getFullYear()
      : new Date().getFullYear();

    const randNum = Math.floor(1000 + Math.random() * 9000);

    setLote(`${especieStr}-${clienteStr}-${anio}-${randNum}`);
  }, [especieId, clienteId, fecha, materiasPrimas, contactos]);

  const [kilos, setKilos] = useState("");
  const [depositoId, setDepositoId] = useState("");
  const [pano, setPano] = useState("");

  const [tipoEnvase, setTipoEnvase] = useState("GRANEL");

  const [kgPorEnvase, setKgPorEnvase] = useState("");
  const [manualKgPorEnvase, setManualKgPorEnvase] = useState("");

  const [chofer, setChofer] = useState("");
  const [transporte, setTransporte] = useState("");
  const [patente, setPatente] = useState("");
  const [ctg, setCtg] = useState("");
  const [cartaPorte, setCartaPorte] = useState("");
  const [ticketBalanza, setTicketBalanza] = useState("");
  const [observacion, setObservacion] = useState("");

  const cantidadEnvases = useMemo(() => {
    if (tipoEnvase === "GRANEL") return 1;

    const k = parseFloat(kilos);

    const kp = parseFloat(
      kgPorEnvase === "VARIOS" ? manualKgPorEnvase : kgPorEnvase,
    );

    if (!isNaN(k) && !isNaN(kp) && kp > 0) {
      return Math.ceil(k / kp);
    }

    return "";
  }, [kilos, tipoEnvase, kgPorEnvase, manualKgPorEnvase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId || !especieId || !kilos || !depositoId) return;

    const clienteObj = contactos.find(
      (c) => String(c.codigo) === String(clienteId),
    );

    const depositoObj = depositos.find(
      (d) => String(d.codigo) === depositoId,
    );

    const payloadLogistico = {
      lote,
      cliente: clienteObj?.razonSocial || clienteObj?.nombre || "Sin Cliente",

      clienteId: clienteObj?.codigo,
      etapa,

      chofer,
      transporte,
      patente,
      ctg,
      cartaPorte,
      ticketBalanza,

      tipoEnvase,

      kgPorEnvase:
        tipoEnvase === "GRANEL"
          ? parseFloat(kilos)
          : kgPorEnvase === "VARIOS"
            ? parseFloat(manualKgPorEnvase || 0)
            : parseFloat(kgPorEnvase),

      cantidadEnvases: parseInt(cantidadEnvases || 1),

      nombreDeposito: depositoObj?.nombre || "Sin Galpón",

      depositoNombre: depositoObj?.nombre || "Sin Galpón",

      pano,
    };

    const payload = {
      codigoArticulo: parseInt(especieId),

      tipoArticulo: "MATERIA_PRIMA",

      tipoMovimiento: "INGRESO",

      origenMovimiento: "INGRESO_FRUTA_MP",

      cantidad: parseFloat(kilos),

      codigoDeposito: parseInt(depositoId),

      lote,

      observacion: `Galpón: ${
        depositoObj?.nombre || "Sin Galpón"
      } | Paño: ${pano || "Sin Paño"} - ${observacion || "Sin notas"}`,

      descripcion: JSON.stringify(payloadLogistico),

      codigoUsuario: usuario?.codigoUsuario || usuario?.id || 1,

      nombreUsuario: usuario?.nombre || "Sistema",
    };

    try {
      await crearMovimiento(payload);

      navigate("/panel/movimeintos/historial-movimeitnos");
    } catch (err) {
      console.error("Error al registrar ingreso:", err);
    }
  };

  const labelClasses =
    "text-sm font-semibold text-slate-700 uppercase mb-2 ml-0.5 flex items-center gap-2";

  const inputClasses =
    "w-full bg-blue-100/50 focus:bg-white border border-slate-300 rounded-md px-4 py-3 text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all";

  const cardClasses =
    "bg-[#fcfcfd] border border-slate-300/70 rounded-md p-7 shadow-sm hover:shadow-md transition-all duration-200";

  return (
    <>
      <ContenedorSeccion className="px-6 py-5 bg-[#f3f6f9] min-h-screen">
        <EncabezadoSeccion
          ruta="Nuevo Ingreso de Grano"
          icono={<MovimientosIcono size={22} className="text-blue-700" />}
          volver={true}
          redireccionAnterior={-1}
        />

        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-7 pb-24">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
            {/* PANEL PRINCIPAL */}
            <div className={`xl:col-span-8 ${cardClasses}`}>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
                <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                  <ArrowDownLeft size={20} />
                </div>

                <div>
                  <h2 className="text-[22px] font-black text-slate-800">
                    Información del Ingreso
                  </h2>

                  <p className="text-[14px] text-slate-500 font-medium">
                    Datos generales del ingreso de mercadería
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClasses}>
                    <Calendar size={16} className="text-blue-600" />
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
                    <FileText size={16} className="text-blue-600" />
                    Código de Lote
                  </label>

                  <input
                    type="text"
                    disabled
                    value={lote || "AUTOMÁTICO"}
                    className={`${inputClasses} bg-slate-100 font-mono font-semibold`}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <FileText size={16} className="text-blue-600" />
                    Etapa
                  </label>

                  <SearchableSelect
                    options={opcionesEtapas}
                    value={etapa}
                    onChange={(e) => setEtapa(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className={labelClasses}>
                  <User size={16} className="text-blue-600" />
                  Cliente / Remitente
                </label>

                <div className="flex gap-2 items-center w-full">
                  <div className="flex-grow min-w-0">
                    <SearchableSelect
                      className="w-full"
                      options={opcionesClientes}
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioContacto(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-md font-black text-[10px] border border-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer whitespace-nowrap h-[42px]"
                  >
                    <NuevoContactoIcono size={16} />+ Nuevo
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className={labelClasses}>
                  <Package size={16} className="text-blue-600" />
                  Especie
                </label>

                <div className="flex gap-2 items-center w-full">
                  <div className="flex-grow min-w-0">
                    <SearchableSelect
                      className="w-full"
                      options={opcionesEspecies}
                      value={especieId}
                      onChange={(e) => setEspecieId(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioMateriaPrima(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-md font-black text-[10px] border border-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer whitespace-nowrap h-[42px]"
                  >
                    <NuevoContactoIcono size={16} />+ Nuevo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={labelClasses}>
                    <Building2 size={16} className="text-blue-600" />
                    Paño / Sector
                  </label>

                  <SearchableSelect
                    options={opcionesPanos}
                    value={pano}
                    onChange={(e) => setPano(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    <Building2 size={16} className="text-blue-600" />
                    Ubicación
                  </label>

                  <SearchableSelect
                    options={opcionesGalpones}
                    value={depositoId}
                    onChange={(e) => setDepositoId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PANEL DERECHO */}
            <div className={`xl:col-span-4 ${cardClasses}`}>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
                <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                  <Package size={20} />
                </div>

                <div>
                  <h2 className="text-[20px] font-black text-slate-800">
                    Configuración de Carga
                  </h2>

                  <p className="text-[14px] text-slate-500 font-medium">
                    Peso y envases
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Kilos Netos</label>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={kilos}
                    onChange={(e) => setKilos(e.target.value)}
                    className={`${inputClasses} text-xl font-semibold pr-16`}
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    KG
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className={labelClasses}>Tipo de Envase</label>

                <div className="grid grid-cols-3 gap-2">
                  {["GRANEL", "BIG BAGS", "BOLSAS"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTipoEnvase(t);

                        if (t === "GRANEL") {
                          setKgPorEnvase("");
                        }
                      }}
                      className={`py-3 rounded-md border text-sm font-semibold transition-all ${
                        tipoEnvase === t
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tipoEnvase !== "GRANEL" && (
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div>
                    <label className={labelClasses}>Kg por Envase</label>

                    <SearchableSelect
                      options={opcionesKgEnvase}
                      value={kgPorEnvase}
                      onChange={(e) => {
                        setKgPorEnvase(e.target.value);

                        if (e.target.value !== "VARIOS") {
                          setManualKgPorEnvase("");
                        }
                      }}
                    />

                    {kgPorEnvase === "VARIOS" && (
                      <input
                        type="number"
                        required
                        placeholder="Ingrese KG..."
                        value={manualKgPorEnvase}
                        onChange={(e) => setManualKgPorEnvase(e.target.value)}
                        className={`${inputClasses} mt-3`}
                      />
                    )}
                  </div>

                  <div>
                    <label className={labelClasses}>Cantidad de Envases</label>

                    <input
                      type="number"
                      disabled
                      value={cantidadEnvases}
                      className={`${inputClasses} bg-slate-100 font-semibold text-center`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TRANSPORTE */}
          <div className={cardClasses}>
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200 mb-6">
              <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                <Truck size={20} />
              </div>

              <div>
                <h2 className="text-[20px] font-black text-slate-800">
                  Logística y Transporte
                </h2>

                <p className="text-[14px] text-slate-500 font-medium">
                  Información opcional de traslado
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>Nombre Chofer</label>

                <input
                  type="text"
                  value={chofer}
                  onChange={(e) => setChofer(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Empresa Transporte</label>

                <input
                  type="text"
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  placeholder="Ej: Transporte SRL"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Patente</label>

                <input
                  type="text"
                  value={patente}
                  onChange={(e) => setPatente(e.target.value)}
                  placeholder="AA123BB"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div>
                <label className={labelClasses}>Código CTG</label>

                <input
                  type="text"
                  value={ctg}
                  onChange={(e) => setCtg(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Carta de Porte</label>

                <input
                  type="text"
                  value={cartaPorte}
                  onChange={(e) => setCartaPorte(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Ticket Balanza</label>

                <input
                  type="text"
                  value={ticketBalanza}
                  onChange={(e) => setTicketBalanza(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className={labelClasses}>Observaciones</label>

              <textarea
                rows={4}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escriba observaciones..."
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
                guardando || !clienteId || !especieId || !kilos || !depositoId
              }
              className="px-7 py-3 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GuardarIcono size={15} />
              )}

              {guardando ? "Registrando..." : "Confirmar Ingreso"}
            </button>
          </div>
        </form>
      </ContenedorSeccion>
      {/* MODAL: CREAR CONTACTO RÁPIDO */}
      {mostrarFormularioContacto && (
        <FormularioContacto
          entidad={{ clave: "CLIENTES", nombre: "CLIENTES" }}
          posicion="centro"
          onClose={() => setMostrarFormularioContacto(false)}
          onExito={(nuevo) => {
            setClienteId(String(nuevo.codigo));
            setMostrarFormularioContacto(false);
          }}
        />
      )}
      {/* MODAL: CREAR ESPECIE RÁPIDA */}
      {mostrarFormularioMateriaPrima && (
        <FormularioMateriaPrima
          posicion="centro"
          onClose={() => setMostrarFormularioMateriaPrima(false)}
          onExito={(nuevo) => {
            setEspecieId(String(nuevo.codigo));
            setMostrarFormularioMateriaPrima(false);
          }}
        />
      )}
    </>
  );
};

export default NuevoIngreso;
