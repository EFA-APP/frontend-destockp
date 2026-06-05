import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../api/Transporte/transporte.api";
import { useAlertas } from "../../../../store/useAlertas";

// --- RUTAS ---
export const useObtenerRutas = () => {
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useQuery({
    queryKey: ["transporte-rutas"],
    queryFn: api.getRutas,
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al obtener las rutas" });
    },
  });
};

export const useCrearRuta = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.crearRuta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-rutas"] });
      agregarAlerta({ type: "success", message: "Ruta creada exitosamente" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al crear la ruta" });
    },
  });
};

export const useActualizarRuta = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.actualizarRuta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-rutas"] });
      agregarAlerta({ type: "success", message: "Ruta actualizada exitosamente" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al actualizar la ruta" });
    },
  });
};

export const useEliminarRuta = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.eliminarRuta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-rutas"] });
      agregarAlerta({ type: "success", message: "Ruta eliminada exitosamente" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al eliminar la ruta" });
    },
  });
};

// --- ENVIOS ---
export const useObtenerEnvios = (fecha) => {
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useQuery({
    queryKey: ["transporte-envios", fecha],
    queryFn: () => api.getEnvios(fecha),
    enabled: !!fecha,
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al obtener los envíos" });
    },
  });
};

export const useCrearEnvio = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.crearEnvio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-envios"] });
      queryClient.invalidateQueries({ queryKey: ["transporte-envios-no-facturados"] });
      agregarAlerta({ type: "success", message: "Envío registrado exitosamente" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al registrar el envío" });
    },
  });
};

export const useActualizarEstadoEnvio = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.actualizarEstadoEnvio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-envios"] });
      agregarAlerta({ type: "success", message: "Estado de envío actualizado" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al actualizar estado del envío" });
    },
  });
};

export const useObtenerEnviosNoFacturados = (codigoRemitente) => {
  return useQuery({
    queryKey: ["transporte-envios-no-facturados", codigoRemitente],
    queryFn: () => api.getEnviosNoFacturados(codigoRemitente),
  });
};

export const useFacturarEnvios = () => {
  const queryClient = useQueryClient();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  return useMutation({
    mutationFn: api.facturarEnvios,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporte-envios"] });
      queryClient.invalidateQueries({ queryKey: ["transporte-envios-no-facturados"] });
      agregarAlerta({ type: "success", message: "Envíos facturados exitosamente" });
    },
    onError: (error) => {
      agregarAlerta({ type: "error", message: error?.response?.data?.message || "Error al facturar envíos" });
    },
  });
};
