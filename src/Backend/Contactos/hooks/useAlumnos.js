import { useMemo, useState, useEffect } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useAlertas } from "../../../store/useAlertas";
import { useConfiguracionContactos } from "./useConfiguracionContactos";
import { useContactos } from "./useContactos";
import {
  EmitirCuotasMasivasApi,
  CargarInteresMasivaApi,
  ListarMovimientosApi,
  ActualizarSaldoApi,
  ObtenerMetricasCuentaApi,
  ObtenerMetricasLoteApi,
} from "../api/contactos.api";
import { usePersistentState } from "../../../hooks/usePersistentState";
import { useAuthStore } from "../../Autenticacion/store/authenticacion.store";

export const useAlumnos = (anioSeleccionado) => {
  const { agregarAlerta } = useAlertas();
  const usuario = useAuthStore((state) => state.usuario);
  const codigoCtaCte = usuario?.configuracion?.cuentas?.ctaCteAlumnos || "1106";
  const codigoIngreso = usuario?.configuracion?.cuentas?.ingresoCuotas || "4106";
  const fechaActual = new Date();
  const anio = anioSeleccionado || fechaActual.getFullYear();

  // 🔍 1. Estado de Filtros (Simplificado)
  const [busqueda, setBusqueda] = usePersistentState("alumnos_busqueda", "");
  const [mesSeleccionado, setMesSeleccionado] = useState(
    fechaActual.getMonth(),
  );
  const [pagina, setPagina] = useState(1);

  // Debounce para la búsqueda para no saturar el servidor
  const [busquedaDebounced] = useDebounce(busqueda, 500);

  // Resetear a página 1 cuando cambia el mes o la búsqueda
  useEffect(() => {
    setPagina(1);
  }, [mesSeleccionado, busquedaDebounced]);

  // 📊 2. Obtención de Datos Reales del API Filtrados por el Servidor
  const periodoFiltro = `${anio}-${String(mesSeleccionado + 1).padStart(2, "0")}`;

  const {
    contactos: alumnos = [],
    cargandoContactos,
    refetch,
    total,
    paginas,
    paginaActual,
  } = useContactos({
    tipoEntidad: "ALUM",
    busqueda: busquedaDebounced,
    pagina,
    limite: 15, // Límite solicitado por el usuario para una interfaz más limpia
    codigoCuenta: codigoCtaCte,
  });

  const { configs } = useConfiguracionContactos();

  // 🏦 3. Movimientos: Seguimos trayéndolos para el historial rápido
  const {
    data: responseMovimientos,
    isLoading: cargandoMovimientos,
    refetch: refetchMovs,
  } = useQuery({
    queryKey: ["movimientos_alumnos", busquedaDebounced, codigoCtaCte],
    queryFn: () =>
      ListarMovimientosApi(null, {
        busqueda: busquedaDebounced,
        limite: 400,
        codigoCuenta: codigoCtaCte,
      }), // Límite de 400 para mapeo rápido de la página actual
    showLoader: false,
    enabled: !!alumnos.length,
  });

  const todosLosMovimientos = responseMovimientos?.data || [];

  // 📊 3b. Métricas calculadas en el Backend (Multitenant y optimizado)
  const periodoMetricas = `${anio}-${String(mesSeleccionado + 1).padStart(2, "0")}`;

  const {
    data: metricasCuenta,
    isLoading: cargandoMetricasCuenta,
    refetch: refetchMetricasCuenta,
  } = useQuery({
    queryKey: ["metricas_cuenta_alumnos", usuario?.codigoEmpresa || 2, codigoCtaCte, periodoMetricas],
    queryFn: () =>
      ObtenerMetricasCuentaApi(usuario?.codigoEmpresa || 2, codigoCtaCte, periodoMetricas),
    showLoader: false,
    enabled: !!codigoCtaCte,
  });

  const {
    data: metricasLote,
    isLoading: cargandoMetricasLote,
    refetch: refetchMetricasLote,
  } = useQuery({
    queryKey: ["metricas_lote_cuotas", usuario?.codigoEmpresa || 2, periodoMetricas, codigoCtaCte],
    queryFn: () =>
      ObtenerMetricasLoteApi(usuario?.codigoEmpresa || 2, periodoMetricas, codigoCtaCte),
    showLoader: false,
    enabled: !!codigoCtaCte,
  });

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
    atributos,
    montoBase = 0,
  ) => {
    // 1. Calcular días de atraso usando solo fechas (sin horas)
    const hoy = new Date();
    const hoyInicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    const fVenc = new Date(fechaVencimiento);
    const vencInicio = new Date(
      fVenc.getFullYear(),
      fVenc.getMonth(),
      fVenc.getDate(),
    );

    const diffTime = hoyInicio.getTime() - vencInicio.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // 2. Si no aplica interés o no está vencido, devolvemos el monto en 0 pero los días calculados
    if (!aplicaInteres || hoyInicio <= vencInicio) {
      return { monto: 0, dias: diffDays };
    }

    // 3. Evaluar tasa diaria
    const tasaDiaria = evaluarFormula(formulaInteres, atributos || {}) || 0;

    return {
      monto: tasaDiaria * diffDays,
      dias: diffDays,
    };
  };

  // Helper para formatear periodo (2024-03 -> Marzo 2024)
  const formatearPeriodo = (periodo) => {
    if (!periodo) return "N/A";
    const [anio, mes] = periodo.split("-");
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${meses[parseInt(mes) - 1]} ${anio}`;
  };

  // 📊 Generar cuotas para cada alumno (Basado en movimientos REALES de deuda)
  const alumnosConCuotas = useMemo(() => {
    return (alumnos || []).map((alumno) => {
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
          alumno.atributos?.aplicar_interes !== undefined
            ? alumno.atributos.aplicar_interes
            : (alumno.aplicarInteres ?? true),
      };

      const montoFinal = calcularMontoFinal(
        config.montoCuota,
        config.descuento,
      );
      const cuotas = {};

      // 1. Obtener todos los periodos únicos y separar créditos sin periodo inicial
      const movsAlumno = (todosLosMovimientos || []).filter(
        (m) => Number(m.codigoContacto) === Number(alumno.codigoSecuencial),
      );

      if (movsAlumno.length > 0) {
        console.log(
          `[useAlumnos] Procesando ${movsAlumno.length} movs para alumno ${alumno.codigoSecuencial} (${alumno.nombre})`,
        );
      }

      const periodosUnicos = [
        ...new Set(movsAlumno.map((m) => m.periodo).filter(Boolean)),
      ].sort();

      // Bolsa global de crédito (empezamos con los que no tienen periodo)
      let bolsaCreditoGlobal = Math.abs(
        movsAlumno
          .filter((m) => m.monto < 0 && !m.periodo)
          .reduce((s, m) => s + m.monto, 0),
      );

      if (bolsaCreditoGlobal > 0) {
        console.log(
          `[useAlumnos] Bolsa de crédito global inicial para ${alumno.nombre}: ${bolsaCreditoGlobal}`,
        );
      }

      // 2. Procesar cada periodo (Cálculo de Deuda y Crédito Directo)
      periodosUnicos.forEach((periodoStr) => {
        const movsPeriodo = movsAlumno.filter((m) => m.periodo === periodoStr);

        const debitoBase = movsPeriodo
          .filter(
            (m) => m.monto > 0 && !m.concepto?.startsWith("INTERES GENERADO"),
          )
          .reduce((s, m) => s + m.monto, 0);

        const interesGrabado = movsPeriodo
          .filter(
            (m) => m.monto > 0 && m.concepto?.startsWith("INTERES GENERADO"),
          )
          .reduce((s, m) => s + m.monto, 0);

        const creditoDirecto = Math.abs(
          movsPeriodo
            .filter((m) => m.monto < 0)
            .reduce((s, m) => s + m.monto, 0),
        );

        const movPrincipal = movsPeriodo.find(
          (m) => m.monto > 0 && !m.concepto?.startsWith("INTERES GENERADO"),
        );
        
        // Intentar extraer tasa de mora "congelada" del concepto (ej: "CUOTA 03/2026 (MORA:$150)")
        const matchMora = movPrincipal?.concepto?.match(/\(MORA:\$([\d.]+)\)/);
        let tasaHistorica = null;
        if (matchMora) {
          tasaHistorica = parseFloat(matchMora[1]);
        }

        let fVenc;
        if (movPrincipal?.fechaVencimiento) {
          fVenc = new Date(movPrincipal.fechaVencimiento);
        } else {
          const partes = (periodoStr || "").split("-");
          if (partes.length === 2) {
            fVenc = new Date(
              parseInt(partes[0]),
              parseInt(partes[1]) - 1,
              config.diaVencimiento || 10,
            );
          } else {
            fVenc = new Date();
          }
        }

        if (isNaN(fVenc.getTime())) fVenc = new Date();

        const baseParaMora = debitoBase || montoFinal;
        
        // Calculamos mora (Usando tasa histórica si existe, sino la actual)
        let resMora;
        if (tasaHistorica !== null) {
          // Calcular mora manual con la tasa guardada
          const hoy = new Date();
          const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
          const vencInicio = new Date(fVenc.getFullYear(), fVenc.getMonth(), fVenc.getDate());
          const diffTime = hoyInicio.getTime() - vencInicio.getTime();
          const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          
          resMora = {
            monto: tasaHistorica * diffDays,
            dias: diffDays
          };
        } else {
          resMora = calcularInteresMora(
            fVenc,
            config.aplicaInteres,
            alumno.atributos,
            baseParaMora,
          );
        }

        const interes = Math.max(interesGrabado, resMora.monto);
        const deudaTotal = baseParaMora + interes;

        // Si el crédito directo supera la deuda de este periodo, el excedente va a la bolsa global
        const saldoTrasCreditoDirecto = deudaTotal - creditoDirecto;
        if (saldoTrasCreditoDirecto < 0) {
          bolsaCreditoGlobal += Math.abs(saldoTrasCreditoDirecto);
        }

        const montoPendiente = Math.max(0, saldoTrasCreditoDirecto);

        // Determinación inteligente de estado
        let estado = "pendiente";
        if (montoPendiente <= 1) {
          estado = "pagado";
        } else if (creditoDirecto > 0) {
          estado = "parcial";
        } else if (fechaActual > fVenc) {
          estado = "vencido";
        }

        cuotas[periodoStr] = {
          periodo: periodoStr,
          periodoFormateado: formatearPeriodo(periodoStr),
          estado,
          monto: montoPendiente,
          montoOriginal: baseParaMora,
          interes,
          diasAtraso: resMora.dias,
          fechaVencimiento: fVenc.toISOString().split("T")[0],
          deudaTotalOriginal: deudaTotal,
        };
      });

      // 3. DISTRIBUCIÓN DE LA BOLSA GLOBAL DE CRÉDITO
      // Ordenamos las cuotas de más antigua a más nueva para saldar deudas viejas primero
      const periodosOrdenados = Object.keys(cuotas).sort();
      periodosOrdenados.forEach((p) => {
        if (bolsaCreditoGlobal > 0 && cuotas[p].monto > 0) {
          const aCubrir = Math.min(bolsaCreditoGlobal, cuotas[p].monto);
          cuotas[p].monto -= aCubrir;
          bolsaCreditoGlobal -= aCubrir;

          if (cuotas[p].monto <= 1) {
            cuotas[p].estado = "pagado";
          }
        }
      });

      // 4. Calcular deuda histórica
      const hoyPeriodoStr = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, "0")}`;
      const deudaHistorica = Object.values(cuotas)
        .filter((c) => c.periodo < hoyPeriodoStr && c.estado !== "pagado")
        .reduce((sum, c) => sum + c.monto, 0);

      const cuotasVencidas = Object.values(cuotas).filter(
        (c) => c.estado === "vencido" && c.monto > 0,
      ).length;

      return {
        ...alumno,
        id: alumno.codigoSecuencial,
        cuotas,
        deudaHistorica,
        cuotasVencidas,
        montoCuotaActual: montoFinal,
        estadoCuota: cuotasVencidas > 0 ? "vencido" : "al_dia",
      };
    });
  }, [alumnos, todosLosMovimientos, formulaCuota, formulaInteres, fechaActual]);

  // 🔍 Filtro mejorado
  const alumnosFiltrados = useMemo(() => {
    if (!busqueda) return alumnosConCuotas;
    const texto = busqueda.toLowerCase();
    return alumnosConCuotas.filter((a) => {
      return (
        String(a.nombre || "").toLowerCase().includes(texto) ||
        String(a.apellido || "").toLowerCase().includes(texto) ||
        String(a.documento || "").includes(texto) ||
        String(a.atributos?.curso || "").toLowerCase().includes(texto)
      );
    });
  }, [alumnosConCuotas, busqueda]);

  // 💳 Registrar un pago (Ahora es REAL: crea un movimiento de Crédito)
  const registrarPago = async (alumnoId, periodoStr, datosPago) => {
    try {
      await ActualizarSaldoApi(alumnoId, {
        monto: -datosPago.monto, // Negativo para crédito (Pago)
        concepto: `PAGO CUOTA PERIODO ${formatearPeriodo(periodoStr)}`,
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
      refetchMetricasCuenta();
      refetchMetricasLote();
    } catch (e) {
      console.error("Error al registrar pago:", e);
    }
  };

  // 📉 4. Emisión Masiva de Cuotas
  const emitirCuotasMensuales = async (periodoStr) => {
    console.log(
      `[Escuela] Iniciando emisión masiva de cuotas para periodo: ${periodoStr}`,
    );

    try {
      await EmitirCuotasMasivasApi({
        tipoEntidad: "ALUM",
        diaVencimiento: 10,
        formulaMonto: formulaCuota,
        formulaInteres: formulaInteres,
        periodo: periodoStr, // Enviamos el periodo seleccionado
        codigoCtaCte,
        codigoIngreso,
      });

      agregarAlerta({
        title: "Éxito",
        message: `Se han emitido las cuotas para el periodo ${formatearPeriodo(periodoStr)} correctamente.`,
        type: "success",
      });

      refetch();
      refetchMovs();
      refetchMetricasCuenta();
      refetchMetricasLote();
    } catch (e) {
      console.error("Error en la emisión masiva:", e);
      agregarAlerta({
        title: "Error",
        message: "No se pudo completar la emisión masiva.",
        type: "error",
      });
    }
  };

  // 📈 5. Carga Masiva de Intereses
  const cargarInteresesMensuales = async (periodoStr) => {
    console.log(
      `[Escuela] Iniciando carga masiva de intereses para periodo: ${periodoStr}`,
    );

    try {
      await CargarInteresMasivaApi({
        tipoEntidad: "ALUM",
        formulaInteres: formulaInteres,
        periodo: periodoStr, // Enviamos el periodo seleccionado
      });

      agregarAlerta({
        title: "Éxito",
        message: `Se han grabado los intereses acumulados para el periodo ${formatearPeriodo(periodoStr)} correctamente.`,
        type: "success",
      });

      refetch();
      refetchMovs();
      refetchMetricasCuenta();
      refetchMetricasLote();
    } catch (e) {
      console.error("Error en la carga masiva de intereses:", e);
      agregarAlerta({
        title: "Error",
        message: "No se pudo completar la carga masiva de intereses.",
        type: "error",
      });
    }
  };

  // 📊 6. Emisión Individual de Cuota
  const emitirCuotaIndividual = async (alumnoId, periodoStr, monto, concepto, fechaVencimiento) => {
    try {
      await EmitirCuotasMasivasApi({
        tipoEntidad: "ALUM",
        diaVencimiento: 10,
        formulaMonto: String(monto),
        formulaInteres: formulaInteres,
        periodo: periodoStr,
        codigoContacto: Number(alumnoId),
        codigoCtaCte,
        codigoIngreso,
      });

      agregarAlerta({
        title: "Cuota Emitida",
        message: "Se ha generado la cuota contable individual correctamente.",
        type: "success",
      });

      refetch();
      refetchMovs();
      refetchMetricasCuenta();
      refetchMetricasLote();
    } catch (e) {
      console.error("Error al emitir cuota individual:", e);
      agregarAlerta({
        title: "Error",
        message: "No se pudo emitir la cuota contable individual.",
        type: "error",
      });
    }
  };

  // 📊 Estadísticas generales
  const obtenerEstadisticas = () => {
    if (metricasLote?.stats) {
      return metricasLote.stats;
    }

    const totalAlumnos = alumnosConCuotas.length;
    const activos = alumnosConCuotas.filter((a) => a.activo).length;

    const totalDeudaProyectada = alumnosConCuotas.reduce((sum, a) => {
      const deudaAlumno = Object.values(a.cuotas)
        .filter((c) => c.estado === "vencido")
        .reduce((s, c) => s + c.monto, 0);
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
    mesSeleccionado,
    setMesSeleccionado,
    cargandoAlumnos: cargandoContactos || cargandoMovimientos || cargandoMetricasCuenta || cargandoMetricasLote,
    obtenerEstadisticas,
    registrarPago,
    emitirCuotasMensuales,
    cargarInteresesMensuales,
    emitirCuotaIndividual,
    refetchAlumnos: refetch,
    refetchMovimientos: () => {
      refetchMovs();
      refetchMetricasCuenta();
      refetchMetricasLote();
    },
    movimientos: todosLosMovimientos,
    paginas,
    paginaActual,
    total,
    setPagina,
    codigoCtaCte,
    metricasCuenta: metricasCuenta || null,
    metricasLote: metricasLote || null,
  };
};
