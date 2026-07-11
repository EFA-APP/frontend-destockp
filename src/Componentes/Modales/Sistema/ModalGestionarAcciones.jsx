import React, { useState, useMemo } from "react";
import {
  CerrarIcono,
  CheckIcono,
  RolIcono,
  UsuarioIcono,
} from "../../../assets/Icons";
import { useActualizarAccionesPermiso } from "../../../Backend/Autenticacion/queries/Permiso/useActualizarAccionesPermiso.mutation";
import { useObtenerTodasLasAccionesGlobales } from "../../../Backend/Autenticacion/queries/Permiso/useObtenerTodasLasAcciones.query";
import { useObtenerUsuarios } from "../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";

const ModalGestionarAcciones = ({
  isOpen,
  onClose,
  permiso,
  rolesEmpresa,
  empresa,
}) => {
  const [nuevaAccion, setNuevaAccion] = useState("");
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [accionesLocal, setAccionesLocal] = useState([]); // Array de { nombre, permitidos: [] }
  const [accionEnEdicion, setAccionEnEdicion] = useState(null); // Nombre de la acción que estamos editando usuarios

  const codigoEmpresa = empresa.codigo || empresa.codigo;

  const { mutateAsync: actualizarAcciones, isPending } =
    useActualizarAccionesPermiso();
  const { data: accionesGlobales } = useObtenerTodasLasAccionesGlobales();
  const { data: usuariosEmpresa } = useObtenerUsuarios(codigoEmpresa);

  // Sincronizar acciones cuando abre el modal
  React.useEffect(() => {
    if (permiso && isOpen) {
      const acc = Array.isArray(permiso.acciones) ? permiso.acciones : [];
      // Normalizar: asegurar que sean objetos { nombre, permitidos }
      setAccionesLocal(
        acc.map((a) => {
          if (typeof a === "string") return { nombre: a, permitidos: [] };
          return { nombre: a.nombre, permitidos: a.permitidos || [] };
        }),
      );
    }
  }, [permiso, isOpen]);

  // Deduplicar y filtrar sugerencias globales
  const sugerenciasFiltradas = useMemo(() => {
    if (!accionesGlobales) return [];
    const unicas = [
      ...new Set(
        accionesGlobales.map((a) => (typeof a === "string" ? a : a.nombre)),
      ),
    ];
    return unicas.filter(
      (ag) =>
        !accionesLocal.some((al) => al.nombre === ag) &&
        ag.toLowerCase().includes(busquedaGlobal.toLowerCase()),
    );
  }, [accionesGlobales, accionesLocal, busquedaGlobal]);

  // Roles vinculados
  const rolesVinculados = useMemo(() => {
    if (!permiso || !rolesEmpresa) return [];
    return rolesEmpresa.filter((rol) =>
      rol.permisos?.some(
        (p) => p.codigo === (permiso.codigo || permiso.codigo),
      ),
    );
  }, [permiso, rolesEmpresa]);

  // Usuarios filtrados para asignar
  const usuariosFiltrados = useMemo(() => {
    // El backend devuelve { usuarios: [], total: number }
    const lista = Array.isArray(usuariosEmpresa)
      ? usuariosEmpresa
      : usuariosEmpresa?.usuarios || usuariosEmpresa?.data || [];

    if (!Array.isArray(lista)) return [];

    return lista.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.correoElectronico?.toLowerCase().includes(busquedaUsuario.toLowerCase())
    );
  }, [usuariosEmpresa, busquedaUsuario]);

  const handleAddAccion = (nombre) => {
    const limpio = nombre.trim().toUpperCase();
    if (limpio && !accionesLocal.some((a) => a.nombre === limpio)) {
      setAccionesLocal([...accionesLocal, { nombre: limpio, permitidos: [] }]);
      setNuevaAccion("");
    }
  };

  const handleRemoveAccion = (nombre) => {
    setAccionesLocal(accionesLocal.filter((a) => a.nombre !== nombre));
    if (accionEnEdicion === nombre) setAccionEnEdicion(null);
  };

  const toggleUsuarioEnAccion = (accionNombre, usuario) => {
    setAccionesLocal(
      accionesLocal.map((acc) => {
        if (acc.nombre !== accionNombre) return acc;

        const yaEsta = acc.permitidos.some(
          (p) => p.codigoUsuario === usuario.codigo,
        );
        if (yaEsta) {
          return {
            ...acc,
            permitidos: acc.permitidos.filter(
              (p) => p.codigoUsuario !== usuario.codigo,
            ),
          };
        } else {
          return {
            ...acc,
            permitidos: [
              ...acc.permitidos,
              {
                codigoEmpresa: codigoEmpresa,
                codigoUsuario: usuario.codigo,
                nombreEmpresa: empresa.nombre,
                nombreUsuario: `${usuario.nombre} ${usuario.apellido}`.trim()
              },
            ],
          };
        }
      }),
    );
  };

  const handleGuardar = async () => {
    try {
      await actualizarAcciones({
        codigo: permiso.codigo || permiso.codigo,
        codigoEmpresa: codigoEmpresa,
        acciones: accionesLocal,
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar acciones", error);
    }
  };

  if (!isOpen || !permiso) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <CheckIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Acciones Granulares
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Permiso: <span className="text-black">{permiso.nombre}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PANEL IZQUIERDO: ACCIONES */}
          <div className="w-1/2 p-6 overflow-y-auto flex flex-col gap-8 border-r border-black/5">
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70">
                Acciones Habilitadas
              </label>

              <div className="flex flex-col gap-2 min-h-[150px]">
                {accionesLocal.map((acc, index) => (
                  <div
                    key={index}
                    className={`group flex items-center justify-between p-3 rounded-md border transition-all ${
                      accionEnEdicion === acc.nombre
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg -translate-x-1"
                        : "bg-black/[0.02] border-black/5 text-black hover:border-black/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRemoveAccion(acc.nombre)}
                        className={`p-1 rounded hover:bg-white/20 transition-colors ${accionEnEdicion === acc.nombre ? "text-white" : "text-red-500"}`}
                      >
                        <CerrarIcono size={14} />
                      </button>
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        {acc.nombre}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setAccionEnEdicion(
                          accionEnEdicion === acc.nombre ? null : acc.nombre,
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                        accionEnEdicion === acc.nombre
                          ? "bg-white text-blue-600"
                          : acc.permitidos.length > 0
                            ? "bg-blue-600 text-white"
                            : "bg-black/10 text-black/40 hover:bg-black/20"
                      }`}
                    >
                      <UsuarioIcono size={10} />
                      {acc.permitidos.length > 0
                        ? `${acc.permitidos.length} USUARIOS`
                        : "ASIGNAR"}
                    </button>
                  </div>
                ))}
                {accionesLocal.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-8">
                    <CheckIcono size={40} />
                    <p className="text-[11px] font-black uppercase mt-2">
                      Sin acciones granulares
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="NUEVA_ACCION..."
                  value={nuevaAccion}
                  onChange={(e) => setNuevaAccion(e.target.value.toUpperCase())}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddAccion(nuevaAccion)
                  }
                  className="flex-1 px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[12px] font-bold focus:outline-none focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleAddAccion(nuevaAccion)}
                  className="px-6 py-2 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-black/80 transition-all"
                >
                  +
                </button>
              </div>

              {/* Sugerencias Globales */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-black/40 uppercase tracking-widest flex items-center gap-2">
                    Catálogo Global
                  </p>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={busquedaGlobal}
                    onChange={(e) =>
                      setBusquedaGlobal(e.target.value.toUpperCase())
                    }
                    className="bg-transparent border-none text-[9px] font-bold text-blue-600 focus:outline-none w-24 text-right"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {sugerenciasFiltradas.slice(0, 10).map((ag, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddAccion(ag)}
                      className="px-2 py-1 bg-black/[0.03] border border-black/5 rounded hover:bg-black/10 text-[9px] font-bold text-black/60"
                    >
                      + {ag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: ASIGNACION DE USUARIOS */}
          <div className="w-1/2 p-6 overflow-y-auto flex flex-col gap-4 bg-slate-50 border-l border-black/5">
            {accionEnEdicion ? (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      Vinculando usuarios a:
                    </span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                      {accionEnEdicion}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <UsuarioIcono size={20} className="text-white" />
                  </div>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="BUSCAR USUARIO..."
                    value={busquedaUsuario}
                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md text-[12px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar">
                  {usuariosFiltrados.map((usuario) => {
                    const estaAsignado = accionesLocal
                      .find((a) => a.nombre === accionEnEdicion)
                      ?.permitidos.some(
                        (p) => p.codigoUsuario === usuario.codigo,
                      );

                    return (
                      <button
                        key={usuario.codigo}
                        onClick={() =>
                          toggleUsuarioEnAccion(accionEnEdicion, usuario)
                        }
                        className={`flex items-center justify-between p-4 rounded-md border transition-all duration-200 group/user ${
                          estaAsignado
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 -translate-y-0.5"
                            : "bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 hover:shadow-md hover:-translate-y-0.5 text-[var(--primary)] font-black"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                              estaAsignado
                                ? "bg-white/20 text-[var(--primary)] font-black"
                                : "bg-slate-100 text-slate-500 group-hover/user:bg-blue-600 group-hover/user:text-white"
                            }`}
                          >
                            {usuario?.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span
                              className={`text-[13px] font-black uppercase tracking-tight leading-none ${
                                estaAsignado ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {usuario?.nombre} {usuario?.apellido}
                            </span>
                            <span
                              className={`text-[10px] font-bold mt-1.5 ${
                                estaAsignado
                                  ? "text-[var(-primary)]/80"
                                  : "text-[var(--primary)]"
                              }`}
                            >
                              {usuario.correoElectronico}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            estaAsignado
                              ? "bg-white text-blue-600 scale-100 shadow-sm"
                              : "bg-slate-100 text-transparent scale-50 group-hover/user:scale-100 group-hover/user:bg-blue-100 group-hover/user:text-blue-600"
                          }`}
                        >
                          <CheckIcono size={14} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-12">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-black/20 flex items-center justify-center mb-4">
                  <UsuarioIcono size={40} />
                </div>
                <h4 className="text-[13px] font-black uppercase tracking-tighter">
                  Panel de Vinculación
                </h4>
                <p className="text-[10px] font-bold uppercase mt-2 max-w-[200px]">
                  Selecciona una acción a la izquierda para gestionar sus
                  usuarios permitidos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-black/10 bg-black/[0.02] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">
                Impacto en Roles:
              </span>
              <div className="flex -space-x-2 mt-1">
                {rolesVinculados.slice(0, 5).map((rol, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-black"
                    title={rol.nombre}
                  >
                    <RolIcono size={10} />
                  </div>
                ))}
                {rolesVinculados.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center text-[8px] text-white font-black">
                    +{rolesVinculados.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="px-8 py-2.5 bg-blue-600 rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isPending ? "Sincronizando..." : "Guardar Vinculaciones"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarAcciones;
