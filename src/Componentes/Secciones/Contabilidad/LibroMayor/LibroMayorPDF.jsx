import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Estilos premium para el reporte
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#4f46e5",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
    color: "#334155",
  },
  reportMeta: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 8,
    color: "#64748b",
  },
  
  // Stats Cards (Más compactos)
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  statLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 11,
    fontWeight: "bold",
  },

  // Table con estilo de Grilla/Libro
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#cbd5e1",
    borderBottomWidth: 1,
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#334155",
    fontSize: 7,
    textTransform: "uppercase",
    textAlign: "center",
  },
  
  // Celdas con bordes verticales
  tableCell: {
    borderRightColor: "#cbd5e1",
    borderRightWidth: 1,
    padding: 4,
    height: "100%",
    justifyContent: "center",
  },
  
  colFecha: { width: "10%" },
  colDesc: { width: "38%" },
  colRef: { width: "13%" },
  colMonto: { width: "13%" },
  
  cellText: {
    fontSize: 7.5,
  },
  cellMonto: {
    fontSize: 7.5,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },
  
  textDebe: { color: "#059669" },
  textHaber: { color: "#dc2626" },
  textSaldo: { color: "#1e293b" },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    fontSize: 7,
    color: "#94a3b8",
  }
});

const LibroMayorPDF = ({ datosMayor, empresa, filtros, contacto }) => {
  if (!datosMayor) return null;

  const totalDebe = datosMayor.movimientos?.reduce((acc, m) => acc + (Number(m.debe) || 0), 0) || 0;
  const totalHaber = datosMayor.movimientos?.reduce((acc, m) => acc + (Number(m.haber) || 0), 0) || 0;
  const saldoFinal = Number(datosMayor.saldoFinal) || 0;

  const formatMonto = (valor) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Libro Mayor</Text>
          <Text style={styles.companyName}>{empresa?.nombre || "EFA - Gestión Empresarial"}</Text>
          <View style={styles.reportMeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaText}>
                Cuenta: {datosMayor.cuenta?.nombre} ({datosMayor.cuenta?.codigo})
              </Text>
              {contacto && (
                <Text style={[styles.metaText, { marginTop: 2, fontWeight: "bold", color: "#1e293b" }]}>
                  Filtrado por Contacto: {contacto}
                </Text>
              )}
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={styles.metaText}>Desde: {filtros?.fechaDesde || "Inicio"}</Text>
              <Text style={styles.metaText}>Hasta: {filtros?.fechaHasta || "Hoy"}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Débitos</Text>
            <Text style={[styles.statValue, styles.textDebe]}>$ {formatMonto(totalDebe)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Créditos</Text>
            <Text style={[styles.statValue, styles.textHaber]}>$ {formatMonto(totalHaber)}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "#4f46e5", backgroundColor: "#eff6ff" }]}>
            <Text style={styles.statLabel}>Saldo Final</Text>
            <Text style={[styles.statValue, styles.textSaldo]}>$ {formatMonto(saldoFinal)}</Text>
          </View>
        </View>

        {/* Table Grilla */}
        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.colFecha]}><Text style={styles.tableHeaderText}>Fecha</Text></View>
            <View style={[styles.tableCell, styles.colDesc]}><Text style={styles.tableHeaderText}>Descripción / Concepto</Text></View>
            <View style={[styles.tableCell, styles.colRef]}><Text style={styles.tableHeaderText}>Ref.</Text></View>
            <View style={[styles.tableCell, styles.colMonto]}><Text style={styles.tableHeaderText}>Debe</Text></View>
            <View style={[styles.tableCell, styles.colMonto]}><Text style={styles.tableHeaderText}>Haber</Text></View>
            <View style={[styles.tableCell, styles.colMonto]}><Text style={styles.tableHeaderText}>Saldo</Text></View>
          </View>

          {/* Body */}
          {datosMayor.movimientos?.map((mov, index) => (
            <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }]}>
              <View style={[styles.tableCell, styles.colFecha]}>
                <Text style={[styles.cellText, { textAlign: "center" }]}>{formatDateStr(mov.asiento?.fecha)}</Text>
              </View>
              <View style={[styles.tableCell, styles.colDesc]}>
                <Text style={[styles.cellText, { fontWeight: "bold" }]}>{mov.asiento?.descripcion}</Text>
                {mov.asiento?.origenModulo && (
                  <Text style={{ fontSize: 5, color: "#94a3b8", marginTop: 1 }}>{mov.asiento.origenModulo}</Text>
                )}
              </View>
              <View style={[styles.tableCell, styles.colRef]}>
                <Text style={[styles.cellText, { textAlign: "center", color: "#64748b" }]}>{mov.asiento?.referencia || "-"}</Text>
              </View>
              <View style={[styles.tableCell, styles.colMonto]}>
                <Text style={[styles.cellMonto, styles.textDebe]}>{mov.debe > 0 ? formatMonto(mov.debe) : ""}</Text>
              </View>
              <View style={[styles.tableCell, styles.colMonto]}>
                <Text style={[styles.cellMonto, styles.textHaber]}>{mov.haber > 0 ? formatMonto(mov.haber) : ""}</Text>
              </View>
              <View style={[styles.tableCell, styles.colMonto]}>
                <Text style={[styles.cellMonto, styles.textSaldo]}>{formatMonto(mov.saldo)}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Página 1 - Reporte generado por Sistema EFA - {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};

export default LibroMayorPDF;
