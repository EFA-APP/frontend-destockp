import { useMemo } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import Select from "./Select";

/**
 * Selector reusable de Unidad de Negocio.
 *
 * - Si el usuario tiene 0 o 1 unidades de negocio, no renderiza nada
 *   (el padre debe usar esa única unidad, o unidadActiva, como filtro fijo).
 * - Si tiene más de una, renderiza un dropdown controlado por el padre
 *   (value/onChange), sin tocar el store global `unidadActiva`.
 */
const SelectorUnidadNegocio = ({
  value,
  onChange,
  label = "Unidad de Negocio",
  className = "",
}) => {
  const usuario = useAuthStore((state) => state.usuario);
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  const options = useMemo(
    () =>
      unidadesNegocio.map((un) => ({
        valor: un.codigoSecuencial,
        texto: un.nombre,
      })),
    [unidadesNegocio],
  );

  if (unidadesNegocio.length <= 1) return null;

  return (
    <Select
      label={label}
      valor={value}
      setValor={onChange}
      options={options}
      className={className}
    />
  );
};

export default SelectorUnidadNegocio;
