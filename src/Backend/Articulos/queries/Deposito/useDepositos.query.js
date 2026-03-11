import { useQuery } from "@tanstack/react-query";
import { ObtenerDepositosApi } from "../../api/Deposito/deposito.api";

export const useDepositos = () => {
    return useQuery({
        queryKey: ["depositos"],
        queryFn: () => ObtenerDepositosApi()
    });
};
