import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrearEnvio } from "../../../Backend/Articulos/queries/Transporte/useTransporte";
import { useContactos } from "../../../Backend/Contactos/hooks/useContactos";
import { useAlertas } from "../../../store/useAlertas";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";
import SearchableSelect from "../../UI/Select/SearchableSelect";
import {
  Package,
  Truck,
  Landmark,
  Wallet,
  CheckSquare,
  Square,
  Clipboard,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { BalanceIcono, NuevoIcono } from "../../../assets/Icons";

const CrearGuia = () => {
  const navigate = useNavigate();
  const { mutate: crearEnvio, isPending: creando } = useCrearEnvio();
  const { contactos, cargandoContactos, crearContacto } = useContactos();
  const { agregarAlerta } = useAlertas();
  const usuario = useAuthStore((state) => state.usuario);
  const deudoresFletes =
    usuario?.configuracion?.cuentas?.deudoresFletes ||
    usuario?.configuracion?.cuentas?.codigoCuentaDeudor ||
    "1105";
  const ingresoFletes =
    usuario?.configuracion?.cuentas?.ingresoFletes ||
    usuario?.configuracion?.cuentas?.codigoCuentaIngreso ||
    "4108";

  const [formData, setFormData] = useState({
    codigoRemitente: "",
    codigoDestinatario: "",
    origen: "Córdoba",
    destino: "Villa María",
    descripcionPaquete: "",
    importe: "",
    formaPago: "CTA_CTE",
  });

  const [mismoCliente, setMismoCliente] = useState(true);

  // Estados para Registro de Clientes al vuelo
  const [remitenteNuevo, setRemitenteNuevo] = useState(false);
  const [destinatarioNuevo, setDestinatarioNuevo] = useState(false);

  const [nuevoRemitenteData, setNuevoRemitenteData] = useState({
    nombre: "",
    apellido: "",
    razonSocial: "",
    documento: "",
  });

  const [nuevoDestinatarioData, setNuevoDestinatarioData] = useState({
    nombre: "",
    apellido: "",
    razonSocial: "",
    documento: "",
  });

  const [registrandoClientes, setRegistrandoClientes] = useState(false);
  const [modalConfirmacionFactura, setModalConfirmacionFactura] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNuevoRemitenteChange = (campo, valor) => {
    setNuevoRemitenteData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleNuevoDestinatarioChange = (campo, valor) => {
    setNuevoDestinatarioData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSelectChange = (name, val) => {
    const actualValue =
      val && typeof val === "object" && "target" in val
        ? val.target.value
        : val;
    setFormData((prev) => {
      const updated = { ...prev, [name]: actualValue };
      // Si mismoCliente está activo y cambia el remitente, actualizar también el destinatario
      if (name === "codigoRemitente" && mismoCliente) {
        updated.codigoDestinatario = actualValue;
      }
      return updated;
    });
  };

  const handleToggleMismoCliente = () => {
    setMismoCliente((prev) => {
      const next = !prev;
      if (next) {
        setFormData((curr) => ({
          ...curr,
          codigoDestinatario: curr.codigoRemitente,
        }));
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones de Remitente
    if (remitenteNuevo) {
      const tieneIdentidad =
        nuevoRemitenteData.nombre.trim() ||
        nuevoRemitenteData.apellido.trim() ||
        nuevoRemitenteData.razonSocial.trim();
      if (!tieneIdentidad) {
        agregarAlerta({
          type: "error",
          message:
            "Debe ingresar al menos Nombre, Apellido o Razón Social para el nuevo remitente",
        });
        return;
      }
    } else {
      if (!formData.codigoRemitente) {
        agregarAlerta({
          type: "error",
          message: "Debe seleccionar un cliente / remitente obligatoriamente",
        });
        return;
      }
    }

    // Validaciones de Destinatario
    if (!mismoCliente) {
      if (destinatarioNuevo) {
        const tieneIdentidad =
          nuevoDestinatarioData.nombre.trim() ||
          nuevoDestinatarioData.apellido.trim() ||
          nuevoDestinatarioData.razonSocial.trim();
        if (!tieneIdentidad) {
          agregarAlerta({
            type: "error",
            message:
              "Debe ingresar al menos Nombre, Apellido o Razón Social para el nuevo destinatario",
          });
          return;
        }
      } else {
        if (!formData.codigoDestinatario) {
          agregarAlerta({
            type: "error",
            message: "Debe seleccionar un destinatario",
          });
          return;
        }
      }
    }

    if (!formData.origen || !formData.destino) {
      agregarAlerta({
        type: "error",
        message: "Debe especificar el origen y destino",
      });
      return;
    }

    if (!formData.importe || Number(formData.importe) <= 0) {
      agregarAlerta({
        type: "error",
        message: "El importe debe ser mayor a 0",
      });
      return;
    }

    setRegistrandoClientes(true);

    try {
      let remitenteIdFinal = null;
      let destinatarioIdFinal = null;
      let clientObj = null;

      // 1. Crear Remitente si es nuevo
      if (remitenteNuevo) {
        const nuevoClie = await crearContacto({
          tipoEntidad: "CLIE",
          nombre: nuevoRemitenteData.nombre,
          apellido: nuevoRemitenteData.apellido,
          razonSocial: nuevoRemitenteData.razonSocial,
          documento: nuevoRemitenteData.documento,
          condicionIva: "CF",
          atributos: { saldo: 0 },
          relaciones: [],
          enteFacturacion: null,
          activo: true,
        });
        remitenteIdFinal = nuevoClie.codigoSecuencial;
        clientObj = nuevoClie;
      } else {
        remitenteIdFinal = Number(formData.codigoRemitente);
        clientObj = contactos?.find((c) => Number(c.codigoSecuencial) === Number(remitenteIdFinal)) || null;
      }

      // 2. Definir Destinatario
      if (mismoCliente) {
        destinatarioIdFinal = remitenteIdFinal;
      } else {
        if (destinatarioNuevo) {
          const nuevoDest = await crearContacto({
            tipoEntidad: "CLIE",
            nombre: nuevoDestinatarioData.nombre,
            apellido: nuevoDestinatarioData.apellido,
            razonSocial: nuevoDestinatarioData.razonSocial,
            documento: nuevoDestinatarioData.documento,
            condicionIva: "CF",
            atributos: { saldo: 0 },
            relaciones: [],
            enteFacturacion: null,
            activo: true,
          });
          destinatarioIdFinal = nuevoDest.codigoSecuencial;
        } else {
          destinatarioIdFinal = Number(formData.codigoDestinatario);
        }
      }

      // 3. Crear Guía de Envío
      const payload = {
        codigoRemitente: remitenteIdFinal,
        codigoDestinatario: destinatarioIdFinal,
        origen: formData.origen,
        destino: formData.destino,
        descripcionPaquete: formData.descripcionPaquete || "Flete General",
        importe: Number(formData.importe),
        totalEnvio: Number(formData.importe), // duplicado para seguridad en backend
        formaPago: formData.formaPago,
        pesoKg: 1.0,
        cantidadBultos: 1,
        codigoCuentaDeudor: deudoresFletes,
        codigoCuentaIngreso: ingresoFletes,
      };

      crearEnvio(payload, {
        onSuccess: (resData) => {
          agregarAlerta({
            type: "success",
            message: "Guía de envío generada y registrada con éxito",
          });

          const formaPagoFinal = formData.formaPago;

          // Resetear formulario completo
          setFormData({
            codigoRemitente: "",
            codigoDestinatario: "",
            origen: "Córdoba",
            destino: "Villa María",
            descripcionPaquete: "",
            importe: "",
            formaPago: "CTA_CTE",
          });
          setNuevoRemitenteData({
            nombre: "",
            apellido: "",
            razonSocial: "",
            documento: "",
          });
          setNuevoDestinatarioData({
            nombre: "",
            apellido: "",
            razonSocial: "",
            documento: "",
          });
          setRemitenteNuevo(false);
          setDestinatarioNuevo(false);
          setMismoCliente(true);

          if (formaPagoFinal === "CONTADO") {
            setModalConfirmacionFactura({
              guiaId: resData?.codigoSecuencial || resData?.id || "N/A",
              origen: resData?.origen || payload.origen,
              destino: resData?.destino || payload.destino,
              descripcionPaquete: resData?.descripcionPaquete || payload.descripcionPaquete || "Flete General",
              importe: resData?.importe || payload.importe,
              cliente: clientObj,
            });
          }
        },
      });
    } catch (err) {
      console.error("Error al registrar cliente al vuelo:", err);
      agregarAlerta({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Ocurrió un error al registrar el cliente en el servidor",
      });
    } finally {
      setRegistrandoClientes(false);
    }
  };

  // Convertir contactos a formato SearchableSelect
  const opcionesContactos =
    contactos?.map((c) => ({
      value: c.codigoSecuencial,
      label: `${c.razonSocial || c.nombreCompleto || c.nombre + " " + (c.apellido || "")} - ${c.documento || "Sin Doc."}`,
    })) || [];

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta="CREAR GUÍA DE ENVÍO"
        icono={<NuevoIcono size={18} />}
      />
      <div className="w-full mx-auto p-2">
        {/* Tarjeta de Formulario con Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-md overflow-hidden p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Sección: Clientes */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-md p-5 flex flex-col gap-4">
              <h3 className="text-[12px] font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Package size={14} /> Clientes Asociados
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Remitente */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                      Cliente / Remitente{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1 bg-gray-200/50 p-0.5 rounded-md w-max">
                      <button
                        type="button"
                        onClick={() => setRemitenteNuevo(false)}
                        className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          !remitenteNuevo
                            ? "bg-white text-orange-600 shadow-sm border border-gray-200/50"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemitenteNuevo(true)}
                        className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          remitenteNuevo
                            ? "bg-white text-orange-600 shadow-sm border border-gray-200/50"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        + Nuevo
                      </button>
                    </div>
                  </div>

                  {!remitenteNuevo ? (
                    <SearchableSelect
                      options={opcionesContactos}
                      value={formData.codigoRemitente}
                      onChange={(val) =>
                        handleSelectChange("codigoRemitente", val)
                      }
                      placeholder="Escriba o seleccione remitente..."
                      disabled={cargandoContactos}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-orange-50/20 border border-orange-500/10 rounded-md animate-in fade-in duration-300 slide-in-from-top-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                          Nombres
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={nuevoRemitenteData.nombre}
                          onChange={(e) =>
                            handleNuevoRemitenteChange("nombre", e.target.value)
                          }
                          className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          placeholder="Apellido"
                          value={nuevoRemitenteData.apellido}
                          onChange={(e) =>
                            handleNuevoRemitenteChange(
                              "apellido",
                              e.target.value,
                            )
                          }
                          className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                          Razón Social
                        </label>
                        <input
                          type="text"
                          placeholder="Empresa (Opcional)"
                          value={nuevoRemitenteData.razonSocial}
                          onChange={(e) =>
                            handleNuevoRemitenteChange(
                              "razonSocial",
                              e.target.value,
                            )
                          }
                          className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm uppercase placeholder:normal-case"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                          Documento / CUIT
                        </label>
                        <input
                          type="text"
                          placeholder="DNI o CUIT"
                          value={nuevoRemitenteData.documento}
                          onChange={(e) =>
                            handleNuevoRemitenteChange(
                              "documento",
                              e.target.value,
                            )
                          }
                          className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkbox mismo cliente */}
                <button
                  type="button"
                  onClick={handleToggleMismoCliente}
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 w-max cursor-pointer select-none hover:text-orange-500 transition-colors py-1"
                >
                  {mismoCliente ? (
                    <CheckSquare size={18} className="text-orange-500" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <span>El destinatario es el mismo cliente remitente</span>
                </button>

                {/* Destinatario (Opcional si es distinto) */}
                {!mismoCliente && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-300 slide-in-from-top-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                        Destinatario <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-1 bg-gray-200/50 p-0.5 rounded-md w-max">
                        <button
                          type="button"
                          onClick={() => setDestinatarioNuevo(false)}
                          className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            !destinatarioNuevo
                              ? "bg-white text-orange-600 shadow-sm border border-gray-200/50"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Existente
                        </button>
                        <button
                          type="button"
                          onClick={() => setDestinatarioNuevo(true)}
                          className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            destinatarioNuevo
                              ? "bg-white text-orange-600 shadow-sm border border-gray-200/50"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          + Nuevo
                        </button>
                      </div>
                    </div>

                    {!destinatarioNuevo ? (
                      <SearchableSelect
                        options={opcionesContactos}
                        value={formData.codigoDestinatario}
                        onChange={(val) =>
                          handleSelectChange("codigoDestinatario", val)
                        }
                        placeholder="Seleccionar destinatario..."
                        disabled={cargandoContactos}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-orange-50/20 border border-orange-500/10 rounded-md animate-in fade-in duration-300 slide-in-from-top-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                            Nombres
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre"
                            value={nuevoDestinatarioData.nombre}
                            onChange={(e) =>
                              handleNuevoDestinatarioChange(
                                "nombre",
                                e.target.value,
                              )
                            }
                            className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                            Apellidos
                          </label>
                          <input
                            type="text"
                            placeholder="Apellido"
                            value={nuevoDestinatarioData.apellido}
                            onChange={(e) =>
                              handleNuevoDestinatarioChange(
                                "apellido",
                                e.target.value,
                              )
                            }
                            className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                            Razón Social
                          </label>
                          <input
                            type="text"
                            placeholder="Empresa (Opcional)"
                            value={nuevoDestinatarioData.razonSocial}
                            onChange={(e) =>
                              handleNuevoDestinatarioChange(
                                "razonSocial",
                                e.target.value,
                              )
                            }
                            className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm uppercase placeholder:normal-case"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                            Documento / CUIT
                          </label>
                          <input
                            type="text"
                            placeholder="DNI o CUIT"
                            value={nuevoDestinatarioData.documento}
                            onChange={(e) =>
                              handleNuevoDestinatarioChange(
                                "documento",
                                e.target.value,
                              )
                            }
                            className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Trayecto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                  Origen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  placeholder="Córdoba"
                  className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                  Destino <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  placeholder="Villa María"
                  className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Sección: Detalles de Carga */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clipboard size={14} /> Detalle / Descripción de la Carga
              </label>
              <input
                type="text"
                name="descripcionPaquete"
                value={formData.descripcionPaquete}
                onChange={handleChange}
                placeholder="Ej. Caja de repuestos, Sobre c/ documentación, Pack mercadería..."
                className="bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-500 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-medium text-gray-800 transition-all shadow-sm"
              />
            </div>

            {/* Sección: Importe y Pago */}
            <div className="bg-orange-50/20 border border-orange-500/10 rounded-md p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark size={14} className="text-orange-600" /> Importe de
                  la Guía ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-orange-600">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="importe"
                    value={formData.importe}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="bg-white border border-orange-500/20 hover:border-orange-500/40 focus:border-orange-500 rounded-md pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-black text-gray-800 transition-all shadow-sm w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={14} className="text-orange-600" /> Forma de Pago{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="formaPago"
                  value={formData.formaPago}
                  onChange={handleChange}
                  className="bg-white border border-orange-500/20 hover:border-orange-500/40 focus:border-orange-500 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-gray-800 transition-all shadow-sm w-full"
                >
                  <option value="CTA_CTE">A Cuenta Corriente</option>
                  <option value="CONTADO">Contado</option>
                </select>
              </div>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={creando || registrandoClientes}
              className="mt-2 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm uppercase tracking-widest rounded-md shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2.5 cursor-pointer"
            >
              {creando || registrandoClientes ? (
                <>Cargando Guía...</>
              ) : (
                <>
                  <Truck size={18} />
                  Generar y Registrar Guía
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Confirmación de Factura para Pago al Contado */}
      {modalConfirmacionFactura && (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-gray-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-500/10 to-transparent flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
                <FileText size={22} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-none">
                  ¿Desea facturar la guía?
                </h3>
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider mt-1">
                  Pago al contado registrado
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                La guía ha sido generada correctamente. ¿Desea proceder a emitir el comprobante de venta facturado en este momento?
              </p>

              {/* Tarjeta de Detalles */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Guía Nro:</span>
                  <span className="font-black text-slate-800">#{String(modalConfirmacionFactura.guiaId).padStart(6, "0")}</span>
                </div>

                {modalConfirmacionFactura.cliente && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Cliente:</span>
                    <span className="font-black text-slate-800 text-right truncate max-w-[200px]" title={modalConfirmacionFactura.cliente.razonSocial || `${modalConfirmacionFactura.cliente.nombre} ${modalConfirmacionFactura.cliente.apellido}`}>
                      {modalConfirmacionFactura.cliente.razonSocial || `${modalConfirmacionFactura.cliente.nombre} ${modalConfirmacionFactura.cliente.apellido}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Trayecto:</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    {modalConfirmacionFactura.origen}
                    <ArrowRight size={10} className="text-slate-400" />
                    {modalConfirmacionFactura.destino}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Detalle:</span>
                  <span className="font-medium text-slate-600 italic">"{modalConfirmacionFactura.descripcionPaquete}"</span>
                </div>

                <div className="h-px bg-gray-200/50 my-1" />

                <div className="flex justify-between items-center">
                  <span className="font-black text-orange-600 uppercase tracking-widest text-[10px]">Monto Total:</span>
                  <span className="font-black text-lg text-emerald-600">
                    {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(modalConfirmacionFactura.importe)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalConfirmacionFactura(null);
                  agregarAlerta({
                    type: "info",
                    message: "Guía guardada sin facturar.",
                  });
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                No, Salir
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/panel/ventas/comprobantes", {
                    state: {
                      origen: "TRANSPORTE_GUIAS",
                      formaPagoGuia: "CONTADO",
                      cliente: modalConfirmacionFactura.cliente,
                      itemsCobro: [
                        {
                          nombre: `Servicio Flete Guía #${String(modalConfirmacionFactura.guiaId).padStart(6, "0")}`,
                          descripcion: `Trayecto: ${modalConfirmacionFactura.origen} a ${modalConfirmacionFactura.destino} | Detalle: ${modalConfirmacionFactura.descripcionPaquete}`,
                          amount: modalConfirmacionFactura.importe,
                          cantidad: 1,
                          precioUnitario: modalConfirmacionFactura.importe,
                          tasaIva: 0,
                          codigoEnvio: modalConfirmacionFactura.guiaId,
                        }
                      ],
                      guiasIds: [modalConfirmacionFactura.guiaId],
                      importe: modalConfirmacionFactura.importe,
                    }
                  });
                  setModalConfirmacionFactura(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Sí, Facturar</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}
    </ContenedorSeccion>
  );
};

export default CrearGuia;
