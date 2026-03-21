import { useState, useMemo } from "react";
import { useObtenerRoles } from "../../queries/Rol/useObtenerRoles.query";
import { useCrearRol } from "../../queries/Rol/useCrearRol.mutation";
import { useActualizarRol } from "../../queries/Rol/useActualizarRol.mutation";
import { useEliminarRol } from "../../queries/Rol/useEliminarRol.mutation";

export const useRolesUI = () => {
  const [busquedaRol, setBusquedaRol] = useState({
    search: "",
    mode: "description", // 'description' | 'code'
    offset: 0,
    limit: 10
  });

  const filters = useMemo(
    () => ({
    //   description: busquedaRol.mode === "description" ? busquedaRol.search : "",
    //   codRol: busquedaRol.mode === "code" ? busquedaRol.search : "",
    //   limit: busquedaRol.limit,
    //   offset: busquedaRol.offset,
    }),
    [busquedaRol]
  );

  const rolesQuery = useObtenerRoles(filters);
  const crearRolMutation = useCrearRol();
  const actualizarRolMutation = useActualizarRol();
  const eliminarRolMutation = useEliminarRol();

  return {
    roles: Array.isArray(rolesQuery.data) 
      ? rolesQuery.data 
      : (rolesQuery.data?.roles || rolesQuery.data?.items || []),
    totalRoles: rolesQuery.data?.total ?? (Array.isArray(rolesQuery.data) ? rolesQuery.data.length : 0),
    cargandoRol: rolesQuery.isLoading,
    setBusquedaRol,
    busquedaRol,
    crearRol: crearRolMutation.mutateAsync,
    creandoRol: crearRolMutation.isPending,
    actualizarRol: actualizarRolMutation.mutateAsync,
    actualizandoRol: actualizarRolMutation.isPending,
    eliminarRol: eliminarRolMutation.mutateAsync,
    eliminandoRol: eliminarRolMutation.isPending,
  };
};
