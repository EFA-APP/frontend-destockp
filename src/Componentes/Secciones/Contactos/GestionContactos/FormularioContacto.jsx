import React, { useState } from "react";
import {
  BorrarIcono,
  CerrarIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { Search } from "lucide-react";

const FormularioContacto = ({
  entidad: entidadProp,
  contacto,
  onClose,
  onExito,
}) => {
  const { entidades, cargandoEntidades } = useEntidades();
  const { configs, cargandoConfigs } = useConfiguracionContactos();
  const { crearContacto, actualizarContacto } = useContactos();

  const [form, setForm] = useState({
    tipoEntidad: entidadProp?.clave || contacto?.tipoEntidad || "",
    nombre: contacto?.nombre || "",
    apellido: contacto?.apellido || "",
    razonSocial: contacto?.razonSocial || "",
    documento: contacto?.documento || "",
    condicionIva: contacto?.condicionIva || "CF",
    atributos: contacto?.atributos || {},
    relaciones: contacto?.relaciones || [],
    enteFacturacion: contacto?.enteFacturacion || null,
  });

  const entidadActual = entidades.find((e) => e.clave === form.tipoEntidad);
  const configsEntidad = configs.filter(
    (c) => c.entidadClave === form.tipoEntidad,
  );

  const [nuevaRelacion, setNuevaRelacion] = useState({
    tipo: "",
    entidad: "",
    codigoSecuencial: "",
    nombre: "",
  });

  const [busquedaEnte, setBusquedaEnte] = useState({
    entidad: "",
    codigoSecuencial: "",
    query: "",
    mostrarDropdown: false,
  });

  const [busquedaVinculo, setBusquedaVinculo] = useState({
    query: "",
    mostrarDropdown: false,
  });

  const [debouncedQueryEnte, setDebouncedQueryEnte] = useState("");
  const [debouncedQueryVinculo, setDebouncedQueryVinculo] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryEnte(busquedaEnte.query);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaEnte.query]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryVinculo(busquedaVinculo.query);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaVinculo.query]);

  const { contactos: listaVinculos, cargandoContactos: cargandoVinculos } =
    useContactos({
      tipoEntidad: nuevaRelacion.entidad,
      busqueda: debouncedQueryVinculo,
    });

  const { contactos: listaEntes, cargandoContactos: cargandoEntes } =
    useContactos({
      tipoEntidad: busquedaEnte.entidad,
      busqueda: debouncedQueryEnte,
    });

  const [highlightedIndexEnte, setHighlightedIndexEnte] = useState(-1);
  const [highlightedIndexVinculo, setHighlightedIndexVinculo] = useState(-1);

  const enteActualNombre = Array.isArray(listaEntes)
    ? listaEntes.find(
        (c) => c.codigoSecuencial === form.enteFacturacion?.codigoSecuencial,
      )?.razonSocial || "---"
    : "---";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (contacto) {
        await actualizarContacto({ id: contacto.codigoSecuencial, dto: form });
        onClose();
      } else {
        const nuevo = await crearContacto(form);
        if (onExito) onExito(nuevo);
        onClose();
      }
    } catch (err) {
      console.error("Error al guardar contacto:", err);
    }
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAtributoChange = (clave, valor) => {
    setForm((prev) => ({
      ...prev,
      atributos: { ...prev.atributos, [clave]: valor },
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-[var(--surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Elegante */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] shadow-sm">
              <CuentaIcono size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest leading-none mb-1">
                {contacto ? "EDITAR" : "NUEVO"}{" "}
                {entidadActual?.nombre || "CONTACTO"}
              </h2>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                {contacto
                  ? `ID: ${contacto.codigoSecuencial.toString().padStart(4, "0")}`
                  : "REGISTRO DE FICHA"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer rounded-md text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {cargandoEntidades || cargandoConfigs ? (
          <div className="flex-1 p-6 space-y-8 overflow-hidden animate-pulse">
            <div className="space-y-3">
              <div className="h-2 w-24 bg-[var(--fill-secondary)] rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-[var(--fill-secondary)] rounded-md" />
                <div className="h-10 bg-[var(--fill-secondary)] rounded-md" />
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="h-px bg-[var(--border-subtle)]" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 bg-[var(--fill-secondary)] rounded-md" />
                <div className="h-14 bg-[var(--fill-secondary)] rounded-md" />
              </div>
              <div className="h-12 bg-[var(--fill-secondary)] rounded-md" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"
          >
            {/* 1. SELECCIÓN DE TIPO */}
            {!entidadProp && !contacto && (
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] ml-1">
                  Categoría de Contacto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {entidades.map((ent) => (
                    <button
                      key={ent.clave}
                      type="button"
                      onClick={() => handleChange("tipoEntidad", ent.clave)}
                      className={`px-3 py-2.5 rounded-md border text-[11px] font-black flex items-center gap-2.5 tracking-wider transition-all cursor-pointer ${
                        form.tipoEntidad === ent.clave
                          ? "bg-[var(--primary-subtle)] text-[var(--primary-emphasis)] border-[var(--primary)]/30 shadow-sm"
                          : "bg-[var(--fill-secondary)] text-[var(--text-muted)] border-transparent hover:bg-[var(--border-subtle)]"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: ent.color || "var(--primary)",
                        }}
                      />
                      {ent.nombre.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DATOS DE IDENTIDAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Ficha Personal
                </span>
                <div className="h-px w-full bg-[var(--border-subtle)]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                  Razón Social / Denominación
                </label>
                <input
                  type="text"
                  placeholder="Empresa o nombre completo"
                  value={form.razonSocial}
                  onChange={(e) => handleChange("razonSocial", e.target.value)}
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    DNI / CUIT
                  </label>
                  <input
                    type="text"
                    value={form.documento}
                    onChange={(e) => handleChange("documento", e.target.value)}
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Cond. Fiscal
                  </label>
                  <div className="relative">
                    <select
                      value={form.condicionIva}
                      onChange={(e) =>
                        handleChange("condicionIva", e.target.value)
                      }
                      className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[12px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer transition-all uppercase"
                    >
                      <option value="CF">Consumidor Final</option>
                      <option value="RI">Resp. Inscripto</option>
                      <option value="MO">Monotributista</option>
                      <option value="EX">Exento</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. RESPONSABLE DE FACTURACIÓN */}
            <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Facturación
                </span>
                {!form.enteFacturacion && (
                  <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Factura Directa
                  </span>
                )}
              </div>

              {!form.enteFacturacion?.codigoSecuencial ? (
                <div className="space-y-3 bg-[var(--fill-secondary)] p-4 rounded-xl border border-[var(--border-subtle)] shadow-inner">
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={busquedaEnte.entidad}
                        onChange={(e) =>
                          setBusquedaEnte({
                            ...busquedaEnte,
                            entidad: e.target.value,
                          })
                        }
                        className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] cursor-pointer appearance-none uppercase"
                      >
                        <option value="">Seleccionar Entidad...</option>
                        {entidades.map((ent) => (
                          <option key={ent.clave} value={ent.clave}>
                            {ent.nombre.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                        <Search size={12} />
                      </div>
                      <input
                        type="text"
                        disabled={!busquedaEnte.entidad}
                        placeholder={
                          !busquedaEnte.entidad
                            ? "Elija entidad primero..."
                            : "Buscar responsable..."
                        }
                        value={busquedaEnte.query}
                        onChange={(e) => {
                          setBusquedaEnte((prev) => ({
                            ...prev,
                            query: e.target.value,
                            mostrarDropdown: true,
                          }));
                          setHighlightedIndexEnte(-1);
                        }}
                        onFocus={() =>
                          busquedaEnte.entidad &&
                          setBusquedaEnte((p) => ({
                            ...p,
                            mostrarDropdown: true,
                          }))
                        }
                        onBlur={() =>
                          setTimeout(
                            () =>
                              setBusquedaEnte((p) => ({
                                ...p,
                                mostrarDropdown: false,
                              })),
                            200,
                          )
                        }
                        className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md pl-9 pr-3 py-2 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 transition-all"
                      />

                      {cargandoEntes && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {busquedaEnte.mostrarDropdown && (
                        <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                          {Array.isArray(listaEntes) &&
                          listaEntes.length > 0 ? (
                            listaEntes.map((c, idx) => (
                              <div
                                key={c.codigoSecuencial}
                                onClick={() => {
                                  const nombre =
                                    c.razonSocial ||
                                    `${c.nombre} ${c.apellido}`;
                                  setForm((p) => ({
                                    ...p,
                                    enteFacturacion: c,
                                  }));
                                  setBusquedaEnte((p) => ({
                                    ...p,
                                    query: nombre,
                                    mostrarDropdown: false,
                                  }));
                                }}
                                className={`px-4 py-2.5 text-[11px] font-bold cursor-pointer rounded-md uppercase transition-colors ${idx === highlightedIndexEnte ? "bg-[var(--primary)] text-white" : "text-[var(--text-primary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"}`}
                              >
                                {c.razonSocial || `${c.nombre} ${c.apellido}`}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] text-center font-bold uppercase italic">
                              {busquedaEnte.query
                                ? "Sin resultados"
                                : "Escriba para buscar..."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-xl shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-0.5">
                      ENTE FACTURADOR:
                    </span>
                    <span className="text-[13px] font-black text-[var(--primary-emphasis)] uppercase truncate max-w-[200px]">
                      {form.enteFacturacion?.razonSocial ||
                        `${form.enteFacturacion?.nombre || ""} ${form.enteFacturacion?.apellido || ""}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, enteFacturacion: null }))
                    }
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                  >
                    <BorrarIcono size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 4. Vínculos / Relaciones */}
            <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Vínculos
                </span>
                <div className="h-px w-full bg-[var(--border-subtle)]" />
              </div>

              <div className="space-y-2.5">
                {form.relaciones.map((rel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-[var(--fill-secondary)] rounded-xl border border-[var(--border-subtle)] group hover:border-[var(--primary)]/30 transition-all shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest mb-0.5">
                        {rel.tipo}
                      </span>
                      <span className="text-[12px] font-black text-[var(--text-primary)] uppercase">
                        {rel.nombre}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          relaciones: p.relaciones.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <BorrarIcono size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--surface-hover)] p-4 rounded-xl border border-dashed border-[var(--border-subtle)] space-y-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="VÍNCULO (EJ: PADRE)"
                    value={nuevaRelacion.tipo}
                    onChange={(e) =>
                      setNuevaRelacion((p) => ({
                        ...p,
                        tipo: e.target.value.toUpperCase(),
                      }))
                    }
                    className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] uppercase transition-all"
                  />
                  <div className="relative">
                    <select
                      value={nuevaRelacion.entidad}
                      onChange={(e) =>
                        setNuevaRelacion((p) => ({
                          ...p,
                          entidad: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer uppercase transition-all"
                    >
                      <option value="">Entidad...</option>
                      {entidades.map((ent) => (
                        <option key={ent.clave} value={ent.clave}>
                          {ent.nombre.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Search size={12} />
                  </div>
                  <input
                    type="text"
                    disabled={!nuevaRelacion.entidad}
                    placeholder="Buscar contacto..."
                    value={busquedaVinculo.query}
                    onChange={(e) => {
                      setBusquedaVinculo({
                        query: e.target.value,
                        mostrarDropdown: true,
                      });
                      setHighlightedIndexVinculo(-1);
                    }}
                    onFocus={() =>
                      nuevaRelacion.entidad &&
                      setBusquedaVinculo((p) => ({
                        ...p,
                        mostrarDropdown: true,
                      }))
                    }
                    onBlur={() =>
                      setTimeout(
                        () =>
                          setBusquedaVinculo((p) => ({
                            ...p,
                            mostrarDropdown: false,
                          })),
                        200,
                      )
                    }
                    className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md pl-9 pr-3 py-2 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
                  />

                  {busquedaVinculo.mostrarDropdown && (
                    <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 p-1">
                      {Array.isArray(listaVinculos) &&
                      listaVinculos.length > 0 ? (
                        listaVinculos.map((c, idx) => (
                          <div
                            key={c.codigoSecuencial}
                            onClick={() => {
                              const nombre =
                                c.razonSocial ||
                                `${c.nombre || ""} ${c.apellido || ""}`.trim();
                              setNuevaRelacion((p) => ({
                                ...p,
                                codigoSecuencial: String(c.codigoSecuencial),
                                nombre,
                              }));
                              setBusquedaVinculo({
                                query: nombre,
                                mostrarDropdown: false,
                              });
                            }}
                            className={`px-4 py-2 flex flex-col cursor-pointer rounded-md transition-all ${idx === highlightedIndexVinculo ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"}`}
                          >
                            <span className="text-[11px] font-black uppercase">
                              {c.razonSocial || `${c.nombre} ${c.apellido}`}
                            </span>
                            <span className="text-[9px] font-bold opacity-60">
                              DNI: {c.documento || "S/D"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-[11px] text-[var(--text-muted)] text-center font-bold uppercase italic">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!nuevaRelacion.tipo || !nuevaRelacion.codigoSecuencial)
                      return;
                    setForm((p) => ({
                      ...p,
                      relaciones: [
                        ...p.relaciones,
                        {
                          ...nuevaRelacion,
                          codigoSecuencial: Number(
                            nuevaRelacion.codigoSecuencial,
                          ),
                          nombre: nuevaRelacion.nombre || "S/N",
                        },
                      ],
                    }));
                    setNuevaRelacion({
                      tipo: "",
                      entidad: "",
                      codigoSecuencial: "",
                      nombre: "",
                    });
                    setBusquedaVinculo({ query: "", mostrarDropdown: false });
                  }}
                  className="w-full py-2 bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border-subtle)] hover:border-[var(--primary)] rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                >
                  AÑADIR VÍNCULO
                </button>
              </div>
            </div>

            {/* 5. CAMPOS DINÁMICOS */}
            {configsEntidad.length > 0 && (
              <div className="space-y-5 pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                    Atributos {entidadActual?.nombre}
                  </span>
                  <div className="h-px w-full bg-[var(--border-subtle)]" />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {configsEntidad.map((conf) => (
                    <div key={conf.claveCampo} className="space-y-1.5">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                        {conf.nombreCampo}{" "}
                        {conf.requerido && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>

                      {conf.tipoDato === "LISTA" ? (
                        <div className="relative">
                          <select
                            value={form.atributos[conf.claveCampo] || ""}
                            onChange={(e) =>
                              handleAtributoChange(
                                conf.claveCampo,
                                e.target.value,
                              )
                            }
                            className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[12px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer uppercase transition-all"
                          >
                            <option value="">Seleccionar...</option>
                            {(conf.opciones || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      ) : conf.tipoDato === "BOOLEANO" ? (
                        <div className="flex gap-2 p-1 bg-[var(--fill-secondary)] rounded-xl border border-[var(--border-subtle)] shadow-inner">
                          <button
                            type="button"
                            onClick={() =>
                              handleAtributoChange(conf.claveCampo, true)
                            }
                            className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all cursor-pointer ${form.atributos[conf.claveCampo] === true ? "bg-[var(--surface)] text-emerald-600 shadow-sm border border-emerald-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                          >
                            SÍ
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAtributoChange(conf.claveCampo, false)
                            }
                            className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all cursor-pointer ${form.atributos[conf.claveCampo] === false ? "bg-[var(--surface)] text-rose-600 shadow-sm border border-rose-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                          >
                            NO
                          </button>
                        </div>
                      ) : (
                        <input
                          type={conf.tipoDato === "NUMERO" ? "number" : "text"}
                          value={form.atributos[conf.claveCampo] || ""}
                          onChange={(e) =>
                            handleAtributoChange(
                              conf.claveCampo,
                              e.target.value,
                            )
                          }
                          className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="pt-8 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
              >
                {contacto ? "ACTUALIZAR FICHA" : "REGISTRAR CONTACTO"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[var(--fill-secondary)] text-[var(--text-muted)] rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border border-transparent hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                DESCARTAR CAMBIOS
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormularioContacto;
