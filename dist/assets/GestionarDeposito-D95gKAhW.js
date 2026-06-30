import { h as w, v as N, d as E, j as e, r as S } from "./index-B40chGZJ.js";
import { u as k } from "./useDepositoUI-C_Zchswj.js";
import { I as A } from "./InventarioIcono-a1KTnwdi.js";
import { C as d } from "./ContenedorSeccion-m2l3PnEr.js";
import { E as q } from "./EncabezadoSeccion-Bn8hRrTt.js";
import { F as G } from "./FormularioDinamico-jy4KRBkB.js";
import "./usePersistentState-CXYf17y7.js";
import "./useDepositos.query-Ct2IhdGp.js";
import "./useMutation-BCSmbTcT.js";
import "./useCrearProducto.mutation-CBmuPtfT.js";
import "./producto.api-CJIIAdP0.js";
import "./InicioIcono-fTjPqS2l.js";
import "./VolverIcono-DKK8Rnlx.js";
import "./AgregarIcono-Db-BdXov.js";
import "./BorrarIcono-BP3NznrB.js";
import "./CalendarioIcono-CsDrNZuF.js";
import "./SubirIcono-KXn07LuV.js";
import "./SearchableSelect-bgkoKC_d.js";
import "./chevron-down-BDic3tFv.js";
import "./search-C04IKVS4.js";
const u = [
    {
      name: "nombre",
      label: "Nombre del Depósito",
      type: "text",
      required: !0,
      section: "Identificación",
    },
    {
      name: "descripcion",
      label: "Descripción / Notas",
      type: "textarea",
      required: !1,
      section: "Identificación",
    },
    {
      name: "responsable",
      label: "Responsable / Encargado",
      type: "text",
      required: !1,
      section: "Contacto",
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      required: !1,
      section: "Ubicación",
    },
    {
      name: "ciudad",
      label: "Ciudad / Localidad",
      type: "text",
      required: !1,
      section: "Ubicación",
    },
    {
      name: "telefono",
      label: "Teléfono de Contacto",
      type: "text",
      required: !1,
      section: "Contacto",
    },
    {
      name: "principal",
      label: "¿Es el Depósito Principal?",
      type: "switch",
      defaultValue: !1,
      required: !1,
      section: "Configuración",
    },
    {
      name: "activo",
      label: "Depósito Activo",
      type: "switch",
      required: !1,
      defaultValue: !0,
      hidden: (s) => !s?.codigoSecuencial,
      section: "Configuración",
    },
  ],
  oe = () => {
    const s = w(),
      [b] = N(),
      f = E(),
      n = b.get("codigoSecuencial"),
      r = f.pathname.includes("/inventario/galpones"),
      o = r ? "Galpón" : "Depósito",
      x = r ? "Galpones" : "Depósitos",
      l = r ? "/panel/inventario/galpones" : "/panel/inventario/depositos",
      {
        depositos: g,
        crearDeposito: h,
        actualizarDeposito: v,
        estaCreando: j,
        estaActualizando: y,
        cargando: p,
      } = k(),
      a = !!n,
      c = a ? g.find((i) => String(i.codigoSecuencial) === n) : null,
      C = async (i) => {
        try {
          const {
            codigoSecuencial: t,
            codigoEmpresa: $,
            createdAt: I,
            updatedAt: L,
            id: P,
            ...m
          } = i;
          (a ? await v(n, m) : await h(m), s(l));
        } catch (t) {
          console.error(
            `Error al ${a ? "actualizar" : "crear"} ${o.toLowerCase()}:`,
            t,
          );
        }
      };
    if (a && !c && p)
      return e.jsx(d, {
        className: "px-3 py-4",
        children: e.jsxs("div", {
          className:
            "flex flex-col items-center justify-center p-12 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md ",
          children: [
            e.jsx("div", {
              className: "w-12 h-12 bg-[var(--primary)]/20 rounded-full mb-4",
            }),
            e.jsx("div", {
              className: "h-4 w-48 bg-black/5 rounded-full mb-2",
            }),
            e.jsx("div", { className: "h-3 w-32 bg-black/5 rounded-full" }),
          ],
        }),
      });
    if (a && !c && !p)
      return e.jsx(d, {
        className: "px-3 py-4",
        children: e.jsxs("div", {
          className:
            "text-black text-center p-8 bg-rose-700/10 border border-rose-700/20 rounded-md shadow-xl backdrop-blur-sm",
          children: [
            e.jsx("p", {
              className:
                "text-rose-700 font-black uppercase tracking-widest mb-2",
              children: "Error de Identificación",
            }),
            e.jsxs("p", {
              className: "text-black/60 font-medium italic",
              children: [
                "El ",
                o.toLowerCase(),
                " con código",
                " ",
                e.jsxs("span", {
                  className: "text-black font-bold",
                  children: ["#", n],
                }),
                " no fue encontrado o no existe.",
              ],
            }),
          ],
        }),
      });
    const D = S.useMemo(
      () =>
        u.map((i) => {
          let t = i.label;
          return (
            r &&
              (t = t
                .replace(/Depósito/g, "Galpón")
                .replace(/depósito/g, "galpón")),
            { ...i, label: t }
          );
        }),
      [u, r],
    );
    return e.jsxs(d, {
      className: "px-3 py-4",
      children: [
        e.jsx("div", {
          className:
            "card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-6 overflow-hidden",
          children: e.jsx(q, {
            ruta: a ? `Edición de ${o}` : `Gestión de ${x}`,
            icono: e.jsx(A, { size: 18 }),
            volver: !0,
            redireccionAnterior: l,
          }),
        }),
        e.jsx(G, {
          titulo: a ? `Configurar ${o}` : `Alta de Punto de ${o}`,
          subtitulo: a
            ? `Actualice la información de ${c?.nombre || `el ${o.toLowerCase()}`}.`
            : "Registre una nueva ubicación física para la gestión de stock global.",
          campos: D,
          initialData: c,
          onSubmit: C,
          onCancel: () => s(l),
          submitLabel: a
            ? y
              ? "Guardando..."
              : "Guardar Cambios"
            : j
              ? "Procesando..."
              : "Confirmar Alta",
        }),
      ],
    });
  };
export { oe as default };
