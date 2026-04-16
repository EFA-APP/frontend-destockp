import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAlertas } from "../../../store/useAlertas";
import { useConfiguracionContactos } from "./useConfiguracionContactos";
import { useContactos } from "./useContactos";
import {
  EmitirCuotasMasivasApi,
  ListarMovimientosApi,
} from "../api/contactos.api";
import { usePersistentState } from "../../../hooks/usePersistentState";

export const useAlumnos = () => {
  const { agregarAlerta } = useAlertas();
  // 🔍 1. Obtención de Datos Reales del API (Usamos límite alto para ver más alumnos)
  const {
    contactos: alumnos = [],
    cargandoContactos,
    refetch,
  } = useContactos({ tipoEntidad: "ALUM", limite: 100 });
  const { configs } = useConfiguracionContactos();

  // 🏦 2. Obtención de Movimientos Reales (Ledger)
  // Nota: Para escalabilidad, traemos todos los movimientos de la empresa
  // Podríamos filtrar por año si fuera necesario.
  const {
    data: todosLosMovimientos = [],
    isLoading: cargandoMovimientos,
    refetch: refetchMovs,
  } = useQuery({
    queryKey: ["movimientos_empresa"],
    queryFn: () => ListarMovimientosApi(), // Sin id trae todos
    showLoader: false,
  });

  const [busqueda, setBusqueda] = usePersistentState("alumnos_busqueda", "");

  // 🎚️ 3. Obtener Fórmulas de la Configuración Real
  const formulaCuota = useMemo(() => {
    const configCuota = configs?.find(
      (c) => c.entidadClave === "ALUM" && c.claveCampo === "cuota",
    );
    return (
      configCuota?.formula || '{tipo_alumno} == "INTERNO" ? 190000 : 130000'
    );
  }, [configs]);

  const formulaInteres = useMemo(() => {
    const configInteres = configs?.find(
      (c) => c.entidadClave === "ALUM" && c.claveCampo === "aplicar_interes",
    );
    return configInteres?.formula || '{tipo_alumno} == "INTERNO" ? 247 : 169';
  }, [configs]);

  // 🧮 Motor de Fórmulas Dinámicas (Centralizado)
  const evaluarFormula = (formula, datos) => {
    if (!formula) return null;
    try {
      // Reemplazar {variable} por su valor real
      let expresion = formula.replace(/{(.*?)}/g, (match, p1) => {
        const valor = datos[p1.trim()];
        return typeof valor === "string" ? `"${valor}"` : (valor ?? 0);
      });

      // Evaluación segura de la expresión resultante
      // eslint-disable-next-line no-new-func
      return new Function(`return ${expresion}`)();
    } catch (e) {
      console.warn("[Motor de Fórmulas] Error al evaluar:", formula, e.message);
      return null;
    }
  };

  // 📅 Registro de pagos inicial (opcional, si no hay nada en persistent storage)
  // [No es necesario si usamos usePersistentState arriba]

  // 🗓️ Fecha actual (usamos la del sistema, o una simulada para pruebas)
  const fechaActual = new Date();

  // 🔍 Verificar si una cuota está vencida
  const estaVencida = (fechaVencimiento) => {
    return fechaActual > new Date(fechaVencimiento);
  };

  // 💰 Calcular monto con descuento aplicado
  const calcularMontoFinal = (montoCuota, descuentoPorcentaje) => {
    const descuento = Number(descuentoPorcentaje) || 0;
    return montoCuota - (montoCuota * descuento) / 100;
  };

  // 🧮 Calcular interés por mora DIARIO (Dinamico por tipo)
  const calcularInteresMora = (
    fechaVencimiento,
    aplicaInteres,
    alumnoAtributos,
  ) => {
    if (!aplicaInteres) return { monto: 0, dias: 0 };

    // Ejecutar fórmula real de configuración
    const tasaDiaria =
      evaluarFormula(formulaInteres, alumnoAtributos || {}) || 0;

    const fVenc = new Date(fechaVencimiento);
    if (fechaActual <= fVenc) return { monto: 0, dias: 0 };

    const diffTime = Math.abs(fechaActual - fVenc);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { 
      monto: diffDays * tasaDiaria,
      dias: diffDays
    };
  };

  // 📊 Generar cuotas para cada alumno (calculado dinámicamente)
  const alumnosConCuotas = useMemo(() => {
    return (alumnos || []).map((alumno) => {
      // 1. Evaluar precio base usando el motor de fórmulas
      const precioCalculado = evaluarFormula(
        formulaCuota,
        alumno.atributos || {},
      );

      const config = {
        montoCuota: Number(
          alumno.atributos?.cuota ||
            alumno.montoCuota ||
            precioCalculado ||
            130000,
        ),
        diaVencimiento: Number(
          alumno.atributos?.dia_vencimiento || alumno.diaVencimiento || 10,
        ),
        descuento: Number(
          alumno.atributos?.beca_porcentaje || alumno.descuento || 0,
        ),
        aplicaInteres:
          alumno.atributos?.aplica_interes !== undefined
            ? alumno.atributos.aplica_interes
            : (alumno.aplicarInteres ?? true),
      };

      const montoFinal = calcularMontoFinal(
        config.montoCuota,
        config.descuento,
      );
      const cuotas = {};

      // Generar cuotas para los meses del año (0 = Enero, 11 = Diciembre)
      for (let mes = 0; mes < 12; mes++) {
        const periodoStr = `${fechaActual.getFullYear()}-${String(mes + 1).padStart(2, "0")}`;

        // Buscar movimientos de este alumno para este periodo
        const movsAlumno = (todosLosMovimientos || []).filter(
          (m) =>
            m.codigoContacto === alumno.codigoSecuencial &&
            m.periodo === periodoStr,
        );

        // Sumar débitos (deuda) y créditos (pagos)
        const debito = movsAlumno
          .filter((m) => m.monto > 0)
          .reduce((s, m) => s + m.monto, 0);
        const credito = Math.abs(
          movsAlumno
            .filter((m) => m.monto < 0)
            .reduce((s, m) => s + m.monto, 0),
        );

        // Movimiento de débito principal para obtener la fecha de vencimiento
        const movPrincipal = movsAlumno.find((m) => m.monto > 0);
        const fVenc = movPrincipal?.fechaVencimiento
          ? new Date(movPrincipal.fechaVencimiento)
          : new Date(fechaActual.getFullYear(), mes, config.diaVencimiento);

        let estado = "sin cuota";
        let interes = 0;
        let diasAtraso = 0;

        if (debito > 0) {
          if (credito >= debito) {
            estado = "pagado";
          } else if (fechaActual > fVenc) {
            estado = "vencido";
            const resMora = calcularInteresMora(
              fVenc,
              config.aplicaInteres,
              alumno.atributos, // Pasamos todos los atributos para evaluar la fórmula
            );
            interes = resMora.monto;
            diasAtraso = resMora.dias;
          } else {
            estado = "pendiente";
          }
        }

        cuotas[mes] = {
          estado,
          monto: debito || montoFinal,
          interes,
          diasAtraso,
          montoConInteres: (debito || montoFinal) + interes,
          fechaVencimiento: fVenc.toISOString().split("T")[0],
          // Datos informativos del pago (usamos el crédito si existe)
          fechaPago: movsAlumno.find((m) => m.monto < 0)?.fecha || null,
          metodoPago: movsAlumno.find((m) => m.monto < 0)?.metodoPago || null,
          numeroRecibo: movsAlumno.find((m) => m.monto < 0)?.referencia || null,
        };
      }

      // Calcular estado general y cuotas adeudadas
      const cuotasArray = Object.values(cuotas);
      const cuotasVencidas = cuotasArray.filter(
        (c) => c.estado === "vencido",
      ).length;
      const cuotasPendientes = cuotasArray.filter(
        (c) =>
          c.estado === "pendiente" &&
          !estaVencida(new Date(c.fechaVencimiento)),
      ).length;

      let estadoCuota = "al_dia";
      if (cuotasVencidas > 0) {
        estadoCuota = "vencido";
      } else if (cuotasPendientes > 0) {
        estadoCuota = "pendiente";
      }

      return {
        ...alumno,
        id: alumno.codigoSecuencial, // Para compatibilidad con la tabla
        cuotas,
        estadoCuota,
        cuotasAdeudadas: cuotasVencidas,
      };
    });
  }, [alumnos, todosLosMovimientos, formulaCuota]);

  // 🔍 Filtro mejorado
  const alumnosFiltrados = useMemo(() => {
    if (!busqueda) return alumnosConCuotas;
    const texto = busqueda.toLowerCase();
    return alumnosConCuotas.filter((a) => {
      return (
        (a.nombre?.toLowerCase() || "").includes(texto) ||
        (a.apellido?.toLowerCase() || "").includes(texto) ||
        a.documento?.includes(texto) ||
        (a.atributos?.curso?.toLowerCase() || "").includes(texto)
      );
    });
  }, [alumnosConCuotas, busqueda]);

  // 💳 Registrar un pago (Ahora es REAL: crea un movimiento de Crédito)
  const registrarPago = async (alumnoId, mes, datosPago) => {
    const periodoStr = `${fechaActual.getFullYear()}-${String(mes + 1).padStart(2, "0")}`;

    try {
      await ActualizarSaldoApi(alumnoId, {
        monto: -datosPago.monto, // Negativo para crédito (Pago)
        concepto: `PAGO CUOTA PERIODO ${periodoStr}`,
        periodo: periodoStr,
        referencia: datosPago.numeroRecibo,
        metodoPago: datosPago.metodoPago,
      });

      agregarAlerta({
        title: "Pago Registrado",
        message:
          "El pago se ha registrado correctamente en la cuenta corriente.",
        type: "success",
      });

      refetch();
      refetchMovs();
    } catch (e) {
      console.error("Error al registrar pago:", e);
    }
  };

  // 📉 4. Emisión Masiva de Cuotas (Hacer la deuda REAL en la DB mediante endpoint masivo)
  const emitirCuotasMensuales = async (mesIndex) => {
    console.log(`[Escuela] Iniciando emisión masiva de cuotas...`);

    try {
      await EmitirCuotasMasivasApi({
        tipoEntidad: "ALUM",
        diaVencimiento: 10,
        formulaMonto: formulaCuota,
      });

      agregarAlerta({
        title: "Éxito",
        message: `Se han emitido las cuotas para todos los alumnos correctamente.`,
        type: "success",
      });

      refetch();
      refetchMovs();
    } catch (e) {
      console.error("Error en la emisión masiva:", e);
      agregarAlerta({
        title: "Error",
        message: "No se pudo completar la emisión masiva.",
        type: "error",
      });
    }
  };

  // 📊 Estadísticas generales
  const obtenerEstadisticas = () => {
    const totalAlumnos = alumnosConCuotas.length;
    const activos = alumnosConCuotas.filter((a) => a.activo).length;

    const totalDeudaProyectada = alumnosConCuotas.reduce((sum, a) => {
      const deudaAlumno = Object.values(a.cuotas)
        .filter((c) => c.estado === "vencido")
        .reduce((s, c) => s + c.montoConInteres, 0);
      return sum + deudaAlumno;
    }, 0);

    const saldoRealTotal = alumnos.reduce(
      (sum, a) => sum + (Number(a.atributos?.saldo) || 0),
      0,
    );
    const alumnosConDeuda = alumnosConCuotas.filter(
      (a) => a.cuotasAdeudadas > 0,
    ).length;

    const totalRecaudado = todosLosMovimientos
      .filter((m) => m.monto < 0)
      .reduce((sum, p) => sum + Math.abs(p.monto), 0);

    const recaudacionMesActual = todosLosMovimientos
      .filter((p) => {
        if (p.monto >= 0) return false;
        const fechaPago = new Date(p.fecha);
        return (
          fechaPago.getMonth() === fechaActual.getMonth() &&
          fechaPago.getFullYear() === fechaActual.getFullYear()
        );
      })
      .reduce((sum, p) => sum + Math.abs(p.monto), 0);

    return {
      totalAlumnos,
      activos,
      totalDeuda: totalDeudaProyectada,
      saldoRealTotal,
      alumnosConDeuda,
      totalRecaudado,
      recaudacionMesActual,
      totalPagos: todosLosMovimientos.filter((m) => m.monto < 0).length,
    };
  };

  return {
    alumnos: alumnosFiltrados,
    alumnosCompletos: alumnosConCuotas,
    busqueda,
    setBusqueda,
    cargandoAlumnos: cargandoContactos || cargandoMovimientos,
    obtenerEstadisticas,
    registrarPago,
    emitirCuotasMensuales,
    movimientos: todosLosMovimientos,
  };
};
