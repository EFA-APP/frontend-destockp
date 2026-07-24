// Mejora obra-sociales-margen-editable: recálculo INSTANTÁNEO en el
// navegador (sin volver a llamar al backend) de ganancia/total_facturar/
// saldo_a_favor/se_factura cuando el usuario edita el "margen de
// ganancia %" en el Paso 3 (Revisión) de la importación de obras
// sociales.
//
// DUPLICACIÓN INTENCIONAL, DOCUMENTADA: esta función es una copia 1:1 del
// algoritmo de
// `comprobantes-ms/src/Aplicacion/ObrasSociales/CasosDeUso/ReglaComunCalculo.ts`
// (`aplicarReglaComun`), que sigue siendo la fuente de verdad real (el
// backend recalcula con esa función en la previsualización original, y
// es la que persiste `ImportacionObraSocialItem` en la base). Este
// archivo NO reemplaza al backend, solo permite una previsualización
// interactiva del efecto de cambiar el margen sin round-trips al
// servidor — al confirmar, el frontend manda los valores YA recalculados
// acá (`ConfirmarImportacionObraSocialCasoDeUso` usa `item.totalFacturar`
// tal cual le llega, no vuelve a calcular el margen).
//
// SI EL DÍA DE MAÑANA CAMBIA LA FÓRMULA DEL LADO DEL SERVIDOR, HAY QUE
// ACTUALIZAR LOS DOS LADOS (este archivo y ReglaComunCalculo.ts) — no hay
// forma de compartir código entre el frontend (Vite/JS) y comprobantes-ms
// (Nest/TS) hoy en este repo.
export function aplicarReglaComun(diferencia, margenGanancia, redondeoEntero) {
  const round2 = (num) => Math.round(num * 100) / 100;

  if (diferencia > 0) {
    const ganancia = round2(diferencia * (margenGanancia / 100));
    let totalFacturar = round2(diferencia + ganancia);

    if (redondeoEntero) {
      totalFacturar = Math.round(totalFacturar);
    }

    return {
      diferencia: round2(diferencia),
      ganancia,
      total_facturar: totalFacturar,
      saldo_a_favor: 0,
      se_factura: true,
    };
  }

  let saldoAFavor = round2(-diferencia);
  if (redondeoEntero) {
    saldoAFavor = Math.round(saldoAFavor);
  }

  return {
    diferencia: round2(diferencia),
    ganancia: 0,
    total_facturar: 0,
    saldo_a_favor: saldoAFavor,
    se_factura: false,
  };
}

// Aplica aplicarReglaComun a cada fila de la previsualización, preservando
// el resto de los campos de la fila (nombre, documento, id_cliente,
// contactoEncontrado, etc.) — `diferencia` NO cambia con el margen (ya
// viene fija de la previsualización original), solo se recalculan las 4
// columnas derivadas.
export function recalcularFilasPorMargen(filas, margenGanancia, redondeoEntero) {
  return (filas || []).map((fila) => ({
    ...fila,
    ...aplicarReglaComun(fila.diferencia, margenGanancia, redondeoEntero),
  }));
}

// Mismos 4 totales que ya devuelve PrevisualizarImportacionObraSocialCasoDeUso
// (`totales`), recalculados a partir de las filas ya recalculadas — los
// totales del header dependen de se_factura/total_facturar por fila.
export function calcularTotales(filas) {
  const lista = filas || [];
  return {
    cantidadLeida: lista.length,
    facturables: lista.filter((f) => f.se_factura).length,
    saldoAFavor: lista.filter((f) => !f.se_factura && f.saldo_a_favor > 0).length,
    montoTotalFacturar: lista.reduce((acc, curr) => acc + (curr.total_facturar || 0), 0),
  };
}
