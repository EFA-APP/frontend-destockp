import { useFacturas } from "../../Ventas/Facturas/useFacturas";

export const useFacturasProveedor = () => {
  // Simplemente extendemos useFacturas con el tipo COMPRA
  const facturasData = useFacturas("prov_", "COMPRA");

  // Adaptamos nombres de retorno si es necesario para mantener compatibilidad con TablaFacturasProveedor
  return {
    ...facturasData,
    isBlanco: facturasData.isFiscal,
    setIsBlanco: facturasData.setIsFiscal,
    // La tabla usa 'facturas' que ya viene de useFacturas
  };
};
