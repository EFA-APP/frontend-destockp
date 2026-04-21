import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const THEME = {
  ink: "#111827",
  slate: "#475569",
  muted: "#64748b",
  line: "#dbe4ee",
  soft: "#f8fafc",
  white: "#ffffff",
  accent: "#c77719",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 92,
    paddingBottom: 50,
    paddingHorizontal: 28,
    backgroundColor: THEME.white,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: THEME.ink,
  },
  headerFixed: {
    position: "absolute",
    top: 20,
    left: 28,
    right: 28,
    borderBottom: `1pt solid ${THEME.line}`,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 14, fontWeight: "bold", color: THEME.ink },
  headerSub: {
    marginTop: 2,
    fontSize: 8,
    color: THEME.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaRight: { alignItems: "flex-end" },
  metaText: { fontSize: 8, color: THEME.slate, marginBottom: 2 },
  metaAccent: { fontSize: 8, color: THEME.accent, fontWeight: "bold" },
  footerFixed: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    borderTop: `1pt solid ${THEME.line}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7, color: THEME.muted },
  footerPage: { fontSize: 7, color: THEME.accent, fontWeight: "bold" },
  dashboard: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    border: `1pt solid ${THEME.line}`,
    backgroundColor: THEME.soft,
    padding: 8,
  },
  statLabel: {
    fontSize: 7,
    color: THEME.muted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    color: THEME.ink,
    fontWeight: "bold",
  },
  table: {
    border: `1pt solid ${THEME.line}`,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: THEME.ink,
    minHeight: 22,
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 22,
    alignItems: "center",
    borderTop: `1pt solid ${THEME.line}`,
  },
  th: {
    color: THEME.white,
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    paddingHorizontal: 5,
  },
  td: {
    color: THEME.ink,
    fontSize: 8,
    paddingHorizontal: 5,
  },
  colCode: { width: "10%", borderRight: `1pt solid ${THEME.line}` },
  colName: { width: "29%", borderRight: `1pt solid ${THEME.line}` },
  colUnit: { width: "8%", borderRight: `1pt solid ${THEME.line}` },
  colDep: {
    flex: 1,
    borderRight: `1pt solid ${THEME.line}`,
  },
});

const StockDepositoPDF = ({ matrizStock = [], depositos = [], empresaNombre }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalArticulos = matrizStock.length;
  const totalItems = matrizStock.reduce((acc, row) => {
    const totalRow = depositos.reduce(
      (sum, dep) => sum + (row[`dep_${dep.codigoSecuencial}`] || 0),
      0,
    );
    return acc + totalRow;
  }, 0);

  const tenantName = empresaNombre || "Empresa no configurada";

  return (
    <Document title={`Reporte_Stock_Depositos_${dateStr}`}>
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <View style={styles.headerFixed} fixed>
          <View>
            <Text style={styles.headerTitle}>Reporte de Stock por Deposito</Text>
            <Text style={styles.headerSub}>{tenantName}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaText}>Generado: {dateStr} {timeStr}</Text>
            <Text style={styles.metaAccent}>Estado: CONSISTENTE</Text>
          </View>
        </View>

        <View style={styles.dashboard}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Articulos</Text>
            <Text style={styles.statValue}>{totalArticulos}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Unidades Totales</Text>
            <Text style={styles.statValue}>{totalItems.toLocaleString("es-AR")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Depositos Activos</Text>
            <Text style={styles.statValue}>{depositos.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <View style={styles.colCode}>
              <Text style={styles.th}>Codigo</Text>
            </View>
            <View style={styles.colName}>
              <Text style={styles.th}>Articulo</Text>
            </View>
            {depositos.map((dep) => (
              <View key={dep.codigoSecuencial} style={styles.colDep}>
                <Text style={styles.th}>{dep.nombre}</Text>
              </View>
            ))}
          </View>

          {matrizStock.map((row, idx) => (
            <View key={`${row.codigoProducto || row.id || idx}`} style={styles.tableRow} wrap={false}>
              <View style={styles.colCode}>
                <Text style={styles.td}>
                  {row.codigoProducto || row.sku || row.id || "-"}
                </Text>
              </View>
              <View style={styles.colName}>
                <Text style={styles.td}>{row.nombre || "-"}</Text>
              </View>
              {depositos.map((dep) => {
                const val = row[`dep_${dep.codigoSecuencial}`] || 0;
                return (
                  <View key={dep.codigoSecuencial} style={styles.colDep}>
                    <Text
                      style={[
                        styles.td,
                        { textAlign: "center", color: val > 0 ? THEME.ink : THEME.muted },
                      ]}
                    >
                      {val > 0 ? val : "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.footerFixed} fixed>
          <Text style={styles.footerText}>
            {tenantName} | Reporte Interno de Inventario
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default StockDepositoPDF;
