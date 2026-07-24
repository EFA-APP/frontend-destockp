// Feature 38 (contactos-relaciones-tab-alta-baja-cascada, R15, design.md §2).
// Extraído tal cual (copy-paste literal) de ModalVincularContacto.jsx
// (feature 37, R5/R12), sin cambiar comportamiento, para que
// ModalRelacionesDisponibles (ListaRelacionesContactos.jsx) pueda
// reutilizarlas sin duplicar el código puro.

// Feature 37 (R5): mismo criterio que migrarRelacionesLegacy
// (Contacto.repositorio.ts, contacto-ms), prefijo distinto (`auto_` en
// vez de `legacy_`) para no confundir el origen de la clave.
export const generarClaveAutoGenerada = (claveA, claveB) => {
  const [menor, mayor] = [claveA, claveB].sort();
  return `auto_${menor.toLowerCase()}_${mayor.toLowerCase()}`;
};

// Feature 37 (R12): Prisma no mapea el conflicto de unicidad a un status
// HTTP específico; se detecta por el mensaje crudo que reenvía
// client-gateway.
export const esConflictoDeClaveDuplicada = (error) =>
  /unique constraint/i.test(error?.response?.data?.message || "");
