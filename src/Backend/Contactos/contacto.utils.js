/**
 * Helpers compartidos para armar el payload de `actualizarContacto`
 * (PATCH /contactos/actualizar/:id), whitelisteado contra los campos que
 * declara el DTO real del backend (client-gateway,
 * `Contactos/Dtos/CrearContacto.dto.ts` + `ActualizarContacto.dto.ts` vía
 * `PartialType`), con el `ValidationPipe` global
 * (`whitelist: true, forbidNonWhitelisted: true`) rechazando cualquier
 * campo no listado ahí.
 *
 * No incluye `codigoEmpresa` (viaja como query param, auto-inyectado por el
 * interceptor de axios en `Backend/Config/axios.js`, no por body) ni
 * `enteFacturacion`/`relaciones` (declarados en el DTO backend pero no
 * usados por los modales que consumen este helper).
 *
 * Si el DTO backend cambia, actualizar únicamente acá.
 */
export const CAMPOS_CONTACTO_BASE_PERMITIDOS = [
  "tipoEntidad",
  "nombre",
  "apellido",
  "razonSocial",
  "documento",
  "correoElectronico",
  "tipoDocumento",
  "condicionIva",
  "activo",
];

/**
 * Arma el subconjunto base (sin `atributos`) del dto de `actualizarContacto`
 * a partir de un contacto/alumno ya cargado, con los mismos defaults que
 * usaban ModalOverrideCuota.jsx / ModalCambioTipoAlumno.jsx antes de
 * centralizarse acá. El caller agrega `atributos` según su propia lógica
 * (cada modal edita una porción distinta del JSON de atributos).
 * @param {Object} contacto
 * @returns {Object}
 */
export const construirContactoBaseDto = (contacto) => ({
  tipoEntidad: contacto.tipoEntidad,
  nombre: contacto.nombre || "",
  apellido: contacto.apellido || "",
  razonSocial: contacto.razonSocial || "",
  documento: contacto.documento || "",
  correoElectronico: contacto.correoElectronico || "",
  tipoDocumento: contacto.tipoDocumento || 99,
  condicionIva: contacto.condicionIva || "CF",
  activo: contacto.activo ?? true,
});
