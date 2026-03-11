import { useQuery } from "@tanstack/react-query";
import { ListarDepositosPorStockApi } from "../../api/Deposito/deposito.api";

export const useDepositosConStock = (filtros = {}) => {

    return useQuery({
        queryKey: ["depositosConStock", filtros],
        queryFn: () => ListarDepositosPorStockApi(filtros),
    });
};
