import {
  t as z,
  g as F,
  a as U,
  u as M,
  r as b,
  j as e,
} from "./index-B40chGZJ.js";
import { E as O } from "./EncabezadoSeccion-Bn8hRrTt.js";
import { C as G } from "./ConfiguracionIcono-wUXbdfq1.js";
import { C as L, E as J } from "./EmitirCuotasIcono-Bk8WUabB.js";
import { d as Y, A as H, a as P, u as W } from "./useContactos-BAAEKb2P.js";
import { u as B } from "./useMutation-BCSmbTcT.js";
import { u as q } from "./useAsientos.query-UhnHb_Rc.js";
import { l as X } from "./asientos.api-BS_H2o43.js";
import { b as Z } from "./formatters-BXXpA9fF.js";
import { P as ee } from "./package-BL8JrPA5.js";
import "./InicioIcono-fTjPqS2l.js";
import "./VolverIcono-DKK8Rnlx.js";
const te = () => {
    const {
      data: t = { items: [], total: 0 },
      isLoading: s,
      isError: a,
      error: r,
      refetch: o,
    } = z({
      queryKey: ["alumnos-cuotas"],
      queryFn: () =>
        Y({ tipoEntidad: "ALUM", limite: 200, codigoCuenta: "110301005" }),
      staleTime: 3e4,
    });
    return {
      alumnos: Array.isArray(t) ? t : (t?.items ?? []),
      cargandoAlumnos: s,
      errorAlumnos: a ? r : null,
      refetch: o,
    };
  },
  re = () => {
    const t = F(),
      { data: s = [], isLoading: a } = z({
        queryKey: ["configuracion-campos-contacto"],
        queryFn: () => P(),
        staleTime: 6e4,
      }),
      r =
        s.find((d) => d.claveCampo === "cuota" && d.entidadClave === "ALUM") ??
        null,
      o = B({
        mutationFn: (d) => {
          if (!r) throw new Error("Configuración de cuota no encontrada");
          return H(r.codigoSecuencial, { formula: String(d) });
        },
        onSuccess: () => {
          t.invalidateQueries({ queryKey: ["configuracion-campos-contacto"] });
        },
      });
    return {
      configCuota: r,
      codigoSecuencial: r?.codigoSecuencial ?? null,
      formula: r?.formula ?? "",
      cargandoConfig: a,
      actualizarCuota: o.mutateAsync,
    };
  },
  ae = 10;
function R(t, s) {
  if (!t) return 0;
  const a = t.trim(),
    r = a.match(/^[\w_]+\s*===\s*"([^"]+)"\s*\?\s*([\d.]+)\s*:\s*([\d.]+)$/);
  if (r) {
    const d = r[1],
      i = parseFloat(r[2]),
      c = parseFloat(r[3]);
    return s === d ? i : c;
  }
  const o = parseFloat(a);
  return isNaN(o) ? 0 : o;
}
function T(t, s, a) {
  const r = String(a).padStart(2, "0"),
    o = String(s);
  return `CUOTA-${t}-${o}-${r}`;
}
function _(t, s, a, r) {
  if (!(Array.isArray(s) && s.some((c) => c.referencia === t)))
    return "SIN_EMITIR";
  const d = new Date(a.getFullYear(), a.getMonth(), ae);
  return new Date(r.getFullYear(), r.getMonth(), r.getDate()) <= d
    ? "EMITIDA"
    : "VENCIDA";
}
function $(t) {
  if (t == null || t === "") return "$ 0";
  const s = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(s)
    ? "$ 0"
    : "$ " +
        new Intl.NumberFormat("es-AR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(s);
}
const K = async ({ codigoCtaCte: t, mes: s, anio: a, codigoContacto: r }) => {
    const o = { codigoCtaCte: t, mes: s, anio: a };
    r != null && (o.codigoContacto = r);
    const { data: d } = await U.post("/contabilidad/cuotas/emitir-lote", o);
    return d;
  },
  se = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  oe = "110301005",
  ne = ({
    alumno: t,
    formula: s,
    mes: a,
    anio: r,
    asientos: o,
    onClose: d,
    onExito: i,
  }) => {
    const { usuario: c } = M(),
      x = F(),
      [h, u] = b.useState(!1),
      [g, p] = b.useState(null),
      m = t.atributos?.tipo_alumno ?? "",
      v = R(s, m),
      w = T(t.codigoSecuencial, r, a),
      f = new Date(r, a - 1, 1),
      j = _(w, o ?? [], f, new Date()) !== "SIN_EMITIR",
      n = t.razonSocial || `${t.nombre ?? ""} ${t.apellido ?? ""}`.trim(),
      E = se[a - 1],
      l = async () => {
        if (!j) {
          (u(!0), p(null));
          try {
            (await K({
              codigoCtaCte: oe,
              mes: a,
              anio: r,
              codigoContacto: t.codigoSecuencial,
            }),
              x.invalidateQueries({ queryKey: ["asientos"] }),
              x.invalidateQueries({ queryKey: ["alumnos-cuotas"] }),
              x.invalidateQueries({ queryKey: ["deuda-alumno"] }),
              i());
          } catch (y) {
            p(y?.response?.data?.message || "Error al emitir cuota");
          } finally {
            u(!1);
          }
        }
      };
    return e.jsx("div", {
      className:
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm",
      children: e.jsxs("div", {
        className:
          "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5",
        children: [
          e.jsx("h2", {
            className:
              "text-lg font-black uppercase tracking-tight text-[var(--text-primary)]",
            children: "Emitir cuota individual",
          }),
          e.jsxs("div", {
            className:
              "flex flex-col gap-2 text-[12px] font-bold text-[var(--text-secondary)]",
            children: [
              e.jsxs("p", {
                children: [
                  "Alumno:",
                  " ",
                  e.jsx("span", {
                    className: "text-[var(--text-primary)] uppercase",
                    children: n,
                  }),
                ],
              }),
              e.jsxs("p", {
                children: [
                  "Período:",
                  " ",
                  e.jsxs("span", {
                    className: "text-[var(--text-primary)]",
                    children: [E, " ", r],
                  }),
                ],
              }),
              e.jsxs("p", {
                children: [
                  "Monto cuota:",
                  " ",
                  e.jsx("span", {
                    className: "text-[var(--text-primary)] text-[14px]",
                    children: $(v),
                  }),
                ],
              }),
            ],
          }),
          j &&
            e.jsxs("div", {
              className:
                "bg-amber-50 border border-amber-200 rounded-md p-3 text-[12px] font-bold text-amber-700",
              children: [
                "Ya existe una cuota emitida para este alumno en ",
                a,
                "/",
                r,
              ],
            }),
          g &&
            e.jsx("p", {
              className: "text-rose-600 font-bold text-[12px]",
              children: g,
            }),
          e.jsxs("div", {
            className: "flex gap-3",
            children: [
              e.jsx("button", {
                onClick: d,
                disabled: h,
                className:
                  "flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer",
                children: "Cancelar",
              }),
              e.jsx("button", {
                onClick: l,
                disabled: j || h,
                className:
                  "flex-1 py-3 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer",
                children: h
                  ? e.jsx("div", {
                      className:
                        "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                    })
                  : "Confirmar",
              }),
            ],
          }),
        ],
      }),
    });
  },
  le = ({ codigoEmpresa: t, codigoContacto: s }) => {
    const { data: a = [], isLoading: r } = z({
        queryKey: ["deuda-alumno", t, s],
        queryFn: () => X({ codigoEmpresa: t, origenModulo: "ESCUELA" }),
        enabled: !!t && !!s,
        staleTime: 3e4,
      }),
      o = `CUOTA-${s}-`;
    return {
      asientosCuota: Array.isArray(a)
        ? a.filter((i) => i.referencia?.startsWith(o))
        : [],
      cargandoDeuda: r,
    };
  },
  ie = ({ alumno: t, onClose: s }) => {
    const { usuario: a } = M(),
      { asientosCuota: r, cargandoDeuda: o } = le({
        codigoEmpresa: a?.codigoEmpresa,
        codigoContacto: t.codigoSecuencial,
      }),
      d = t.razonSocial || `${t.nombre ?? ""} ${t.apellido ?? ""}`.trim();
    return e.jsx("div", {
      className:
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm",
      children: e.jsxs("div", {
        className:
          "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[80vh]",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("h2", {
                className:
                  "text-lg font-black uppercase tracking-tight text-[var(--text-primary)]",
                children: ["Historial de deudas — ", d],
              }),
              e.jsx("button", {
                onClick: s,
                className:
                  "w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer text-lg font-black",
                children: "×",
              }),
            ],
          }),
          o
            ? e.jsx("div", {
                className: "flex flex-col gap-2",
                children: Array.from({ length: 3 }).map((i, c) =>
                  e.jsx(
                    "div",
                    { className: "h-10 bg-black/5 rounded animate-pulse" },
                    c,
                  ),
                ),
              })
            : r.length === 0
              ? e.jsx("p", {
                  className:
                    "text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest py-8 text-center",
                  children: "Sin cuotas emitidas",
                })
              : e.jsx("div", {
                  className: "overflow-y-auto flex-1",
                  children: e.jsxs("table", {
                    className: "w-full border-collapse text-left",
                    children: [
                      e.jsx("thead", {
                        className: "bg-[var(--fill-secondary)] sticky top-0",
                        children: e.jsxs("tr", {
                          children: [
                            e.jsx("th", {
                              className:
                                "px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)]",
                              children: "Referencia",
                            }),
                            e.jsx("th", {
                              className:
                                "px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)]",
                              children: "Fecha",
                            }),
                            e.jsx("th", {
                              className:
                                "px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right",
                              children: "Monto",
                            }),
                            e.jsx("th", {
                              className:
                                "px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center",
                              children: "Estado",
                            }),
                          ],
                        }),
                      }),
                      e.jsx("tbody", {
                        children: r.map((i) => {
                          const c = i.referencia?.split("-") ?? [],
                            x = c[c.length - 2],
                            h = c[c.length - 1],
                            u =
                              x && h
                                ? new Date(Number(x), Number(h) - 1, 1)
                                : null,
                            g = new Date(),
                            p = u
                              ? new Date(u.getFullYear(), u.getMonth(), 10)
                              : null,
                            m = new Date(
                              g.getFullYear(),
                              g.getMonth(),
                              g.getDate(),
                            ),
                            v = p
                              ? m <= p
                                ? "EMITIDA"
                                : "VENCIDA"
                              : "EMITIDA",
                            w = i.detalles
                              ? i.detalles.reduce(
                                  (f, k) => f + (k.debe ?? 0),
                                  0,
                                )
                              : 0;
                          return e.jsxs(
                            "tr",
                            {
                              className:
                                "border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/40 transition-colors",
                              children: [
                                e.jsx("td", {
                                  className:
                                    "px-3 py-2.5 text-[11px] font-mono text-[var(--text-primary)]",
                                  children: i.referencia,
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-3 py-2.5 text-[11px] text-[var(--text-secondary)]",
                                  children: Z(i.fecha),
                                }),
                                e.jsx("td", {
                                  className:
                                    "px-3 py-2.5 text-[11px] font-bold text-right text-[var(--text-primary)]",
                                  children: $(w),
                                }),
                                e.jsx("td", {
                                  className: "px-3 py-2.5 text-center",
                                  children: e.jsx("span", {
                                    className: `px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${v === "VENCIDA" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`,
                                    children: v,
                                  }),
                                }),
                              ],
                            },
                            i.codigoSecuencial,
                          );
                        }),
                      }),
                    ],
                  }),
                }),
          e.jsx("button", {
            onClick: s,
            className:
              "w-full py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-colors cursor-pointer",
            children: "Cerrar",
          }),
        ],
      }),
    });
  },
  ce = [
    { valor: "proximo_mes", etiqueta: "aplicar desde próximo mes" },
    { valor: "recalcular_actual", etiqueta: "recalcular cuota actual impaga" },
  ],
  de = ({
    alumno: t,
    nuevoTipoAlumno: s,
    mes: a,
    anio: r,
    asientos: o,
    onClose: d,
    onExito: i,
  }) => {
    const c = F(),
      [x, h] = b.useState(""),
      [u, g] = b.useState(!1),
      [p, m] = b.useState(""),
      { actualizarContacto: v } = W(),
      w = T(t.codigoSecuencial, r, a),
      f = new Date(r, a - 1, 1),
      j = _(w, o ?? [], f, new Date()) !== "SIN_EMITIR",
      n = t.razonSocial || `${t.nombre ?? ""} ${t.apellido ?? ""}`.trim(),
      E = async () => {
        if (x) {
          (g(!0), m(""));
          try {
            const {
              codigoEmpresa: l,
              codigoSecuencial: y,
              fechaCreacion: A,
              updatedAt: N,
              estado: S,
              ...D
            } = t;
            x === "proximo_mes"
              ? (await v({
                  id: t.codigoSecuencial,
                  dto: {
                    ...D,
                    atributos: { ...(t.atributos ?? {}), tipo_alumno: s },
                  },
                }),
                c.invalidateQueries({ queryKey: ["alumnos-cuotas"] }),
                c.invalidateQueries({ queryKey: ["asientos"] }),
                i())
              : (await v({
                  id: t.codigoSecuencial,
                  dto: {
                    ...D,
                    atributos: { ...(t.atributos ?? {}), tipo_alumno: s },
                  },
                }),
                c.invalidateQueries({ queryKey: ["alumnos-cuotas"] }),
                c.invalidateQueries({ queryKey: ["asientos"] }),
                j
                  ? m(
                      "El tipo de alumno fue actualizado, pero la cuota de este mes ya fue emitida y no puede modificarse retroactivamente.",
                    )
                  : i());
          } catch (l) {
            m(
              l?.response?.data?.message ||
                "Error al actualizar el tipo de alumno.",
            );
          } finally {
            g(!1);
          }
        }
      };
    return e.jsx("div", {
      className:
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm",
      children: e.jsxs("div", {
        className:
          "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5",
        children: [
          e.jsx("h2", {
            className:
              "text-lg font-black uppercase tracking-tight text-[var(--text-primary)]",
            children: "Cambio de tipo de alumno",
          }),
          e.jsxs("div", {
            className:
              "text-[12px] font-bold text-[var(--text-secondary)] flex flex-col gap-1",
            children: [
              e.jsxs("p", {
                children: [
                  "Alumno:",
                  " ",
                  e.jsx("span", {
                    className: "text-[var(--text-primary)] uppercase",
                    children: n,
                  }),
                ],
              }),
              e.jsxs("p", {
                children: [
                  "Nuevo tipo:",
                  " ",
                  e.jsx("span", {
                    className:
                      "text-[var(--text-primary)] uppercase font-black",
                    children: s,
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex flex-col gap-3",
            children: [
              e.jsx("p", {
                className:
                  "text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]",
                children: "Seleccioná cómo aplicar el cambio:",
              }),
              ce.map((l) =>
                e.jsxs(
                  "label",
                  {
                    className: `flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${x === l.valor ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]"}`,
                    children: [
                      e.jsx("input", {
                        type: "radio",
                        name: "opcion-tipo-alumno",
                        value: l.valor,
                        checked: x === l.valor,
                        onChange: () => h(l.valor),
                        className: "accent-[var(--primary)]",
                      }),
                      e.jsx("span", {
                        className:
                          "text-[12px] font-bold text-[var(--text-primary)]",
                        children: l.etiqueta,
                      }),
                    ],
                  },
                  l.valor,
                ),
              ),
            ],
          }),
          p &&
            e.jsx("div", {
              className:
                "bg-amber-50 border border-amber-200 rounded-md p-3 text-[12px] font-bold text-amber-700",
              children: p,
            }),
          e.jsxs("div", {
            className: "flex gap-3",
            children: [
              e.jsx("button", {
                onClick: d,
                disabled: u,
                className:
                  "flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer",
                children: "Cancelar",
              }),
              e.jsx("button", {
                onClick: E,
                disabled: !x || u || !!p,
                className:
                  "flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer",
                children: u
                  ? e.jsx("div", {
                      className:
                        "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                    })
                  : "Confirmar",
              }),
            ],
          }),
        ],
      }),
    });
  },
  ue = ({ estado: t }) =>
    t === "VENCIDA"
      ? e.jsx("span", {
          className:
            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200",
          children: "VENCIDA",
        })
      : t === "EMITIDA"
        ? e.jsx("span", {
            className:
              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200",
            children: "EMITIDA",
          })
        : e.jsx("span", {
            className:
              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[var(--fill-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]",
            children: "SIN EMITIR",
          }),
  xe = ({
    alumnos: t,
    cargando: s,
    formula: a,
    mes: r,
    anio: o,
    refetch: d,
  }) => {
    const { usuario: i } = M(),
      [c, x] = b.useState(null),
      [h, u] = b.useState(null),
      [g, p] = b.useState(null),
      m = b.useMemo(() => new Date(o, r - 1, 1), [o, r]),
      v = new Date(),
      w = `${o}-${String(r).padStart(2, "0")}-01`,
      f = new Date(o, r, 0).getDate(),
      k = `${o}-${String(r).padStart(2, "0")}-${f}`,
      { data: C = [] } = q(
        i?.codigoEmpresa
          ? {
              codigoEmpresa: i.codigoEmpresa,
              origenModulo: "ESCUELA",
              fechaDesde: w,
              fechaHasta: k,
            }
          : {},
      ),
      j = b.useMemo(
        () =>
          t.map((n) => {
            const E = n.atributos?.tipo_alumno ?? "",
              l = n.atributos?.curso ?? "",
              y = R(a, E),
              A = T(n.codigoSecuencial, o, r),
              N = _(A, C, m, v),
              S = n.atributos?.saldo ?? 0,
              D =
                n.razonSocial || `${n.nombre ?? ""} ${n.apellido ?? ""}`.trim();
            return {
              ...n,
              tipoAlumno: E,
              curso: l,
              monto: y,
              referencia: A,
              estado: N,
              saldo: S,
              nombreCompleto: D,
            };
          }),
        [t, a, o, r, C, m],
      );
    return s
      ? e.jsx("div", {
          className:
            "bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden",
          children: e.jsxs("table", {
            className: "w-full border-collapse",
            children: [
              e.jsx("thead", {
                className: "bg-[var(--fill-secondary)]",
                children: e.jsx("tr", {
                  children: [
                    "Alumno",
                    "Tipo",
                    "Curso",
                    "Monto Cuota",
                    "Estado",
                    "Saldo Deuda",
                    "Acciones",
                  ].map((n) =>
                    e.jsx(
                      "th",
                      {
                        className:
                          "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left",
                        children: n,
                      },
                      n,
                    ),
                  ),
                }),
              }),
              e.jsx("tbody", {
                children: Array.from({ length: 5 }).map((n, E) =>
                  e.jsx(
                    "tr",
                    {
                      className: "border-b border-[var(--border-subtle)]",
                      children: Array.from({ length: 7 }).map((l, y) =>
                        e.jsx(
                          "td",
                          {
                            className: "px-4 py-3",
                            children: e.jsx("div", {
                              className: "h-4 bg-black/5 rounded animate-pulse",
                            }),
                          },
                          y,
                        ),
                      ),
                    },
                    E,
                  ),
                ),
              }),
            ],
          }),
        })
      : j.length === 0
        ? e.jsxs("div", {
            className:
              "bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] py-20 flex flex-col items-center gap-3 text-[var(--text-muted)]",
            children: [
              e.jsx(ee, { size: 40, className: "opacity-20" }),
              e.jsx("p", {
                className: "text-[13px] font-bold uppercase tracking-widest",
                children: "No hay alumnos registrados",
              }),
            ],
          })
        : e.jsxs(e.Fragment, {
            children: [
              e.jsx("div", {
                className:
                  "bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden",
                children: e.jsx("div", {
                  className: "overflow-x-auto",
                  children: e.jsxs("table", {
                    className: "w-full border-collapse min-w-max",
                    children: [
                      e.jsx("thead", {
                        className:
                          "bg-[var(--fill-secondary)] sticky top-0 z-10",
                        children: e.jsxs("tr", {
                          children: [
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left",
                              children: "Alumno",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left",
                              children: "Tipo",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-left",
                              children: "Curso",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right",
                              children: "Monto Cuota",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center",
                              children: "Estado",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right",
                              children: "Saldo Deuda",
                            }),
                            e.jsx("th", {
                              className:
                                "px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right",
                              children: "Acciones",
                            }),
                          ],
                        }),
                      }),
                      e.jsx("tbody", {
                        children: j.map((n) =>
                          e.jsxs(
                            "tr",
                            {
                              className: `border-b border-[var(--border-subtle)] transition-colors ${n.estado === "VENCIDA" ? "border-l-4 border-l-rose-500 bg-rose-50/30" : "hover:bg-[var(--fill-secondary)]/40"}`,
                              "data-estado": n.estado,
                              children: [
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx("span", {
                                    className:
                                      "text-[12px] font-bold text-[var(--text-primary)] uppercase",
                                    children:
                                      n.nombreCompleto ||
                                      `Alumno #${n.codigoSecuencial}`,
                                  }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx("span", {
                                    className:
                                      "text-[11px] font-bold text-[var(--text-secondary)] uppercase",
                                    children: n.tipoAlumno || "—",
                                  }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsx("span", {
                                    className:
                                      "text-[11px] font-bold text-[var(--text-secondary)] uppercase",
                                    children: n.curso || "—",
                                  }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-right",
                                  children: e.jsx("span", {
                                    className:
                                      "text-[12px] font-bold text-[var(--text-primary)]",
                                    children: $(n.monto),
                                  }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-center",
                                  children: e.jsx(ue, { estado: n.estado }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3 text-right",
                                  children: e.jsx("span", {
                                    className: `text-[12px] font-bold ${n.saldo > 0 ? "text-rose-600" : "text-[var(--text-primary)]"}`,
                                    children: $(n.saldo),
                                  }),
                                }),
                                e.jsx("td", {
                                  className: "px-4 py-3",
                                  children: e.jsxs("div", {
                                    className: "flex justify-end gap-2",
                                    children: [
                                      n.estado === "SIN_EMITIR" &&
                                        e.jsx("button", {
                                          onClick: () => x(n),
                                          className:
                                            "px-3 py-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all cursor-pointer",
                                          children: "Emitir",
                                        }),
                                      e.jsx("button", {
                                        onClick: () => u(n),
                                        className:
                                          "px-3 py-1.5 bg-[var(--fill-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded text-[10px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-all cursor-pointer",
                                        children: "Ver deudas",
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            },
                            n.codigoSecuencial,
                          ),
                        ),
                      }),
                    ],
                  }),
                }),
              }),
              c &&
                e.jsx(ne, {
                  alumno: c,
                  formula: a,
                  mes: r,
                  anio: o,
                  asientos: C,
                  onClose: () => x(null),
                  onExito: () => {
                    (x(null), d());
                  },
                }),
              h && e.jsx(ie, { alumno: h, onClose: () => u(null) }),
              g &&
                e.jsx(de, {
                  alumno: g,
                  mes: r,
                  anio: o,
                  asientos: C,
                  onClose: () => p(null),
                  onExito: () => {
                    (p(null), d());
                  },
                }),
            ],
          });
  },
  pe = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  me = "110301005",
  be = ({
    alumnos: t,
    formula: s,
    mes: a,
    anio: r,
    onClose: o,
    onExito: d,
  }) => {
    const { usuario: i } = M(),
      c = F(),
      [x, h] = b.useState(!1),
      [u, g] = b.useState(null),
      p = new Date(r, a - 1, 1),
      m = new Date(),
      v = `${r}-${String(a).padStart(2, "0")}-01`,
      w = new Date(r, a, 0).getDate(),
      f = `${r}-${String(a).padStart(2, "0")}-${w}`,
      { data: k = [] } = q(
        i?.codigoEmpresa
          ? {
              codigoEmpresa: i.codigoEmpresa,
              origenModulo: "ESCUELA",
              fechaDesde: v,
              fechaHasta: f,
            }
          : {},
      ),
      { pendientes: C, yaEmitidos: j } = t.reduce(
        (l, y) => {
          const A = T(y.codigoSecuencial, r, a);
          return (
            _(A, k, p, m) === "SIN_EMITIR"
              ? l.pendientes.push(y)
              : l.yaEmitidos.push(y),
            l
          );
        },
        { pendientes: [], yaEmitidos: [] },
      ),
      n = async () => {
        if (C.length !== 0) {
          h(!0);
          try {
            const l = i?.codigoEmpresa,
              y = await K({
                codigoEmpresa: l,
                codigoCtaCte: me,
                mes: a,
                anio: r,
              });
            (g(y),
              c.invalidateQueries({ queryKey: ["asientos"] }),
              c.invalidateQueries({ queryKey: ["alumnos-cuotas"] }),
              c.invalidateQueries({ queryKey: ["deuda-alumno"] }));
          } catch (l) {
            g({
              error: l?.response?.data?.message || "Error al emitir cuotas",
            });
          } finally {
            h(!1);
          }
        }
      },
      E = pe[a - 1];
    return e.jsx("div", {
      className:
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm",
      children: e.jsxs("div", {
        className:
          "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5",
        children: [
          e.jsxs("h2", {
            className:
              "text-lg font-black uppercase tracking-tight text-[var(--text-primary)]",
            children: ["Generar cuotas — ", E, " ", r],
          }),
          u
            ? e.jsxs(e.Fragment, {
                children: [
                  u.error
                    ? e.jsx("p", {
                        className: "text-rose-600 font-bold text-[13px]",
                        children: u.error,
                      })
                    : e.jsxs("div", {
                        className: "flex flex-col gap-3",
                        children: [
                          e.jsxs("p", {
                            className:
                              "text-emerald-700 font-black text-[14px]",
                            children: [
                              "Generados: ",
                              u.totalGenerados ?? u.generados ?? 0,
                            ],
                          }),
                          u.omitidos?.length > 0 &&
                            e.jsxs("div", {
                              children: [
                                e.jsxs("p", {
                                  className:
                                    "text-amber-600 font-bold text-[12px] mb-1",
                                  children: [
                                    "Omitidos (ya emitidos): ",
                                    u.omitidos.length,
                                  ],
                                }),
                                e.jsx("ul", {
                                  className:
                                    "text-[11px] text-amber-700 list-disc list-inside",
                                  children: u.omitidos.map((l, y) =>
                                    e.jsx(
                                      "li",
                                      {
                                        children:
                                          l.referencia ?? l.codigoContacto,
                                      },
                                      y,
                                    ),
                                  ),
                                }),
                              ],
                            }),
                        ],
                      }),
                  e.jsx("button", {
                    onClick: d,
                    className:
                      "w-full py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer",
                    children: "Cerrar",
                  }),
                ],
              })
            : e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("div", {
                    className:
                      "flex flex-col gap-2 text-[12px] font-bold text-[var(--text-secondary)]",
                    children: [
                      e.jsxs("p", {
                        children: [
                          "Alumnos a emitir:",
                          " ",
                          e.jsx("span", {
                            className: "text-[var(--text-primary)] text-[14px]",
                            children: C.length,
                          }),
                        ],
                      }),
                      j.length > 0 &&
                        e.jsxs("p", {
                          className: "text-amber-600",
                          children: [
                            "Alumnos con cuota ya emitida (serán omitidos): ",
                            j.length,
                          ],
                        }),
                    ],
                  }),
                  j.length > 0 &&
                    e.jsxs("div", {
                      className:
                        "bg-amber-50 border border-amber-200 rounded-md p-3 max-h-32 overflow-y-auto",
                      children: [
                        e.jsx("p", {
                          className:
                            "text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2",
                          children: "Ya emitidas",
                        }),
                        j.map((l) =>
                          e.jsx(
                            "p",
                            {
                              className:
                                "text-[11px] text-amber-700 font-medium",
                              children:
                                l.razonSocial ||
                                `${l.nombre ?? ""} ${l.apellido ?? ""}`.trim(),
                            },
                            l.codigoSecuencial,
                          ),
                        ),
                      ],
                    }),
                  e.jsxs("div", {
                    className: "flex gap-3 mt-2",
                    children: [
                      e.jsx("button", {
                        onClick: o,
                        disabled: x,
                        className:
                          "flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer",
                        children: "Cancelar",
                      }),
                      e.jsx("button", {
                        onClick: n,
                        disabled: x || C.length === 0,
                        className:
                          "flex-1 py-3 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer",
                        children: x
                          ? e.jsx("div", {
                              className:
                                "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                            })
                          : "Confirmar",
                      }),
                    ],
                  }),
                ],
              }),
        ],
      }),
    });
  },
  V = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
function he(t) {
  if (!t) return { valorInterno: "", valorExterno: "" };
  const s = t.match(/\?\s*([\d.]+)\s*:\s*([\d.]+)/);
  if (s) return { valorInterno: s[1], valorExterno: s[2] };
  const a = parseFloat(t.trim());
  if (!isNaN(a)) {
    const r = String(a);
    return { valorInterno: r, valorExterno: r };
  }
  return { valorInterno: "", valorExterno: "" };
}
const fe = ({
    formula: t,
    mes: s,
    anio: a,
    actualizarCuota: r,
    onClose: o,
  }) => {
    const { usuario: d } = M(),
      i = he(t),
      [c, x] = b.useState(i.valorInterno),
      [h, u] = b.useState(i.valorExterno),
      [g, p] = b.useState(""),
      [m, v] = b.useState(!1),
      [w, f] = b.useState(!1),
      [k, C] = b.useState(""),
      j = `${a}-${String(s).padStart(2, "0")}-01`,
      n = new Date(a, s, 0).getDate(),
      E = `${a}-${String(s).padStart(2, "0")}-${n}`,
      { data: l = [] } = q(
        d?.codigoEmpresa
          ? {
              codigoEmpresa: d.codigoEmpresa,
              origenModulo: "ESCUELA",
              fechaDesde: j,
              fechaHasta: E,
            }
          : {},
      ),
      y = l.some((N) => {
        const S = String(s).padStart(2, "0");
        return (
          N.referencia?.startsWith("CUOTA-") &&
          N.referencia?.endsWith(`-${a}-${S}`)
        );
      }),
      A = async () => {
        p("");
        const N = parseFloat(c),
          S = parseFloat(h);
        if (!c || isNaN(N) || N <= 0) {
          p("El valor para alumnos Internos debe ser un número mayor a cero.");
          return;
        }
        if (!h || isNaN(S) || S <= 0) {
          p("El valor para alumnos Externos debe ser un número mayor a cero.");
          return;
        }
        const D = `tipo_alumno === "INTERNO" ? ${Math.round(N)} : ${Math.round(S)}`;
        v(!0);
        try {
          (await r(D),
            C(
              y
                ? `El nuevo valor se aplicará desde el mes siguiente (${V[s % 12]} ${s === 12 ? a + 1 : a}), ya que el mes actual ya tiene cuotas emitidas.`
                : `El nuevo valor se aplicará de inmediato para ${V[s - 1]} ${a}.`,
            ),
            f(!0));
        } catch (Q) {
          p(Q?.response?.data?.message || "Error al guardar");
        } finally {
          v(!1);
        }
      };
    return e.jsx("div", {
      className:
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm",
      children: e.jsxs("div", {
        className:
          "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5",
        children: [
          e.jsx("h2", {
            className:
              "text-lg font-black uppercase tracking-tight text-[var(--text-primary)]",
            children: "Editar valor de cuota",
          }),
          e.jsx("div", {
            className: "text-[12px] font-bold text-[var(--text-secondary)]",
            children: e.jsxs("p", {
              children: [
                "Fórmula actual:",
                " ",
                e.jsx("span", {
                  className:
                    "font-mono text-[var(--text-primary)] bg-[var(--fill-secondary)] px-2 py-0.5 rounded text-[11px]",
                  children: t || "—",
                }),
              ],
            }),
          }),
          w
            ? e.jsxs(e.Fragment, {
                children: [
                  e.jsx("div", {
                    className:
                      "bg-emerald-50 border border-emerald-200 rounded-md p-3 text-[12px] font-bold text-emerald-700",
                    children: k,
                  }),
                  e.jsx("button", {
                    onClick: o,
                    className:
                      "w-full py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer",
                    children: "Cerrar",
                  }),
                ],
              })
            : e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("div", {
                    className: "flex flex-col gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "flex flex-col gap-1",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]",
                            children: "Valor Interno (alumnos INTERNO)",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: c,
                            onChange: (N) => {
                              (x(N.target.value), p(""));
                            },
                            placeholder: "Ej: 130000",
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--primary)] transition-colors text-[var(--text-primary)]",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex flex-col gap-1",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]",
                            children: "Valor Externo (otros tipos de alumno)",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: h,
                            onChange: (N) => {
                              (u(N.target.value), p(""));
                            },
                            placeholder: "Ej: 190000",
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--primary)] transition-colors text-[var(--text-primary)]",
                          }),
                        ],
                      }),
                      g &&
                        e.jsx("p", {
                          className: "text-rose-600 text-[11px] font-bold",
                          children: g,
                        }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-3",
                    children: [
                      e.jsx("button", {
                        onClick: o,
                        disabled: m,
                        className:
                          "flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer",
                        children: "Cancelar",
                      }),
                      e.jsx("button", {
                        onClick: A,
                        disabled: m,
                        className:
                          "flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-2 transition-all cursor-pointer",
                        children: m
                          ? e.jsx("div", {
                              className:
                                "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                            })
                          : "Guardar",
                      }),
                    ],
                  }),
                ],
              }),
        ],
      }),
    });
  },
  ge = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  I = new Date().getFullYear(),
  ve = [I - 2, I - 1, I, I + 1, I + 2],
  $e = () => {
    const t = new Date(),
      [s, a] = b.useState(t.getMonth() + 1),
      [r, o] = b.useState(t.getFullYear()),
      [d, i] = b.useState(!1),
      [c, x] = b.useState(!1),
      { alumnos: h, cargandoAlumnos: u, errorAlumnos: g, refetch: p } = te(),
      { formula: m, cargandoConfig: v, actualizarCuota: w } = re();
    return g
      ? e.jsxs("div", {
          className: "w-full py-6 px-6",
          children: [
            e.jsx(O, { ruta: "CUOTAS", icono: e.jsx(L, { size: 20 }) }),
            e.jsxs("div", {
              className:
                "flex flex-col items-center justify-center py-20 gap-4",
              children: [
                e.jsx("p", {
                  className:
                    "text-rose-600 font-bold text-[13px] uppercase tracking-widest",
                  children: "Error al cargar alumnos",
                }),
                e.jsx("button", {
                  onClick: () => p(),
                  className:
                    "px-6 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:brightness-110 transition-all cursor-pointer",
                  children: "Reintentar",
                }),
              ],
            }),
          ],
        })
      : e.jsxs("div", {
          className: "w-full py-6 px-6 flex flex-col gap-4",
          children: [
            e.jsx(O, {
              ruta: "CUOTAS",
              icono: e.jsx(L, { size: 20 }),
              children: e.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  e.jsxs("button", {
                    onClick: () => x(!0),
                    className:
                      "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shadow-sm transition-all cursor-pointer",
                    children: [e.jsx(G, { size: 14 }), "Editar valor de cuota"],
                  }),
                  e.jsxs("button", {
                    onClick: () => i(!0),
                    disabled: !m,
                    className:
                      "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer",
                    children: [
                      e.jsx(J, { size: 14 }),
                      "Generar cuotas para todos",
                    ],
                  }),
                ],
              }),
            }),
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                e.jsx("select", {
                  value: s,
                  onChange: (f) => a(Number(f.target.value)),
                  "aria-label": "Mes",
                  className:
                    "text-[11px] font-bold uppercase bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]",
                  children: ge.map((f, k) =>
                    e.jsx("option", { value: k + 1, children: f }, k + 1),
                  ),
                }),
                e.jsx("select", {
                  value: r,
                  onChange: (f) => o(Number(f.target.value)),
                  "aria-label": "Año",
                  className:
                    "text-[11px] font-bold uppercase bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]",
                  children: ve.map((f) =>
                    e.jsx("option", { value: f, children: f }, f),
                  ),
                }),
                !m &&
                  !v &&
                  e.jsx("span", {
                    className:
                      "text-rose-500 text-[11px] font-bold uppercase tracking-widest",
                    children: "Configure el valor de cuota antes de emitir",
                  }),
              ],
            }),
            e.jsx(xe, {
              alumnos: h,
              cargando: u,
              formula: m,
              mes: s,
              anio: r,
              refetch: p,
            }),
            d &&
              e.jsx(be, {
                alumnos: h,
                formula: m,
                mes: s,
                anio: r,
                onClose: () => i(!1),
                onExito: () => {
                  (i(!1), p());
                },
              }),
            c &&
              e.jsx(fe, {
                formula: m,
                mes: s,
                anio: r,
                actualizarCuota: w,
                onClose: () => x(!1),
              }),
          ],
        });
  };
export { $e as default };
