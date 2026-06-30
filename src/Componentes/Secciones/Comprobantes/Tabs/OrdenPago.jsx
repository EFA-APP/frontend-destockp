import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, Search, X } from "lucide-react";
import { DetallePago } from "../../../../Componentes/Secciones/Comprobantes/Componentes/DetallePago";
import { ListarContactosApi } from "../../../../Backend/Contactos/api/contactos.api";
import { ObtenerDeudasContactoApi } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { useGenerarComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";
import { formatNumber, parseCurrency } from "../../../../utils/formatters";

const formatPrice = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n ?? 0);

const hoy = () => new Date().toISOString().split("T")[0];

const OrdenPago = () => {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const [deudasConImporte, setDeudasConImporte] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [vueltos, setVueltos] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [importesRaw, setImportesRaw] = useState({});
  const [importeWarnings, setImporteWarnings] = useState({});

  const { mutate: crearComprobante, isPending } = useGenerarComprobante();

  const handleEnterNext = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const all = Array.from(
      document.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([type="checkbox"]), select:not([disabled])')
    );
    const i = all.indexOf(e.target);
    if (i >= 0 && i < all.length - 1) all[i + 1].focus();
  };

  const { data: contactosRaw } = useQuery({
    queryKey: ["proveedores-orden-pago", busqueda],
    queryFn: () => ListarContactosApi({ tipoEntidad: "PROV", busqueda: busqueda.trim(), limite: 10 }),
    enabled: busqueda.length >= 2 && !contactoSeleccionado,
  });
  const contactos = contactosRaw?.items ?? [];

  const { data: deudasRaw, isLoading: cargandoDeudas } = useQuery({
    queryKey: ["deudas-orden-pago", contactoSeleccionado?.codigoSecuencial],
    queryFn: () => ObtenerDeudasContactoApi(contactoSeleccionado.codigoSecuencial),
    enabled: !!contactoSeleccionado,
  });

  useEffect(() => {
    if (deudasRaw !== undefined && !cargandoDeudas) {
      const lista = Array.isArray(deudasRaw) ? deudasRaw : [];
      setDeudasConImporte(lista.map((d) => ({ ...d, importeAplicado: 0 })));
      setImportesRaw({});
      setImporteWarnings({});
      setSeleccionados(new Set());
    }
  }, [deudasRaw, cargandoDeudas]);

  const deudas = deudasConImporte;

  const limpiar = () => {
    setDeudasConImporte([]);
    setImportesRaw({});
    setImporteWarnings({});
    setPagos([]);
    setVueltos([]);
    setSeleccionados(new Set());
  };

  const seleccionarContacto = (c) => {
    setContactoSeleccionado(c);
    setBusqueda(c.razonSocial || `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim());
    setMostrarResultados(false);
    limpiar();
  };

  const limpiarContacto = () => {
    setContactoSeleccionado(null);
    setBusqueda("");
    limpiar();
  };

  const actualizarImporte = (idx, valor) => {
    setDeudasConImporte((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, importeAplicado: valor } : d))
    );
  };

  const toggleSeleccion = (d, idx) => {
    const estaba = seleccionados.has(d.codigo);
    setSeleccionados((prev) => {
      const next = new Set(prev);
      estaba ? next.delete(d.codigo) : next.add(d.codigo);
      return next;
    });
    if (estaba) {
      actualizarImporte(idx, 0);
      setImportesRaw((prev) => { const n = { ...prev }; delete n[d.codigo]; return n; });
      setImporteWarnings((prev) => { const n = { ...prev }; delete n[d.codigo]; return n; });
    } else {
      actualizarImporte(idx, d.saldoPendiente);
    }
  };

  const totalAplicado = deudas.reduce((s, d) => s + (d.importeAplicado || 0), 0);

  const handleConfirmar = () => {
    if (!contactoSeleccionado) return;

    const ahora = new Date();
    const periodoStr = ahora.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const periodo = periodoStr.charAt(0).toUpperCase() + periodoStr.slice(1);
    const montoFinal = pagos.reduce((s, p) => s + p.monto, 0);

    const detallePagos = pagos.map((p) => ({
      metodoPago: p.tipoMetodoPago,
      monto: p.monto,
      fechaPago: hoy(),
      ...(p.tipoMetodoPago !== "EFECTIVO" && p.codigoBancoDestino && {
        codigoBancoDestino: p.codigoBancoDestino,
      }),
      ...(p.datosTarjeta && {
        datosTarjeta: {
          tipoTarjeta: p.tipoMetodoPago === "TARJETA_CREDITO" ? "CREDITO" : "DEBITO",
          marca: p.datosTarjeta.marca || "",
          cantidadCuotas: Number(p.datosTarjeta.cantidadCuotas) || 1,
          recargo: parseFloat(p.datosTarjeta.recargo) || 0,
          cupon: p.datosTarjeta.cupon || "",
          lote: p.datosTarjeta.lote || "",
          autorizacion: p.datosTarjeta.autorizacion || "",
          fechaAcreditacion: p.datosTarjeta.fechaAcreditacion || "",
        },
      }),
      ...(p.chequeTercero && { chequeTercero: p.chequeTercero }),
      ...(p.chequePropio && { chequePropio: p.chequePropio }),
    }));

    crearComprobante({
      dto: {
        tipoDescripcionComprobante: "ORDEN_PAGO",
        tipoOperacion: "EGRESO",
        fechaEmision: hoy(),
        fechaVto: hoy(),
        puntoVenta: 1,
        codigoReceptor: contactoSeleccionado.codigoSecuencial,
        entidadReceptor: contactoSeleccionado.tipoEntidad,
        codigoTipoComprobante: 993,
        condicionComprobante: "CONTADO",
        subtotal: montoFinal,
        iva: 0,
        total: montoFinal,
        detalle: [{
          tipoDetalle: "CUENTA_CONTABLE",
          codigoDetalle: 0,
          descripcion: `Pago período ${periodo}`,
          cantidad: 1,
          precioUnitario: montoFinal,
          iva: 0,
          subtotal: montoFinal,
        }],
        detallePagos,
        comprobantesAsociados: deudas
          .filter((d) => seleccionados.has(d.codigo) && (d.importeAplicado || 0) > 0)
          .map((d) => ({
            tipoDescripcionComprobante: d.tipoDescripcionComprobante,
            tipoRelacion: "APLICA_PAGO",
            numeroComprobante: d.numeroComprobante,
            codigoTipoComprobante: d.codigoTipoComprobante,
            codigoComprobante: d.codigo,
            importeAplicado: d.importeAplicado,
            codigoUnidadNegocio: 1,
          })),
      },
      codigoUnidadNegocio: 1,
    });
  };

  return (
    <div className="flex flex-col gap-6 bg-white rounded-md p-5 border border-gray-200">
      <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
        Nueva Orden de Pago — Pago a Proveedor
      </h2>

      {/* BUSQUEDA DE PROVEEDOR */}
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Buscar Proveedor
        </label>
        {contactoSeleccionado ? (
          <div className="flex items-center gap-3 px-4 py-2.5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-md">
            <span className="text-sm font-bold text-gray-900 flex-1">
              {contactoSeleccionado.razonSocial ||
                `${contactoSeleccionado.nombre ?? ""} ${contactoSeleccionado.apellido ?? ""}`.trim()}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
              {contactoSeleccionado.tipoEntidad}
            </span>
            <button type="button" onClick={limpiarContacto}
              className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              placeholder="Escribe el nombre, código o documento del proveedor..."
              autoComplete="off"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-400 placeholder:font-normal"
              onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
              onFocus={() => setMostrarResultados(true)}
              onBlur={() => setTimeout(() => setMostrarResultados(false), 200)}
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {mostrarResultados && contactos.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {contactos.map((c) => (
                  <button key={c.codigoSecuencial} type="button" onClick={() => seleccionarContacto(c)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-b border-gray-100 last:border-0 transition-colors">
                    <span className="font-bold">
                      {c.razonSocial || `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim()}
                    </span>
                    {c.documento && <span className="ml-2 text-xs text-gray-400">Doc: {c.documento}</span>}
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{c.tipoEntidad}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TABLA DE DEUDAS */}
      {contactoSeleccionado && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Comprobantes con saldo pendiente
            </label>
            {cargandoDeudas ? (
              <p className="text-sm text-gray-500 py-4 text-center">Cargando deudas...</p>
            ) : deudas.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                Este proveedor no tiene comprobantes pendientes de pago.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 w-8"></th>
                      <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Tipo</th>
                      <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Numero</th>
                      <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Fecha</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider text-gray-500">Total</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider text-gray-500">Saldo</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider text-gray-500">Importe a aplicar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deudas.map((d, idx) => {
                      const seleccionado = seleccionados.has(d.codigo);
                      const rawVal = importesRaw[d.codigo];
                      const warning = importeWarnings[d.codigo];
                      return (
                        <tr key={d.codigo ?? idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={seleccionado}
                              onChange={() => toggleSeleccion(d, idx)}
                              className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
                            />
                          </td>
                          <td className="px-3 py-2 font-semibold text-gray-700">{d.tipoDescripcionComprobante}</td>
                          <td className="px-3 py-2 font-semibold text-gray-700">
                            {String(d.puntoVenta ?? 0).padStart(5, "0")}-{String(d.numeroComprobante ?? 0).padStart(8, "0")}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{d.fechaEmision ? d.fechaEmision.split("T")[0] : "-"}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-700">{formatPrice(d.total)}</td>
                          <td className="px-3 py-2 text-right font-bold text-amber-600">{formatPrice(d.saldoPendiente)}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <input
                                type="text"
                                disabled={!seleccionado}
                                value={
                                  rawVal !== undefined
                                    ? rawVal
                                    : seleccionado && d.importeAplicado
                                    ? formatNumber(d.importeAplicado)
                                    : ""
                                }
                                onChange={(e) =>
                                  setImportesRaw((prev) => ({ ...prev, [d.codigo]: e.target.value }))
                                }
                                onFocus={() =>
                                  setImportesRaw((prev) => ({
                                    ...prev,
                                    [d.codigo]: d.importeAplicado ? String(d.importeAplicado) : "",
                                  }))
                                }
                                onBlur={() => {
                                  const val = parseCurrency(importesRaw[d.codigo] ?? "");
                                  if (val > d.saldoPendiente) {
                                    setImporteWarnings((prev) => ({
                                      ...prev,
                                      [d.codigo]: `Máximo: ${formatNumber(d.saldoPendiente)}`,
                                    }));
                                    actualizarImporte(idx, d.saldoPendiente);
                                  } else {
                                    setImporteWarnings((prev) => { const n = { ...prev }; delete n[d.codigo]; return n; });
                                    actualizarImporte(idx, val);
                                  }
                                  setImportesRaw((prev) => { const n = { ...prev }; delete n[d.codigo]; return n; });
                                }}
                                onKeyDown={handleEnterNext}
                                className="w-28 px-2 py-1 text-right border rounded text-sm font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border-gray-300"
                              />
                              {warning && (
                                <span className="text-[10px] text-red-500 font-semibold">{warning}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-right text-xs font-black uppercase tracking-wider text-gray-700">
                        Total aplicado:
                      </td>
                      <td className="px-3 py-2 text-right font-black text-[var(--primary)]">
                        {formatPrice(totalAplicado)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* DETALLE DE PAGO */}
          <DetallePago
            totalComprobante={totalAplicado}
            tipoOperacion="EGRESO"
            pagos={pagos}
            setPagos={setPagos}
            vueltos={vueltos}
            setVueltos={setVueltos}
          />

          {/* BOTON CONFIRMAR */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={isPending || !contactoSeleccionado || pagos.length === 0 || seleccionados.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white text-sm font-black uppercase tracking-wider rounded-md hover:bg-[var(--primary)]/90 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save size={16} />
              {isPending ? "Guardando..." : "Confirmar Orden de Pago"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdenPago;
