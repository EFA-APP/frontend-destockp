import React, { useState } from "react";
import {
  BorrarIcono,
  CerrarIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-full max-w-sm h-full bg-[#080808] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500">
        {/* Header Minimalista */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white/5 border border-white/10 text-[var(--primary)] text-emerald-500!">
              <CuentaIcono size={16} />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest">
                {contacto ? "EDITAR" : "NUEVO"}{" "}
                {entidadActual?.nombre || "CONTACTO"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 cursor-pointer rounded-md transition-colors text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500 "
          >
            <CerrarIcono size={16} />
          </button>
        </div>

        {cargandoEntidades || cargandoConfigs ? (
          <div className="flex-1 p-6 space-y-8 animate-pulse overflow-hidden">
            {/* Skeleton: Tipo de Entidad */}
            <div className="space-y-3">
              <div className="h-2 w-24 bg-white/10 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-white/5 rounded-md" />
                <div className="h-10 bg-white/5 rounded-md" />
              </div>
            </div>

            {/* Skeleton: Identidad */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 bg-[var(--primary)]/20 rounded" />
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <div className="h-2 w-12 bg-white/10 rounded" />
                    <div className="h-9 bg-white/5 rounded-md" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-12 bg-white/10 rounded" />
                    <div className="h-9 bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                  <div className="h-2 w-20 bg-white/10 rounded" />
                  <div className="h-9 bg-white/5 rounded-md" />
              </div>
            </div>

            {/* Skeleton: Fiscal */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <div className="h-2 w-16 bg-white/10 rounded" />
                    <div className="h-9 bg-white/5 rounded-md" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-16 bg-white/10 rounded" />
                    <div className="h-9 bg-white/5 rounded-md" />
                </div>
            </div>

            {/* Skeleton: Sección Inferior */}
            <div className="space-y-3 pt-4">
                <div className="h-20 bg-white/5 rounded-md border border-white/10 border-dashed" />
                <div className="h-10 bg-[var(--primary)]/10 rounded-md" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
          >
          {/* 1. SELECCIÓN DE TIPO Pro */}
          {!entidadProp && !contacto && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-white/50 uppercase tracking-[0.15em] ml-1">
                TIPO DE ENTIDAD
              </label>
              <div className="grid grid-cols-2 gap-2">
                {entidades.map((ent) => (
                  <button
                    key={ent.clave}
                    type="button"
                    onClick={() => handleChange("tipoEntidad", ent.clave)}
                    className={`px-3 py-2 rounded-md border text-[10px] font-black transition-all flex items-center gap-2 tracking-wider ${
                      form.tipoEntidad === ent.clave
                        ? "bg-white/10 text-white border-white/20 shadow-lg"
                        : "bg-white/5 text-white/30 border-transparent hover:bg-white/10"
                    }`}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-md"
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

          {/* 2. DATOS DE IDENTIDAD Refined */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-[var(--primary)] uppercase tracking-[0.15em]">
                Identidad
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/60 uppercase  ml-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/60 uppercase  ml-1">
                Razón Social
              </label>
              <input
                type="text"
                placeholder="Empresa o nombre completo"
                value={form.razonSocial}
                onChange={(e) => handleChange("razonSocial", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/60 uppercase  ml-1">
                  DNI/CUIT
                </label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={(e) => handleChange("documento", e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/60 uppercase  ml-1">
                  IVA
                </label>
                <select
                  value={form.condicionIva}
                  onChange={(e) => handleChange("condicionIva", e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all appearance-none cursor-pointer"
                >
                  <option className="text-black" value="CF">
                    CONSUMIDOR FINAL
                  </option>
                  <option className="text-black" value="RI">
                    RESP. INSCRIPTO
                  </option>
                  <option className="text-black" value="MO">
                    MONOTRIBUTISTA
                  </option>
                  <option className="text-black" value="EX">
                    EXENTO
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. RESPONSABLE DE FACTURACIÓN (ENTE) Pro */}
          <div className="space-y-3 pt-4 border-t border-white/5 bg-white/[0.01] p-4 rounded-md border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 uppercase ">
                Responsable de Facturación
              </span>
              {!form.enteFacturacion && (
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                  Factura a sí mismo
                </span>
              )}
            </div>

            {!form.enteFacturacion?.codigoSecuencial ? (
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <select
                    value={busquedaEnte.entidad}
                    onChange={(e) =>
                      setBusquedaEnte({
                        ...busquedaEnte,
                        entidad: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    <option className="text-black" value="">
                      FILTRAR ENTIDAD...
                    </option>
                    {entidades.map((ent) => (
                      <option
                        className="text-black"
                        key={ent.clave}
                        value={ent.clave}
                      >
                        {ent.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-full">
                    <input
                      type="text"
                      disabled={!busquedaEnte.entidad}
                      placeholder={
                        !busquedaEnte.entidad
                          ? "SELECCIONE QUÉ ENTIDAD BUSCAR..."
                          : "BUSCAR RESPONSABLE..."
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
                      onFocus={() => {
                        if (busquedaEnte.entidad) {
                          setBusquedaEnte((prev) => ({
                            ...prev,
                            mostrarDropdown: true,
                          }));
                          setHighlightedIndexEnte(-1);
                        }
                      }}
                      onBlur={() =>
                        setTimeout(
                          () =>
                            setBusquedaEnte((prev) => ({
                              ...prev,
                              mostrarDropdown: false,
                            })),
                          200,
                        )
                      }
                      onKeyDown={(e) => {
                        if (!busquedaEnte.mostrarDropdown) return;
                        const filtered = (
                          Array.isArray(listaEntes) ? listaEntes : []
                        ).filter((c) => {
                          const searchIndex =
                            `${c.codigoSecuencial} ${c.razonSocial} ${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase();
                          return searchIndex.includes(
                            busquedaEnte.query.toLowerCase(),
                          );
                        });

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedIndexEnte((prev) =>
                            prev < filtered.length - 1 ? prev + 1 : prev,
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndexEnte((prev) =>
                            prev > 0 ? prev - 1 : 0,
                          );
                        } else if (
                          e.key === "Enter" &&
                          highlightedIndexEnte >= 0
                        ) {
                          e.preventDefault();
                          const c = filtered[highlightedIndexEnte];
                          if (c) {
                            const nombre =
                              c.razonSocial || `${c.nombre} ${c.apellido}`;
                            setForm((prev) => ({
                              ...prev,
                              enteFacturacion: c, // Guardamos el objeto completo
                            }));
                            setBusquedaEnte((prev) => ({
                              ...prev,
                              query: nombre,
                              mostrarDropdown: false,
                            }));
                          }
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-white focus:outline-none focus:border-[var(--primary)] disabled:opacity-30 placeholder:opacity-40"
                    />

                    {cargandoEntes && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {busquedaEnte.mostrarDropdown && (
                      <div className="absolute top-full mt-1 left-0 right-0 max-h-40 overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1 flex flex-col">
                        {Array.isArray(listaEntes) &&
                          listaEntes
                            .filter((c) => {
                              const searchIndex =
                                `${c.codigoSecuencial} ${c.razonSocial} ${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase();
                              return searchIndex.includes(
                                busquedaEnte.query.toLowerCase(),
                              );
                            })
                            .map((c, idx) => (
                              <div
                                key={c.codigoSecuencial}
                                onClick={() => {
                                  const nombre =
                                    c.razonSocial ||
                                    `${c.nombre} ${c.apellido}`;
                                  setForm((prev) => ({
                                    ...prev,
                                    enteFacturacion: c, // Guardamos el objeto completo
                                  }));
                                  setBusquedaEnte((prev) => ({
                                    ...prev,
                                    query: nombre,
                                    mostrarDropdown: false,
                                  }));
                                }}
                                className={`px-3 py-2 text-[10px] font-black hover:text-white cursor-pointer rounded-md uppercase tracking-tighter transition-all ${idx === highlightedIndexEnte ? "bg-[var(--primary)] text-white" : "text-white/70 hover:bg-[var(--primary)]/20"}`}
                              >
                                {c.razonSocial || `${c.nombre} ${c.apellido}`}
                              </div>
                            ))}
                        {Array.isArray(listaEntes) &&
                          listaEntes.length === 0 && (
                            <div className="px-3 py-2 text-[10px] text-white/20 text-center">
                              Sin resultados
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-md">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-tighter">
                    FACTURAR A:
                  </span>
                  <span className="text-[10px] font-bold text-white/80">
                    {form.enteFacturacion?.razonSocial ||
                      `${form.enteFacturacion?.nombre || ""} ${form.enteFacturacion?.apellido || ""}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      enteFacturacion: null,
                    }))
                  }
                  className="p-1 px-3 text-[8px] font-black bg-red-500/10 text-red-500 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-all font-black"
                >
                  QUITAR
                </button>
              </div>
            )}
          </div>

          {/* 4. Vínculos / Relaciones */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                Vínculos / Relaciones
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Listado de relaciones actuales */}
            <div className="space-y-2">
              {form.relaciones.map((rel, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-md border border-white/5 group"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-tighter">
                      {rel.tipo?.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-white/70">
                      ID: {rel.codigoSecuencial}{" "}
                      {rel.entidad ? `[${rel.entidad?.toUpperCase()}]` : ""} -{" "}
                      {rel.nombre?.toUpperCase() || "S/N"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        relaciones: prev.relaciones.filter((_, i) => i !== idx),
                      }))
                    }
                    className="p-1.5 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <BorrarIcono size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulario para agregar relación */}
            <div className="bg-white/[0.03] p-3 rounded-md border border-dashed border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="VÍNCOLO (EJ: PADRE)"
                  value={nuevaRelacion.tipo}
                  onChange={(e) =>
                    setNuevaRelacion({
                      ...nuevaRelacion,
                      tipo: e.target.value.toUpperCase(),
                    })
                  }
                  className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                />
                <select
                  value={nuevaRelacion.entidad}
                  onChange={(e) =>
                    setNuevaRelacion({
                      ...nuevaRelacion,
                      entidad: e.target.value,
                    })
                  }
                  className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                >
                  <option className="text-black" value="">
                    ENTIDAD...
                  </option>
                  {entidades.map((ent) => (
                    <option
                      className="text-black"
                      key={ent.clave}
                      value={ent.clave}
                    >
                      {ent.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="text"
                  disabled={!nuevaRelacion.entidad}
                  placeholder={
                    !nuevaRelacion.entidad
                      ? "SELECCIONE QUÉ ENTIDAD BUSCAR..."
                      : "BUSCAR AL CONTACTO (DNI, NOMBRE)..."
                  }
                  value={busquedaVinculo.query}
                  onChange={(e) => {
                    setBusquedaVinculo({
                      query: e.target.value,
                      mostrarDropdown: true,
                    });
                    setHighlightedIndexVinculo(-1);
                  }}
                  onFocus={() => {
                    if (nuevaRelacion.entidad) {
                      setBusquedaVinculo((prev) => ({
                        ...prev,
                        mostrarDropdown: true,
                      }));
                      setHighlightedIndexVinculo(-1);
                    }
                  }}
                  onBlur={() =>
                    setTimeout(
                      () =>
                        setBusquedaVinculo((prev) => ({
                          ...prev,
                          mostrarDropdown: false,
                        })),
                      200,
                    )
                  }
                  onKeyDown={(e) => {
                    if (!busquedaVinculo.mostrarDropdown) return;
                    const filtered = (
                      Array.isArray(listaVinculos) ? listaVinculos : []
                    ).filter((c) => {
                      const searchIndex =
                        `${c.codigoSecuencial} ${c.razonSocial} ${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase();
                      return searchIndex.includes(
                        busquedaVinculo.query.toLowerCase(),
                      );
                    });

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIndexVinculo((prev) =>
                        prev < filtered.length - 1 ? prev + 1 : prev,
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIndexVinculo((prev) =>
                        prev > 0 ? prev - 1 : 0,
                      );
                    } else if (
                      e.key === "Enter" &&
                      highlightedIndexVinculo >= 0
                    ) {
                      e.preventDefault();
                      const c = filtered[highlightedIndexVinculo];
                      if (c) {
                        const nombre =
                          c.razonSocial ||
                          `${c.nombre || ""} ${c.apellido || ""}`.trim();
                        setNuevaRelacion((prev) => ({
                          ...prev,
                          codigoSecuencial: String(c.codigoSecuencial),
                          nombre,
                        }));
                        setBusquedaVinculo({
                          query: nombre,
                          mostrarDropdown: false,
                        });
                      }
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-white focus:outline-none focus:border-[var(--primary)] disabled:opacity-30 placeholder:opacity-40"
                />

                {cargandoVinculos && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {busquedaVinculo.mostrarDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 max-h-40 overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1 flex flex-col">
                    {Array.isArray(listaVinculos) &&
                      listaVinculos
                        .filter((c) => {
                          const searchIndex =
                            `${c.codigoSecuencial} ${c.razonSocial} ${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase();
                          return searchIndex.includes(
                            busquedaVinculo.query.toLowerCase(),
                          );
                        })
                        .map((c, idx) => (
                          <div
                            key={c.codigoSecuencial}
                            onClick={() => {
                              const nombre =
                                c.razonSocial ||
                                `${c.nombre || ""} ${c.apellido || ""}`.trim();
                              setNuevaRelacion((prev) => ({
                                ...prev,
                                codigoSecuencial: String(c.codigoSecuencial),
                                nombre,
                              }));
                              setBusquedaVinculo({
                                query: nombre,
                                mostrarDropdown: false,
                              });
                            }}
                            className={`px-3 py-2 flex flex-col cursor-pointer rounded-md transition-colors ${idx === highlightedIndexVinculo ? "bg-[var(--primary)]/50" : "hover:bg-[var(--primary)]/20"}`}
                          >
                            <span className="text-[10px] font-black text-white/90 uppercase tracking-tighter">
                              {c.razonSocial || `${c.nombre} ${c.apellido}`}
                            </span>
                            <span className="text-[8px] font-bold text-white/40">
                              DNI: {c.documento || "S/D"}
                            </span>
                          </div>
                        ))}
                    {Array.isArray(listaVinculos) &&
                      listaVinculos.length === 0 && (
                        <div className="px-3 py-2 text-[10px] text-white/20 text-center">
                          No hay registros
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

                  // Use the stored name, or fallback if available
                  const contactoVinculado = listaVinculos?.find(
                    (c) =>
                      c.codigoSecuencial ===
                      Number(nuevaRelacion.codigoSecuencial),
                  );
                  let nombreFinal = nuevaRelacion.nombre;
                  if (!nombreFinal && contactoVinculado) {
                    nombreFinal =
                      contactoVinculado.razonSocial ||
                      `${contactoVinculado.nombre || ""} ${contactoVinculado.apellido || ""}`.trim();
                  }

                  setForm((prev) => ({
                    ...prev,
                    relaciones: [
                      ...prev.relaciones,
                      {
                        ...nuevaRelacion,
                        codigoSecuencial: Number(
                          nuevaRelacion.codigoSecuencial,
                        ),
                        nombre: nombreFinal || "S/N",
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
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[9px] font-black uppercase tracking-widest transition-all"
              >
                VINCULAR CONTACTO
              </button>
            </div>
          </div>

          {/* 5. CAMPOS DINÁMICOS Refined */}
          {configsEntidad.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.15em]">
                  Extra [{entidadActual?.nombre}]
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {configsEntidad.map((conf) => (
                  <div key={conf.claveCampo} className="space-y-1">
                    <label className="text-[9px] font-black text-white/60 uppercase  ml-1">
                      {conf.nombreCampo}{" "}
                      {conf.requerido && (
                        <span className="text-red-500/50">*</span>
                      )}
                    </label>

                    {conf.tipoDato === "LISTA" ? (
                      <select
                        value={form.atributos[conf.claveCampo] || ""}
                        onChange={(e) =>
                          handleAtributoChange(conf.claveCampo, e.target.value)
                        }
                        className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
                      >
                        <option value="" className="text-black">
                          SELECCIONAR...
                        </option>
                        {(conf.opciones || []).map((opt) => (
                          <option key={opt} className="text-black">
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    ) : conf.tipoDato === "BOOLEANO" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAtributoChange(conf.claveCampo, true)
                          }
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-black border transition-all ${
                            form.atributos[conf.claveCampo] === true
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-white/5 text-white/20 border-transparent hover:bg-white/10"
                          }`}
                        >
                          SÍ
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAtributoChange(conf.claveCampo, false)
                          }
                          className={`flex-1 py-1.5 rounded-md text-[9px] font-black border transition-all ${
                            form.atributos[conf.claveCampo] === false
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-white/5 text-white/20 border-transparent hover:bg-white/10"
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <input
                        type={conf.tipoDato === "NUMERO" ? "number" : "text"}
                        value={form.atributos[conf.claveCampo] || ""}
                        onChange={(e) =>
                          handleAtributoChange(conf.claveCampo, e.target.value)
                        }
                        className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Acción Pro */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-[var(--primary)] text-black rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(var(--p-rgb),0.2)]"
            >
              {contacto ? "ACTUALIZAR" : "CREAR"} CONTACTO
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default FormularioContacto;
