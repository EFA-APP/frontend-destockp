import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";
import { PlusCircle } from "lucide-react";

export const accionesCuotas = ({
  handlePagarCuota,
  handleEmitirIndividual,
  periodoSeleccionado,
}) => [
  {
    ...accionesReutilizables.generarComprobanteDeVenta,
    mostrar: (alumno) => {
      // Mostrar si tiene algo de deuda (actual o anterior)
      const cuotaActual = alumno.cuotas?.[periodoSeleccionado];
      const tieneDeudaActual = cuotaActual && cuotaActual.monto > 0;

      const tieneDeudaAnterior = Object.values(alumno.cuotas || {}).some(
        (c) => c.periodo < periodoSeleccionado && c.monto > 0,
      );

      return tieneDeudaActual || tieneDeudaAnterior;
    },
    onClick: (alumno) => {
      handlePagarCuota(alumno);
    },
  },
  {
    ...accionesReutilizables.aumentarCuota,
    mostrar: (alumno) => {
      // Mostrar SOLO si la cuota del periodo actual NO EXISTE
      const cuotaActual = alumno.cuotas?.[periodoSeleccionado];
      return !cuotaActual;
    },
    onClick: (alumno) => {
      handleEmitirIndividual(alumno);
    },
  },
];
