/**
 * Denominaciones vigentes de pesos argentinos (billetes y monedas) usadas
 * únicamente para el arqueo/conteo de "Cierre de Caja" en la UI.
 *
 * No es un catálogo de backend: no existe ningún modelo de denominaciones
 * en tesoreria-ms y no se crea uno (feature solo UI/UX, ver design.md §3).
 * Si en el futuro cambia el papel moneda vigente, se actualiza este archivo
 * sin tocar backend.
 */
export const BILLETES = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10];

export const MONEDAS = [10, 5, 2, 1];
