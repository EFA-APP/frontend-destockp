import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const THEME = {
  primary: "#1FAE6D",
  dark: "#111827",
  slate: "#475569",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#cbd5e1",
  success: "#059669",
  warning: "#f59e0b",
  danger: "#dc2626",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: THEME.dark,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: THEME.primary,
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: THEME.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 8,
    color: THEME.muted,
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.dark,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 4,
  },

  // Cards
  cardsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: THEME.light,
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: THEME.muted,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.dark,
  },

  // Tables
  table: {
    width: "100%",
    marginTop: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: THEME.light,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  col1: { flex: 2 },
  col2: { flex: 3, textAlign: "right" },
  col3: { flex: 3, textAlign: "right" },
  col4: { flex: 3, textAlign: "right" },
  th: {
    fontSize: 8,
    fontWeight: "bold",
    color: THEME.slate,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 9,
    color: THEME.dark,
  },
  emptyText: {
    padding: 15,
    textAlign: "center",
    fontSize: 9,
    color: THEME.muted,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: THEME.muted,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 10,
  }
});

const formatearMoneda = (monto) => {
  return Number(monto || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
};

export default function MetricasCuentaCorrientePDF({ datos, tipo }) {
  const { totales = {}, evolucion = {} } = datos || {};
  const evolucionTipo = evolucion[tipo] || [];

  const fechaImpresion = new Date().toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const labelAbonado = tipo === "INGRESO" ? "Cobrado" : "Pagado";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Cuentas Corrientes</Text>
          <Text style={styles.subtitle}>Análisis de Operaciones de {tipo === 'INGRESO' ? 'Cobro' : 'Pago'}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>Generado el: {fechaImpresion}</Text>
            <Text style={styles.metaText}>Sistema EFA</Text>
          </View>
        </View>

        {/* Totales */}
        <Text style={styles.sectionTitle}>Saldos Consolidados</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.card, { borderLeftColor: THEME.primary }]}>
            <Text style={styles.cardTitle}>Total A Cobrar</Text>
            <Text style={styles.cardValue}>{formatearMoneda(totales.totalACobrar)}</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: THEME.warning }]}>
            <Text style={styles.cardTitle}>Total A Pagar</Text>
            <Text style={styles.cardValue}>{formatearMoneda(totales.totalAPagar)}</Text>
          </View>
        </View>

        {/* Evolución Mensual */}
        <Text style={styles.sectionTitle}>Evolución Mensual ({tipo})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.col1]}>Período</Text>
            <Text style={[styles.th, styles.col2]}>Emitido</Text>
            <Text style={[styles.th, styles.col3]}>{labelAbonado}</Text>
            <Text style={[styles.th, styles.col4]}>Diferencia</Text>
          </View>

          {evolucionTipo.length === 0 ? (
            <Text style={styles.emptyText}>No hay datos de evolución disponibles.</Text>
          ) : (
            evolucionTipo.map((mes, idx) => {
              const emitido = Number(mes.montoEmitido || 0);
              const abonado = Number(mes.montoCobrado || 0);
              const diff = emitido - abonado;
              return (
                <View key={idx} style={[styles.tableRow, idx === evolucionTipo.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={[styles.td, styles.col1, { fontWeight: "bold" }]}>{mes.periodo}</Text>
                  <Text style={[styles.td, styles.col2]}>{formatearMoneda(emitido)}</Text>
                  <Text style={[styles.td, styles.col3, { color: THEME.success }]}>{formatearMoneda(abonado)}</Text>
                  <Text style={[styles.td, styles.col4, { color: diff > 0 ? THEME.danger : THEME.slate }]}>
                    {formatearMoneda(diff)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Documento generado automáticamente - Página ${pageNumber} de ${totalPages}`
        )} />
      </Page>
    </Document>
  );
}
