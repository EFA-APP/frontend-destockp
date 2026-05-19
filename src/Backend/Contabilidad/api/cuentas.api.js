import { axiosInitial } from "../../Config";

export const obtenerArbolCuentas = async () => {
  const { data } = await axiosInitial.get("/contabilidad/cuentas/arbol", {
    showLoader: true,
    sinEmpresa: true,
  });
  return data;
};

export const crearCuenta = async (dto) => {
  const { data } = await axiosInitial.post("/contabilidad/cuentas", dto, {
    showLoader: true,
    sinEmpresa: true,
  });
  return data;
};

export const importarPlanCuentas = async (dto) => {
  const { data } = await axiosInitial.post("/contabilidad/cuentas/importar", dto, {
    showLoader: true,
    sinEmpresa: true,
  });
  return data;
};

export const obtenerCuentasNoImputables = async () => {
  const { data } = await axiosInitial.get("/contabilidad/cuentas/no-imputables", {
    showLoader: true,
    sinEmpresa: true,
  });
  return data;
};
