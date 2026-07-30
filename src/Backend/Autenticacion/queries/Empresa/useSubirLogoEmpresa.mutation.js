import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subirLogoEmpresaApi } from "../../api/Empresa/empresa.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useSubirLogoEmpresa = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: subirLogoEmpresaApi,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todas-las-empresas"] });
      queryClient.invalidateQueries({
        queryKey: ["empresa-por-codigo", variables?.codigoEmpresa],
      });
    },
    onError: (error) => {
      agregarAlerta({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Ocurrió un error al intentar subir el logo de la empresa.",
      });
    },
  });
};
