import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListarConfiguracionCamposApi,
  ActualizarConfiguracionCampoApi,
} from "../../Contactos/api/contactos.api";

/**
 * Hook para leer y actualizar la configuración de cuota del alumno
 * (ConfiguracionCampoContacto con claveCampo="cuota" y entidadClave="ALUM").
 *
 * Cubre: R8, R22, R23
 *
 * @returns {{
 *   configCuota: Object|null,
 *   codigoSecuencial: number|null,
 *   formula: string,
 *   cargandoConfig: boolean,
 *   actualizarCuota: (nuevoValor: string|number) => Promise<void>
 * }}
 */
export const useConfigCuota = () => {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading: cargandoConfig } = useQuery({
    queryKey: ["configuracion-campos-contacto"],
    queryFn: () => ListarConfiguracionCamposApi(),
    staleTime: 60_000,
  });

  const configCuota = configs.find(
    (c) => c.claveCampo === "cuota" && c.entidadClave === "ALUM"
  ) ?? null;

  const mutationActualizar = useMutation({
    mutationFn: (nuevoValor) => {
      if (!configCuota) throw new Error("Configuración de cuota no encontrada");
      return ActualizarConfiguracionCampoApi(configCuota.codigoSecuencial, {
        formula: String(nuevoValor),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-campos-contacto"] });
    },
  });

  const configTipoAlumno = configs.find(
    (c) => c.claveCampo === "tipo_alumno" && c.entidadClave === "ALUM"
  ) ?? null;
  const tipoAlumnoOpciones = Array.isArray(configTipoAlumno?.opciones)
    ? configTipoAlumno.opciones.map((o) => (typeof o === "string" ? o : (o.valor ?? "")))
    : [];

  return {
    configCuota,
    codigoSecuencial: configCuota?.codigoSecuencial ?? null,
    formula: configCuota?.formula ?? "",
    cargandoConfig,
    actualizarCuota: mutationActualizar.mutateAsync,
    tipoAlumnoOpciones,
  };
};
