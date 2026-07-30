import React, { useState, useMemo } from "react";
import { CerrarIcono, CheckIcono, UsuarioIcono, EditarIcono, AdvertenciaIcono } from "../../../assets/Icons";
import { useCrearAccion } from "../../../Backend/Autenticacion/queries/Accion/useCrearAccion.mutation";
import { useEditarAccion } from "../../../Backend/Autenticacion/queries/Accion/useEditarAccion.mutation";
import { useObtenerSeccionesQuery } from "../../../Backend/Autenticacion/queries/Secciones/useObtenerSecciones.query";
import { useObtenerUsuarios } from "../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";
import { useObtenerUsuariosHabilitados } from "../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuariosHabilitados.query";
import { useActualizarUsuariosHabilitados } from "../../../Backend/Autenticacion/queries/Usuario/useActualizarUsuariosHabilitados.mutation";

// rbac-normalizacion-secciones-permisos (R17, R33, R34, R36): reemplaza la
// edición de Permiso.acciones[].permitidos.
//
// feature accion-vinculada-a-submenu: este modal ahora tiene 3 modos
// explícitos vía la prop `modo` ("alta" | "editar" | "restriccion"),
// separando conceptos que antes estaban mezclados (con `accion` en null
// operaba en modo "alta"; con `accion` presente SIEMPRE operaba en modo
// "restriccion", aunque el usuario hubiera clickeado "editar" -- ese era
// el bug reportado: no existía una edición real de la Accion en sí).
//
//   - "alta": crea una Accion nueva en el catálogo global (useCrearAccion).
//     codigoSubMenu pasa a ser obligatorio (antes no existía el campo).
//   - "editar": edita nombre/descripcion/codigoSubMenu de una Accion ya
//     existente (useEditarAccion) -- flujo nuevo, no existía antes. Uso
//     principal: asignar codigoSubMenu a las Acciones que arrancaron en
//     NULL en la migración de esta feature.
//   - "restriccion": gestiona UsuarioAccionHabilitada (whitelist por
//     usuario) para la combinación SubMenu+Acción -- comportamiento ya
//     existente, sin cambios de fondo. El SubMenu ya NO se elige a mano acá
//     (redundante: la Accion ya tiene un codigoSubMenu fijo), pasa a ser
//     sólo informativo. Si la Accion todavía no tiene codigoSubMenu
//     asignado, el formulario de restricción se deshabilita por completo.
//
// Si no se pasa `modo` explícitamente, se infiere igual que antes
// (`!accion` -> "alta", `accion` -> "restriccion") para no romper otros
// posibles usos del componente.
const ModalGestionarAcciones = ({ isOpen, onClose, accion, empresa, modo: modoProp }) => {
  const modo = modoProp || (!accion ? "alta" : "restriccion");
  const modoAlta = modo === "alta";
  const modoEdicion = modo === "editar";
  const modoRestriccion = modo === "restriccion";

  const [nombreAccion, setNombreAccion] = useState("");
  const [descripcionAccion, setDescripcionAccion] = useState("");
  const [codigoSubMenuForm, setCodigoSubMenuForm] = useState(null); // usado en "alta" y "editar"
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [seleccionUsuarios, setSeleccionUsuarios] = useState([]); // codigos de usuario

  const codigoEmpresa = empresa?.codigo;
  // "restriccion": el SubMenu ya no se elige, viene fijo de la Accion.
  const codigoSubMenuRestriccion = accion?.codigoSubMenu ?? null;

  const { mutateAsync: crearAccion, isPending: creandoAccion } = useCrearAccion();
  const { mutateAsync: editarAccion, isPending: editandoAccion } = useEditarAccion();
  const { data: secciones } = useObtenerSeccionesQuery();
  const { data: usuariosEmpresa } = useObtenerUsuarios(codigoEmpresa);
  const { data: usuariosHabilitados, isLoading: cargandoHabilitados } = useObtenerUsuariosHabilitados({
    codigoEmpresa,
    codigoSubMenu: codigoSubMenuRestriccion,
    codigoAccion: accion?.codigo,
  });
  const { mutateAsync: actualizarUsuariosHabilitados, isPending: guardandoRestriccion } =
    useActualizarUsuariosHabilitados();

  const listaSecciones = Array.isArray(secciones) ? secciones : secciones?.data || [];

  // Precarga el whitelist ya existente para la combinación SubMenu+Acción
  // elegida (evita sobrescribir a ciegas, ver design.md — gap agregado en
  // implementación).
  React.useEffect(() => {
    setSeleccionUsuarios(Array.isArray(usuariosHabilitados) ? usuariosHabilitados : []);
  }, [usuariosHabilitados]);

  // Reset / precarga de formulario al abrir el modal (según el modo).
  React.useEffect(() => {
    if (isOpen) {
      if (modoEdicion && accion) {
        setNombreAccion(accion.nombre || "");
        setDescripcionAccion(accion.descripcion || "");
        setCodigoSubMenuForm(accion.codigoSubMenu ?? null);
      } else {
        setNombreAccion("");
        setDescripcionAccion("");
        setCodigoSubMenuForm(null);
      }
      setBusquedaUsuario("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accion, modo]);

  const usuariosFiltrados = useMemo(() => {
    const lista = Array.isArray(usuariosEmpresa)
      ? usuariosEmpresa
      : usuariosEmpresa?.usuarios || usuariosEmpresa?.data || [];

    if (!Array.isArray(lista)) return [];

    return lista.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.correoElectronico?.toLowerCase().includes(busquedaUsuario.toLowerCase()),
    );
  }, [usuariosEmpresa, busquedaUsuario]);

  // Nombre del SubMenu ya asignado a la Accion (para el aviso informativo
  // del modo "restriccion").
  const nombreSubMenuAsignado = useMemo(() => {
    if (!codigoSubMenuRestriccion) return null;
    for (const s of listaSecciones) {
      const sm = (s.subMenus || []).find((sm) => sm.codigo === codigoSubMenuRestriccion);
      if (sm) return `${s.nombre} / ${sm.nombre}`;
    }
    return null;
  }, [listaSecciones, codigoSubMenuRestriccion]);

  if (!isOpen) return null;

  const handleSubmitAlta = async (e) => {
    e.preventDefault();
    try {
      await crearAccion({
        nombre: nombreAccion.trim().toUpperCase(),
        descripcion: descripcionAccion.trim() || undefined,
        codigoSubMenu: codigoSubMenuForm,
      });
      onClose();
    } catch (error) {
      console.error("Error al crear acción", error);
    }
  };

  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    try {
      await editarAccion({
        codigo: accion.codigo,
        nombre: nombreAccion.trim().toUpperCase(),
        descripcion: descripcionAccion.trim() || undefined,
        codigoSubMenu: codigoSubMenuForm || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error al editar acción", error);
    }
  };

  const toggleUsuario = (codigoUsuario) => {
    setSeleccionUsuarios((prev) =>
      prev.includes(codigoUsuario) ? prev.filter((c) => c !== codigoUsuario) : [...prev, codigoUsuario],
    );
  };

  const handleGuardarRestriccion = async () => {
    try {
      await actualizarUsuariosHabilitados({
        codigoEmpresa,
        codigoSubMenu: codigoSubMenuRestriccion,
        codigoAccion: accion.codigo,
        codigosUsuario: seleccionUsuarios,
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar restricción de usuarios", error);
    }
  };

  // Selector de SubMenu (con optgroup por Sección) reutilizado tal cual en
  // "alta" y "editar" -- mismo patrón visual que tenía antes el selector
  // "SubMenú a restringir" del modo "restriccion".
  const renderSelectorSubMenu = () => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">SubMenú</label>
      <select
        required
        value={codigoSubMenuForm || ""}
        onChange={(e) => setCodigoSubMenuForm(Number(e.target.value) || null)}
        className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all appearance-none"
      >
        <option value="">-- Selecciona un SubMenú --</option>
        {listaSecciones.map((s) => (
          <optgroup key={s.codigo} label={s.nombre}>
            {(s.subMenus || [])
              .filter((sm) => sm.activo !== false)
              .map((sm) => (
                <option key={sm.codigo} value={sm.codigo}>
                  {sm.nombre}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  if (modoAlta || modoEdicion) {
    const isPending = modoAlta ? creandoAccion : editandoAccion;
    const handleSubmit = modoAlta ? handleSubmitAlta : handleSubmitEdicion;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                {modoAlta ? <CheckIcono size="20" color="white" /> : <EditarIcono size="20" color="white" />}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                  {modoAlta ? "Nueva Acción" : "Editar Acción"}
                </h2>
                <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                  Catálogo global de acciones
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-black/10 rounded-md transition-colors">
              <CerrarIcono size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Nombre</label>
              <input
                type="text"
                required
                value={nombreAccion}
                onChange={(e) => setNombreAccion(e.target.value.toUpperCase())}
                placeholder="CREAR_CONTACTO"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Descripción
              </label>
              <input
                type="text"
                value={descripcionAccion}
                onChange={(e) => setDescripcionAccion(e.target.value)}
                placeholder="Permite crear un contacto nuevo"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
              />
            </div>
            {renderSelectorSubMenu()}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-2.5 bg-blue-600 rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-blue-700 transition-all"
              >
                {isPending ? "Guardando..." : modoAlta ? "Crear Acción" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- MODO "restriccion" ---
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <CheckIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">Restricción por Usuario</h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Acción: <span className="text-black">{accion.nombre}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-black/10 rounded-md transition-colors">
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">SubMenú</label>
            {/* feature accion-vinculada-a-submenu: ya no es un <select> --
                el SubMenu de la Accion es fijo (1 SubMenu -> N Acciones),
                elegirlo acá quedaría redundante/inconsistente. */}
            <div className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold text-black/80">
              {nombreSubMenuAsignado || "Sin asignar"}
            </div>
            <p className="text-[9px] font-bold text-black/40 uppercase ml-1 italic">
              Si no marcás a ningún usuario, la acción de este SubMenú queda abierta a todo Rol que la conceda (sin
              restricción).
            </p>
          </div>

          {!codigoSubMenuRestriccion ? (
            <div className="flex items-start gap-3 p-4 rounded-md border border-amber-300 bg-amber-50">
              <div className="shrink-0 mt-0.5">
                <AdvertenciaIcono size={18} color="#b45309" />
              </div>
              <p className="text-[12px] font-bold text-amber-800">
                Esta Acción todavía no tiene SubMenú asignado — asignáselo primero en{" "}
                <span className="uppercase">Editar Acción</span>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="BUSCAR USUARIO..."
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[12px] font-bold focus:outline-none focus:bg-white transition-all"
              />
              {cargandoHabilitados ? (
                <div className="py-8 text-center text-[11px] font-bold text-black/40 italic">Cargando...</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {usuariosFiltrados.map((usuario) => {
                    const estaAsignado = seleccionUsuarios.includes(usuario.codigo);
                    return (
                      <button
                        key={usuario.codigo}
                        type="button"
                        onClick={() => toggleUsuario(usuario.codigo)}
                        className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                          estaAsignado
                            ? "bg-blue-600 border-blue-600 text-white shadow-md"
                            : "bg-black/[0.02] border-black/5 hover:border-black/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <UsuarioIcono size={16} />
                          <span className="text-[12px] font-black uppercase tracking-tight">
                            {usuario.nombre} {usuario.apellido}
                          </span>
                        </div>
                        {estaAsignado && <CheckIcono size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-black/10 bg-black/[0.02] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarRestriccion}
            disabled={!codigoSubMenuRestriccion || guardandoRestriccion}
            className="px-8 py-2.5 bg-blue-600 rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-40"
          >
            {guardandoRestriccion ? "Guardando..." : "Guardar Restricción"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarAcciones;
