import React, { useState } from "react";
import FormularioContacto from "./FormularioContacto";
import DetallesContacto from "./DetallesContacto";
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

// Componente Interno para Asignar Ente de Facturación
const InlineEnteFacturacion = ({ contacto, onActualizar }) => {
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
      (c) => String(c.codigoSecuencial) === String(codSecuencial),
    );
    if (enteSeleccionado) {
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
        enteFacturacion: enteSeleccionado,
      });
    }
    setModoEdicion(false);
  };

  const handleRemoverEnte = async (e) => {
    e.stopPropagation();
    await onActualizar(contacto.codigoSecuencial, {
      ...contacto,
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
            <span className="text-[11px] font-bold text-[var(--primary)] uppercase border-b border-dashed border-[var(--primary)]/30 hover:border-[var(--primary)] transition-colors">
              {contacto.enteFacturacion.razonSocial ||
                `${contacto.enteFacturacion.nombre} ${contacto.enteFacturacion.apellido}`}
            </span>
          </div>
          <button
            onClick={handleRemoverEnte}
            className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
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
        className="px-2 py-1 text-[10px] font-bold uppercase border border-dashed border-[var(--primary)]/50 text-[var(--primary)] rounded hover:bg-[var(--primary)]/10 transition-colors shadow-sm"
      >
        Asignar Ente
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 min-w-[220px] p-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-2xl absolute z-50 bottom-full mb-2 md:bottom-auto md:mb-0 md:mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
          Asignar Ente
        </span>
        <button
          onClick={() => setModoEdicion(false)}
          className="text-gray-400 hover:text-rose-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <select
          value={tipoEntidadSeleccionada}
          onChange={(e) => setTipoEntidadSeleccionada(e.target.value)}
          className="w-full text-[11px] p-2 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded uppercase font-bold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
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
                value: String(c.codigoSecuencial),
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
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
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
      <div className="flex flex-col gap-2 min-w-[280px] p-3 bg-[var(--surface)] border border-[var(--primary)] rounded-md shadow-xl absolute z-50 left-0 top-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-black uppercase text-[var(--primary)] tracking-widest">
            Editar Identidad
          </span>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <input
          autoFocus
          placeholder="Razón Social (Opcional)"
          value={form.razonSocial}
          onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
          onKeyDown={handleKeyDown}
          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
        />
        <div className="flex gap-2">
          <input
            placeholder="Nombres"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
          />
          <input
            placeholder="Apellidos"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
          />
        </div>
        <input
          placeholder="DNI / CUIT"
          value={form.documento}
          onChange={(e) => setForm({ ...form, documento: e.target.value })}
          onKeyDown={handleKeyDown}
          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
        />
        <input
          placeholder="Correo Electrónico (Opcional)"
          value={form.correoElectronico}
          onChange={(e) =>
            setForm({ ...form, correoElectronico: e.target.value })
          }
          onKeyDown={handleKeyDown}
          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
        />

        <button
          onClick={handleGuardar}
          className="w-full py-2 mt-1 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded hover:brightness-110 transition-all cursor-pointer"
        >
          Guardar Cambios
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-1 mt-1 cursor-pointer group px-1.5 py-1 border border-transparent hover:border-dashed hover:border-[var(--primary)]/50 rounded transition-colors"
      onClick={() => setIsEditing(true)}
      title="Clic para editar"
    >
      <span className="text-[13px] font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
        {contacto.razonSocial?.toUpperCase() ||
          `${contacto.nombre?.toUpperCase()} ${contacto.apellido?.toUpperCase()}`}
        {!contacto.razonSocial && !contacto.nombre && (
          <span className="italic text-[var(--text-muted)] text-[11px]">
            Sin Nombre
          </span>
        )}
      </span>
      <div className="flex items-center gap-1.5 opacity-60">
        <span className="text-[10px] font-black uppercase tracking-wider">
          {contacto.documento ? "DNI/CUIT:" : ""}
        </span>
        <span className="text-[11px] font-medium">
          {contacto.documento || <span className="italic text-[9px]">S/D</span>}
        </span>
      </div>
      {contacto.correoElectronico && (
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[10px] font-black uppercase tracking-wider">
            EMAIL:
          </span>
          <span className="text-[11px] font-medium text-[var(--text-primary)] lowercase">
            {contacto.correoElectronico}
          </span>
        </div>
      )}
    </div>
  );
};

// Componente Interno para Edición en Línea de Atributos
const InlineAtributo = ({ contacto, conf, onActualizar }) => {
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
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
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
          await onActualizar(contacto.codigoSecuencial, {
            ...contacto,
            atributos: {
              ...(contacto.atributos || {}),
              [conf.claveCampo]: !isTrue,
            },
          });
        }}
        className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all shadow-sm border ${isTrue ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"}`}
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
          await onActualizar(contacto.codigoSecuencial, {
            ...contacto,
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
        className="w-full min-w-[100px] bg-[var(--surface)] border border-[var(--primary)] rounded px-2 py-1 text-[11px] font-bold outline-none shadow-sm text-[var(--text-primary)]"
      />
    );
  }

  return (
    <div
      className="min-h-[24px] w-full flex items-center cursor-pointer px-1.5 border border-transparent hover:border-dashed hover:border-[var(--primary)]/50 rounded transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
        {valorActual !== "" && valorActual !== null ? (
          String(valorActual).toUpperCase()
        ) : (
          <span className="text-[10px] text-[var(--text-muted)] italic font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contactoEditar, setContactoEditar] = useState(null);
  const [contactoDetalle, setContactoDetalle] = useState(null);
  const [contactoAEliminar, setContactoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);

  const { actualizarContacto } = useContactos();
  const { configs } = useConfiguracionContactos();
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

  // Sincronizar el detalle abierto con los datos frescos del servidor
  React.useEffect(() => {
    if (contactoDetalle && contactos.length > 0) {
      const actualizado = contactos.find((c) => c.codigoSecuencial === contactoDetalle.codigoSecuencial);
      if (actualizado && JSON.stringify(actualizado) !== JSON.stringify(contactoDetalle)) {
        setContactoDetalle(actualizado);
      }
    }
  }, [contactos, contactoDetalle]);

  const handleEditar = (contacto) => {
    setContactoEditar(contacto);
    setMostrarFormulario(true);
  };

  const handleActualizarContactoInline = async (
    codigoSecuencial,
    payloadActualizado,
  ) => {
    try {
      if (payloadActualizado.correoElectronico) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payloadActualizado.correoElectronico.trim())) {
          agregarAlerta({
            title: "Correo Inválido",
            message:
              "El correo electrónico ingresado no tiene un formato válido.",
            type: "warning",
          });
          return;
        }
      }

      // Limpiar propiedades que no corresponden al DTO
      const {
        codigoEmpresa,
        codigoSecuencial: _,
        fechaCreacion,
        updatedAt,
        estado,
        ...dtoLimpio
      } = payloadActualizado;

      await actualizarContacto({ id: codigoSecuencial, dto: dtoLimpio });
      agregarAlerta({
        title: "Actualizado",
        message: "Contacto actualizado correctamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error al actualizar contacto en línea:", error);
      agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el contacto.",
        type: "error",
      });
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!contactoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarContacto(contactoAEliminar.codigoSecuencial);
      setContactoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      alert("No se pudo eliminar el contacto. Intente nuevamente.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-hidden bg-transparent">
      {/* COLUMNA CENTRAL: Lista de Contactos */}
      <div className="flex flex-col flex-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[16px] shadow-sm overflow-hidden min-w-[320px]">
        {/* Encabezado y Búsqueda */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[13px] font-black uppercase text-[var(--text-primary)] tracking-widest">
              {entidad ? entidad.nombre : "Contactos"}
            </h2>
            <TieneAccion accion="CREAR_CONTACTO">
              <button
                onClick={() => {
                  setContactoEditar(null);
                  setMostrarFormulario(true);
                }}
                className="bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-md shadow-sm shadow-[var(--primary)]/20 hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
              >
                <AgregarIcono size={14} /> Crear Contacto
              </button>
            </TieneAccion>
          </div>

          <div className="flex items-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar contactos..."
              className="bg-transparent border-none outline-none text-[13px] font-medium py-2 px-3 w-full text-[var(--text-primary)]"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal("")}
                className="text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
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
                className="h-16 bg-[var(--fill-secondary)]/50 rounded-md animate-pulse mb-1"
              />
            ))
          ) : contactos.length > 0 ? (
            contactos.map((fila) => {
              const isSelected =
                contactoDetalle?.codigoSecuencial === fila.codigoSecuencial;
              const avatarInitial = fila.nombre
                ? fila.nombre.charAt(0)
                : fila.razonSocial
                  ? fila.razonSocial.charAt(0)
                  : "?";
              return (
                <div
                  key={fila.codigoSecuencial}
                  onClick={() => setContactoDetalle(fila)}
                  className={`flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all group border ${isSelected ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 shadow-sm" : "hover:bg-[var(--fill-secondary)]/50 border-transparent"}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--primary)] font-black text-lg shrink-0 uppercase shadow-sm">
                    {avatarInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-[13px] font-bold truncate ${isSelected ? "text-[var(--primary)]" : "text-[var(--text-primary)]"}`}
                    >
                      {fila.razonSocial ||
                        `${fila.nombre || ""} ${fila.apellido || ""}`.trim() ||
                        "Sin Nombre"}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium truncate mt-0.5">
                      {entidad?.nombre || "Contacto"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-[var(--text-muted)] hover:text-amber-400 transition-colors rounded-md hover:bg-amber-50">
                      <Star size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactoAEliminar(fila);
                      }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors rounded-md hover:bg-rose-50"
                    >
                      <BorrarIcono size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] pb-10">
              <Package size={40} className="mb-3 opacity-20" />
              <span className="text-[12px] font-black uppercase tracking-widest">
                No se encontraron contactos
              </span>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--fill-secondary)]/20 flex items-center justify-between">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">
            Total: {total}
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={filtros.pagina <= 1}
              onClick={() =>
                setFiltros((p) => ({ ...p, pagina: p.pagina - 1 }))
              }
              className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
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
              className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
            >
              Sig
            </button>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Detalles del Contacto o Formulario */}
      {mostrarFormulario ? (
        <div className="w-[450px] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[16px] shadow-sm flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right-4 duration-300">
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
      ) : contactoDetalle ? (
        <div className="w-[450px] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[16px] shadow-sm flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right-4 duration-300">
          <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--fill-secondary)]/30">
            <h3 className="text-[11px] font-black uppercase text-[var(--text-primary)] tracking-widest">
              Detalles del Contacto
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => handleEditar(contactoDetalle)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-all cursor-pointer"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setContactoAEliminar(contactoDetalle)}
                className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
              >
                <BorrarIcono size={16} />
              </button>
              <div className="w-px h-6 bg-[var(--border-subtle)] my-auto mx-1" />
              <button
                onClick={() => setContactoDetalle(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--fill-secondary)] rounded-md transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
            {/* Perfil Header */}
            <div className="flex items-center gap-5 pb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--fill)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--primary)] font-black text-3xl uppercase shadow-sm">
                {contactoDetalle.nombre
                  ? contactoDetalle.nombre.charAt(0)
                  : contactoDetalle.razonSocial
                    ? contactoDetalle.razonSocial.charAt(0)
                    : "?"}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <InlineIdentidad
                  contacto={contactoDetalle}
                  onActualizar={handleActualizarContactoInline}
                />
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {entidad?.nombre || "Contacto"}
                </p>
              </div>
            </div>

            {/* Grid de Detalles */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 border-t border-[var(--border-subtle)] pt-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                  <Mail size={12} /> Correo Electrónico
                </span>
                <span className="text-[12px] font-bold text-[var(--text-primary)]">
                  {contactoDetalle.correoElectronico || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                  <Building2 size={12} /> DNI / CUIT
                </span>
                <span className="text-[12px] font-bold text-[var(--text-primary)]">
                  {contactoDetalle.documento || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                  <Briefcase size={12} /> Facturación
                </span>
                <InlineEnteFacturacion
                  contacto={contactoDetalle}
                  onActualizar={handleActualizarContactoInline}
                />
              </div>

              {configsEntidad.map((conf) => (
                <div key={conf.claveCampo} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {conf.nombreCampo}
                  </span>
                  <InlineAtributo
                    contacto={contactoDetalle}
                    conf={conf}
                    onActualizar={handleActualizarContactoInline}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 flex gap-3">
            <button
              onClick={() => handleEditar(contactoDetalle)}
              className="flex-1 py-3 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-md shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              Editar Contacto
            </button>
            <button
              onClick={() => setContactoAEliminar(contactoDetalle)}
              className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-black uppercase tracking-widest rounded-md shadow-sm hover:bg-rose-100 transition-all cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex w-[450px] bg-gray-50 border border-dashed border-[var(--color-neutral-border)] rounded-[16px] flex-col items-center justify-center shrink-0">
          <CuentaIcono size={64} className="mb-4 text-[var(--color-neutral-text-muted)] opacity-20" />
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
          <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] max-w-md w-full p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm">
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
                  className="flex-1 py-3 rounded-[8px] bg-white border border-[var(--color-neutral-border)] text-[13px] font-bold text-[var(--color-neutral-text-main)] hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-[8px] bg-rose-600 text-white text-[13px] font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
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
