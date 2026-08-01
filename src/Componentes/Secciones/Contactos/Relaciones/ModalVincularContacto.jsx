import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  UserPlus,
  Link2,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import {
  useContactoQuery,
  useCrearRelacionMutation,
} from "../../../../Backend/Contactos/hooks/useRelacionesContacto";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useConfiguracionRelaciones } from "../../../../Backend/Contactos/hooks/useConfiguracionRelaciones";
import {
  generarClaveAutoGenerada,
  esConflictoDeClaveDuplicada,
} from "../../../../Backend/Contactos/utils/relacionAutoGenerar";

// Feature 35 (contactos-tabs-usuarios-relaciones-globales, R35-R41,
// design.md §9.2). Reescrito como wizard de 3 pasos ("origen" -> "relacion"
// -> "vinculo"), sin recibir codigoContacto/idRelacion/nombreRelacion/
// tipoEntidadEsperado como props externos (ya no hay ningún consumidor que
// los fije de antemano tras eliminar VisorRelaciones.jsx, único consumidor
// anterior). El paso "vinculo" reutiliza tal cual la lógica ya existente de
// "Buscar existente"/"Crear nuevo" (feature 33), solo movida al tercer paso.
//
// Feature 36 (contactos-relaciones-agrupadas-por-contacto, R21-R23,
// design.md §5): prop opcional `contactoOrigenInicial` — si viene seteada al
// abrir el modal, el wizard arranca directamente en el paso "relacion" con
// ese contacto ya fijado como origen (paso 1 salteado), usada por
// PanelRelacionesContacto.jsx. Sin esa prop, comportamiento sin cambios.
//
// Feature 37 (contactos-vinculo-entidad-directa, R1-R19, design.md §4): el
// paso "relacion" agrega un selector de TODAS las entidades (useEntidades),
// que coexiste con la lista de relacionesDisponibles ya configuradas (no la
// reemplaza). Al elegir una entidad se resuelve localmente si ya existe una
// ConfiguracionRelacion hacia ese par (0 -> se crea automáticamente vía
// crearConfiguracionRelacion; 1 -> se reusa; 2+ -> se pide desambiguar
// usando la lista de arriba), sin backend nuevo (R17).
const CONTACTO_NUEVO_VACIO = {
  nombre: "",
  apellido: "",
  razonSocial: "",
  documento: "",
  correoElectronico: "",
};

const ModalVincularContacto = ({
  open,
  onClose,
  contactoOrigenInicial = null,
}) => {
  const [paso, setPaso] = useState("origen"); // "origen" | "relacion" | "vinculo"

  // Paso 1: elegir contacto de origen (R36).
  const [contactoOrigen, setContactoOrigen] = useState(null);
  const [busquedaOrigen, setBusquedaOrigen] = useState("");
  const [busquedaOrigenDebounced, setBusquedaOrigenDebounced] = useState("");

  // Paso 2: elegir relación disponible del contacto de origen (R37).
  const [relacionElegida, setRelacionElegida] = useState(null); // {idRelacion, nombre, tipoEntidadEsperado}

  // Feature 37: selector de entidades (R1) y resolución crear-o-reusar.
  const [entidadEnProceso, setEntidadEnProceso] = useState(null); // clave de la entidad en resolución (R8, R11)
  const [entidadAmbigua, setEntidadAmbigua] = useState(null); // clave de la última entidad con 2+ coincidencias (R8)

  // Paso 3 (sin cambios de lógica respecto al componente anterior, R38).
  const [modo, setModo] = useState("existente"); // "existente" | "nuevo"
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [contactoNuevo, setContactoNuevo] = useState(CONTACTO_NUEVO_VACIO);
  const [errorMensaje, setErrorMensaje] = useState("");

  // R36: búsqueda cross-entidad (sin tipoEntidad), mismo mecanismo que el
  // buscador global de DashboardContactos.jsx.
  // Bugfix 2026-07-19: sin `enabled`, la query se disparaba ni bien se
  // montaba el paso "origen" (busquedaOrigenDebounced === ""), trayendo los
  // primeros 8 contactos del backend antes de que el usuario escribiera
  // nada — el placeholder "Escriba para buscar..." de abajo asumía
  // (incorrectamente) que `resultadosOrigen` estaba vacío en ese caso.
  const { contactos: resultadosOrigen, cargandoContactos: cargandoOrigen } =
    useContactos({
      busqueda: busquedaOrigenDebounced,
      limite: 8,
      enabled: Boolean(busquedaOrigenDebounced),
    });

  // R37: relacionesDisponibles ya resuelto por el backend (mismo campo que
  // consumía VisorRelaciones), sin recalcular nada en el frontend.
  // Feature 37: se agrega `refetch` (necesario para R11, condición de
  // carrera en la creación automática), sin modificar el hook.
  const { data: contactoOrigenCompleto, refetch: refetchContactoOrigen } =
    useContactoQuery(contactoOrigen?.codigo);
  const relacionesDisponibles = contactoOrigenCompleto?.relacionesDisponibles || [];

  // Feature 37: lista completa de entidades (R1) y creación de
  // ConfiguracionRelacion (R4), mismas fuentes que GestionRelaciones.jsx.
  const { entidades } = useEntidades();
  const { crearConfiguracionRelacion } = useConfiguracionRelaciones();

  // R38 (bugfix post-review feature 33): el backend resuelve el tipo esperado
  // por el lado opuesto de la relación; se usa tal cual para filtrar la
  // búsqueda, sin recalcularlo en el frontend.
  const { contactos: resultados, cargandoContactos } = useContactos({
    busqueda: busquedaDebounced,
    tipoEntidad: relacionElegida?.tipoEntidadEsperado,
    limite: 8,
  });

  const { mutateAsync: crearRelacion, isPending } = useCrearRelacionMutation();

  useEffect(() => {
    const timer = setTimeout(
      () => setBusquedaOrigenDebounced(busquedaOrigen),
      400,
    );
    return () => clearTimeout(timer);
  }, [busquedaOrigen]);

  useEffect(() => {
    const timer = setTimeout(() => setBusquedaDebounced(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    if (open) {
      if (contactoOrigenInicial) {
        setPaso("relacion"); // R21: paso 1 salteado
        setContactoOrigen(contactoOrigenInicial);
      } else {
        setPaso("origen"); // R22: comportamiento sin cambios
        setContactoOrigen(null);
      }
      setBusquedaOrigen("");
      setBusquedaOrigenDebounced("");
      setRelacionElegida(null);
      setModo("existente");
      setBusqueda("");
      setBusquedaDebounced("");
      setContactoNuevo(CONTACTO_NUEVO_VACIO);
      setErrorMensaje("");
      setEntidadEnProceso(null);
      setEntidadAmbigua(null);
    }
    // Bugfix post-implementación feature 37 (2026-07-19): este efecto debe
    // reiniciar el wizard únicamente en el flanco de apertura (open pasa de
    // false a true), no en cualquier re-render donde `contactoOrigenInicial`
    // reciba una referencia nueva (p. ej. PanelRelacionesContacto/
    // ListaRelacionesContactos re-renderizando con un objeto `contacto`
    // recreado tras un refetch de la lista, con el mismo contenido pero
    // distinta identidad). Antes, `contactoOrigenInicial` estaba en el
    // arreglo de dependencias: cualquier cambio de referencia mientras el
    // modal seguía abierto volvía a ejecutar `setPaso("relacion")`,
    // pisando el paso "vinculo" ya alcanzado (R7) sin que el usuario hiciera
    // nada. `contactoOrigenInicial` se sigue leyendo dentro del efecto (con
    // el valor vigente en el render donde `open` cambia), solo se retira del
    // arreglo de dependencias a propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const nombreContacto = (c) =>
    c?.razonSocial || `${c?.nombre || ""} ${c?.apellido || ""}`.trim() || "Sin Nombre";

  const handleElegirOrigen = (contacto) => {
    setContactoOrigen(contacto);
    setPaso("relacion"); // R36 -> R37
  };

  const handleElegirRelacion = (rel) => {
    setRelacionElegida(rel);
    setPaso("vinculo"); // R37 -> R38
  };

  // Feature 38 (R15): generarClaveAutoGenerada y esConflictoDeClaveDuplicada
  // se importan desde Backend/Contactos/utils/relacionAutoGenerar.js (antes
  // definidas localmente acá, feature 37 R5/R12); mismo comportamiento,
  // origen único.

  // Feature 37 (R3): filtra relacionesDisponibles por tipoEntidadEsperado,
  // sin ninguna llamada de red nueva.
  const resolverCoincidencias = (relaciones, claveEntidadDestino) =>
    relaciones.filter((r) => r.tipoEntidadEsperado === claveEntidadDestino);

  // Feature 37: resuelve, al elegir una entidad del selector nuevo, si hay
  // que reusar una ConfiguracionRelacion existente (R6), crear una nueva
  // automáticamente (R4, R5) o pedir desambiguación (R8) — R7 en todos los
  // casos resueltos avanza automáticamente al paso "vinculo".
  const handleElegirEntidadDestino = async (entidadDestino) => {
    setEntidadAmbigua(null);
    setErrorMensaje("");

    const coincidencias = resolverCoincidencias(
      relacionesDisponibles,
      entidadDestino.clave,
    ); // R3

    if (coincidencias.length === 1) {
      handleElegirRelacion(coincidencias[0]); // R6, R7
      return;
    }

    if (coincidencias.length > 1) {
      setEntidadAmbigua(entidadDestino.clave); // R8
      return;
    }

    // 0 coincidencias -> crear automáticamente (R4, R5)
    setEntidadEnProceso(entidadDestino.clave);
    try {
      const entidadOrigen = entidades.find(
        (e) => e.clave === contactoOrigen.tipoEntidad,
      );
      const nuevaConfig = await crearConfiguracionRelacion({
        clave: generarClaveAutoGenerada(
          contactoOrigen.tipoEntidad,
          entidadDestino.clave,
        ),
        claveOrigen: contactoOrigen.tipoEntidad,
        claveDestino: entidadDestino.clave,
        nombreDirecto: entidadDestino.nombre,
        nombreInverso: entidadOrigen?.nombre || contactoOrigen.tipoEntidad,
        cardinalidad: "MUCHOS_A_MUCHOS",
      });
      handleElegirRelacion({
        idRelacion: nuevaConfig.clave,
        nombre: nuevaConfig.nombreDirecto,
        tipoEntidadEsperado: entidadDestino.clave,
      }); // R7
    } catch (error) {
      if (esConflictoDeClaveDuplicada(error)) {
        // R11: condición de carrera — refrescar y reintentar una vez, sin
        // reutilizar la closure de relacionesDisponibles (puede estar stale).
        const { data: refrescado } = await refetchContactoOrigen();
        const coincidenciasFrescas = resolverCoincidencias(
          refrescado?.relacionesDisponibles || [],
          entidadDestino.clave,
        );
        if (coincidenciasFrescas.length >= 1) {
          handleElegirRelacion(coincidenciasFrescas[0]);
          setEntidadEnProceso(null);
          return;
        }
      }
      // R12
      setErrorMensaje(
        error?.response?.data?.message ||
          "No se pudo preparar la relación. Intente nuevamente.",
      );
    } finally {
      setEntidadEnProceso(null);
    }
  };

  const enviar = async (dto) => {
    setErrorMensaje("");
    try {
      // R39: codigo del contacto de origen elegido en el paso 1 + idRelacion
      // elegido en el paso 2.
      await crearRelacion({
        codigo: contactoOrigen.codigo,
        idRelacion: relacionElegida.idRelacion,
        dto,
      });
      onClose(); // R41
    } catch (error) {
      // R40: mostrar error sin cerrar el modal ni perder los datos cargados.
      setErrorMensaje(
        error?.response?.data?.message ||
          "No se pudo crear el vínculo. Intente nuevamente.",
      );
    }
  };

  const handleSeleccionarExistente = (contacto) => {
    enviar({ contactoExistente: { codigo: contacto.codigo } });
  };

  const handleCrearNuevo = (e) => {
    e.preventDefault();
    const tieneIdentidad =
      contactoNuevo.nombre.trim() ||
      contactoNuevo.apellido.trim() ||
      contactoNuevo.razonSocial.trim();
    if (!tieneIdentidad) {
      setErrorMensaje(
        "Complete al menos un campo de identificación (Nombre, Apellido o Razón Social).",
      );
      return;
    }
    enviar({ contactoNuevo });
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-md shadow-2xl border border-gray-200 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            {/* R21: cuando el modal se abrió con contactoOrigenInicial, el
                paso "origen" fue salteado a propósito — no se ofrece un
                "Atrás" que lleve a un paso que nunca se mostró (design.md
                §5). */}
            {paso !== "origen" &&
              !(paso === "relacion" && contactoOrigenInicial) && (
              <button
                onClick={() =>
                  setPaso(paso === "vinculo" ? "relacion" : "origen")
                }
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                title="Atrás"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-[13px] font-black uppercase text-gray-900 tracking-widest flex items-center gap-2">
                <Link2 size={16} className="text-[#1FAE6D]" />
                Agregar Vínculo
              </h3>
              {contactoOrigen && (
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  {nombreContacto(contactoOrigen)}
                  {relacionElegida && (
                    <>
                      <ArrowRight size={11} className="opacity-50" />
                      {relacionElegida.nombre}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {errorMensaje && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-[12px] font-bold text-rose-700">
              {errorMensaje}
            </div>
          )}

          {/* PASO 1: elegir contacto de origen (R36) */}
          {paso === "origen" && (
            <div className="space-y-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Paso 1: Elegir contacto de origen
              </span>
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 focus-within:ring-2 focus-within:ring-[#1FAE6D]/20 transition-all shadow-sm">
                <Search size={14} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={busquedaOrigen}
                  onChange={(e) => setBusquedaOrigen(e.target.value)}
                  placeholder="Buscar cualquier contacto..."
                  className="bg-transparent border-none outline-none text-[13px] font-medium py-2 px-3 w-full text-gray-900"
                />
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                {cargandoOrigen ? (
                  <div className="text-[11px] font-bold text-gray-500 uppercase text-center py-4">
                    Buscando...
                  </div>
                ) : resultadosOrigen.length === 0 ? (
                  <div className="text-[11px] font-bold text-gray-500 uppercase text-center py-4">
                    {busquedaOrigen ? "Sin resultados" : "Escriba para buscar..."}
                  </div>
                ) : (
                  resultadosOrigen.map((c) => (
                    <button
                      key={c.codigo}
                      type="button"
                      onClick={() => handleElegirOrigen(c)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-200 hover:border-[#1FAE6D]/40 hover:bg-[#1FAE6D]/10 transition-all text-left cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-gray-900 uppercase">
                          {nombreContacto(c)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">
                          {c.tipoEntidad} · DNI/CUIT: {c.documento || "S/D"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PASO 2: elegir relación disponible del contacto de origen (R37) */}
          {paso === "relacion" && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Paso 2: Elegir tipo de relación
              </span>

              {/* Lista de relaciones ya configuradas — sin cambios de
                  lógica, solo reubicada (Feature 37, R9, R12). */}
              {relacionesDisponibles.length === 0 ? (
                <div className="text-[11px] font-bold text-gray-500 uppercase text-center py-2">
                  Este contacto todavía no tiene relaciones configuradas.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {relacionesDisponibles.map((rel) => (
                    <button
                      key={rel.idRelacion}
                      type="button"
                      onClick={() => handleElegirRelacion(rel)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-200 hover:border-[#1FAE6D]/40 hover:bg-[#1FAE6D]/10 transition-all text-left cursor-pointer"
                    >
                      <span className="text-[12px] font-bold text-gray-900 uppercase">
                        {rel.nombre}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        {rel.cantidadVinculos} vínculo(s)
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selector de entidad destino (Feature 37, R1, R9): coexiste
                  con la lista de arriba, no la reemplaza. */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  O elegir una entidad
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {entidades.map((ent) => {
                    const coincidencias = resolverCoincidencias(
                      relacionesDisponibles,
                      ent.clave,
                    );
                    return (
                      <button
                        key={ent.clave}
                        type="button"
                        disabled={Boolean(entidadEnProceso)}
                        onClick={() => handleElegirEntidadDestino(ent)}
                        className="flex flex-col items-start px-3 py-2 rounded-md border border-gray-200 hover:border-[#1FAE6D]/40 hover:bg-[#1FAE6D]/10 transition-all text-left cursor-pointer disabled:opacity-50"
                      >
                        <span className="text-[11px] font-bold text-gray-900 uppercase">
                          {ent.nombre}
                          {entidadEnProceso === ent.clave && "…"}
                        </span>
                        {coincidencias.length === 1 && (
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider opacity-70">
                            Ya configurada
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {entidadAmbigua && (
                  <div className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Ya existen varias relaciones configuradas hacia esa
                    entidad. Elegí una de la lista de relaciones de arriba.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 3: buscar existente / crear nuevo (R38, sin cambios de lógica) */}
          {paso === "vinculo" && (
            <>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Paso 3: Vincular contacto
              </span>

              <div className="flex gap-1 p-1 bg-gray-50 rounded-md border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setModo("existente");
                    setErrorMensaje("");
                  }}
                  className={`flex-1 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    modo === "existente"
                      ? "bg-white text-[#1FAE6D] shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Buscar Existente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModo("nuevo");
                    setErrorMensaje("");
                  }}
                  className={`flex-1 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    modo === "nuevo"
                      ? "bg-white text-[#1FAE6D] shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Crear Nuevo
                </button>
              </div>

              {modo === "existente" ? (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Buscando:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1FAE6D]/10 text-[#1FAE6D] border border-[#1FAE6D]/20 text-[10px] font-black uppercase tracking-wider">
                      {relacionElegida?.tipoEntidadEsperado}
                    </span>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 focus-within:ring-2 focus-within:ring-[#1FAE6D]/20 transition-all shadow-sm">
                    <Search size={14} className="text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre, razón social o documento..."
                      className="bg-transparent border-none outline-none text-[13px] font-medium py-2 px-3 w-full text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {cargandoContactos ? (
                      <div className="text-[11px] font-bold text-gray-500 uppercase text-center py-4">
                        Buscando...
                      </div>
                    ) : resultados.length === 0 ? (
                      <div className="text-[11px] font-bold text-gray-500 uppercase text-center py-4">
                        {busqueda ? "Sin resultados" : "Escriba para buscar..."}
                      </div>
                    ) : (
                      resultados.map((c) => (
                        <button
                          key={c.codigo}
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSeleccionarExistente(c)}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-200 hover:border-[#1FAE6D]/40 hover:bg-[#1FAE6D]/10 transition-all text-left cursor-pointer disabled:opacity-50"
                        >
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-gray-900 uppercase">
                              {nombreContacto(c)}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">
                              {c.tipoEntidad} · DNI/CUIT: {c.documento || "S/D"}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCrearNuevo} className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombres"
                      value={contactoNuevo.nombre}
                      onChange={(e) =>
                        setContactoNuevo((p) => ({ ...p, nombre: e.target.value }))
                      }
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] shadow-sm transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Apellidos"
                      value={contactoNuevo.apellido}
                      onChange={(e) =>
                        setContactoNuevo((p) => ({
                          ...p,
                          apellido: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] shadow-sm transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Razón Social (opcional)"
                    value={contactoNuevo.razonSocial}
                    onChange={(e) =>
                      setContactoNuevo((p) => ({
                        ...p,
                        razonSocial: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] shadow-sm transition-all uppercase"
                  />
                  <input
                    type="text"
                    placeholder="DNI / CUIT"
                    value={contactoNuevo.documento}
                    onChange={(e) =>
                      setContactoNuevo((p) => ({
                        ...p,
                        documento: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] shadow-sm transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Correo Electrónico (opcional)"
                    value={contactoNuevo.correoElectronico}
                    onChange={(e) =>
                      setContactoNuevo((p) => ({
                        ...p,
                        correoElectronico: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] shadow-sm transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 bg-[#1FAE6D] hover:bg-[#178F58] text-white text-[12px] font-black uppercase tracking-widest rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    {isPending ? "Vinculando..." : "Crear y Vincular"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalVincularContacto;
