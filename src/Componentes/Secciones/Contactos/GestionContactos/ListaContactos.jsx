import React, { useState } from "react";
import FormularioContacto from "./FormularioContacto";
import DetallesContacto from "./DetallesContacto";
import BreadcrumbFicha from "../Relaciones/BreadcrumbFicha";
import {
  AdvertenciaIcono,
  AgregarIcono,
  BorrarIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import {
  Edit2,
  Search,
  X,
  Package,
  Star,
  Mail,
  Building2,
  Briefcase,
} from "lucide-react";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { useAlertas } from "../../../../store/useAlertas";
import { useActualizarContactoInline } from "../../../../Backend/Contactos/hooks/useActualizarContactoInline";

// Componente Interno para Asignar Ente de Facturación
export const InlineEnteFacturacion = ({ contacto, onActualizar }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const { entidades } = useEntidades();
  const [tipoEntidadSeleccionada, setTipoEntidadSeleccionada] = useState("");
  const { contactos: listaEntes, cargandoContactos: cargandoEntes } =
    useContactos({
      tipoEntidad: tipoEntidadSeleccionada,
    });

  const handleSelectEnte = async (e) => {
    const codSecuencial = e.target.value;
    const enteSeleccionado = listaEntes.find(
      (c) => String(c.codigo) === String(codSecuencial),
    );
    if (enteSeleccionado) {
      await onActualizar(contacto.codigo, {
        enteFacturacion: enteSeleccionado,
      });
    }
    setModoEdicion(false);
  };

  const handleRemoverEnte = async (e) => {
    e.stopPropagation();
    await onActualizar(contacto.codigo, {
      enteFacturacion: null,
    });
  };

  if (!modoEdicion) {
    if (contacto.enteFacturacion) {
      return (
        <div className="flex items-center gap-2 group w-full">
          <div
            className="cursor-pointer flex-1 truncate max-w-[150px] md:max-w-[200px]"
            onClick={() => setModoEdicion(true)}
          >
            <span className="text-[12px] font-semibold text-[#1FAE6D] uppercase border-b border-dashed border-[#1FAE6D]/30 hover:border-[#1FAE6D] transition-colors">
              {contacto.enteFacturacion.razonSocial ||
                `${contacto.enteFacturacion.nombre} ${contacto.enteFacturacion.apellido}`}
            </span>
          </div>
          <button
            onClick={handleRemoverEnte}
            className="p-1.5 text-[#EF5A5A] border border-gray-200 bg-white hover:bg-gray-50 rounded-md transition-all cursor-pointer shadow-sm"
            title="Remover Ente"
          >
            <X size={14} />
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => setModoEdicion(true)}
        className="px-3 py-1.5 text-[10px] font-bold uppercase border border-dashed border-[#1FAE6D]/50 text-[#1FAE6D] rounded-md hover:bg-[#E8F7EF] transition-colors shadow-sm cursor-pointer"
      >
        Asignar Ente
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 min-w-[220px] p-4 bg-[#FFFFFF] border border-[#E9EDEC] rounded-md shadow-sm absolute z-50 bottom-full mb-2 md:bottom-auto md:mb-0 md:mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-bold uppercase text-[#6B7472] tracking-widest">
          Asignar Ente
        </span>
        <button
          onClick={() => setModoEdicion(false)}
          className="text-[#6B7472] hover:text-[#EF5A5A] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-3">
        <select
          value={tipoEntidadSeleccionada}
          onChange={(e) => setTipoEntidadSeleccionada(e.target.value)}
          className="w-full text-[12px] p-2 bg-[#F5F7F6] border border-[#E9EDEC] rounded-md uppercase font-semibold text-[#1A1D1C] outline-none focus:border-[#1FAE6D] transition-all cursor-pointer"
        >
          <option value="">Categoría...</option>
          {entidades.map((ent) => (
            <option key={ent.clave} value={ent.clave}>
              {ent.nombre}
            </option>
          ))}
        </select>

        {tipoEntidadSeleccionada && (
          <div className="relative">
            <SearchableSelect
              options={(listaEntes || []).map((c) => ({
                value: String(c.codigo),
                label: (
                  c.razonSocial || `${c.nombre} ${c.apellido}`
                ).toUpperCase(),
              }))}
              value={""}
              onChange={handleSelectEnte}
              placeholder={
                cargandoEntes ? "Cargando..." : "Buscar responsable..."
              }
              className="w-full shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Interno para Edición en Línea de Identidad
const InlineIdentidad = ({ contacto, onActualizar }) => {
  const { agregarAlerta } = useAlertas();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: contacto.nombre || "",
    apellido: contacto.apellido || "",
    razonSocial: contacto.razonSocial || "",
    documento: contacto.documento || "",
    correoElectronico: contacto.correoElectronico || "",
  });

  const handleGuardar = async () => {
    if (form.correoElectronico) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correoElectronico.trim())) {
        agregarAlerta({
          title: "Correo Inválido",
          message:
            "El correo electrónico ingresado no tiene un formato válido.",
          type: "warning",
        });
        return;
      }
    }

    // Solo actualizar si hubo cambios
    if (
      form.nombre !== (contacto.nombre || "") ||
      form.apellido !== (contacto.apellido || "") ||
      form.razonSocial !== (contacto.razonSocial || "") ||
      form.documento !== (contacto.documento || "") ||
      form.correoElectronico !== (contacto.correoElectronico || "")
    ) {
      await onActualizar(contacto.codigo, {
        ...form,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuardar();
    if (e.key === "Escape") setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 min-w-[280px] p-4 bg-[#FFFFFF] border border-[#1FAE6D] rounded-md shadow-sm absolute z-50 left-0 top-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold uppercase text-[#1FAE6D] tracking-widest">
            Editar Identidad
          </span>
          <button
            onClick={() => setIsEditing(false)}
            className="text-[#6B7472] hover:text-[#EF5A5A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <input
          autoFocus
          placeholder="Razón Social (Opcional)"
          value={form.razonSocial}
          onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#F5F7F6] border border-[#E9EDEC] rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-[#1FAE6D] uppercase text-[#1A1D1C] transition-colors"
        />
        <div className="flex gap-2">
          <input
            placeholder="Nombres"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#F5F7F6] border border-[#E9EDEC] rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-[#1FAE6D] uppercase text-[#1A1D1C] transition-colors"
          />
          <input
            placeholder="Apellidos"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#F5F7F6] border border-[#E9EDEC] rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-[#1FAE6D] uppercase text-[#1A1D1C] transition-colors"
          />
        </div>
        <input
          placeholder="DNI / CUIT"
          value={form.documento}
          onChange={(e) => setForm({ ...form, documento: e.target.value })}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#F5F7F6] border border-[#E9EDEC] rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-[#1FAE6D] uppercase text-[#1A1D1C] transition-colors"
        />
        <input
          placeholder="Correo Electrónico (Opcional)"
          value={form.correoElectronico}
          onChange={(e) =>
            setForm({ ...form, correoElectronico: e.target.value })
          }
          onKeyDown={handleKeyDown}
          className="w-full bg-[#F5F7F6] border border-[#E9EDEC] rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-[#1FAE6D] text-[#1A1D1C] transition-colors"
        />

        <button
          onClick={handleGuardar}
          className="w-full py-2.5 mt-2 bg-[#1FAE6D] text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-[#178F58] transition-all cursor-pointer shadow-sm"
        >
          Guardar Cambios
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-1 mt-1 cursor-pointer group px-2 py-1.5 border border-transparent hover:bg-[#F5F7F6] rounded-md transition-colors"
      onClick={() => setIsEditing(true)}
      title="Clic para editar"
    >
      <span className="text-[14px] font-bold text-[#1A1D1C] group-hover:text-[#1FAE6D] transition-colors">
        {contacto.razonSocial?.toUpperCase() ||
          `${contacto.nombre?.toUpperCase()} ${contacto.apellido?.toUpperCase()}`.trim()}
        {!contacto.razonSocial && !contacto.nombre && (
          <span className="italic text-[#9CA5A2] text-[12px] font-medium">
            Sin Nombre
          </span>
        )}
      </span>
    </div>
  );
};

// Componente Interno para Edición en Línea de Atributos
export const InlineAtributo = ({ contacto, conf, onActualizar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const valorActual = contacto.atributos?.[conf.claveCampo] ?? "";
  const [valor, setValor] = useState(valorActual);

  React.useEffect(() => {
    setValor(contacto.atributos?.[conf.claveCampo] ?? "");
  }, [contacto.atributos, conf.claveCampo]);

  const handleGuardar = async () => {
    if (valor !== valorActual) {
      const nuevoValor =
        conf.tipoDato === "NUMERO"
          ? valor === ""
            ? ""
            : Number(valor)
          : valor;
      await onActualizar(contacto.codigo, {
        atributos: {
          ...(contacto.atributos || {}),
          [conf.claveCampo]: nuevoValor,
        },
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuardar();
    if (e.key === "Escape") {
      setValor(valorActual);
      setIsEditing(false);
    }
  };

  if (conf.tipoDato === "BOOLEANO") {
    const isTrue = valorActual === true;
    return (
      <button
        onClick={async () => {
          await onActualizar(contacto.codigo, {
            atributos: {
              ...(contacto.atributos || {}),
              [conf.claveCampo]: !isTrue,
            },
          });
        }}
        className={`px-3 py-1 rounded-md border text-[10px] font-black uppercase transition-all shadow-sm ${isTrue ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"}`}
      >
        {isTrue ? "SÍ" : "NO"}
      </button>
    );
  }

  if (conf.tipoDato === "LISTA") {
    return (
      <select
        value={valorActual}
        onChange={async (e) => {
          await onActualizar(contacto.codigo, {
            atributos: {
              ...(contacto.atributos || {}),
              [conf.claveCampo]: e.target.value,
            },
          });
        }}
        className="bg-transparent text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer border-b border-dashed border-[var(--text-muted)] hover:border-[var(--primary)] transition-colors uppercase w-full py-0.5"
      >
        <option value="">--</option>
        {(conf.opciones || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        type={conf.tipoDato === "NUMERO" ? "number" : "text"}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={handleGuardar}
        onKeyDown={handleKeyDown}
        className="w-full min-w-[100px] bg-[#FFFFFF] border border-[#1FAE6D] rounded-md px-3 py-1.5 text-[12px] font-medium outline-none shadow-sm text-[#1A1D1C] transition-all"
      />
    );
  }

  return (
    <div
      className="min-h-[28px] w-full flex items-center cursor-pointer px-2 py-1 border border-transparent hover:bg-[#F5F7F6] rounded-md transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <span className="text-[13px] font-semibold text-[#1A1D1C] truncate group-hover:text-[#1FAE6D]">
        {valorActual !== "" && valorActual !== null ? (
          String(valorActual).toUpperCase()
        ) : (
          <span className="text-[11px] text-[#9CA5A2] italic font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Editar...
          </span>
        )}
      </span>
    </div>
  );
};

const ListaContactos = ({
  entidad,
  contactos,
  cargando,
  filtros,
  setFiltros,
  total,
  paginas,
  eliminarContacto,
  // Feature 33 (contactos-relaciones-ui): "contacto en foco" y la pila de
  // breadcrumb ahora se gestionan en el padre (DashboardContactos.jsx,
  // design.md §1.4, §3.1/§3.2). Este componente deja de gestionar
  // contactoDetalle como estado interno.
  contactoEnFoco,
  cargandoContactoEnFoco,
  fichaAbierta,
  pilaBreadcrumb,
  onAbrirFicha,
  onVolverA,
  onCerrarFicha,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contactoEditar, setContactoEditar] = useState(null);
  const [contactoAEliminar, setContactoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);

  const { configs } = useConfiguracionContactos();
  const { actualizarContactoInline: handleActualizarContactoInline } =
    useActualizarContactoInline();
  const { agregarAlerta } = useAlertas();

  // Filtrar los atributos que corresponden a esta entidad
  const configsEntidad = React.useMemo(() => {
    return configs.filter((c) => c.entidadClave === entidad?.clave);
  }, [configs, entidad?.clave]);

  // Debounce para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, busqueda: busquedaLocal, pagina: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaLocal, setFiltros]);

  const handleEditar = (contacto) => {
    setContactoEditar(contacto);
    setMostrarFormulario(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!contactoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarContacto(contactoAEliminar.codigo);
      // Si el contacto eliminado era el que estaba en foco (Ficha abierta),
      // cerramos la ficha y vaciamos el breadcrumb (evita mostrar la ficha
      // de un contacto recién desactivado).
      if (contactoAEliminar.codigo === contactoEnFoco?.codigo) {
        onCerrarFicha?.();
      }
      setContactoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      // Feature 15 (validar-deuda-antes-desactivar-contacto): el backend
      // (contacto-ms) ahora puede rechazar la baja con un mensaje concreto
      // ("No se puede dar de baja: el contacto tiene $X de saldo pendiente
      // en Y comprobante(s).") -- se muestra tal cual en vez del genérico.
      agregarAlerta({
        type: "error",
        title: "No se pudo eliminar el contacto",
        message:
          error?.response?.data?.message ||
          "No se pudo eliminar el contacto. Intente nuevamente.",
        autoDismiss: false,
      });
    } finally {
      setEliminando(false);
    }
  };

  // R20 (design.md §3.1, "Nota de ancho"): cuando hay una Ficha abierta (y
  // no se está editando/creando un contacto en el panel lateral clásico),
  // el listado central se OCULTA (no se desmonta, para no perder filtros ni
  // paginación) y la Ficha ocupa el ancho completo disponible.
  const ocultarListadoCentral = fichaAbierta && !mostrarFormulario;

  return (
    <div className="flex h-full overflow-hidden bg-transparent">
      {/* COLUMNA CENTRAL: Lista de Contactos (oculta, no desmontada, cuando hay Ficha abierta) */}
      <div
        className={`${ocultarListadoCentral ? "hidden" : "flex"} flex-col flex-1 bg-transparent overflow-hidden min-w-[320px]`}
      >
        {/* Encabezado y Búsqueda */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[13px] font-black uppercase text-gray-900 tracking-widest">
              {entidad ? entidad.nombre : "Contactos"}
            </h2>
            <TieneAccion accion="CREAR_CONTACTO">
              <button
                onClick={() => {
                  setContactoEditar(null);
                  setMostrarFormulario(true);
                }}
                className="bg-[#1FAE6D] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-md hover:bg-[#178F58] flex items-center gap-2 transition-all cursor-pointer"
              >
                <AgregarIcono size={14} /> Crear Contacto
              </button>
            </TieneAccion>
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[#1FAE6D]/20 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar contactos..."
              className="bg-transparent border-none outline-none text-[13px] font-medium py-2 px-3 w-full text-gray-900"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal("")}
                className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {cargando ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-md animate-pulse mb-1"
              />
            ))
          ) : contactos.length > 0 ? (
            contactos.map((fila) => {
              const isSelected = contactoEnFoco?.codigo === fila.codigo;
              const avatarInitial = fila.nombre
                ? fila.nombre.charAt(0)
                : fila.razonSocial
                  ? fila.razonSocial.charAt(0)
                  : "?";
              return (
                <div
                  key={fila.codigo}
                  onClick={() => onAbrirFicha?.(fila, { raiz: true })}
                  className={`flex items-center gap-4 p-4 rounded-md cursor-pointer transition-all border ${isSelected ? "bg-[#F1FAF5] border-[#1FAE6D]/30" : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E9EDEC] flex items-center justify-center text-[#1FAE6D] font-black text-lg shrink-0 uppercase shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    {avatarInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-[14px] font-semibold truncate ${isSelected ? "text-[#178F58]" : "text-[#1A1D1C]"}`}
                    >
                      {fila.razonSocial ||
                        `${fila.nombre || ""} ${fila.apellido || ""}`.trim() ||
                        "Sin Nombre"}
                    </h4>
                    <p className="text-[12px] text-[#6B7472] font-medium truncate mt-0.5">
                      {entidad?.nombre || "Contacto"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-[10px] font-bold uppercase flex items-center justify-center text-gray-500 hover:text-yellow-600 transition-colors shadow-sm cursor-pointer">
                      <Star size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactoAEliminar(fila);
                      }}
                      className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-[10px] font-bold uppercase flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
                    >
                      <BorrarIcono size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-10">
              <Package size={40} className="mb-3 opacity-20" />
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-500">
                No se encontraron contactos
              </span>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:block">
            Total: {total}
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={filtros.pagina <= 1}
              onClick={() =>
                setFiltros((p) => ({ ...p, pagina: p.pagina - 1 }))
              }
              className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 cursor-pointer shadow-sm transition-all text-gray-700"
            >
              Ant
            </button>
            <span className="text-[11px] font-black px-2">
              {filtros.pagina} / {paginas || 1}
            </span>
            <button
              disabled={filtros.pagina >= paginas}
              onClick={() =>
                setFiltros((p) => ({ ...p, pagina: p.pagina + 1 }))
              }
              className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30 cursor-pointer shadow-sm transition-all text-gray-700"
            >
              Sig
            </button>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Formulario (alta/edición) o Ficha del Contacto (R19-R21, R54) */}
      {mostrarFormulario ? (
        <div className="w-full md:w-[450px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right-4 duration-300">
          <FormularioContacto
            inline={true}
            entidad={entidad}
            contacto={contactoEditar}
            onClose={() => {
              setMostrarFormulario(false);
              setContactoEditar(null);
            }}
          />
        </div>
      ) : fichaAbierta ? (
        <div className="flex-1 bg-white border-l border-gray-200 flex flex-col overflow-hidden min-w-[320px] animate-in slide-in-from-right-4 duration-300">
          {/* Breadcrumb (R21) */}
          <div className="px-4 pt-3 border-b border-gray-200 bg-gray-50/50">
            <BreadcrumbFicha pila={pilaBreadcrumb} onVolverA={onVolverA} />
          </div>

          {!contactoEnFoco ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10">
              <div className="w-8 h-8 border-2 border-[#1FAE6D]/30 border-t-[#1FAE6D] rounded-full animate-spin" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                {cargandoContactoEnFoco
                  ? "Cargando ficha..."
                  : "Contacto no encontrado"}
              </span>
            </div>
          ) : (
            <>
              <div className="p-4 flex justify-between items-center bg-[#FFFFFF] border-b border-[#E9EDEC]">
                <h3 className="text-[13px] font-bold text-[#6B7472] uppercase tracking-wider">
                  Detalles del Contacto
                </h3>
                <button
                  onClick={() => onCerrarFicha?.()}
                  className="p-2 text-[#6B7472] hover:text-[#1A1D1C] hover:bg-[#F5F7F6] rounded-[10px] transition-all cursor-pointer"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar max-w-3xl gap-6 bg-[#F8FAFC]">
                {/* Card de Identidad */}
                <div className="bg-white p-5 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-200 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#F1FAF5] border border-[#1FAE6D]/20 flex items-center justify-center text-[#1FAE6D] font-black text-2xl uppercase shadow-sm shrink-0">
                    {contactoEnFoco.nombre
                      ? contactoEnFoco.nombre.charAt(0)
                      : contactoEnFoco.razonSocial
                        ? contactoEnFoco.razonSocial.charAt(0)
                        : "?"}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <InlineIdentidad
                      contacto={contactoEnFoco}
                      onActualizar={handleActualizarContactoInline}
                    />
                    <p className="text-[12px] font-medium text-[#6B7472]">
                      {contactoEnFoco.tipoEntidad ||
                        entidad?.nombre ||
                        "Contacto"}
                    </p>
                  </div>
                </div>

                {/* Card Datos Fiscales/Contacto */}
                <div className="bg-white p-5 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-200 flex flex-col gap-5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-1">
                    Contacto y Facturación
                  </h4>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-medium text-[#6B7472] flex items-center gap-1.5">
                        <Mail size={14} className="opacity-70" /> Correo
                        Electrónico
                      </span>
                      <span className="text-[13px] font-semibold text-[#1A1D1C]">
                        {contactoEnFoco.correoElectronico || "-"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-medium text-[#6B7472] flex items-center gap-1.5">
                        <Building2 size={14} className="opacity-70" /> DNI /
                        CUIT
                      </span>
                      <span className="text-[13px] font-semibold text-[#1A1D1C]">
                        {contactoEnFoco.documento || "-"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-medium text-[#6B7472] flex items-center gap-1.5">
                        <Briefcase size={14} className="opacity-70" />{" "}
                        Facturación
                      </span>
                      <InlineEnteFacturacion
                        contacto={contactoEnFoco}
                        onActualizar={handleActualizarContactoInline}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Atributos Dinámicos */}
                {configsEntidad.length > 0 && (
                  <div className="bg-white p-5 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-200 flex flex-col gap-5">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2 mb-1">
                      Información Adicional
                    </h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      {configsEntidad.map((conf) => (
                        <div
                          key={conf.claveCampo}
                          className="flex flex-col gap-1.5"
                        >
                          <span className="text-[11px] font-medium text-[#6B7472]">
                            {conf.nombreCampo}
                          </span>
                          <InlineAtributo
                            contacto={contactoEnFoco}
                            conf={conf}
                            onActualizar={handleActualizarContactoInline}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Action Buttons */}
              <div className="p-5 border-t border-gray-200 bg-white flex gap-4">
                <button
                  onClick={() => handleEditar(contactoEnFoco)}
                  className="flex-1 py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Editar Completo
                </button>
                <button
                  onClick={() => setContactoAEliminar(contactoEnFoco)}
                  className="px-5 py-3 text-[#EF5A5A] bg-[#EF5A5A]/5 border border-[#EF5A5A]/20 text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-[#EF5A5A]/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <BorrarIcono size={16} />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex w-[450px] bg-gray-50 border border-dashed border-gray-200 rounded-md flex-col items-center justify-center shrink-0">
          <CuentaIcono
            size={64}
            className="mb-4 text-gray-400 opacity-20"
          />
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[var(--color-neutral-text-muted)]">
            Seleccioná un Contacto
          </h3>
          <p className="text-[12px] font-medium text-[var(--color-neutral-text-muted)] mt-2">
            Para ver sus detalles aquí
          </p>
        </div>
      )}

      {/* MODALES EXTERNOS */}

      {contactoAEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-md max-w-md w-full p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm">
                <AdvertenciaIcono size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tighter text-[var(--color-neutral-text-main)]">
                  ¿Eliminar Contacto?
                </h3>
                <p className="text-[13px] text-[var(--color-neutral-text-muted)] font-medium leading-relaxed tracking-wide">
                  Estás por desactivar a{" "}
                  <span className="text-[var(--color-neutral-text-main)] font-bold">
                    {contactoAEliminar.razonSocial ||
                      `${contactoAEliminar.nombre || ""} ${contactoAEliminar.apellido || ""}`}
                  </span>
                  . Esta acción ocultará al contacto de las listas activas pero
                  mantendrá su historial.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setContactoAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-md bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-md bg-[#EF5A5A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {eliminando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BorrarIcono size={14} />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaContactos;
