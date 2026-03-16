import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Paleta de colores Editorial / High-End
const THEME = {
    carbon: '#111111',
    gold: '#dd7513ff',
    silver: '#F1F1F1',
    border: '#E0E0E0',
    text: '#333333',
    muted: '#999999',
    white: '#FFFFFF'
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: THEME.white,
        fontFamily: 'Helvetica',
    },
    // --- Header Section ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: `0.5pt solid ${THEME.carbon}`,
        paddingBottom: 15,
        marginBottom: 20,
    },
    brand: {
        fontSize: 28,
        letterSpacing: 4,
        fontWeight: 'bold',
        color: THEME.carbon,
    },
    reportType: {
        fontSize: 10,
        letterSpacing: 2,
        color: THEME.gold,
        marginTop: 5,
        fontWeight: 'bold',
    },
    meta: {
        textAlign: 'right',
    },
    dateLabel: {
        fontSize: 8,
        color: THEME.muted,
        textTransform: 'uppercase',
    },
    dateValue: {
        fontSize: 10,
        color: THEME.carbon,
        fontWeight: 'bold',
    },

    // --- Dashboard / Stats ---
    dashboard: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        border: `0.2pt solid ${THEME.border}`,
        padding: '10 15',
        backgroundColor: '#FCFCFC',
    },
    statLabel: {
        fontSize: 7,
        color: THEME.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    statValue: {
        fontSize: 16,
        color: THEME.carbon,
        fontWeight: 'bold',
    },
    statUnit: {
        fontSize: 7,
        color: THEME.gold,
        fontWeight: 'bold',
        marginLeft: 2,
    },

    // --- Table Section ---
    tableContainer: {
        marginTop: 10,
        border: `0.2pt solid ${THEME.carbon}`, // Fine technical line
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: THEME.carbon,
        minHeight: 25,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: `0.2pt solid ${THEME.border}`,
        minHeight: 30,
        alignItems: 'center',
    },
    headerCell: {
        fontSize: 7.5,
        color: THEME.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 8,
    },
    cell: {
        fontSize: 9,
        color: THEME.text,
        paddingHorizontal: 8,
    },

    // Column widths
    colRef: { width: '12%', borderRight: `0.2pt solid ${THEME.border}`, height: '100%', justifyContent: 'center' },
    colName: { width: '30%', borderRight: `0.2pt solid ${THEME.border}`, height: '100%', justifyContent: 'center' },
    colUnit: { width: '8%', borderRight: `0.2pt solid ${THEME.border}`, height: '100%', justifyContent: 'center', textAlign: 'center' },
    colDep: { flex: 1, height: '100%', justifyContent: 'center', textAlign: 'center', borderRight: `0.2pt solid ${THEME.border}` },

    // Cell Emphasis
    skuText: { fontSize: 8, color: THEME.gold, fontWeight: 'bold' },
    nameText: { fontSize: 9, fontWeight: 'bold' },
    stockPositive: { fontSize: 13, color: THEME.carbon, fontWeight: 'bold' },
    stockZero: { fontSize: 9, color: THEME.border },

    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTop: `0.2pt solid ${THEME.border}`,
    },
    footerText: {
        fontSize: 7,
        color: THEME.muted,
        letterSpacing: 0.5,
    },
    footerPage: {
        fontSize: 7,
        color: THEME.gold,
        fontWeight: 'bold',
    }
});

const StockDepositoPDF = ({ matrizStock, depositos }) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    // Calculos para el Dashboard
    const totalArticulos = matrizStock.length;
    let totalItems = 0;
    matrizStock.forEach(row => {
        depositos.forEach(dep => {
            totalItems += (row[`dep_${dep.codigoSecuencial}`] || 0);
        });
    });

    return (
        <Document title={`Reporte de Stock_${dateStr}`}>
            <Page size="A4" orientation="landscape" style={styles.page}>

                {/* Minimal Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.reportType}>REPORTE DE DEPOSITOS</Text>
                    </View>
                    <View style={styles.meta}>
                        <Text style={styles.dateLabel}>Generado el</Text>
                        <Text style={styles.dateValue}>{dateStr} - {timeStr}</Text>
                        <Text style={[styles.dateLabel, { marginTop: 4 }]}>Estado: <Text style={{ color: THEME.gold, fontWeight: 'bold' }}>CONSISTENTE</Text></Text>
                    </View>
                </View>

                {/* Technical Dashboard */}
                <View style={styles.dashboard}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Nomenclatura Articulos</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.statValue}>{totalArticulos}</Text>
                            <Text style={styles.statUnit}>SKU</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Existencias Totales</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.statValue}>{totalItems.toLocaleString()}</Text>
                            <Text style={styles.statUnit}>UNIDADES</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: THEME.carbon }]}>
                        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.4)' }]}>Puntos de Distribución</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={[styles.statValue, { color: THEME.white }]}>{depositos.length}</Text>
                            <Text style={[styles.statUnit, { color: THEME.gold }]}>NODOS ACTIVOS</Text>
                        </View>
                    </View>
                </View>

                {/* Elegant Grid */}
                <View style={styles.tableContainer}>
                    {/* Header */}
                    <View style={styles.tableHeaderRow}>
                        <View style={styles.colRef}><Text style={styles.headerCell}>Referencia</Text></View>
                        <View style={styles.colName}><Text style={styles.headerCell}>Descripción de Articulo</Text></View>
                        <View style={styles.colUnit}><Text style={styles.headerCell}>U.M.</Text></View>
                        {depositos.map(dep => (
                            <View key={dep.codigoSecuencial} style={styles.colDep}>
                                <Text style={styles.headerCell}>{dep.nombre}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Data Rows */}
                    {matrizStock.map((row, idx) => (
                        <View key={idx} style={styles.tableRow} wrap={false}>
                            <View style={styles.colRef}>
                                <Text style={[styles.cell, styles.skuText]}>{row.sku || row.id}</Text>
                            </View>
                            <View style={styles.colName}>
                                <Text style={[styles.cell, styles.nameText]}>{row.nombre}</Text>
                            </View>
                            <View style={styles.colUnit}>
                                <Text style={[styles.cell, { textAlign: 'center' }]}>{row.unidadMedida}</Text>
                            </View>
                            {depositos.map(dep => {
                                const val = row[`dep_${dep.codigoSecuencial}`] || 0;
                                return (
                                    <View key={dep.codigoSecuencial} style={styles.colDep}>
                                        <Text style={[styles.cell, val > 0 ? styles.stockPositive : styles.stockZero]}>
                                            {val > 0 ? val : '-'}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>DeStockP Warehouse Management System | Documento Reservado</Text>
                    <Text
                        style={styles.footerPage}
                        render={({ pageNumber, totalPages }) => `FOLIO ${pageNumber} DE ${totalPages}`}
                    />
                </View>
            </Page>
        </Document>
    );
};

export default StockDepositoPDF;
