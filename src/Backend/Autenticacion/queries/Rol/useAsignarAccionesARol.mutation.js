import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asignarAccionesARolApi } from "../../api/Accion/accion.api";
import { useAlertas } from "../../../../store/useAlertas";

// R5, R15, R16(a), R38: reemplaza el manejo de "permisos" dentro de
// actualizarRol.
//
// fix-refresco-modal-vincular-permisos-rol: `onSuccess` DEBE devolver
// (await/return) las promesas de invalidación/refetch. `ModalVincularPermisosRol.jsx`
// llama a `mutateAsync` en un loop `for` (una vez por SubMenu tocado) y cierra el
// modal apenas el loop termina; TanStack Query solo hace que `mutateAsync` espere
// a `onSuccess` si éste retorna una promesa. Sin el `return`, cada iteración del
// loop (y el cierre del modal) podía completarse antes de que el refetch de
// ["roles"] terminara de verdad -- si React Query dedupeaba ese refetch con uno
// disparado por una iteración anterior (misma query en vuelo), el resultado que
// terminaba en caché podía no incluir el SubMenu recién tocado en la ÚLTIMA
// iteración del loop, aunque el backend ya lo hubiera guardado correctamente
// (reproducido: reabrir el modal sin F5 mostraba el SubMenu como no activado).
export const useAsignarAccionesARol = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  return useMutation({
    mutationFn: asignarAccionesARolApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roles"] }),
        queryClient.refetchQueries({ queryKey: ["verificarToken"] }),
      ]);
    },
    onError: (error) => {
      agregarAlerta({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Ocurrió un error al asignar las acciones al rol.",
      });
    },
  });
};
