import { useQuery } from "@tanstack/react-query";
import { ListarConfiguracionCamposApi } from "../../Contactos/api/contactos.api";

/**
 * Hook genérico (no ligado a ALUM) para leer `ConfiguracionCampoContacto`
 * filtrada por `entidadClave` (ej: "ALUM", "SOCI").
 *
 * Reutiliza el mismo endpoint `contactos.config.listar` que ya usa
 * `useConfigCuota.js` (ALUM-específico, legacy — no tocar), pero sin
 * asumir ninguna entidad ni claveCampo en particular: sirve para poblar
 * selects de "atributo" en formularios genéricos (ej. `ModalReglasCuota.jsx`).
 */
export const useConfiguracionCampos = (entidadClave) => {
  const { data: configs = [], isLoading: cargandoCampos } = useQuery({
    queryKey: ["configuracion-campos-contacto"],
    queryFn: () => ListarConfiguracionCamposApi(),
    staleTime: 60_000,
  });

  const campos = configs.filter((c) => c.entidadClave === entidadClave);

  return {
    campos,
    cargandoCampos,
  };
};
