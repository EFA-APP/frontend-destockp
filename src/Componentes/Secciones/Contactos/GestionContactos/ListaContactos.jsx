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
import { Edit2, Search, X, Package } from "lucide-react";
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
  const { contactos: listaEntes, cargandoContactos: cargandoEntes } = useContactos({
    tipoEntidad: tipoEntidadSeleccionada,
  });

  const handleSelectEnte = async (e) => {
    const codSecuencial = e.target.value;
    const enteSeleccionado = listaEntes.find(c => String(c.codigoSecuencial) === String(codSecuencial));
    if (enteSeleccionado) {
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
        enteFacturacion: enteSeleccionado
      });
    }
    setModoEdicion(false);
  };

  const handleRemoverEnte = async (e) => {
    e.stopPropagation();
    await onActualizar(contacto.codigoSecuencial, {
      ...contacto,
      enteFacturacion: null
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
               {contacto.enteFacturacion.razonSocial || `${contacto.enteFacturacion.nombre} ${contacto.enteFacturacion.apellido}`}
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
    <div className="flex flex-col gap-2 min-w-[220px] p-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg shadow-2xl absolute z-50 bottom-full mb-2 md:bottom-auto md:mb-0 md:mt-2" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-1">
         <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Asignar Ente</span>
         <button onClick={() => setModoEdicion(false)} className="text-gray-400 hover:text-rose-500 transition-colors"><X size={14}/></button>
      </div>
      <div className="space-y-2">
         <select 
            value={tipoEntidadSeleccionada}
            onChange={e => setTipoEntidadSeleccionada(e.target.value)}
            className="w-full text-[11px] p-2 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded uppercase font-bold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
         >
            <option value="">Categoría...</option>
            {entidades.map(ent => (
               <option key={ent.clave} value={ent.clave}>{ent.nombre}</option>
            ))}
         </select>
         
         {tipoEntidadSeleccionada && (
            <div className="relative">
              <SearchableSelect 
                options={(listaEntes || []).map(c => ({
                  value: String(c.codigoSecuencial),
                  label: (c.razonSocial || `${c.nombre} ${c.apellido}`).toUpperCase()
                }))}
                value={""}
                onChange={handleSelectEnte}
                placeholder={cargandoEntes ? "Cargando..." : "Buscar responsable..."}
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
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: contacto.nombre || "",
    apellido: contacto.apellido || "",
    razonSocial: contacto.razonSocial || "",
    documento: contacto.documento || "",
  });

  const handleGuardar = async () => {
    // Solo actualizar si hubo cambios
    if (
      form.nombre !== (contacto.nombre || "") ||
      form.apellido !== (contacto.apellido || "") ||
      form.razonSocial !== (contacto.razonSocial || "") ||
      form.documento !== (contacto.documento || "")
    ) {
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
        ...form
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
      <div className="flex flex-col gap-2 min-w-[280px] p-3 bg-[var(--surface)] border border-[var(--primary)] rounded-lg shadow-xl absolute z-50 left-0 top-0">
        <div className="flex justify-between items-center mb-1">
           <span className="text-[10px] font-black uppercase text-[var(--primary)] tracking-widest">Editar Identidad</span>
           <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-rose-500 transition-colors"><X size={14}/></button>
        </div>
        
        <input 
          autoFocus
          placeholder="Razón Social (Opcional)"
          value={form.razonSocial}
          onChange={e => setForm({...form, razonSocial: e.target.value})}
          onKeyDown={handleKeyDown}
          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
        />
        <div className="flex gap-2">
           <input 
             placeholder="Nombres"
             value={form.nombre}
             onChange={e => setForm({...form, nombre: e.target.value})}
             onKeyDown={handleKeyDown}
             className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
           />
           <input 
             placeholder="Apellidos"
             value={form.apellido}
             onChange={e => setForm({...form, apellido: e.target.value})}
             onKeyDown={handleKeyDown}
             className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
           />
        </div>
        <input 
          placeholder="DNI / CUIT"
          value={form.documento}
          onChange={e => setForm({...form, documento: e.target.value})}
          onKeyDown={handleKeyDown}
          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors"
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
         {contacto.razonSocial?.toUpperCase() || `${contacto.nombre?.toUpperCase()} ${contacto.apellido?.toUpperCase()}`}
         {!contacto.razonSocial && !contacto.nombre && <span className="italic text-[var(--text-muted)] text-[11px]">Sin Nombre</span>}
       </span>
       <div className="flex items-center gap-1.5 opacity-60">
         <span className="text-[10px] font-black uppercase tracking-wider">
           {contacto.documento ? "DNI/CUIT:" : ""}
         </span>
         <span className="text-[11px] font-medium">{contacto.documento || <span className="italic text-[9px]">S/D</span>}</span>
       </div>
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
      const nuevoValor = conf.tipoDato === "NUMERO" ? (valor === "" ? "" : Number(valor)) : valor;
      await onActualizar(contacto.codigoSecuencial, {
        ...contacto,
        atributos: {
          ...(contacto.atributos || {}),
          [conf.claveCampo]: nuevoValor
        }
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
             atributos: { ...(contacto.atributos || {}), [conf.claveCampo]: !isTrue }
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
             atributos: { ...(contacto.atributos || {}), [conf.claveCampo]: e.target.value }
           });
         }}
         className="bg-transparent text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer border-b border-dashed border-[var(--text-muted)] hover:border-[var(--primary)] transition-colors uppercase w-full py-0.5"
      >
         <option value="">--</option>
         {(conf.opciones || []).map(opt => (
            <option key={opt} value={opt}>{opt.toUpperCase()}</option>
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
         onChange={e => setValor(e.target.value)}
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
          {valorActual !== "" && valorActual !== null ? String(valorActual).toUpperCase() : <span className="text-[10px] text-[var(--text-muted)] italic font-medium opacity-0 group-hover:opacity-100 transition-opacity">Editar...</span>}
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
    return configs.filter(c => c.entidadClave === entidad?.clave);
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

  const handleActualizarContactoInline = async (codigoSecuencial, payloadActualizado) => {
    try {
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
        type: "success"
      });
    } catch (error) {
       console.error("Error al actualizar contacto en línea:", error);
       agregarAlerta({
        title: "Error",
        message: "No se pudo actualizar el contacto.",
        type: "error"
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
    <div className="flex flex-col h-full bg-[var(--surface)] rounded-lg border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      
      {/* HEADER DE LA TABLA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 gap-4">
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all w-full md:w-80">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input 
             type="text"
             value={busquedaLocal} 
             onChange={e => setBusquedaLocal(e.target.value)}
             placeholder="Buscar por nombre o DNI/CUIT..."
             className="bg-transparent border-none outline-none text-[13px] font-medium py-2.5 px-3 w-full text-[var(--text-primary)]"
          />
          {busquedaLocal && (
             <button onClick={() => setBusquedaLocal("")} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                <X size={14} />
             </button>
          )}
        </div>

        <TieneAccion accion="CREAR_CONTACTO">
          <button 
            onClick={() => { setContactoEditar(null); setMostrarFormulario(true); }}
            className="px-5 py-2.5 bg-[var(--primary)] text-white text-[12px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-[var(--primary)]/20 transition-all"
          >
            <AgregarIcono size={14} /> Crear Contacto
          </button>
        </TieneAccion>
      </div>

      {/* TABLA DESKTOP */}
      <div className="hidden md:block flex-1 overflow-auto bg-[var(--surface)] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-[var(--fill-secondary)] sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] w-24">Código</th>
              <th className="px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] min-w-[200px]">Nombre / Razón Social</th>
              
              {/* Columnas Dinámicas para Atributos */}
              {configsEntidad.map(conf => (
                <th key={conf.claveCampo} className="px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] whitespace-nowrap">
                  {conf.nombreCampo}
                </th>
              ))}

              <th className="px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] min-w-[150px]">Facturación</th>
              <th className="px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right w-32 sticky right-0 bg-[var(--fill-secondary)] shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
               Array.from({length: 5}).map((_, i) => (
                 <tr key={i} className="border-b border-[var(--border-subtle)]">
                    <td className="px-5 py-4"><div className="h-4 bg-black/5 rounded animate-pulse w-12" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-black/5 rounded animate-pulse w-48 mb-1" /><div className="h-3 bg-black/5 rounded animate-pulse w-32" /></td>
                    {configsEntidad.map(conf => (
                       <td key={conf.claveCampo} className="px-5 py-4"><div className="h-4 bg-black/5 rounded animate-pulse w-16" /></td>
                    ))}
                    <td className="px-5 py-4"><div className="h-6 bg-black/5 rounded animate-pulse w-32" /></td>
                    <td className="px-5 py-4 sticky right-0 bg-[var(--surface)]"><div className="h-8 bg-black/5 rounded animate-pulse w-24 float-right" /></td>
                 </tr>
               ))
            ) : contactos.length > 0 ? (
               contactos.map((fila) => (
                 <tr key={fila.codigoSecuencial} className="border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/50 transition-colors group">
                   <td className="px-5 py-4 align-top">
                     <span className="bg-[var(--fill-secondary)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[11px] font-black text-[var(--text-primary)] mt-1 inline-block">
                       {fila.codigoSecuencial.toString().padStart(4, "0")}
                     </span>
                   </td>
                   <td className="px-5 py-4 align-top relative">
                     <InlineIdentidad contacto={fila} onActualizar={handleActualizarContactoInline} />
                   </td>
                   
                   {/* Celdas Dinámicas para Atributos */}
                   {configsEntidad.map(conf => (
                      <td key={conf.claveCampo} className="px-5 py-4 align-top">
                         <div className="mt-1 w-full">
                            <InlineAtributo contacto={fila} conf={conf} onActualizar={handleActualizarContactoInline} />
                         </div>
                      </td>
                   ))}

                   <td className="px-5 py-4 relative align-top">
                      <div className="mt-1">
                         <InlineEnteFacturacion contacto={fila} onActualizar={handleActualizarContactoInline} />
                      </div>
                   </td>
                   <td className="px-5 py-4 align-top sticky right-0 bg-[var(--surface)] group-hover:bg-[var(--fill-secondary)]/10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors">
                     <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                       <button onClick={() => setContactoDetalle(fila)} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors" title="Ver Detalles">
                          <CuentaIcono size={16}/>
                       </button>
                       <button onClick={() => handleEditar(fila)} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors" title="Editar">
                          <Edit2 size={16}/>
                       </button>
                       <button onClick={() => setContactoAEliminar(fila)} className="p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Eliminar">
                          <BorrarIcono size={16}/>
                       </button>
                     </div>
                   </td>
                 </tr>
               ))
            ) : (
               <tr>
                 <td colSpan={4 + configsEntidad.length} className="py-20 text-center text-[var(--text-muted)]">
                    <Package size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-bold uppercase tracking-widest">No se encontraron contactos</p>
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MOBILE */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--fill-secondary)]/30">
        {cargando ? (
           Array.from({length: 4}).map((_, i) => (
             <div key={i} className="h-32 bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border-subtle)] animate-pulse" />
           ))
        ) : contactos.length > 0 ? (
           contactos.map((fila) => (
             <div key={fila.codigoSecuencial} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                   <div className="flex-1 relative">
                      <InlineIdentidad contacto={fila} onActualizar={handleActualizarContactoInline} />
                   </div>
                   <span className="bg-[var(--fill-secondary)] px-2 py-1 rounded border border-[var(--border-subtle)] text-[11px] font-black shrink-0">
                      {fila.codigoSecuencial.toString().padStart(4, "0")}
                   </span>
                </div>
                
                <div className="border-t border-[var(--border-subtle)] pt-3 relative flex justify-between items-center z-10">
                   <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Facturación:</span>
                   <InlineEnteFacturacion contacto={fila} onActualizar={handleActualizarContactoInline} />
                </div>

                {/* Atributos Dinámicos en Mobile */}
                {configsEntidad.length > 0 && (
                  <div className="border-t border-[var(--border-subtle)] pt-3 flex flex-col gap-2">
                     <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">Atributos</span>
                     <div className="grid grid-cols-1 gap-2">
                       {configsEntidad.map(conf => (
                          <div key={conf.claveCampo} className="flex justify-between items-center gap-3 bg-[var(--fill-secondary)] p-2.5 rounded border border-[var(--border-subtle)]">
                             <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase w-1/3 truncate" title={conf.nombreCampo}>{conf.nombreCampo}</span>
                             <div className="w-2/3 flex justify-end">
                                <InlineAtributo contacto={fila} conf={conf} onActualizar={handleActualizarContactoInline} />
                             </div>
                          </div>
                       ))}
                     </div>
                  </div>
                )}

                <div className="border-t border-[var(--border-subtle)] pt-3 flex justify-end gap-2">
                    <button onClick={() => setContactoDetalle(fila)} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] bg-[var(--fill-secondary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors border border-transparent hover:border-[var(--primary)]/20">
                       <CuentaIcono size={16}/>
                    </button>
                    <button onClick={() => handleEditar(fila)} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] bg-[var(--fill-secondary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors border border-transparent hover:border-[var(--primary)]/20">
                       <Edit2 size={16}/>
                    </button>
                    <button onClick={() => setContactoAEliminar(fila)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-transparent hover:border-rose-200">
                       <BorrarIcono size={16}/>
                    </button>
                </div>
             </div>
           ))
        ) : (
           <div className="py-20 text-center text-[var(--text-muted)]">
              <Package size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-[12px] font-bold uppercase tracking-widest">Sin contactos</p>
           </div>
        )}
      </div>

      {/* FOOTER PAGINACIÓN */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">Total: {total}</span>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <select 
             value={filtros.limite} 
             onChange={e => setFiltros(p => ({...p, limite: Number(e.target.value), pagina: 1}))} 
             className="text-[11px] font-bold uppercase bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
           >
              <option value={10}>10 Filas</option>
              <option value={20}>20 Filas</option>
              <option value={50}>50 Filas</option>
           </select>
           <div className="flex items-center gap-2 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md p-1">
              <button 
                disabled={filtros.pagina <= 1} 
                onClick={() => setFiltros(p => ({...p, pagina: p.pagina - 1}))} 
                className="text-[10px] px-2.5 py-1.5 rounded disabled:opacity-30 font-black uppercase tracking-widest hover:bg-[var(--surface)] hover:shadow-sm transition-all text-[var(--text-primary)]"
              >
                 Ant
              </button>
              <span className="text-[11px] font-black px-2">{filtros.pagina} / {paginas || 1}</span>
              <button 
                disabled={filtros.pagina >= paginas} 
                onClick={() => setFiltros(p => ({...p, pagina: p.pagina + 1}))} 
                className="text-[10px] px-2.5 py-1.5 rounded disabled:opacity-30 font-black uppercase tracking-widest hover:bg-[var(--surface)] hover:shadow-sm transition-all text-[var(--text-primary)]"
              >
                 Sig
              </button>
           </div>
        </div>
      </div>

      {/* Modal / Overlay for Form */}
      {mostrarFormulario && (
        <FormularioContacto
          entidad={entidad}
          contacto={contactoEditar}
          onClose={() => {
            setMostrarFormulario(false);
            setContactoEditar(null);
          }}
        />
      )}

      {/* Modal / Overlay for Detail View */}
      {contactoDetalle && (
        <DetallesContacto
          contacto={contactoDetalle}
          onClose={() => setContactoDetalle(null)}
        />
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {contactoAEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm">
                <AdvertenciaIcono size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">
                  ¿Eliminar Contacto?
                </h3>
                <p className="text-[13px] text-[var(--text-muted)] font-bold leading-relaxed uppercase tracking-widest">
                  Estás por desactivar a{" "}
                  <span className="text-[var(--text-primary)]">
                    {contactoAEliminar.razonSocial ||
                      `${contactoAEliminar.nombre} ${contactoAEliminar.apellido}`}
                  </span>
                  . Esta acción ocultará al contacto de las listas activas pero
                  mantendrá su historial.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setContactoAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 py-3.5 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[12px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3.5 rounded-md bg-rose-600 text-white text-[12px] border border-rose-700 font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
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
