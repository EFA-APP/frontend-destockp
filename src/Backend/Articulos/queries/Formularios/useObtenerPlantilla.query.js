import { useQuery } from "@tanstack/react-query";
import { obtenerPlantillaFormulario } from "../../api/Formularios/FormulariosApi";

export const useObtenerPlantilla = (entidad) => {
  return useQuery({
    queryKey: ["plantillaFormulario", entidad],
    queryFn: () => obtenerPlantillaFormulario(entidad),
    enabled: !!entidad, // Solo ejecutar si tenemos entidad
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });
};
