import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF' },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #000',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 5 },
  table: { display: 'table', width: '100%', marginTop: 20 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #EEE', minHeight: 25, alignItems: 'center' },
  tableHeader: { backgroundColor: '#F0F0F0', fontWeight: 'bold' },
  tableCell: { fontSize: 8, padding: 5 },
  colFecha: { width: '15%' },
  colArticulo: { width: '35%' },
  colTipo: { width: '10%' },
  colOrigen: { width: '20%' },
  colCantidad: { width: '10%', textAlign: 'right' },
  colUsuario: { width: '10%', textAlign: 'right' },
  tag: { fontSize: 7, padding: 2, borderRadius: 3, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#999',
  }
});

const ReporteMovimientosPDF = ({ movimientos, tipoArticulo, fechaInicio, fechaFin }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reporte de Movimientos</Text>
          <Text style={styles.subtitle}>
            {tipoArticulo} | {fechaInicio || 'Inicio'} - {fechaFin || 'Hoy'}
          </Text>
        </View>
        <Text style={{ fontSize: 10 }}>EFA System</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.colFecha]}>Fecha</Text>
          <Text style={[styles.tableCell, styles.colArticulo]}>Artículo</Text>
          <Text style={[styles.tableCell, styles.colTipo]}>Tipo</Text>
          <Text style={[styles.tableCell, styles.colOrigen]}>Origen</Text>
          <Text style={[styles.tableCell, styles.colCantidad]}>Cant.</Text>
          <Text style={[styles.tableCell, styles.colUsuario]}>Usuario</Text>
        </View>

        {movimientos?.map((mov, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colFecha]}>
              {mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-AR') : '-'}
            </Text>
            <View style={styles.colArticulo}>
                <Text style={styles.tableCell}>{mov.nombreArticulo}</Text>
                {mov.observacion && <Text style={{ fontSize: 6, color: '#999', marginLeft: 5 }}>{mov.observacion}</Text>}
            </View>
            <View style={styles.colTipo}>
                <Text style={[styles.tableCell, styles.tag, { 
                    backgroundColor: mov.tipoMovimiento === 'INGRESO' ? '#D1FAE5' : mov.tipoMovimiento === 'EGRESO' ? '#FEE2E2' : '#FEF3C7',
                    color: mov.tipoMovimiento === 'INGRESO' ? '#065F46' : mov.tipoMovimiento === 'EGRESO' ? '#991B1B' : '#92400E'
                }]}>
                    {mov.tipoMovimiento}
                </Text>
            </View>
            <Text style={[styles.tableCell, styles.colOrigen]}>{mov.origenMovimiento?.replace(/_/g, ' ')}</Text>
            <Text style={[styles.tableCell, styles.colCantidad]}>{mov.cantidad}</Text>
            <Text style={[styles.tableCell, styles.colUsuario]}>{mov.nombreUsuario}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
    </Page>
  </Document>
);

export default ReporteMovimientosPDF;
