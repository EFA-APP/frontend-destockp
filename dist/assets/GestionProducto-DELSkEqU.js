import { j as e, l as k, h as P, d as y, r as d } from "./index-B40chGZJ.js";
import { u as w } from "./useProductoUI-yQIfvrW4.js";
import { C as N } from "./ComprobanteIcono-BCs5PU0k.js";
import { I as l } from "./InventarioIcono-a1KTnwdi.js";
import { H as u } from "./HistorialIcono-CSQMYL0z.js";
import { C as n } from "./ContenedorSeccion-m2l3PnEr.js";
import { E as S } from "./EncabezadoSeccion-Bn8hRrTt.js";
import { M as C } from "./ModalDetalleGenerico-BgITXwYO.js";
import { L as b } from "./ListaMovimientos-CuaRfzBo.js";
import "./usePersistentState-CXYf17y7.js";
import "./useObtenerProductos.query-B9y12e2p.js";
import "./producto.api-CJIIAdP0.js";
import "./useCrearProducto.mutation-CBmuPtfT.js";
import "./useMutation-BCSmbTcT.js";
import "./InicioIcono-fTjPqS2l.js";
import "./VolverIcono-DKK8Rnlx.js";
import "./ModalDetalle-CYlGfd_c.js";
import "./ModalDetalleBase-CFRCXR5X.js";
import "./index-DUIPri7x.js";
import "./useObtenerMovimientos.query-Bh9QmLu2.js";
import "./movimientos.api-DzztfvQ1.js";
import "./DescargarIcono-WJ0_k1eh.js";
import "./CargandoIcono-CWoE4r-x.js";
import "./react-pdf.browser-C1ZePWAQ.js";
import "./DataTable-C99iIqn_.js";
import "./BuscadorIcono-B01USmuw.js";
import "./AgregarIcono-Db-BdXov.js";
import "./FiltroIcono-qxTG_L65.js";
import "./CajaIcono-Cm7hK_gS.js";
import "./TieneAccion-ve4VSAZe.js";
import "./chevron-down-BDic3tFv.js";
import "./package-BL8JrPA5.js";
import "./loader-circle-6lDZKHs1.js";
import "./useDepositos.query-Ct2IhdGp.js";
import "./SearchableSelect-bgkoKC_d.js";
import "./search-C04IKVS4.js";
import "./map-pin-Ps1GKLMP.js";
import "./rotate-ccw-4gBl0syV.js";
const E = {
    title: "Detalle del producto",
    icon: e.jsx(l, { size: 18 }),
    sections: [
      {
        label: "Producto",
        key: "nombre",
        sub: (i) => `CODE: ${i.codigoSecuencial}`,
        editable: !0,
      },
      {
        label: "Descripción",
        key: "descripcion",
        editable: !0,
        type: "textarea",
      },
      {
        label: "Unidad",
        key: "unidadMedida",
        editable: !0,
        type: "select",
        options: [
          { label: "PAQUETE", value: "PAQUETE" },
          { label: "FRASCO", value: "FRASCO" },
        ],
      },
      { label: "Stock Disponible", key: "stock", editable: !0, type: "number" },
      {
        label: "Cant. p/ Paquete",
        key: "cantidadPorPaquete",
        editable: !0,
        type: "number",
      },
      { label: "Estado Activo", key: "activo", editable: !0, type: "boolean" },
    ],
    metrics: [
      { label: "Stock Total", value: "stock" },
      { label: "Paquetes", value: "cantidadDePaquetesActuales" },
      { label: "Por Paquete", value: "cantidadPorPaquete" },
    ],
  },
  xe = () => {
    const { id: i } = k(),
      s = P(),
      p = y(),
      { productos: c, actualizarProducto: x, cargando: v } = w(),
      [t, f] = d.useState(p.state?.producto || null),
      [a, h] = d.useState(p.state?.tab || "info");
    d.useEffect(() => {
      if (!t && c.length > 0) {
        const o = c.find((m) => String(m.codigoSecuencial) === i);
        o && f(o);
      }
    }, [i, c, t]);
    const g = [
      { id: "info", label: "Información", icon: e.jsx(N, { size: 16 }) },
      { id: "editar", label: "Editar", icon: e.jsx(l, { size: 16 }) },
      { id: "historial", label: "Historial", icon: e.jsx(u, { size: 16 }) },
    ];
    return !t && v
      ? e.jsx(n, {
          className: "flex items-center justify-center p-20",
          children: e.jsx("div", {
            className:
              " text-[var(--primary)] font-black uppercase tracking-widest",
            children: "Cargando Producto...",
          }),
        })
      : t
        ? e.jsxs(n, {
            className: "px-3 py-2",
            children: [
              e.jsx("div", {
                className:
                  "card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md! mb-4 overflow-hidden",
                children: e.jsx(S, {
                  ruta: `Producto: ${t.nombre}`,
                  icono: e.jsx(l, { size: 18 }),
                  volver: !0,
                  redireccionAnterior: "/panel/inventario/productos",
                }),
              }),
              e.jsx("div", {
                className:
                  "flex flex-wrap items-center gap-1.5 p-1! bg-black/20! border! border-black/5! rounded-t-md! backdrop-blur-md! self-start shadow-inner!",
                children: g.map((o) =>
                  e.jsxs(
                    "button",
                    {
                      onClick: () => h(o.id),
                      className: `group relative flex items-center gap-2 px-4 py-2 rounded-md! text-[11px] font-black uppercase tracking-[0.1em] ! ! overflow-hidden! cursor-pointer! ${a === o.id ? "text-[var(--primary)]! bg-[var(--primary)]/10! border! border-[var(--primary)]/20! shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]!" : "text-black/30! hover:text-black/70! hover:bg-white/[0.03]! border! border-transparent!"}`,
                      children: [
                        e.jsx("span", {
                          className: `! ! scale-75 ${a === o.id ? "scale-90! text-[var(--primary)]!" : "!"}`,
                          children: o.icon,
                        }),
                        o.label,
                        a === o.id &&
                          e.jsx("div", {
                            className:
                              "absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]! ! ! !",
                          }),
                      ],
                    },
                    o.id,
                  ),
                ),
              }),
              e.jsxs("div", {
                className: "    bg-[var(--surface)] p-2 rounded-md",
                children: [
                  (a === "info" || a === "editar") &&
                    e.jsx("div", {
                      className: "max-w-[720px] mx-auto",
                      children: e.jsx(C, {
                        open: !0,
                        accentColor: "emerald",
                        isStandalone: !0,
                        hideTabs: a === "info",
                        onClose: () => s("/panel/inventario/productos"),
                        mode: a === "editar" ? "editar" : "view",
                        data: t,
                        ...E,
                        initialTab: "info",
                        width: "w-full",
                        onSave: async (o) => {
                          const {
                            codigoSecuencial: m,
                            codigoEmpresa: A,
                            id: z,
                            ...r
                          } = o;
                          (r.stock !== void 0 &&
                            (r.stock = parseFloat(r.stock) || 0),
                            r.cantidadPorPaquete !== void 0 &&
                              (r.cantidadPorPaquete =
                                parseFloat(r.cantidadPorPaquete) || 0),
                            r.activo !== void 0 && (r.activo = !!r.activo));
                          try {
                            (await x(t.codigoSecuencial, r),
                              s("/panel/inventario/productos"));
                          } catch (j) {
                            console.error("Error updating product:", j);
                          }
                        },
                        children:
                          a === "editar" &&
                          e.jsx(b, {
                            codigoArticulo: t?.codigoSecuencial,
                            tipoArticulo: "PRODUCTO",
                          }),
                      }),
                    }),
                  a === "historial" &&
                    e.jsxs("div", {
                      className: "max-w-[720px] mx-auto bg-transparent!",
                      children: [
                        e.jsxs("div", {
                          className:
                            "flex items-center gap-2 mb-4 p-3 rounded-md! bg-zinc-900/30 border border-black/5 shadow-inner",
                          children: [
                            e.jsx("div", {
                              className:
                                "w-8 h-8 rounded-md! bg-amber-700/10 flex items-center justify-center border border-amber-700/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                              children: e.jsx(u, {
                                size: 16,
                                color: "var(--primary)",
                              }),
                            }),
                            e.jsxs("div", {
                              children: [
                                e.jsx("h3", {
                                  className:
                                    "text-sm font-black text-black uppercase tracking-wider",
                                  children: "Historial",
                                }),
                                e.jsx("p", {
                                  className:
                                    "text-[10px] text-black/40 font-bold uppercase tracking-widest",
                                  children: "Traza de operaciones",
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx(b, {
                          codigoArticulo: t?.codigoSecuencial,
                          tipoArticulo: "PRODUCTO",
                        }),
                      ],
                    }),
                ],
              }),
            ],
          })
        : e.jsx(n, {
            className: "p-8",
            children: e.jsxs("div", {
              className:
                "bg-rose-700/10 border border-rose-700/20 rounded-md p-8 text-center",
              children: [
                e.jsx("p", {
                  className:
                    "text-rose-700 font-black uppercase tracking-widest mb-2",
                  children: "Producto no encontrado",
                }),
                e.jsx("button", {
                  onClick: () => s("/panel/inventario/productos"),
                  className:
                    "text-black/60 hover:text-black underline font-bold mt-4",
                  children: "Volver al listado",
                }),
              ],
            }),
          });
  };
export { xe as default };
