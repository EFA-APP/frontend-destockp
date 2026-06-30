import {
  c as ie,
  j as e,
  r as x,
  k as re,
  R as P,
  X as _,
  C as ne,
} from "./index-B40chGZJ.js";
import { E as ce } from "./EncabezadoSeccion-Bn8hRrTt.js";
import { C as I } from "./CuentaIcono-DDdKUXiG.js";
import { C as B } from "./ConfiguracionIcono-wUXbdfq1.js";
import { u as q } from "./useEntidades-CuymRbYT.js";
import { u as G, L as de, a as pe, I as xe } from "./useContactos-BAAEKb2P.js";
import { u as ae, F as me } from "./FormularioContacto-CgTWMcnF.js";
import { E as ue } from "./EmailIcono-CfaJ9S2A.js";
import { C as be } from "./CerrarIcono-D3kBRcyY.js";
import { A as ve } from "./AgregarIcono-Db-BdXov.js";
import { B as T } from "./BorrarIcono-BP3NznrB.js";
import { A as he } from "./AdvertenciaIcono-BuiXXujO.js";
import { T as te } from "./TieneAccion-ve4VSAZe.js";
import { S as ge } from "./SearchableSelect-bgkoKC_d.js";
import { S as fe } from "./search-C04IKVS4.js";
import { P as H } from "./package-BL8JrPA5.js";
import { F as se, u as M, w as je, r as ye } from "./xlsx-Dm0bbtPq.js";
import { M as Ne } from "./ModalDetalleBase-CFRCXR5X.js";
import { M as we } from "./ModalDetalle-CYlGfd_c.js";
import { G as ke } from "./GuardarIcono-X0HqXi-a.js";
import { M as Ce } from "./MovimientoIcono-DVK9yKEJ.js";
import { D as Ee } from "./download-C2Gy6888.js";
import { C as Se } from "./circle-alert-BIsr8Ajl.js";
import "./InicioIcono-fTjPqS2l.js";
import "./VolverIcono-DKK8Rnlx.js";
import "./useMutation-BCSmbTcT.js";
import "./index-DUIPri7x.js";
import "./chevron-down-BDic3tFv.js";
const Ae = [
    [
      "path",
      {
        d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        key: "1a8usu",
      },
    ],
  ],
  J = ie("pen", Ae),
  Ie = ({ contacto: r, onClose: p }) =>
    r
      ? e.jsx("div", {
          className:
            "fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all",
          onClick: p,
          children: e.jsxs("div", {
            className:
              "w-full md:w-[500px] h-screen bg-[var(--surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300",
            onClick: (i) => i.stopPropagation(),
            children: [
              e.jsxs("div", {
                className:
                  "px-8 py-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-hover)]",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [
                      e.jsx("div", {
                        className:
                          "w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] shadow-sm",
                        children: e.jsx(I, { size: 20 }),
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("h2", {
                            className:
                              "text-[16px] font-black text-[var(--text-primary)] uppercase tracking-widest",
                            children: "Detalles del Contacto",
                          }),
                          e.jsxs("p", {
                            className:
                              "text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em]",
                            children: [
                              "EXPEDIENTE:",
                              " ",
                              r.codigoSecuencial.toString().padStart(4, "0"),
                              " •",
                              " ",
                              r.tipoEntidad,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: p,
                    className:
                      "p-2 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer",
                    children: e.jsx(be, { size: 20 }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10",
                children: [
                  e.jsxs("div", {
                    className: "text-center space-y-4",
                    children: [
                      e.jsxs("div", {
                        className:
                          "w-24 h-24 mx-auto rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xl relative group",
                        children: [
                          e.jsx("div", {
                            className:
                              "absolute inset-0 bg-[var(--primary)]/5 rounded-md group-hover:bg-[var(--primary)]/10 transition-all",
                          }),
                          e.jsx("span", {
                            className:
                              "text-4xl font-black text-[var(--primary-emphasis)] relative z-10",
                            children: (
                              r.nombre?.[0] ||
                              r.razonSocial?.[0] ||
                              "?"
                            ).toUpperCase(),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          e.jsx("h3", {
                            className:
                              "text-xl font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight",
                            children:
                              r.razonSocial?.toUpperCase() ||
                              `${r.nombre?.toUpperCase()} ${r.apellido?.toUpperCase()}`,
                          }),
                          e.jsx("div", {
                            className:
                              "inline-flex items-center px-3 py-1 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--primary)]/10",
                            children: r.tipoEntidad?.toUpperCase(),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "space-y-8",
                    children: [
                      e.jsxs("section", {
                        className: "space-y-4",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              e.jsx("span", {
                                className:
                                  "text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap",
                                children: "Información Fiscal",
                              }),
                              e.jsx("div", {
                                className:
                                  "h-px w-full bg-[var(--border-subtle)]",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                              e.jsxs("div", {
                                className:
                                  "p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] shadow-sm",
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5",
                                    children: "DOCUMENTO / CUIT",
                                  }),
                                  e.jsx("p", {
                                    className:
                                      "text-[14px] font-bold text-[var(--text-primary)]",
                                    children: r.documento || "NO REGISTRADO",
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                className:
                                  "p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] shadow-sm",
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5",
                                    children: "CONDICIÓN IVA",
                                  }),
                                  e.jsx("span", {
                                    className:
                                      "text-[13px] font-black text-[var(--primary-emphasis)] uppercase",
                                    children:
                                      r.condicionIva === "RI"
                                        ? "Responsable Inscripto"
                                        : r.condicionIva === "MO"
                                          ? "Monotributista"
                                          : r.condicionIva === "EX"
                                            ? "Exento"
                                            : "Consumidor Final",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      r.correoElectronico &&
                        e.jsxs("section", {
                          className: "space-y-4",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap",
                                  children: "Información de Contacto",
                                }),
                                e.jsx("div", {
                                  className:
                                    "h-px w-full bg-[var(--border-subtle)]",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className:
                                "p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] flex items-center gap-3 shadow-sm",
                              children: [
                                e.jsx("div", {
                                  className: "text-[var(--primary)] shrink-0",
                                  children: e.jsx(ue, { size: 20 }),
                                }),
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("p", {
                                      className:
                                        "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5",
                                      children: "CORREO ELECTRÓNICO",
                                    }),
                                    e.jsx("p", {
                                      className:
                                        "text-[13px] font-bold text-[var(--text-primary)] lowercase select-all",
                                      children: r.correoElectronico,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      e.jsxs("section", {
                        className: "space-y-4",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              e.jsx("span", {
                                className:
                                  "text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap",
                                children: "Responsable Administrativo",
                              }),
                              e.jsx("div", {
                                className:
                                  "h-px w-full bg-[var(--border-subtle)]",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className:
                              "p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5",
                                    children: "ENTE QUE FACTURA",
                                  }),
                                  e.jsx("p", {
                                    className:
                                      "text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide",
                                    children:
                                      r.enteFacturacion?.razonSocial?.toUpperCase() ||
                                      `${r.enteFacturacion?.nombre?.toUpperCase() || ""} ${r.enteFacturacion?.apellido?.toUpperCase() || ""}` ||
                                      "TITULAR DIRECTO",
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className: `px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${r.enteFacturacion ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`,
                                children: r.enteFacturacion
                                  ? "TERCERO"
                                  : "TITULAR",
                              }),
                            ],
                          }),
                        ],
                      }),
                      r.atributos &&
                        Object.keys(r.atributos).length > 0 &&
                        e.jsxs("section", {
                          className: "space-y-4",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap",
                                  children: "Atributos Adicionales",
                                }),
                                e.jsx("div", {
                                  className:
                                    "h-px w-full bg-[var(--border-subtle)]",
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              className: "grid grid-cols-2 gap-4",
                              children: Object.entries(r.atributos).map(
                                ([i, d]) =>
                                  e.jsxs(
                                    "div",
                                    {
                                      className:
                                        "p-4 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] shadow-sm",
                                      children: [
                                        e.jsx("p", {
                                          className:
                                            "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5",
                                          children: i.replace(/_/g, " "),
                                        }),
                                        e.jsx("p", {
                                          className:
                                            "text-[13px] font-bold text-[var(--text-primary)]",
                                          children:
                                            typeof d == "boolean"
                                              ? d
                                                ? "SÍ"
                                                : "NO"
                                              : typeof d == "number"
                                                ? new Intl.NumberFormat(
                                                    "es-AR",
                                                  ).format(d)
                                                : d || "---",
                                        }),
                                      ],
                                    },
                                    i,
                                  ),
                              ),
                            }),
                          ],
                        }),
                      r.relaciones &&
                        r.relaciones.length > 0 &&
                        e.jsxs("section", {
                          className: "space-y-4",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap",
                                  children: "Vínculos y Relaciones",
                                }),
                                e.jsx("div", {
                                  className:
                                    "h-px w-full bg-[var(--border-subtle)]",
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              className: "space-y-3",
                              children: r.relaciones.map((i, d) =>
                                e.jsxs(
                                  "div",
                                  {
                                    className:
                                      "flex items-center justify-between p-4 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] group hover:border-[var(--primary)]/30 transition-all shadow-sm",
                                    children: [
                                      e.jsxs("div", {
                                        className: "flex flex-col",
                                        children: [
                                          e.jsx("span", {
                                            className:
                                              "text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.15em] mb-1",
                                            children: i.tipo?.toUpperCase(),
                                          }),
                                          e.jsxs("span", {
                                            className:
                                              "text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wide",
                                            children: [
                                              i.nombre?.toUpperCase() ||
                                                `ID: ${i.codigoSecuencial}`,
                                              " ",
                                              e.jsxs("span", {
                                                className:
                                                  "text-[10px] text-[var(--text-muted)] ml-1",
                                                children: [
                                                  "[",
                                                  i.entidad?.toUpperCase(),
                                                  "]",
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsx("div", {
                                        className:
                                          "w-10 h-10 rounded-md bg-[var(--fill-secondary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary-subtle)] transition-all shadow-inner",
                                        children: e.jsx(I, { size: 16 }),
                                      }),
                                    ],
                                  },
                                  d,
                                ),
                              ),
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className:
                  "p-8 border-t border-[var(--border-subtle)] bg-[var(--surface-hover)]",
                children: e.jsx("button", {
                  onClick: p,
                  className:
                    "w-full py-4 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all shadow-sm cursor-pointer",
                  children: "Cerrar Vista",
                }),
              }),
            ],
          }),
        })
      : null,
  Y = ({ contacto: r, onActualizar: p }) => {
    const [i, d] = x.useState(!1),
      { entidades: u } = q(),
      [o, v] = x.useState(""),
      { contactos: m, cargandoContactos: b } = G({ tipoEntidad: o }),
      t = async (l) => {
        const y = l.target.value,
          N = m.find((g) => String(g.codigoSecuencial) === String(y));
        (N && (await p(r.codigoSecuencial, { ...r, enteFacturacion: N })),
          d(!1));
      },
      n = async (l) => {
        (l.stopPropagation(),
          await p(r.codigoSecuencial, { ...r, enteFacturacion: null }));
      };
    return i
      ? e.jsxs("div", {
          className:
            "flex flex-col gap-2 min-w-[220px] p-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-2xl absolute z-50 bottom-full mb-2 md:bottom-auto md:mb-0 md:mt-2",
          onClick: (l) => l.stopPropagation(),
          children: [
            e.jsxs("div", {
              className: "flex justify-between items-center mb-1",
              children: [
                e.jsx("span", {
                  className:
                    "text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest",
                  children: "Asignar Ente",
                }),
                e.jsx("button", {
                  onClick: () => d(!1),
                  className:
                    "text-gray-400 hover:text-rose-500 transition-colors",
                  children: e.jsx(_, { size: 14 }),
                }),
              ],
            }),
            e.jsxs("div", {
              className: "space-y-2",
              children: [
                e.jsxs("select", {
                  value: o,
                  onChange: (l) => v(l.target.value),
                  className:
                    "w-full text-[11px] p-2 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded uppercase font-bold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all",
                  children: [
                    e.jsx("option", { value: "", children: "Categoría..." }),
                    u.map((l) =>
                      e.jsx(
                        "option",
                        { value: l.clave, children: l.nombre },
                        l.clave,
                      ),
                    ),
                  ],
                }),
                o &&
                  e.jsx("div", {
                    className: "relative",
                    children: e.jsx(ge, {
                      options: (m || []).map((l) => ({
                        value: String(l.codigoSecuencial),
                        label: (
                          l.razonSocial || `${l.nombre} ${l.apellido}`
                        ).toUpperCase(),
                      })),
                      value: "",
                      onChange: t,
                      placeholder: b ? "Cargando..." : "Buscar responsable...",
                      className: "w-full shadow-sm",
                    }),
                  }),
              ],
            }),
          ],
        })
      : r.enteFacturacion
        ? e.jsxs("div", {
            className: "flex items-center gap-2 group w-full",
            children: [
              e.jsx("div", {
                className:
                  "cursor-pointer flex-1 truncate max-w-[150px] md:max-w-[200px]",
                onClick: () => d(!0),
                children: e.jsx("span", {
                  className:
                    "text-[11px] font-bold text-[var(--primary)] uppercase border-b border-dashed border-[var(--primary)]/30 hover:border-[var(--primary)] transition-colors",
                  children:
                    r.enteFacturacion.razonSocial ||
                    `${r.enteFacturacion.nombre} ${r.enteFacturacion.apellido}`,
                }),
              }),
              e.jsx("button", {
                onClick: n,
                className:
                  "opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all",
                title: "Remover Ente",
                children: e.jsx(_, { size: 14 }),
              }),
            ],
          })
        : e.jsx("button", {
            onClick: () => d(!0),
            className:
              "px-2 py-1 text-[10px] font-bold uppercase border border-dashed border-[var(--primary)]/50 text-[var(--primary)] rounded hover:bg-[var(--primary)]/10 transition-colors shadow-sm",
            children: "Asignar Ente",
          });
  },
  Z = ({ contacto: r, onActualizar: p }) => {
    const { agregarAlerta: i } = re(),
      [d, u] = x.useState(!1),
      [o, v] = x.useState({
        nombre: r.nombre || "",
        apellido: r.apellido || "",
        razonSocial: r.razonSocial || "",
        documento: r.documento || "",
        correoElectronico: r.correoElectronico || "",
      }),
      m = async () => {
        if (
          o.correoElectronico &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.correoElectronico.trim())
        ) {
          i({
            title: "Correo Inválido",
            message:
              "El correo electrónico ingresado no tiene un formato válido.",
            type: "warning",
          });
          return;
        }
        ((o.nombre !== (r.nombre || "") ||
          o.apellido !== (r.apellido || "") ||
          o.razonSocial !== (r.razonSocial || "") ||
          o.documento !== (r.documento || "") ||
          o.correoElectronico !== (r.correoElectronico || "")) &&
          (await p(r.codigoSecuencial, { ...r, ...o })),
          u(!1));
      },
      b = (t) => {
        (t.key === "Enter" && m(), t.key === "Escape" && u(!1));
      };
    return d
      ? e.jsxs("div", {
          className:
            "flex flex-col gap-2 min-w-[280px] p-3 bg-[var(--surface)] border border-[var(--primary)] rounded-md shadow-xl absolute z-50 left-0 top-0",
          children: [
            e.jsxs("div", {
              className: "flex justify-between items-center mb-1",
              children: [
                e.jsx("span", {
                  className:
                    "text-[10px] font-black uppercase text-[var(--primary)] tracking-widest",
                  children: "Editar Identidad",
                }),
                e.jsx("button", {
                  onClick: () => u(!1),
                  className:
                    "text-gray-400 hover:text-rose-500 transition-colors",
                  children: e.jsx(_, { size: 14 }),
                }),
              ],
            }),
            e.jsx("input", {
              autoFocus: !0,
              placeholder: "Razón Social (Opcional)",
              value: o.razonSocial,
              onChange: (t) => v({ ...o, razonSocial: t.target.value }),
              onKeyDown: b,
              className:
                "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors",
            }),
            e.jsxs("div", {
              className: "flex gap-2",
              children: [
                e.jsx("input", {
                  placeholder: "Nombres",
                  value: o.nombre,
                  onChange: (t) => v({ ...o, nombre: t.target.value }),
                  onKeyDown: b,
                  className:
                    "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors",
                }),
                e.jsx("input", {
                  placeholder: "Apellidos",
                  value: o.apellido,
                  onChange: (t) => v({ ...o, apellido: t.target.value }),
                  onKeyDown: b,
                  className:
                    "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors",
                }),
              ],
            }),
            e.jsx("input", {
              placeholder: "DNI / CUIT",
              value: o.documento,
              onChange: (t) => v({ ...o, documento: t.target.value }),
              onKeyDown: b,
              className:
                "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] uppercase text-[var(--text-primary)] transition-colors",
            }),
            e.jsx("input", {
              placeholder: "Correo Electrónico (Opcional)",
              value: o.correoElectronico,
              onChange: (t) => v({ ...o, correoElectronico: t.target.value }),
              onKeyDown: b,
              className:
                "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1.5 text-[11px] font-bold outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors",
            }),
            e.jsx("button", {
              onClick: m,
              className:
                "w-full py-2 mt-1 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded hover:brightness-110 transition-all cursor-pointer",
              children: "Guardar Cambios",
            }),
          ],
        })
      : e.jsxs("div", {
          className:
            "flex flex-col gap-1 mt-1 cursor-pointer group px-1.5 py-1 border border-transparent hover:border-dashed hover:border-[var(--primary)]/50 rounded transition-colors",
          onClick: () => u(!0),
          title: "Clic para editar",
          children: [
            e.jsxs("span", {
              className:
                "text-[13px] font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors",
              children: [
                r.razonSocial?.toUpperCase() ||
                  `${r.nombre?.toUpperCase()} ${r.apellido?.toUpperCase()}`,
                !r.razonSocial &&
                  !r.nombre &&
                  e.jsx("span", {
                    className: "italic text-[var(--text-muted)] text-[11px]",
                    children: "Sin Nombre",
                  }),
              ],
            }),
            e.jsxs("div", {
              className: "flex items-center gap-1.5 opacity-60",
              children: [
                e.jsx("span", {
                  className: "text-[10px] font-black uppercase tracking-wider",
                  children: r.documento ? "DNI/CUIT:" : "",
                }),
                e.jsx("span", {
                  className: "text-[11px] font-medium",
                  children:
                    r.documento ||
                    e.jsx("span", {
                      className: "italic text-[9px]",
                      children: "S/D",
                    }),
                }),
              ],
            }),
            r.correoElectronico &&
              e.jsxs("div", {
                className: "flex items-center gap-1.5 opacity-60",
                children: [
                  e.jsx("span", {
                    className:
                      "text-[10px] font-black uppercase tracking-wider",
                    children: "EMAIL:",
                  }),
                  e.jsx("span", {
                    className:
                      "text-[11px] font-medium text-[var(--text-primary)] lowercase",
                    children: r.correoElectronico,
                  }),
                ],
              }),
          ],
        });
  },
  ee = ({ contacto: r, conf: p, onActualizar: i }) => {
    const [d, u] = x.useState(!1),
      o = r.atributos?.[p.claveCampo] ?? "",
      [v, m] = x.useState(o);
    P.useEffect(() => {
      m(r.atributos?.[p.claveCampo] ?? "");
    }, [r.atributos, p.claveCampo]);
    const b = async () => {
        if (v !== o) {
          const n = p.tipoDato === "NUMERO" ? (v === "" ? "" : Number(v)) : v;
          await i(r.codigoSecuencial, {
            ...r,
            atributos: { ...(r.atributos || {}), [p.claveCampo]: n },
          });
        }
        u(!1);
      },
      t = (n) => {
        (n.key === "Enter" && b(), n.key === "Escape" && (m(o), u(!1)));
      };
    if (p.tipoDato === "BOOLEANO") {
      const n = o === !0;
      return e.jsx("button", {
        onClick: async () => {
          await i(r.codigoSecuencial, {
            ...r,
            atributos: { ...(r.atributos || {}), [p.claveCampo]: !n },
          });
        },
        className: `px-3 py-1 rounded text-[10px] font-black uppercase transition-all shadow-sm border ${n ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"}`,
        children: n ? "SÍ" : "NO",
      });
    }
    return p.tipoDato === "LISTA"
      ? e.jsxs("select", {
          value: o,
          onChange: async (n) => {
            await i(r.codigoSecuencial, {
              ...r,
              atributos: {
                ...(r.atributos || {}),
                [p.claveCampo]: n.target.value,
              },
            });
          },
          className:
            "bg-transparent text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer border-b border-dashed border-[var(--text-muted)] hover:border-[var(--primary)] transition-colors uppercase w-full py-0.5",
          children: [
            e.jsx("option", { value: "", children: "--" }),
            (p.opciones || []).map((n) =>
              e.jsx("option", { value: n, children: n.toUpperCase() }, n),
            ),
          ],
        })
      : d
        ? e.jsx("input", {
            autoFocus: !0,
            type: p.tipoDato === "NUMERO" ? "number" : "text",
            value: v,
            onChange: (n) => m(n.target.value),
            onBlur: b,
            onKeyDown: t,
            className:
              "w-full min-w-[100px] bg-[var(--surface)] border border-[var(--primary)] rounded px-2 py-1 text-[11px] font-bold outline-none shadow-sm text-[var(--text-primary)]",
          })
        : e.jsx("div", {
            className:
              "min-h-[24px] w-full flex items-center cursor-pointer px-1.5 border border-transparent hover:border-dashed hover:border-[var(--primary)]/50 rounded transition-colors group",
            onClick: () => u(!0),
            children: e.jsx("span", {
              className:
                "text-[11px] font-bold text-[var(--text-primary)] truncate",
              children:
                o !== "" && o !== null
                  ? String(o).toUpperCase()
                  : e.jsx("span", {
                      className:
                        "text-[10px] text-[var(--text-muted)] italic font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                      children: "Editar...",
                    }),
            }),
          });
  },
  ze = ({
    entidad: r,
    contactos: p,
    cargando: i,
    filtros: d,
    setFiltros: u,
    total: o,
    paginas: v,
    eliminarContacto: m,
  }) => {
    const [b, t] = x.useState(!1),
      [n, l] = x.useState(null),
      [y, N] = x.useState(null),
      [g, E] = x.useState(null),
      [a, A] = x.useState(!1),
      [S, F] = x.useState(d.busqueda),
      { actualizarContacto: O } = G(),
      { configs: L } = ae(),
      { agregarAlerta: R } = re(),
      c = P.useMemo(
        () => L.filter((s) => s.entidadClave === r?.clave),
        [L, r?.clave],
      );
    P.useEffect(() => {
      const s = setTimeout(() => {
        u((h) => ({ ...h, busqueda: S, pagina: 1 }));
      }, 500);
      return () => clearTimeout(s);
    }, [S, u]);
    const C = (s) => {
        (l(s), t(!0));
      },
      f = async (s, h) => {
        try {
          if (
            h.correoElectronico &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h.correoElectronico.trim())
          ) {
            R({
              title: "Correo Inválido",
              message:
                "El correo electrónico ingresado no tiene un formato válido.",
              type: "warning",
            });
            return;
          }
          const {
            codigoEmpresa: D,
            codigoSecuencial: V,
            fechaCreacion: U,
            updatedAt: z,
            estado: X,
            ...k
          } = h;
          (await O({ id: s, dto: k }),
            R({
              title: "Actualizado",
              message: "Contacto actualizado correctamente.",
              type: "success",
            }));
        } catch (D) {
          (console.error("Error al actualizar contacto en línea:", D),
            R({
              title: "Error",
              message: "No se pudo actualizar el contacto.",
              type: "error",
            }));
        }
      },
      w = async () => {
        if (g)
          try {
            (A(!0), await m(g.codigoSecuencial), E(null));
          } catch (s) {
            (console.error("Error al eliminar contacto:", s),
              alert("No se pudo eliminar el contacto. Intente nuevamente."));
          } finally {
            A(!1);
          }
      };
    return e.jsxs("div", {
      className:
        "flex flex-col h-full bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden",
      children: [
        e.jsxs("div", {
          className:
            "flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 gap-4",
          children: [
            e.jsxs("div", {
              className:
                "flex items-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all w-full md:w-80",
              children: [
                e.jsx(fe, { size: 16, className: "text-[var(--text-muted)]" }),
                e.jsx("input", {
                  type: "text",
                  value: S,
                  onChange: (s) => F(s.target.value),
                  placeholder: "Buscar por nombre o DNI/CUIT...",
                  className:
                    "bg-transparent border-none outline-none text-[13px] font-medium py-2.5 px-3 w-full text-[var(--text-primary)]",
                }),
                S &&
                  e.jsx("button", {
                    onClick: () => F(""),
                    className:
                      "text-[var(--text-muted)] hover:text-rose-500 transition-colors",
                    children: e.jsx(_, { size: 14 }),
                  }),
              ],
            }),
            e.jsx(te, {
              accion: "CREAR_CONTACTO",
              children: e.jsxs("button", {
                onClick: () => {
                  (l(null), t(!0));
                },
                className:
                  "px-5 py-2.5 bg-[var(--primary)] text-white text-[12px] font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-[var(--primary)]/20 transition-all",
                children: [e.jsx(ve, { size: 14 }), " Crear Contacto"],
              }),
            }),
          ],
        }),
        e.jsx("div", {
          className:
            "hidden md:block flex-1 overflow-auto bg-[var(--surface)] custom-scrollbar",
          children: e.jsxs("table", {
            className: "w-full text-left border-collapse min-w-max",
            children: [
              e.jsx("thead", {
                className:
                  "bg-[var(--fill-secondary)] sticky top-0 z-10 shadow-sm",
                children: e.jsxs("tr", {
                  children: [
                    e.jsx("th", {
                      className:
                        "px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] w-24",
                      children: "Código",
                    }),
                    e.jsx("th", {
                      className:
                        "px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] min-w-[200px]",
                      children: "Nombre / Razón Social",
                    }),
                    c.map((s) =>
                      e.jsx(
                        "th",
                        {
                          className:
                            "px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] whitespace-nowrap",
                          children: s.nombreCampo,
                        },
                        s.claveCampo,
                      ),
                    ),
                    e.jsx("th", {
                      className:
                        "px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] min-w-[150px]",
                      children: "Facturación",
                    }),
                    e.jsx("th", {
                      className:
                        "px-5 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right w-32 sticky right-0 bg-[var(--fill-secondary)] shadow-[-4px_0_10px_rgba(0,0,0,0.02)]",
                      children: "Acciones",
                    }),
                  ],
                }),
              }),
              e.jsx("tbody", {
                children: i
                  ? Array.from({ length: 5 }).map((s, h) =>
                      e.jsxs(
                        "tr",
                        {
                          className: "border-b border-[var(--border-subtle)]",
                          children: [
                            e.jsx("td", {
                              className: "px-5 py-4",
                              children: e.jsx("div", {
                                className:
                                  "h-4 bg-black/5 rounded animate-pulse w-12",
                              }),
                            }),
                            e.jsxs("td", {
                              className: "px-5 py-4",
                              children: [
                                e.jsx("div", {
                                  className:
                                    "h-4 bg-black/5 rounded animate-pulse w-48 mb-1",
                                }),
                                e.jsx("div", {
                                  className:
                                    "h-3 bg-black/5 rounded animate-pulse w-32",
                                }),
                              ],
                            }),
                            c.map((D) =>
                              e.jsx(
                                "td",
                                {
                                  className: "px-5 py-4",
                                  children: e.jsx("div", {
                                    className:
                                      "h-4 bg-black/5 rounded animate-pulse w-16",
                                  }),
                                },
                                D.claveCampo,
                              ),
                            ),
                            e.jsx("td", {
                              className: "px-5 py-4",
                              children: e.jsx("div", {
                                className:
                                  "h-6 bg-black/5 rounded animate-pulse w-32",
                              }),
                            }),
                            e.jsx("td", {
                              className:
                                "px-5 py-4 sticky right-0 bg-[var(--surface)]",
                              children: e.jsx("div", {
                                className:
                                  "h-8 bg-black/5 rounded animate-pulse w-24 float-right",
                              }),
                            }),
                          ],
                        },
                        h,
                      ),
                    )
                  : p.length > 0
                    ? p.map((s) =>
                        e.jsxs(
                          "tr",
                          {
                            className:
                              "border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/50 transition-colors group",
                            children: [
                              e.jsx("td", {
                                className: "px-5 py-4 align-top",
                                children: e.jsx("span", {
                                  className:
                                    "bg-[var(--fill-secondary)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[11px] font-black text-[var(--text-primary)] mt-1 inline-block",
                                  children: s.codigoSecuencial
                                    .toString()
                                    .padStart(4, "0"),
                                }),
                              }),
                              e.jsx("td", {
                                className: "px-5 py-4 align-top relative",
                                children: e.jsx(Z, {
                                  contacto: s,
                                  onActualizar: f,
                                }),
                              }),
                              c.map((h) =>
                                e.jsx(
                                  "td",
                                  {
                                    className: "px-5 py-4 align-top",
                                    children: e.jsx("div", {
                                      className: "mt-1 w-full",
                                      children: e.jsx(ee, {
                                        contacto: s,
                                        conf: h,
                                        onActualizar: f,
                                      }),
                                    }),
                                  },
                                  h.claveCampo,
                                ),
                              ),
                              e.jsx("td", {
                                className: "px-5 py-4 relative align-top",
                                children: e.jsx("div", {
                                  className: "mt-1",
                                  children: e.jsx(Y, {
                                    contacto: s,
                                    onActualizar: f,
                                  }),
                                }),
                              }),
                              e.jsx("td", {
                                className:
                                  "px-5 py-4 align-top sticky right-0 bg-[var(--surface)] group-hover:bg-[var(--fill-secondary)]/10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors",
                                children: e.jsxs("div", {
                                  className:
                                    "flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1",
                                  children: [
                                    e.jsx("button", {
                                      onClick: () => N(s),
                                      className:
                                        "p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors",
                                      title: "Ver Detalles",
                                      children: e.jsx(I, { size: 16 }),
                                    }),
                                    e.jsx("button", {
                                      onClick: () => C(s),
                                      className:
                                        "p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors",
                                      title: "Editar",
                                      children: e.jsx(J, { size: 16 }),
                                    }),
                                    e.jsx("button", {
                                      onClick: () => E(s),
                                      className:
                                        "p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors",
                                      title: "Eliminar",
                                      children: e.jsx(T, { size: 16 }),
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          },
                          s.codigoSecuencial,
                        ),
                      )
                    : e.jsx("tr", {
                        children: e.jsxs("td", {
                          colSpan: 4 + c.length,
                          className:
                            "py-20 text-center text-[var(--text-muted)]",
                          children: [
                            e.jsx(H, {
                              size: 40,
                              className: "mx-auto mb-3 opacity-20",
                            }),
                            e.jsx("p", {
                              className:
                                "text-[13px] font-bold uppercase tracking-widest",
                              children: "No se encontraron contactos",
                            }),
                          ],
                        }),
                      }),
              }),
            ],
          }),
        }),
        e.jsx("div", {
          className:
            "md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--fill-secondary)]/30",
          children: i
            ? Array.from({ length: 4 }).map((s, h) =>
                e.jsx(
                  "div",
                  {
                    className:
                      "h-32 bg-[var(--surface)] rounded-md shadow-sm border border-[var(--border-subtle)] animate-pulse",
                  },
                  h,
                ),
              )
            : p.length > 0
              ? p.map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className:
                        "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-4 shadow-sm flex flex-col gap-4",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-start gap-3",
                          children: [
                            e.jsx("div", {
                              className: "flex-1 relative",
                              children: e.jsx(Z, {
                                contacto: s,
                                onActualizar: f,
                              }),
                            }),
                            e.jsx("span", {
                              className:
                                "bg-[var(--fill-secondary)] px-2 py-1 rounded border border-[var(--border-subtle)] text-[11px] font-black shrink-0",
                              children: s.codigoSecuencial
                                .toString()
                                .padStart(4, "0"),
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className:
                            "border-t border-[var(--border-subtle)] pt-3 relative flex justify-between items-center z-10",
                          children: [
                            e.jsx("span", {
                              className:
                                "text-[10px] font-black text-[var(--text-muted)] uppercase",
                              children: "Facturación:",
                            }),
                            e.jsx(Y, { contacto: s, onActualizar: f }),
                          ],
                        }),
                        c.length > 0 &&
                          e.jsxs("div", {
                            className:
                              "border-t border-[var(--border-subtle)] pt-3 flex flex-col gap-2",
                            children: [
                              e.jsx("span", {
                                className:
                                  "text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1",
                                children: "Atributos",
                              }),
                              e.jsx("div", {
                                className: "grid grid-cols-1 gap-2",
                                children: c.map((h) =>
                                  e.jsxs(
                                    "div",
                                    {
                                      className:
                                        "flex justify-between items-center gap-3 bg-[var(--fill-secondary)] p-2.5 rounded border border-[var(--border-subtle)]",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "text-[10px] font-bold text-[var(--text-muted)] uppercase w-1/3 truncate",
                                          title: h.nombreCampo,
                                          children: h.nombreCampo,
                                        }),
                                        e.jsx("div", {
                                          className: "w-2/3 flex justify-end",
                                          children: e.jsx(ee, {
                                            contacto: s,
                                            conf: h,
                                            onActualizar: f,
                                          }),
                                        }),
                                      ],
                                    },
                                    h.claveCampo,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        e.jsxs("div", {
                          className:
                            "border-t border-[var(--border-subtle)] pt-3 flex justify-end gap-2",
                          children: [
                            e.jsx("button", {
                              onClick: () => N(s),
                              className:
                                "p-2 text-[var(--text-muted)] hover:text-[var(--primary)] bg-[var(--fill-secondary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors border border-transparent hover:border-[var(--primary)]/20",
                              children: e.jsx(I, { size: 16 }),
                            }),
                            e.jsx("button", {
                              onClick: () => C(s),
                              className:
                                "p-2 text-[var(--text-muted)] hover:text-[var(--primary)] bg-[var(--fill-secondary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors border border-transparent hover:border-[var(--primary)]/20",
                              children: e.jsx(J, { size: 16 }),
                            }),
                            e.jsx("button", {
                              onClick: () => E(s),
                              className:
                                "p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-transparent hover:border-rose-200",
                              children: e.jsx(T, { size: 16 }),
                            }),
                          ],
                        }),
                      ],
                    },
                    s.codigoSecuencial,
                  ),
                )
              : e.jsxs("div", {
                  className: "py-20 text-center text-[var(--text-muted)]",
                  children: [
                    e.jsx(H, {
                      size: 40,
                      className: "mx-auto mb-3 opacity-20",
                    }),
                    e.jsx("p", {
                      className:
                        "text-[12px] font-bold uppercase tracking-widest",
                      children: "Sin contactos",
                    }),
                  ],
                }),
        }),
        e.jsxs("div", {
          className:
            "p-3 border-t border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10",
          children: [
            e.jsxs("span", {
              className:
                "text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest hidden sm:block",
              children: ["Total: ", o],
            }),
            e.jsxs("div", {
              className:
                "flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end",
              children: [
                e.jsxs("select", {
                  value: d.limite,
                  onChange: (s) =>
                    u((h) => ({
                      ...h,
                      limite: Number(s.target.value),
                      pagina: 1,
                    })),
                  className:
                    "text-[11px] font-bold uppercase bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded px-2 py-1 outline-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors",
                  children: [
                    e.jsx("option", { value: 10, children: "10 Filas" }),
                    e.jsx("option", { value: 20, children: "20 Filas" }),
                    e.jsx("option", { value: 50, children: "50 Filas" }),
                  ],
                }),
                e.jsxs("div", {
                  className:
                    "flex items-center gap-2 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md p-1",
                  children: [
                    e.jsx("button", {
                      disabled: d.pagina <= 1,
                      onClick: () => u((s) => ({ ...s, pagina: s.pagina - 1 })),
                      className:
                        "text-[10px] px-2.5 py-1.5 rounded disabled:opacity-30 font-black uppercase tracking-widest hover:bg-[var(--surface)] hover:shadow-sm transition-all text-[var(--text-primary)]",
                      children: "Ant",
                    }),
                    e.jsxs("span", {
                      className: "text-[11px] font-black px-2",
                      children: [d.pagina, " / ", v || 1],
                    }),
                    e.jsx("button", {
                      disabled: d.pagina >= v,
                      onClick: () => u((s) => ({ ...s, pagina: s.pagina + 1 })),
                      className:
                        "text-[10px] px-2.5 py-1.5 rounded disabled:opacity-30 font-black uppercase tracking-widest hover:bg-[var(--surface)] hover:shadow-sm transition-all text-[var(--text-primary)]",
                      children: "Sig",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        b &&
          e.jsx(me, {
            entidad: r,
            contacto: n,
            onClose: () => {
              (t(!1), l(null));
            },
          }),
        y && e.jsx(Ie, { contacto: y, onClose: () => N(null) }),
        g &&
          e.jsx("div", {
            className:
              "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm",
            children: e.jsx("div", {
              className:
                "bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200",
              children: e.jsxs("div", {
                className: "flex flex-col items-center text-center gap-4",
                children: [
                  e.jsx("div", {
                    className:
                      "w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2 border border-rose-100 shadow-sm",
                    children: e.jsx(he, { size: 32 }),
                  }),
                  e.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      e.jsx("h3", {
                        className:
                          "text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]",
                        children: "¿Eliminar Contacto?",
                      }),
                      e.jsxs("p", {
                        className:
                          "text-[13px] text-[var(--text-muted)] font-bold leading-relaxed uppercase tracking-widest",
                        children: [
                          "Estás por desactivar a",
                          " ",
                          e.jsx("span", {
                            className: "text-[var(--text-primary)]",
                            children:
                              g.razonSocial || `${g.nombre} ${g.apellido}`,
                          }),
                          ". Esta acción ocultará al contacto de las listas activas pero mantendrá su historial.",
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-3 w-full mt-4",
                    children: [
                      e.jsx("button", {
                        onClick: () => E(null),
                        disabled: a,
                        className:
                          "flex-1 py-3.5 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[12px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors shadow-sm",
                        children: "Cancelar",
                      }),
                      e.jsxs("button", {
                        onClick: w,
                        disabled: a,
                        className:
                          "flex-1 py-3.5 rounded-md bg-rose-600 text-white text-[12px] border border-rose-700 font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm",
                        children: [
                          a
                            ? e.jsx("div", {
                                className:
                                  "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                              })
                            : e.jsx(T, { size: 14 }),
                          "Eliminar",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
      ],
    });
  },
  Oe = () => {
    const { entidades: r, crearEntidad: p, eliminarEntidad: i } = q(),
      {
        configs: d,
        crearConfiguracion: u,
        actualizarConfiguracion: o,
        eliminarConfiguracion: v,
      } = ae(),
      [m, b] = x.useState({
        nombre: "",
        clave: "",
        icono: "user",
        color: "#34d399",
      }),
      [t, n] = x.useState({
        entidad: "",
        nombreCampo: "",
        claveCampo: "",
        tipoDato: "TEXTO",
        opciones: "",
        formula: "",
        requerido: !1,
      }),
      [l, y] = x.useState(null),
      N = async (a) => {
        (a.preventDefault(),
          !(!m.nombre || !m.clave) &&
            (await p(m),
            b({ nombre: "", clave: "", icono: "user", color: "#34d399" })));
      },
      g = async (a) => {
        if ((a.preventDefault(), !t.entidad || !t.nombreCampo || !t.claveCampo))
          return;
        const A = {
          ...t,
          codigoEmpresa: 2,
          opciones:
            t.tipoDato === "LISTA"
              ? typeof t.opciones == "string"
                ? t.opciones.split(",").map((S) => S.trim())
                : t.opciones
              : null,
        };
        (l ? await o({ codigoSecuencial: l, data: A }) : await u(A),
          n({
            entidad: "",
            nombreCampo: "",
            claveCampo: "",
            tipoDato: "TEXTO",
            opciones: "",
            formula: "",
            requerido: !1,
          }),
          y(null));
      },
      E = (a) => {
        (y(a.codigoSecuencial),
          n({
            entidad: a.entidadClave,
            nombreCampo: a.nombreCampo,
            claveCampo: a.claveCampo,
            tipoDato: a.tipoDato,
            opciones: Array.isArray(a.opciones)
              ? a.opciones.join(", ")
              : a.opciones || "",
            formula: a.formula || "",
            requerido: a.requerido || !1,
          }));
      };
    return e.jsx("div", {
      className:
        "flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar",
      children: e.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8",
        children: [
          e.jsxs("div", {
            className: "space-y-6",
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-3 mb-6",
                children: [
                  e.jsx("div", {
                    className:
                      "w-10 h-10 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-sm",
                    children: e.jsx(I, { size: 16 }),
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("h2", {
                        className:
                          "text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]",
                        children: "Maestro de Entidades",
                      }),
                      e.jsx("p", {
                        className:
                          "text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider",
                        children: "GESTIÓN DE CATEGORÍAS DE CONTACTOS",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("form", {
                onSubmit: N,
                className:
                  "bg-[var(--surface-hover)] p-5 rounded-md border border-[var(--border-subtle)] space-y-4 shadow-sm",
                children: [
                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "Nombre de Entidad",
                          }),
                          e.jsx("input", {
                            type: "text",
                            placeholder: "Ej: ALUMNOS",
                            value: m.nombre,
                            onChange: (a) =>
                              b({ ...m, nombre: a.target.value }),
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "Cód. Identificador",
                          }),
                          e.jsx("input", {
                            type: "text",
                            maxLength: 4,
                            placeholder: "ALUM",
                            value: m.clave,
                            onChange: (a) =>
                              b({ ...m, clave: a.target.value.toUpperCase() }),
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-4 items-end",
                    children: [
                      e.jsxs("div", {
                        className: "flex-1 space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "Color de Categoría",
                          }),
                          e.jsx("div", {
                            className: "relative",
                            children: e.jsx("input", {
                              type: "color",
                              value: m.color,
                              onChange: (a) =>
                                b({ ...m, color: a.target.value }),
                              className:
                                "w-full h-10 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md p-1 cursor-pointer",
                            }),
                          }),
                        ],
                      }),
                      e.jsx("button", {
                        type: "submit",
                        className:
                          "px-8 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer h-10",
                        children: "REGISTRAR",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className: "grid grid-cols-1 gap-2.5",
                children: r.map((a) =>
                  e.jsxs(
                    "div",
                    {
                      className:
                        "flex items-center justify-between px-5 py-3.5 bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] group hover:border-[var(--primary)]/30 transition-all shadow-sm",
                      children: [
                        e.jsxs("div", {
                          className: "flex items-center gap-4",
                          children: [
                            e.jsx("div", {
                              className: "w-2.5 h-2.5 rounded-full shadow-lg",
                              style: {
                                backgroundColor: a.color,
                                boxShadow: `0 0 10px ${a.color}44`,
                              },
                            }),
                            e.jsxs("div", {
                              className: "flex flex-col",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider",
                                  children: a.nombre,
                                }),
                                e.jsxs("span", {
                                  className:
                                    "text-[10px] text-[var(--text-muted)] font-black tracking-[0.1em]",
                                  children: ["CLAVE: ", a.clave],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("button", {
                          onClick: () => {
                            window.confirm(
                              `¿Estás seguro de eliminar la entidad "${a.nombre}"?`,
                            ) && i(a.clave);
                          },
                          className:
                            "p-2.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer",
                          children: e.jsx(T, { size: 14 }),
                        }),
                      ],
                    },
                    a.clave,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "space-y-6",
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-3 mb-6",
                children: [
                  e.jsx("div", {
                    className:
                      "w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm",
                    children: e.jsx(B, { size: 16 }),
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("h2", {
                        className:
                          "text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]",
                        children: "Esquema de Atributos",
                      }),
                      e.jsx("p", {
                        className:
                          "text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider",
                        children: "CAMPOS DINÁMICOS POR ENTIDAD",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("form", {
                onSubmit: g,
                className: `p-5 rounded-md border transition-all shadow-sm space-y-4 ${l ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20" : "bg-[var(--surface-hover)] border-[var(--border-subtle)]"}`,
                children: [
                  l &&
                    e.jsxs("div", {
                      className: "flex items-center justify-between mb-4",
                      children: [
                        e.jsx("span", {
                          className:
                            "text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full",
                          children: "Editando Atributo",
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => {
                            (y(null),
                              n({
                                entidad: "",
                                nombreCampo: "",
                                claveCampo: "",
                                tipoDato: "TEXTO",
                                opciones: "",
                                formula: "",
                                requerido: !1,
                              }));
                          },
                          className:
                            "text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest",
                          children: "CANCELAR EDICIÓN",
                        }),
                      ],
                    }),
                  e.jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      e.jsx("label", {
                        className:
                          "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                        children: "Entidad de Destino",
                      }),
                      e.jsxs("div", {
                        className: "relative",
                        children: [
                          e.jsxs("select", {
                            disabled: !!l,
                            value: t.entidad,
                            onChange: (a) =>
                              n({ ...t, entidad: a.target.value }),
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider",
                            children: [
                              e.jsx("option", {
                                value: "",
                                className: "text-[var(--text-muted)]",
                                children: "SELECCIONAR ENTIDAD...",
                              }),
                              r.map((a) =>
                                e.jsx(
                                  "option",
                                  {
                                    value: a.clave,
                                    children: a.nombre.toUpperCase(),
                                  },
                                  a.clave,
                                ),
                              ),
                            ],
                          }),
                          e.jsx("div", {
                            className:
                              "absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--text-muted)]",
                            children: e.jsx("svg", {
                              width: "12",
                              height: "12",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "3",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              children: e.jsx("path", { d: "m6 9 6 6 6-6" }),
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "Nombre Visual",
                          }),
                          e.jsx("input", {
                            type: "text",
                            placeholder: "Ej: MATRÍCULA",
                            value: t.nombreCampo,
                            onChange: (a) =>
                              n({ ...t, nombreCampo: a.target.value }),
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "ID Atributo (clave)",
                          }),
                          e.jsx("input", {
                            type: "text",
                            disabled: !!l,
                            placeholder: "matricula",
                            value: t.claveCampo,
                            onChange: (a) =>
                              n({ ...t, claveCampo: a.target.value }),
                            className:
                              "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] tracking-wider disabled:opacity-50",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-4",
                    children: [
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className:
                              "text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1",
                            children: "Formato de Dato",
                          }),
                          e.jsxs("div", {
                            className: "relative",
                            children: [
                              e.jsxs("select", {
                                value: t.tipoDato,
                                onChange: (a) =>
                                  n({ ...t, tipoDato: a.target.value }),
                                className:
                                  "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer transition-all uppercase tracking-wider",
                                children: [
                                  e.jsx("option", {
                                    value: "TEXTO",
                                    children: "TEXTO PLANO",
                                  }),
                                  e.jsx("option", {
                                    value: "NUMERO",
                                    children: "VALOR NUMÉRICO",
                                  }),
                                  e.jsx("option", {
                                    value: "BOOLEANO",
                                    children: "SÍ / NO",
                                  }),
                                  e.jsx("option", {
                                    value: "LISTA",
                                    children: "LISTA DESPLEGABLE",
                                  }),
                                ],
                              }),
                              e.jsx("div", {
                                className:
                                  "absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--text-muted)]",
                                children: e.jsx("svg", {
                                  width: "12",
                                  height: "12",
                                  viewBox: "0 0 24 24",
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeWidth: "3",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  children: e.jsx("path", {
                                    d: "m6 9 6 6 6-6",
                                  }),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "flex items-end",
                        children: e.jsx("button", {
                          type: "submit",
                          className: `w-full h-10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer ${l ? "bg-blue-500 shadow-blue-500/20" : "bg-blue-600 shadow-blue-600/20"}`,
                          children: l ? "GUARDAR CAMBIOS" : "INSERTAR CAMPO",
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "space-y-1.5 pt-4 border-t border-[var(--border-subtle)]",
                    children: [
                      e.jsxs("label", {
                        className:
                          "text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] ml-1 flex justify-between items-center",
                        children: [
                          e.jsx("span", {
                            children: "Fórmula Dinámica (Opcional)",
                          }),
                          e.jsxs("span", {
                            className:
                              "text-[9px] lowercase opacity-60 bg-amber-100 px-2 py-0.5 rounded italic",
                            children: ["usar ", "{clave_campo}"],
                          }),
                        ],
                      }),
                      e.jsx("textarea", {
                        placeholder:
                          'Ej: {tipo_alumno} == "interno" ? 190000 : 130000',
                        value: t.formula,
                        onChange: (a) => n({ ...t, formula: a.target.value }),
                        rows: 2,
                        className:
                          "w-full bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-[12px] font-mono text-amber-800 focus:outline-none focus:border-amber-400 transition-all placeholder:text-amber-300",
                      }),
                    ],
                  }),
                  t.tipoDato === "LISTA" &&
                    e.jsxs("div", {
                      className:
                        "space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300",
                      children: [
                        e.jsx("label", {
                          className:
                            "text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.15em] ml-1",
                          children: "Opciones (separadas por coma)",
                        }),
                        e.jsx("input", {
                          type: "text",
                          placeholder: "Ej: OPCIÓN 1, OPCIÓN 2, OPCIÓN 3",
                          value: t.opciones,
                          onChange: (a) =>
                            n({ ...t, opciones: a.target.value }),
                          className:
                            "w-full bg-[var(--primary-subtle)] border border-[var(--primary)]/30 rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--primary)]/30 uppercase tracking-widest",
                        }),
                      ],
                    }),
                ],
              }),
              e.jsx("div", {
                className: "grid grid-cols-1 gap-2.5",
                children: d.map((a) =>
                  e.jsx(
                    "div",
                    {
                      className:
                        "flex flex-col px-5 py-4 bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] hover:border-[var(--primary)]/20 transition-all group shadow-sm",
                      children: e.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-4",
                            children: [
                              e.jsx("span", {
                                className:
                                  "px-2.5 py-1 rounded-md bg-[var(--fill-secondary)] text-[10px] font-black text-[var(--text-muted)] uppercase border border-[var(--border-subtle)] tracking-wider",
                                children: a.entidadClave,
                              }),
                              e.jsxs("div", {
                                className: "flex flex-col",
                                children: [
                                  e.jsx("span", {
                                    className:
                                      "text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wide",
                                    children: a.nombreCampo,
                                  }),
                                  a.formula &&
                                    e.jsxs("span", {
                                      className:
                                        "text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1",
                                      children: [
                                        e.jsx("div", {
                                          className:
                                            "w-1 h-1 rounded-full bg-amber-500 animate-pulse",
                                        }),
                                        "Dinámico (Fórmula)",
                                      ],
                                    }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [
                              e.jsx("span", {
                                className:
                                  "text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] bg-[var(--fill-secondary)] px-2 py-1 rounded-md",
                                children: a.tipoDato,
                              }),
                              e.jsx("button", {
                                onClick: () => E(a),
                                className:
                                  "p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-all cursor-pointer",
                                title: "Editar Esquema",
                                children: e.jsx(B, { size: 14 }),
                              }),
                              e.jsx("button", {
                                onClick: () => {
                                  window.confirm(
                                    `¿Estás seguro de eliminar el atributo "${a.nombreCampo}"?`,
                                  ) && v(a.codigoSecuencial);
                                },
                                className:
                                  "p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all cursor-pointer",
                                title: "Eliminar Atributo",
                                children: e.jsx(T, { size: 14 }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    },
                    a.codigoSecuencial,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
    });
  },
  De = ({ open: r, onClose: p, onExito: i }) => {
    const [d, u] = x.useState([]),
      [o, v] = x.useState([]),
      [m, b] = x.useState([]),
      [t, n] = x.useState(""),
      [l, y] = x.useState(!1),
      [N, g] = x.useState(null);
    x.useEffect(() => {
      r && E();
    }, [r]);
    const E = async () => {
        try {
          const [c, C] = await Promise.all([de(), pe()]);
          (v(c), b(C));
        } catch (c) {
          console.error("Error al cargar catálogos:", c);
        }
      },
      a = x.useMemo(
        () => (t ? m.filter((c) => c.entidadClave === t) : []),
        [t, m],
      ),
      A = () => {
        if (!t) {
          g("Por favor, seleccioná primero qué tipo de contacto vas a cargar.");
          return;
        }
        let c = [
          "Nombre",
          "Apellido",
          "Razón Social",
          "Documento",
          "Condición IVA (CF/RI/MO/EX)",
        ];
        a.forEach((w) => {
          let s = w.nombreCampo;
          (w.tipoDato === "LISTA" &&
          Array.isArray(w.opciones) &&
          w.opciones.length > 0
            ? (s += ` (${w.opciones.join("/")})`)
            : w.tipoDato === "BOOLEANO" && (s += " (SI/NO)"),
            w.requerido && (s += " (Obligatorio)"),
            c.push(s));
        });
        const C = M.aoa_to_sheet([c]),
          f = M.book_new();
        (M.book_append_sheet(f, C, "Plantilla"),
          je(f, `plantilla_importar_${t.toLowerCase()}.xlsx`));
      },
      S = (c) => {
        const C = c.target.files[0];
        if (!C) return;
        if (!t) {
          g("Seleccioná la entidad antes de subir el archivo.");
          return;
        }
        const f = new FileReader();
        ((f.onload = (w) => {
          try {
            const s = w.target.result,
              h = ye(s, { type: "binary" }),
              D = h.SheetNames[0],
              V = h.Sheets[D],
              U = M.sheet_to_json(V, { header: 1 });
            if (U.length <= 1) {
              g("El archivo está vacío o no tiene encabezados.");
              return;
            }
            const z = U[0].map((j) => j?.toString().toLowerCase().trim() || ""),
              X = U.slice(1),
              k = {
                nombre: z.indexOf("nombre"),
                apellido: z.indexOf("apellido"),
                razonSocial: z.indexOf("razón social"),
                documento: z.indexOf("documento"),
                iva: z.findIndex((j) => j.includes("iva")),
              },
              K = X.map((j) => {
                const W = {
                  tipoEntidad: t,
                  nombre: (k.nombre !== -1 && j[k.nombre]) || "",
                  apellido: (k.apellido !== -1 && j[k.apellido]) || "",
                  razonSocial: (k.razonSocial !== -1 && j[k.razonSocial]) || "",
                  documento:
                    (k.documento !== -1 && j[k.documento]?.toString()) || "",
                  condicionIva: (k.iva !== -1 && j[k.iva]) || "CF",
                  atributos: {},
                };
                return (
                  a.forEach((Q) => {
                    const oe = Q.nombreCampo.toLowerCase().trim(),
                      $ = z.findIndex((le) => le.includes(oe));
                    $ !== -1 &&
                      j[$] !== void 0 &&
                      (W.atributos[Q.claveCampo] = j[$]);
                  }),
                  W
                );
              }).filter((j) => j.nombre || j.razonSocial);
            (u(K), g(null));
          } catch {
            g("Error al procesar el archivo Excel.");
          }
        }),
          f.readAsBinaryString(C));
      },
      F = async () => {
        if (!(d.length === 0 || l)) {
          y(!0);
          try {
            (await xe(d), i && i(), O());
          } catch (c) {
            (console.error("Error en carga masiva:", c),
              g(
                c.response?.data?.message ||
                  "Error al procesar la carga masiva.",
              ));
          } finally {
            y(!1);
          }
        }
      },
      O = () => {
        (u([]), g(null), n(""), p());
      },
      L = e.jsxs("div", {
        className: "space-y-6 py-2",
        children: [
          e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsx("label", {
                className:
                  "text-[12px] font-black text-black/30 uppercase tracking-[0.2em] ml-1",
                children: "1. Seleccioná el tipo de Contacto",
              }),
              e.jsx("div", {
                className: "grid grid-cols-2 gap-2",
                children: o.map((c) =>
                  e.jsxs(
                    "button",
                    {
                      onClick: () => {
                        (n(c.clave), u([]), g(null));
                      },
                      className: `p-3 rounded-md border flex items-center gap-3  ${t === c.clave ? "bg-[var(--primary)]/10 border-[var(--primary)] text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "bg-white/[0.02] border-black/5 text-black/40 hover:bg-black/5"}`,
                      children: [
                        e.jsx("div", {
                          className: `w-8 h-8 rounded-md flex items-center justify-center ${t === c.clave ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-black/5 text-black/20"}`,
                          children: e.jsx(I, { size: 16 }),
                        }),
                        e.jsx("span", {
                          className:
                            "text-xs font-black uppercase tracking-widest",
                          children: c.nombre,
                        }),
                      ],
                    },
                    c.clave,
                  ),
                ),
              }),
            ],
          }),
          t &&
            e.jsxs("div", {
              className: "flex flex-wrap gap-4    ",
              children: [
                e.jsxs("button", {
                  onClick: A,
                  className:
                    "flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-700/10 hover:bg-emerald-700/20 border border-emerald-700/20 rounded-md text-emerald-400  group",
                  children: [
                    e.jsx(Ee, {
                      size: 20,
                      className: "group-hover:-translate-y-1 ",
                    }),
                    e.jsxs("div", {
                      className: "text-left",
                      children: [
                        e.jsxs("div", {
                          className:
                            "text-xs font-black uppercase tracking-wider",
                          children: ["Planilla ", t],
                        }),
                        e.jsx("div", {
                          className: "text-[12px] opacity-60",
                          children: "Descargar Formato .xlsx",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("label", {
                  className:
                    "flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 rounded-md text-[var(--primary)]  cursor-pointer group",
                  children: [
                    e.jsx(se, { size: 20, className: " " }),
                    e.jsxs("div", {
                      className: "text-left",
                      children: [
                        e.jsx("div", {
                          className:
                            "text-xs font-black uppercase tracking-wider",
                          children: "Subir Archivo",
                        }),
                        e.jsx("div", {
                          className: "text-[12px] opacity-60",
                          children: "Seleccionar Excel listo",
                        }),
                      ],
                    }),
                    e.jsx("input", {
                      type: "file",
                      accept: ".xlsx, .xls",
                      className: "hidden",
                      onChange: S,
                    }),
                  ],
                }),
              ],
            }),
          N &&
            e.jsxs("div", {
              className:
                "bg-rose-700/10 border border-rose-700/20 rounded-md p-4 flex items-center gap-3 text-rose-400 text-xs font-bold   ",
              children: [e.jsx(Se, { size: 18 }), N],
            }),
          d.length > 0 &&
            e.jsxs("div", {
              className: "space-y-3   ",
              children: [
                e.jsxs("div", {
                  className: "flex items-center justify-between px-1",
                  children: [
                    e.jsx("label", {
                      className:
                        "text-[13px] font-bold text-black/50 uppercase tracking-widest",
                      children: "Previsualización",
                    }),
                    e.jsxs("span", {
                      className:
                        "text-[12px] font-black text-[var(--primary)] uppercase",
                      children: [d.length, " registros detectados"],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className:
                    "space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar",
                  children: d.map((c, C) =>
                    e.jsxs(
                      "div",
                      {
                        className:
                          "flex items-center gap-4 bg-white/[0.03] p-3 rounded-md border border-black/5 hover:bg-white/[0.06] ",
                        children: [
                          e.jsx("div", {
                            className:
                              "w-8 h-8 rounded-md bg-black/5 flex items-center justify-center border border-black/10 shrink-0",
                            children: e.jsx(I, {
                              size: 14,
                              className: "text-black/40",
                            }),
                          }),
                          e.jsxs("div", {
                            className: "flex-1 min-w-0",
                            children: [
                              e.jsx("div", {
                                className:
                                  "text-[13px] font-bold text-black truncate",
                                children:
                                  c.razonSocial || `${c.nombre} ${c.apellido}`,
                              }),
                              e.jsxs("div", {
                                className: "flex items-center gap-2 mt-0.5",
                                children: [
                                  e.jsx("span", {
                                    className:
                                      "text-[11px] text-black/30 uppercase font-black",
                                    children: c.documento || "S/D",
                                  }),
                                  e.jsx("span", {
                                    className: "text-[11px] text-black/10",
                                    children: "•",
                                  }),
                                  e.jsx("span", {
                                    className:
                                      "text-[11px] text-[var(--primary)]/70 font-bold",
                                    children: c.condicionIva,
                                  }),
                                ],
                              }),
                              Object.keys(c.atributos).length > 0 &&
                                e.jsx("div", {
                                  className: "flex flex-wrap gap-1 mt-2",
                                  children: Object.entries(c.atributos).map(
                                    ([f, w]) =>
                                      e.jsxs(
                                        "span",
                                        {
                                          className:
                                            "px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[10px] font-black text-black/40 uppercase",
                                          children: [f, ": ", w || "---"],
                                        },
                                        f,
                                      ),
                                  ),
                                }),
                            ],
                          }),
                          e.jsx(ne, {
                            size: 16,
                            className: "text-emerald-700/40",
                          }),
                        ],
                      },
                      C,
                    ),
                  ),
                }),
              ],
            }),
        ],
      }),
      R = e.jsxs("div", {
        className: "flex items-center justify-between w-full",
        children: [
          e.jsx("button", {
            onClick: O,
            className:
              "px-6 py-2.5 text-xs font-black text-black/40 hover:text-black uppercase tracking-widest ",
            children: "Cancelar",
          }),
          e.jsxs("button", {
            onClick: F,
            disabled: d.length === 0 || l,
            className:
              "flex items-center gap-3 px-8 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:brightness-110 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-black rounded-md font-black text-[13px] uppercase tracking-widest  shadow-xl shadow-[var(--primary)]/20 active:scale-95",
            children: [
              l
                ? e.jsx("div", {
                    className:
                      "w-4 h-4 border-2 border-white/30 border-t-white rounded-full ",
                  })
                : e.jsx(ke, { size: 16 }),
              l ? "Importando..." : "Realizar Carga Masiva",
            ],
          }),
        ],
      });
    return e.jsx(Ne, {
      open: r,
      onClose: O,
      width: "max-w-xl",
      children: e.jsx(we, {
        title: "Carga Masiva de Contactos",
        icon: e.jsx(Ce, { size: 20 }),
        onClose: O,
        footer: R,
        children: L,
      }),
    });
  },
  ir = () => {
    const [r, p] = x.useState(null),
      [i, d] = x.useState(!1),
      [u, o] = x.useState(!1),
      [v, m] = x.useState({ pagina: 1, limite: 10, busqueda: "" }),
      { entidades: b, cargandoEntidades: t } = q();
    x.useEffect(() => {
      !r && b.length > 0 && !i && p(b[0]);
    }, [b, r, i]);
    const {
      contactos: n,
      total: l,
      paginas: y,
      cargandoContactos: N,
      eliminarContacto: g,
      refetch: E,
    } = G({ tipoEntidad: r?.clave, ...v });
    return e.jsxs("div", {
      className:
        "flex flex-col h-screen bg-[var(--fill)] text-[var(--text-primary)] overflow-hidden p-4 lg:p-6 gap-4",
      children: [
        e.jsx(ce, {
          ruta: i ? "CONFIGURACIÓN" : "CONTACTOS",
          icono: e.jsx(I, { size: 18 }),
          children: e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              !i &&
                e.jsxs("button", {
                  onClick: () => o(!0),
                  className:
                    "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer",
                  children: [e.jsx(se, { size: 14 }), "Carga Masiva"],
                }),
              e.jsx(te, {
                accion: "CONFIGURAR_CONTACTO",
                children: e.jsxs("button", {
                  onClick: () => d(!i),
                  className: `flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-black border uppercase tracking-widest transition-all cursor-pointer ${i ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shadow-sm"}`,
                  children: [
                    e.jsx(B, { size: 14 }),
                    i ? "VOLVER" : "CONFIGURAR",
                  ],
                }),
              }),
            ],
          }),
        }),
        e.jsxs("div", {
          className: "flex-1 flex flex-col gap-4 overflow-hidden",
          children: [
            !i &&
              e.jsx("div", {
                className:
                  "flex items-center gap-1 p-1 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md shadow-inner overflow-x-auto no-scrollbar shrink-0",
                children: t
                  ? e.jsx("div", {
                      className: "flex gap-2",
                      children: [1, 2, 3].map((a) =>
                        e.jsx(
                          "div",
                          {
                            className:
                              "w-32 h-10 bg-black/5 animate-pulse rounded-md",
                          },
                          a,
                        ),
                      ),
                    })
                  : b.map((a) => {
                      const A = r?.clave === a.clave;
                      return e.jsxs(
                        "button",
                        {
                          onClick: () => {
                            (p(a), m((S) => ({ ...S, pagina: 1 })));
                          },
                          className: `
                      relative px-5 py-2.5 rounded-md text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5 cursor-pointer whitespace-nowrap
                      ${A ? "text-[var(--text-primary)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[var(--border-subtle)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50 border border-transparent"}
                    `,
                          children: [
                            e.jsx("div", {
                              className: "w-2 h-2 rounded-full shadow-sm",
                              style: {
                                backgroundColor: a.color || "var(--primary)",
                              },
                            }),
                            e.jsx("span", {
                              className: "relative z-10",
                              children: a.nombre,
                            }),
                          ],
                        },
                        a.codigoSecuencial,
                      );
                    }),
              }),
            e.jsx("div", {
              className: "flex-1 rounded-md flex flex-col ",
              children: i
                ? e.jsx(Oe, {})
                : e.jsx(ze, {
                    entidad: r,
                    contactos: n,
                    cargando: N,
                    filtros: v,
                    setFiltros: m,
                    total: l,
                    paginas: y,
                    eliminarContacto: g,
                  }),
            }),
          ],
        }),
        e.jsx(De, {
          open: u,
          onClose: () => o(!1),
          onExito: () => {
            E();
          },
        }),
      ],
    });
  };
export { ir as default };
