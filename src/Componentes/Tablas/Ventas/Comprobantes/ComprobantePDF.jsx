import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  
  // TOP BORDER WITH ORIGINAL/DUPLICADO
  topLabelContainer: {
    border: '1px solid #000',
    paddingVertical: 4,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // HEADER CONTAINER
  headerContainer: {
    flexDirection: 'row',
    border: '1px solid #000',
    minHeight: 110,
  },
  
  // LOGO & EMISOR (LEFT)
  headerLeft: {
    width: '45%',
    padding: 10,
    justifyContent: 'flex-start',
  },
  emisorMainTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  emisorDetailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emisorDetailValue: {
    fontSize: 8,
    fontWeight: 'normal',
    marginBottom: 4,
  },

  // VOUCHER BOX (CENTER)
  headerCenter: {
    width: 50,
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  letraComprobante: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  codComprobante: {
    fontSize: 7,
    marginTop: 2,
  },

  // VOUCHER INFO (RIGHT)
  headerRight: {
    width: '45%',
    padding: 10,
  },
  voucherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  flexRow: {
    flexDirection: 'row',
    fontSize: 8,
    marginBottom: 4,
  },
  labelBold: {
    fontWeight: 'bold',
    marginRight: 4,
  },

  // PERIOD SECTION
  periodBorder: {
    border: '1px solid #000',
    borderTop: 'none',
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // RECEPTOR SECTION
  receptorSection: {
    border: '1px solid #000',
    borderTop: 'none',
    padding: 8,
    flexDirection: 'row',
    minHeight: 60,
  },
  receptorLeft: {
    width: '35%',
  },
  receptorRight: {
    width: '65%',
  },

  // TABLE
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#CCCCCC',
    border: '1px solid #000',
    borderTop: 'none',
    alignItems: 'center',
    minHeight: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    minHeight: 20,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    paddingHorizontal: 4,
  },
  colCodigo: { width: '10%', textAlign: 'left' },
  colDesc: { width: '40%', textAlign: 'left' },
  colCant: { width: '10%', textAlign: 'right' },
  colMedida: { width: '10%', textAlign: 'center' },
  colPrecio: { width: '15%', textAlign: 'right' },
  colSub: { width: '15%', textAlign: 'right' },

  tableBottom: {
    borderTop: '1px solid #000',
    width: '100%',
  },

  // TOTALES
  summaryContainer: {
    border: '1px solid #000',
    borderTop: 'none',
    flexDirection: 'row',
    minHeight: 180,
    justifyContent: 'flex-end',
    padding: 10,
  },
  totalesBox: {
    width: '30%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // FOOTER
  footerSection: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  arcaLogo: {
    width: 60,
    height: 25,
    marginLeft: 15,
  },
  footerRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  caeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerNote: {
    fontSize: 7,
    marginTop: 10,
    textAlign: 'left',
    color: '#333',
  }
});

const formatearFechaAfip = (fechaStr) => {
  if (!fechaStr || fechaStr.length !== 8) return fechaStr;
  const anio = fechaStr.substring(0, 4);
  const mes = fechaStr.substring(4, 6);
  const dia = fechaStr.substring(6, 8);
  return `${dia}/${mes}/${anio}`;
};

// Helper para mapear Condicion IVA (de abreviado a nombre completo)
const mapearCondicionIva = (condicion) => {
  const mapa = {
    'RI': 'RESPONSABLE INSCRIPTO',
    'RM': 'RESPONSABLE MONOTRIBUTO',
    'M': 'RESPONSABLE MONOTRIBUTO',
    'EX': 'IVA SUJETO EXENTO',
    'CF': 'CONSUMIDOR FINAL',
    'NR': 'NO RESPONSABLE',
    'NC': 'SUJETO NO CATEGORIZADO'
  };
  
  const limpio = condicion?.toUpperCase().trim();
  return mapa[limpio] || condicion || 'CONSUMIDOR FINAL';
};

const ComprobantePagina = ({ comprobante, emisor, labelCopia, conexionArca }) => {
  const {
    letraComprobante = 'C',
    puntoVenta = 1,
    numeroComprobante = 0,
    fechaEmision,
    receptor,
    detalles = [],
    total = 0,
    cae,
    vtoCae,
    fiscal = false,
    qrCodeImage,
    tipoDocumento
  } = comprobante;

  const nroFormateado = String(numeroComprobante).padStart(8, '0');
  const ptoVtaFormateado = String(puntoVenta).padStart(5, '0');
  const fechaStr = new Date(fechaEmision).toLocaleDateString('es-AR');

  return (
    <Page size="A4" style={styles.page}>
      {/* LABEL SUPERIOR: ORIGINAL/DUPLICADO */}
      <View style={styles.topLabelContainer}>
        <Text style={styles.topLabelText}>{labelCopia}</Text>
      </View>

      {/* CABECERA PRINCIPAL */}
      <View style={styles.headerContainer}>
        {/* LADO IZQUIERDO: EMISOR */}
        <View style={styles.headerLeft}>
          <Text style={styles.emisorMainTitle}>{emisor.nombreComercial.toUpperCase()}</Text>
          {conexionArca && (
            <>
              <Text style={styles.emisorDetailLabel}>Razón Social: <Text style={styles.emisorDetailValue}>{emisor.razonSocial}</Text></Text>
              <Text style={styles.emisorDetailLabel}>Domicilio Comercial: <Text style={styles.emisorDetailValue}>{emisor.domicilio}</Text></Text>
              <Text style={styles.emisorDetailLabel}>Condición frente al IVA: <Text style={styles.emisorDetailValue}>{mapearCondicionIva(emisor.condicionIva)}</Text></Text>
            </>
          )}
        </View>

        {/* CENTRO: LETRA */}
        <View style={styles.headerCenter}>
          <Text style={styles.letraComprobante}>{letraComprobante}</Text>
          <Text style={styles.codComprobante}>COD. {String(tipoDocumento || '011').padStart(3, '0')}</Text>
        </View>

        {/* LADO DERECHO: VOUCHER INFO */}
        <View style={styles.headerRight}>
          <Text style={styles.voucherTitle}>{fiscal ? 'FACTURA' : 'RECIBO'}</Text>
          <View style={styles.flexRow}>
            <Text style={styles.labelBold}>Punto de Venta: {ptoVtaFormateado}</Text>
            <Text style={styles.labelBold}>Comp. Nro: {nroFormateado}</Text>
          </View>
          <Text style={styles.emisorDetailLabel}>Fecha de Emisión: <Text style={styles.emisorDetailValue}>{fechaStr}</Text></Text>
          {conexionArca && (
            <>
              <Text style={styles.emisorDetailLabel}>CUIT: <Text style={styles.emisorDetailValue}>{emisor.cuit}</Text></Text>
              <Text style={styles.emisorDetailLabel}>Ingresos Brutos: <Text style={styles.emisorDetailValue}>{emisor.iibb}</Text></Text>
              <Text style={styles.emisorDetailLabel}>Fecha de Inicio de Actividades: <Text style={styles.emisorDetailValue}>{emisor.inicioActividades}</Text></Text>
            </>
          )}
        </View>
      </View>

      {/* PERIODO - Solo demostrativo como en ARCA */}
      <View style={styles.periodBorder}>
        <Text>Período Facturado Desde: {fechaStr}</Text>
        <Text>Hasta: {fechaStr}</Text>
        <Text>Fecha de Vto. para el pago: {fechaStr}</Text>
      </View>

      {/* DATOS DEL RECEPTOR */}
      <View style={styles.receptorSection}>
        <View style={styles.receptorLeft}>
          <Text style={styles.emisorDetailLabel}>CUIT: <Text style={styles.emisorDetailValue}>{receptor?.DocNro || '0'}</Text></Text>
          <Text style={styles.emisorDetailLabel}>Condición frente al IVA: <Text style={styles.emisorDetailValue}>{mapearCondicionIva(receptor?.condicionIva)}</Text></Text>
          <Text style={styles.emisorDetailLabel}>Condición de venta: <Text style={styles.emisorDetailValue}>{comprobante.condicionVenta?.toUpperCase() || 'CONTADO'}</Text></Text>
        </View>
        <View style={styles.receptorRight}>
          <Text style={styles.emisorDetailLabel}>Apellido y Nombre / Razón Social: <Text style={styles.emisorDetailValue}>{receptor?.razonSocial || 'CONSUMIDOR FINAL'}</Text></Text>
          <Text style={styles.emisorDetailLabel}>Domicilio: <Text style={styles.emisorDetailValue}>{receptor?.domicilio || '-'}</Text></Text>
        </View>
      </View>

      {/* TABLA DE PRODUCTOS */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.colCodigo]}>Código</Text>
        <Text style={[styles.tableCell, styles.colDesc]}>Producto / Servicio</Text>
        <Text style={[styles.tableCell, styles.colCant]}>Cantidad</Text>
        <Text style={[styles.tableCell, styles.colMedida]}>U. Medida</Text>
        <Text style={[styles.tableCell, styles.colPrecio]}>Precio Unit.</Text>
        <Text style={[styles.tableCell, styles.colSub]}>Subtotal</Text>
      </View>
      
      {detalles.map((det, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colCodigo]}>{i+1}</Text>
          <Text style={[styles.tableCell, styles.colDesc]}>{det.nombre}</Text>
          <Text style={[styles.tableCell, styles.colCant]}>{det.cantidad?.toFixed(2)}</Text>
          <Text style={[styles.tableCell, styles.colMedida]}>unidades</Text>
          <Text style={[styles.tableCell, styles.colPrecio]}>{det.precioUnitario?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          <Text style={[styles.tableCell, styles.colSub]}>{det.subtotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        </View>
      ))}
      
      {/* ESPACIADOR PARA QUE EL TOTAL QUEDE ABAJO */}
      <View style={{ flex: 1, borderLeft: '1px solid #000', borderRight: '1px solid #000' }} />
      <View style={styles.tableBottom} />

      {/* SECCION TOTALES */}
      <View style={styles.summaryContainer}>
        <View style={styles.totalesBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal: $</Text>
            <Text>{total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Importe Otros Tributos: $</Text>
            <Text>0,00</Text>
          </View>
          <View style={[styles.totalRow, { fontSize: 12 }]}>
            <Text>Importe Total: $</Text>
            <Text>{total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>
      </View>

      {/* FOOTER AFIP / ARCA */}
      {fiscal && cae ? (
        <>
          <View style={styles.footerSection}>
            <View style={styles.footerLeft}>
              {qrCodeImage && <Image src={qrCodeImage} style={styles.qrCode} />}
              <Image src="/logo-arca.jpg" style={styles.arcaLogo} />
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.caeLabel}>CAE N°: {cae}</Text>
              <Text style={styles.caeLabel}>Fecha de Vto. de CAE: {formatearFechaAfip(vtoCae)}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5 }}>Comprobante Autorizado</Text>
          <Text style={styles.footerNote}>Esta Agencia no se responsabiliza por los datos ingresados en el detalle de la operación</Text>
        </>
      ) : (
        <View style={{ marginTop: 20, textAlign: 'center' }}>
          <Text style={{ fontSize: 8, color: '#999' }}>ESTE COMPROBANTE NO ES VÁLIDO COMO FACTURA</Text>
        </View>
      )}
    </Page>
  );
};

const ComprobantePDF = ({ comprobante, usuario }) => {
  const df = usuario?.datosFiscales || {};
  const fiscal = !!comprobante.cae;
  const conexionArca = usuario?.conexionArca || false;

  const emisor = {
    nombreComercial: usuario?.nombreEmpresa || "SISTEMA EFA",
    razonSocial: df.razonSocial || usuario?.nombreEmpresa || "SISTEMA EFA",
    domicilio: df.domicilioComercial || "NO DEFINIDO",
    condicionIva: df.condicionIva || "IVA Responsable Inscripto",
    cuit: df.cuit || "00-00000000-0",
    iibb: df.iibb || "-",
    inicioActividades: df.inicioActividades ? new Date(df.inicioActividades).toLocaleDateString('es-AR') : "-"
  };

  return (
    <Document>
      <ComprobantePagina 
        comprobante={comprobante} 
        emisor={emisor} 
        labelCopia="ORIGINAL" 
        conexionArca={conexionArca} 
      />
      {fiscal && (
        <ComprobantePagina 
          comprobante={comprobante} 
          emisor={emisor} 
          labelCopia="DUPLICADO" 
          conexionArca={conexionArca} 
        />
      )}
    </Document>
  );
};

export default ComprobantePDF;
