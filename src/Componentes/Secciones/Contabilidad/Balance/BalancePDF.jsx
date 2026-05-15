import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    paddingBottom: 5,
    marginBottom: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    fontSize: 9,
    borderBottom: '0.5 solid #eee',
  },
  colCode: { width: '20%' },
  colName: { width: '55%' },
  colAmount: { width: '25%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '1 solid #333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: '#999',
    borderTop: '1 solid #eee',
    paddingTop: 10,
  },
  balanced: {
    marginTop: 30,
    padding: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

const BalancePDF = ({ balance, empresa, filtros }) => {
  const fechaGeneracion = new Date().toLocaleString('es-AR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>BALANCE GENERAL</Text>
          <Text style={styles.subtitle}>{empresa?.nombre || 'SISTEMA EFA'}</Text>
          <Text style={styles.subtitle}>
            Periodo: {filtros.fechaDesde} al {filtros.fechaHasta}
          </Text>
        </View>

        {/* ACTIVO */}
        <Text style={styles.sectionTitle}>ACTIVO</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Código</Text>
          <Text style={styles.colName}>Cuenta</Text>
          <Text style={styles.colAmount}>Saldo</Text>
        </View>
        {balance.activo.items.map((item) => (
          <View key={item.codigo} style={styles.tableRow}>
            <Text style={styles.colCode}>{item.codigo}</Text>
            <Text style={styles.colName}>{item.nombre}</Text>
            <Text style={styles.colAmount}>$ {item.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={{ width: '75%' }}>TOTAL ACTIVO</Text>
          <Text style={styles.colAmount}>$ {balance.activo.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* PASIVO */}
        <Text style={styles.sectionTitle}>PASIVO</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Código</Text>
          <Text style={styles.colName}>Cuenta</Text>
          <Text style={styles.colAmount}>Saldo</Text>
        </View>
        {balance.pasivo.items.map((item) => (
          <View key={item.codigo} style={styles.tableRow}>
            <Text style={styles.colCode}>{item.codigo}</Text>
            <Text style={styles.colName}>{item.nombre}</Text>
            <Text style={styles.colAmount}>$ {item.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={{ width: '75%' }}>TOTAL PASIVO</Text>
          <Text style={styles.colAmount}>$ {balance.pasivo.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* PATRIMONIO NETO */}
        <Text style={styles.sectionTitle}>PATRIMONIO NETO</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Código</Text>
          <Text style={styles.colName}>Cuenta</Text>
          <Text style={styles.colAmount}>Saldo</Text>
        </View>
        {balance.patrimonio.items.map((item) => (
          <View key={item.codigo} style={styles.tableRow}>
            <Text style={styles.colCode}>{item.codigo}</Text>
            <Text style={styles.colName}>{item.nombre}</Text>
            <Text style={styles.colAmount}>$ {item.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}
        <View style={styles.tableRow}>
          <Text style={styles.colCode}>-</Text>
          <Text style={styles.colName}>Resultado del Ejercicio</Text>
          <Text style={styles.colAmount}>$ {balance.patrimonio.resultadoEjercicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={{ width: '75%' }}>TOTAL PATRIMONIO NETO</Text>
          <Text style={styles.colAmount}>$ {balance.patrimonio.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Resumen Final */}
        <View style={[styles.balanced, { 
          backgroundColor: balance.estaBalanceado ? '#e8f5e9' : '#ffebee',
          color: balance.estaBalanceado ? '#2e7d32' : '#c62828',
          marginTop: 40
        }]}>
          <Text>Total Activo: $ {balance.activo.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          <Text>Total Pasivo + PN: $ {(balance.pasivo.total + balance.patrimonio.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          <Text style={{ marginTop: 5 }}>
            Estado: {balance.estaBalanceado ? 'BALANCEADO ✓' : `DESBALANCEADO (Dif: $ ${balance.diferencia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}) ✖`}
          </Text>
        </View>

        <Text style={styles.footer}>
          Documento generado el {fechaGeneracion} - Sistema EFA Contabilidad
        </Text>
      </Page>
    </Document>
  );
};

export default BalancePDF;
