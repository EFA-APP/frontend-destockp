import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes si es necesario, pero usaremos las estándar para mayor compatibilidad
const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  
  // CABECERA
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    border: '1px solid #000',
    marginBottom: 20,
  },
  headerLeft: {
    padding: 10,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    padding: 10,
    width: '45%',
    borderLeft: '1px solid #000',
  },
  headerCenter: {
    width: 40,
    height: 40,
    border: '1px solid #000',
    position: 'absolute',
    left: '50%',
    marginLeft: -20,
    top: -1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  letraComprobante: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tipoCompLabel: {
    fontSize: 8,
    position: 'absolute',
    bottom: 2,
    width: '100%',
    textAlign: 'center',
  },

  // TEXTOS CABECERA
  companyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#1a1a1a' },
  companyTagline: { fontSize: 8, color: '#666', marginBottom: 2 },
  
  infoTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  infoText: { fontSize: 9, marginBottom: 2 },

  // RECEPTOR
  receptorSection: {
    border: '1px solid #000',
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  receptorCol: { width: '48%' },
  receptorLabel: { fontSize: 8, color: '#666', marginBottom: 2, textTransform: 'uppercase' },
  receptorValue: { fontSize: 10, fontWeight: 'bold' },

  // TABLA DETALLES
  table: { marginTop: 10, borderBottom: '1px solid #EEE' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #EEE', minHeight: 25, alignItems: 'center' },
  tableHeader: { backgroundColor: '#F9f9f9', borderTop: '1px solid #000', borderBottom: '1px solid #000' },
  tableCell: { fontSize: 9, padding: 5 },
  
  colCant: { width: '10%', textAlign: 'center' },
  colDesc: { width: '50%' },
  colPrecio: { width: '20%', textAlign: 'right' },
  colSubtotal: { width: '20%', textAlign: 'right' },

  // TOTALES Y PAGOS
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  pagosCol: {
    width: '55%',
    padding: 8,
    backgroundColor: '#FBFBFB',
    borderRadius: 4,
  },
  totalesCol: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottom: '1px solid #F0F0F0'
  },
  totalSuma: {
    marginTop: 5,
    paddingTop: 5,
    borderTop: '1px solid #000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  pagoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    marginBottom: 2,
    color: '#444'
  },

  // FOOTER
  footer: {
    marginTop: 40,
    paddingTop: 10,
    borderTop: '1px solid #EEE',
    textAlign: 'center',
  },
  caeText: { fontSize: 10, fontWeight: 'bold' },
  fechaVto: { fontSize: 8, color: '#666', marginTop: 2 }
});

const ComprobantePDF = ({ comprobante, vendedorConfig, arcaConfig }) => {
  const {
    letraComprobante = 'X',
    puntoVenta = 1,
    numeroComprobante = 0,
    fechaEmision,
    receptor,
    detalles = [],
    pagos = [],
    subtotal = 0,
    iva = 0,
    total = 0,
    cae,
    vtoCae,
    fiscal = false
  } = comprobante;

  const nroFormateado = String(numeroComprobante).padStart(8, '0');
  const ptoVtaFormateado = String(puntoVenta).padStart(4, '0');

  // Datos del Emisor (Elegir entre Arca Fiscal o Interno)
  const emisor = fiscal && arcaConfig ? {
    nombre: arcaConfig.razonSocial,
    domicilio: arcaConfig.domicilio,
    localidad: arcaConfig.localidad || "Salta",
    condicionIva: arcaConfig.condicionIva,
    cuit: arcaConfig.cuit,
    iibb: arcaConfig.iibb,
    inicioActividades: arcaConfig.inicioActividades
  } : {
    nombre: vendedorConfig?.nombreEmpresa || "SISTEMA EFA",
    domicilio: "Domicilio Administrativo",
    localidad: "Salta",
    condicionIva: "Consumidor Final",
    cuit: "00-00000000-0",
    iibb: "Exento",
    inicioActividades: "-"
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          {/* CUADRO LETRA CENTRAL */}
          <View style={styles.headerCenter}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{letraComprobante}</Text>
            <Text style={{ fontSize: 6, position: 'absolute', bottom: 2, width: '100%', textAlign: 'center' }}>cod. {comprobante.tipoDocumento || '99'}</Text>
          </View>

          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{emisor.nombre}</Text>
            <Text style={styles.companyTagline}>Gestión Integral de Ventas</Text>
            <Text style={styles.infoText}>Domicilio: {emisor.domicilio}</Text>
            <Text style={styles.infoText}>Localidad: {emisor.localidad}</Text>
            <Text style={styles.infoText}>Condición IVA: {emisor.condicionIva}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.infoTitle}>{fiscal ? 'FACTURA' : 'COMPROBANTE INTERNO'}</Text>
            <Text style={styles.infoText}>Pto. Vta: {ptoVtaFormateado}  Comp. Nro: {nroFormateado}</Text>
            <Text style={styles.infoText}>Fecha de Emisión: {new Date(fechaEmision).toLocaleDateString('es-AR')}</Text>
            <Text style={styles.infoText}>CUIT: {emisor.cuit}</Text>
            <Text style={styles.infoText}>Ingresos Brutos: {emisor.iibb}</Text>
            <Text style={styles.infoText}>Inicio de Actividades: {emisor.inicioActividades}</Text>
          </View>
        </View>

        {/* RECEPTOR */}
        <View style={styles.receptorSection}>
          <View style={styles.receptorCol}>
            <Text style={styles.receptorLabel}>Señor(es):</Text>
            <Text style={styles.receptorValue}>{receptor?.razonSocial || 'CONSUMIDOR FINAL'}</Text>
            <Text style={styles.infoText}>Domicilio: {receptor?.domicilio || 'N/A'}</Text>
          </View>
          <View style={styles.receptorCol}>
            <Text style={styles.receptorLabel}>Condición IVA / Identificación:</Text>
            <Text style={styles.infoText}>IVA: Consumidor Final</Text>
            <Text style={styles.infoText}>{receptor?.DocTipo === 80 ? 'CUIT' : 'DNI'}: {receptor?.DocNro || '0'}</Text>
            <Text style={styles.infoText}>Cond. Venta: {comprobante.condicionVenta?.toUpperCase() || 'CONTADO'}</Text>
          </View>
        </View>

        {/* TABLA DETALLES */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.colCant]}>CANT</Text>
            <Text style={[styles.tableCell, styles.colDesc]}>DESCRIPCIÓN</Text>
            <Text style={[styles.tableCell, styles.colPrecio]}>P. UNITARIO</Text>
            <Text style={[styles.tableCell, styles.colSubtotal]}>IMPORTE</Text>
          </View>

          {detalles.map((det, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colCant]}>{det.cantidad}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{det.nombre}</Text>
              <Text style={[styles.tableCell, styles.colPrecio]}>$ {det.precioUnitario?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
              <Text style={[styles.tableCell, styles.colSubtotal]}>$ {det.subtotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}
        </View>

        {/* TOTALES Y PAGOS */}
        <View style={styles.summarySection}>
          {/* COLUMNA PAGOS */}
          <View style={styles.pagosCol}>
            <Text style={[styles.infoTitle, { fontSize: 8, marginBottom: 8 }]}>Detalles del Pago</Text>
            {pagos.map((p, idx) => (
              <View key={idx} style={styles.pagoRow}>
                <Text>• {p.metodo?.toUpperCase()} {p.detalles ? `(${p.detalles})` : ''}</Text>
                <Text style={{ fontWeight: 'bold' }}>$ {p.monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
              </View>
            ))}
            {pagos.length === 0 && <Text style={{ fontSize: 8, color: '#999 italic' }}>Pago registrado en cuenta corriente</Text>}
          </View>

          {/* COLUMNA TOTALES */}
          <View style={styles.totalesCol}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9 }}>Subtotal:</Text>
              <Text style={{ fontSize: 9 }}>$ {subtotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9 }}>IVA (0%):</Text>
              <Text style={{ fontSize: 9 }}>$ {iva?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.totalSuma}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>TOTAL:</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>$ {total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* FOOTER AFIP O INTERNO */}
        {fiscal && cae ? (
          <View style={styles.footer}>
             <Text style={styles.caeText}>CAE: {cae}</Text>
             <Text style={styles.fechaVto}>Fecha Vto. CAE: {vtoCae ? new Date(vtoCae).toLocaleDateString('es-AR') : '-'}</Text>
          </View>
        ) : (
          <View style={styles.footer}>
             <Text style={{ fontSize: 8, color: '#999' }}>ESTE COMPROBANTE NO ES VÁLIDO COMO FACTURA</Text>
             <Text style={{ fontSize: 7, color: '#CCC', marginTop: 5 }}>EFA SYSTEM - Gestionado digitalmente</Text>
          </View>
        )}

      </Page>
    </Document>
  );
};

export default ComprobantePDF;
