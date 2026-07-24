/**
 * Feature "egreso-distribucion-unidad-negocio" — T23. Cubre: R2, R41.
 *
 * Tests de lógica pura — sin @testing-library/react (mismo patrón que
 * CrearComprobante.spec.js). Verifica dos casos donde el botón "Repartir"
 * NO debe mostrarse en ningún ítem del carrito:
 *
 * (a) el comprobante de Egreso es RECIBO (992) u ORDEN_PAGO (993) — R2.
 * (b) la empresa tiene <=1 Unidad de Negocio configurada, aunque el
 *     comprobante sea elegible (Factura/NC/ND) — R41.
 */

// ─── Lógica extraída de Egresos.jsx (permiteRepartoUnidadNegocio) ──────────

const TIPO_DESCRIPCION_MAP = {
  1: "FACTURA",
  2: "NOTA_DEBITO",
  3: "NOTA_CREDITO",
  6: "FACTURA",
  7: "NOTA_DEBITO",
  8: "NOTA_CREDITO",
  11: "FACTURA",
  12: "NOTA_DEBITO",
  13: "NOTA_CREDITO",
  991: "FACTURA",
  992: "RECIBO",
  993: "ORDEN_PAGO",
  994: "NOTA_CREDITO",
  995: "NOTA_DEBITO",
};

/**
 * Replica exactamente la lógica de `permiteRepartoUnidadNegocio` en
 * Egresos.jsx: elegible solo Factura/NotaCredito/NotaDebito (R2) Y más de
 * una Unidad de Negocio configurada (R41).
 */
function permiteRepartoUnidadNegocio(codigoTipoComprobante, unidadesNegocio) {
  const codigoTipo = Number(codigoTipoComprobante);
  const tipoDescripcion = TIPO_DESCRIPCION_MAP[codigoTipo] || "FACTURA";
  return (
    ["FACTURA", "NOTA_CREDITO", "NOTA_DEBITO"].includes(tipoDescripcion) &&
    (unidadesNegocio?.length || 0) > 1
  );
}

describe("Egresos — permiteRepartoUnidadNegocio (T23, R2, R41)", () => {
  const dosUnidades = [{ codigo: 1, nombre: "Casa Central" }, { codigo: 2, nombre: "Sucursal Norte" }];

  it("Caso (a): RECIBO (992) NO habilita el reparto, aunque haya 2+ unidades (R2)", () => {
    expect(permiteRepartoUnidadNegocio(992, dosUnidades)).toBe(false);
  });

  it("Caso (a): ORDEN_PAGO (993) NO habilita el reparto, aunque haya 2+ unidades (R2)", () => {
    expect(permiteRepartoUnidadNegocio(993, dosUnidades)).toBe(false);
  });

  it("Caso (b): Factura (991) con 1 sola Unidad de Negocio NO habilita el reparto (R41)", () => {
    expect(permiteRepartoUnidadNegocio(991, [{ codigo: 1, nombre: "Única" }])).toBe(false);
  });

  it("Caso (b): Factura (991) sin ninguna Unidad de Negocio configurada NO habilita el reparto (R41)", () => {
    expect(permiteRepartoUnidadNegocio(991, [])).toBe(false);
    expect(permiteRepartoUnidadNegocio(991, undefined)).toBe(false);
  });

  it("Factura (991) con 2+ unidades SÍ habilita el reparto (caso normal, no-regresión de R2/R41)", () => {
    expect(permiteRepartoUnidadNegocio(991, dosUnidades)).toBe(true);
  });

  it("Nota de Crédito (994) y Nota de Débito (995) con 2+ unidades SÍ habilitan el reparto", () => {
    expect(permiteRepartoUnidadNegocio(994, dosUnidades)).toBe(true);
    expect(permiteRepartoUnidadNegocio(995, dosUnidades)).toBe(true);
  });
});

// ─── R42: herencia del reparto al precargar una NC/ND desde la Factura asociada ───

/**
 * Replica exactamente el mapeo de `full.detalles` a ítems del carrito que
 * hace el `useEffect` de `cabecera.comprobanteAsociado` en Egresos.jsx.
 * Decisión del humano post-implementación (R42, no estaba en el spec
 * original): cada línea hereda tal cual el reparto por unidad de negocio
 * que tenía en la Factura original.
 */
function mapearDetallesPrecarga(detalles) {
  return detalles.map((d) => ({
    codigo: d.codigoDetalle,
    nombre: d.descripcion,
    tipoDetalle: d.tipoDetalle,
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
    descuento: d.descuento || 0,
    tasaIva: d.tasaIva || 0,
    codigoDeposito: d.codigoDeposito || 0,
    ...(Array.isArray(d.repartos) &&
      d.repartos.length > 0 && {
        repartoUnidadNegocio: d.repartos.map((r) => ({
          codigoUnidadNegocio: r.codigoUnidadNegocio,
          porcentaje: r.porcentaje,
        })),
      }),
  }));
}

describe("Egresos — precarga de NC/ND desde Factura asociada hereda el reparto (R42)", () => {
  it("una línea con reparto en la Factura original llega con repartoUnidadNegocio poblado (mismo formato del modal)", () => {
    const detallesFactura = [
      {
        codigoDetalle: 10,
        descripcion: "Producto repartido",
        tipoDetalle: "PRODUCTO",
        cantidad: 1,
        precioUnitario: 1000,
        descuento: 0,
        tasaIva: 21,
        codigoDeposito: 0,
        repartos: [
          { codigo: 1, codigoDetalleComprobante: 10, codigoUnidadNegocio: 1, porcentaje: 40, monto: 400 },
          { codigo: 2, codigoDetalleComprobante: 10, codigoUnidadNegocio: 2, porcentaje: 60, monto: 600 },
        ],
      },
    ];

    const items = mapearDetallesPrecarga(detallesFactura);

    expect(items[0].repartoUnidadNegocio).toEqual([
      { codigoUnidadNegocio: 1, porcentaje: 40 },
      { codigoUnidadNegocio: 2, porcentaje: 60 },
    ]);
  });

  it("una línea SIN reparto en la Factura original (repartos vacío/undefined) queda sin repartoUnidadNegocio (comportamiento default)", () => {
    const detallesFactura = [
      {
        codigoDetalle: 11,
        descripcion: "Producto sin repartir",
        tipoDetalle: "PRODUCTO",
        cantidad: 1,
        precioUnitario: 500,
        descuento: 0,
        tasaIva: 21,
        codigoDeposito: 0,
        repartos: [],
      },
      {
        codigoDetalle: 12,
        descripcion: "Producto sin campo repartos (comprobante viejo)",
        tipoDetalle: "PRODUCTO",
        cantidad: 1,
        precioUnitario: 700,
        descuento: 0,
        tasaIva: 21,
        codigoDeposito: 0,
      },
    ];

    const items = mapearDetallesPrecarga(detallesFactura);

    expect(items[0].repartoUnidadNegocio).toBeUndefined();
    expect(items[1].repartoUnidadNegocio).toBeUndefined();
  });
});
