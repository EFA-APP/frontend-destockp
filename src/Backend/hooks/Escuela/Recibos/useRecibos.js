import { useState, useMemo } from "react";

export const useRecibos = () => {
  // 📋 Datos de ejemplo - En producción vendrían de una API
  const [alumnos] = useState([
    {
      id: 1,
      nombre: "Lucía Gómez",
      dni: "45123456",
      curso: "5° A",
      montoCuota: 15000,
      descuento: 20,
    },
    {
      id: 2,
      nombre: "Juan Pérez",
      dni: "43123478",
      curso: "4° B",
      montoCuota: 18000,
      descuento: 0,
    },
    {
      id: 3,
      nombre: "Sofía López",
      dni: "47111222",
      curso: "6° A",
      montoCuota: 16000,
      descuento: 0,
    },
  ]);

  const [recibos, setRecibos] = useState([
    {
      id: 1,
      numero: "00001",
      prefijo: "R",
      fecha: "2024-01-08",
      alumnoId: 1,
      alumnoNombre: "Lucía Gómez",
      alumnoDni: "45123456",
      curso: "5° A",
      concepto: "Cuota Enero 2024",
      periodo: "2024-01",
      montoCuota: 15000,
      descuento: 20,
      montoDescuento: 3000,
      interes: 0,
      montoInteres: 0,
      subtotal: 12000,
      total: 12000,
      metodoPago: "Transferencia",
      estado: "pagado",
      observaciones: "Beca 20% por promedio",
      fechaVencimiento: "2024-01-10",
      diasAtraso: 0,
      responsable: "María Gómez",
      responsableDni: "30111222",
    },
    {
      id: 2,
      numero: "00002",
      prefijo: "R",
      fecha: "2024-01-10",
      alumnoId: 2,
      alumnoNombre: "Juan Pérez",
      alumnoDni: "43123478",
      curso: "4° B",
      concepto: "Cuota Enero 2024",
      periodo: "2024-01",
      montoCuota: 18000,
      descuento: 0,
      montoDescuento: 0,
      interes: 0,
      montoInteres: 0,
      subtotal: 18000,
      total: 18000,
      metodoPago: "Efectivo",
      estado: "pagado",
      observaciones: "",
      fechaVencimiento: "2024-01-10",
      diasAtraso: 0,
      responsable: "Carlos Pérez",
      responsableDni: "28123456",
    },
    {
      id: 3,
      numero: "00003",
      prefijo: "R",
      fecha: "2024-02-12",
      alumnoId: 2,
      alumnoNombre: "Juan Pérez",
      alumnoDni: "43123478",
      curso: "4° B",
      concepto: "Cuota Febrero 2024",
      periodo: "2024-02",
      montoCuota: 18000,
      descuento: 0,
      montoDescuento: 0,
      interes: 0,
      montoInteres: 0,
      subtotal: 18000,
      total: 18000,
      metodoPago: "Transferencia",
      estado: "pagado",
      observaciones: "",
      fechaVencimiento: "2024-02-10",
      diasAtraso: 2,
      responsable: "Carlos Pérez",
      responsableDni: "28123456",
    },
    {
      id: 4,
      numero: "00004",
      prefijo: "R",
      fecha: "2024-03-25",
      alumnoId: 2,
      alumnoNombre: "Juan Pérez",
      alumnoDni: "43123478",
      curso: "4° B",
      concepto: "Cuota Marzo 2024",
      periodo: "2024-03",
      montoCuota: 18000,
      descuento: 0,
      montoDescuento: 0,
      interes: 2,
      montoInteres: 360,
      subtotal: 18000,
      total: 18360,
      metodoPago: "Efectivo",
      estado: "pagado",
      observaciones: "Pago con mora - 15 días de atraso",
      fechaVencimiento: "2024-03-10",
      diasAtraso: 15,
      responsable: "Carlos Pérez",
      responsableDni: "28123456",
    },
    {
      id: 5,
      numero: "00005",
      prefijo: "R",
      fecha: "2024-01-15",
      alumnoId: 3,
      alumnoNombre: "Sofía López",
      alumnoDni: "47111222",
      curso: "6° A",
      concepto: "Cuota Enero 2024",
      periodo: "2024-01",
      montoCuota: 16000,
      descuento: 0,
      montoDescuento: 0,
      interes: 0,
      montoInteres: 0,
      subtotal: 16000,
      total: 16000,
      metodoPago: "Transferencia",
      estado: "pagado",
      observaciones: "",
      fechaVencimiento: "2024-01-15",
      diasAtraso: 0,
      responsable: "Laura López",
      responsableDni: "29111999",
    },
    {
      id: 6,
      numero: "00006",
      prefijo: "R",
      fecha: "2024-12-28",
      alumnoId: 1,
      alumnoNombre: "Lucía Gómez",
      alumnoDni: "45123456",
      curso: "5° A",
      concepto: "Cuota Diciembre 2024",
      periodo: "2024-12",
      montoCuota: 15000,
      descuento: 20,
      montoDescuento: 3000,
      interes: 0,
      montoInteres: 0,
      subtotal: 12000,
      total: 12000,
      metodoPago: "Mercado Pago",
      estado: "pagado",
      observaciones: "",
      fechaVencimiento: "2024-12-10",
      diasAtraso: 18,
      responsable: "María Gómez",
      responsableDni: "30111222",
    },
  ]);

  // 🔍 Estados de filtrado
  const [busqueda, setBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState("TODOS");
  const [estadoRecibo, setEstadoRecibo] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("TODOS");

  // 📊 Filtrado de recibos
  const recibosFiltrados = useMemo(() => {
    return recibos.filter((recibo) => {
      // Búsqueda general
      const textoBusqueda = busqueda.toLowerCase();
      const coincideBusqueda =
        !busqueda ||
        recibo.numero.includes(textoBusqueda) ||
        recibo.alumnoNombre.toLowerCase().includes(textoBusqueda) ||
        recibo.alumnoDni.includes(textoBusqueda) ||
        recibo.curso.toLowerCase().includes(textoBusqueda) ||
        recibo.concepto.toLowerCase().includes(textoBusqueda);

      // Filtro de método de pago
      const coincideMetodo =
        metodoPago === "TODOS" || recibo.metodoPago === metodoPago;

      // Filtro de estado
      const coincideEstado =
        estadoRecibo === "TODOS" || recibo.estado === estadoRecibo;

      // Filtro de fecha desde
      const coincideFechaDesde =
        !fechaDesde || new Date(recibo.fecha) >= new Date(fechaDesde);

      // Filtro de fecha hasta
      const coincideFechaHasta =
        !fechaHasta || new Date(recibo.fecha) <= new Date(fechaHasta);

      // Filtro de período
      const coincidePeriodo =
        periodoSeleccionado === "TODOS" ||
        recibo.periodo === periodoSeleccionado;

      return (
        coincideBusqueda &&
        coincideMetodo &&
        coincideEstado &&
        coincideFechaDesde &&
        coincideFechaHasta &&
        coincidePeriodo
      );
    });
  }, [
    recibos,
    busqueda,
    metodoPago,
    estadoRecibo,
    fechaDesde,
    fechaHasta,
    periodoSeleccionado,
  ]);

  // 📈 Estadísticas
  const obtenerEstadisticas = () => {
    const totalRecaudado = recibosFiltrados.reduce(
      (sum, r) => sum + r.total,
      0
    );
    const totalDescuentos = recibosFiltrados.reduce(
      (sum, r) => sum + r.montoDescuento,
      0
    );
    const totalIntereses = recibosFiltrados.reduce(
      (sum, r) => sum + r.montoInteres,
      0
    );
    const recibosConMora = recibosFiltrados.filter(
      (r) => r.diasAtraso > 0
    ).length;

    // Recaudación por método de pago
    const recaudacionPorMetodo = recibosFiltrados.reduce((acc, r) => {
      acc[r.metodoPago] = (acc[r.metodoPago] || 0) + r.total;
      return acc;
    }, {});

    // Promedio días de atraso
    const totalDiasAtraso = recibosFiltrados.reduce(
      (sum, r) => sum + r.diasAtraso,
      0
    );
    const promedioDiasAtraso =
      recibosFiltrados.length > 0
        ? (totalDiasAtraso / recibosFiltrados.length).toFixed(1)
        : 0;

    return {
      totalRecibos: recibosFiltrados.length,
      totalRecaudado,
      totalDescuentos,
      totalIntereses,
      recibosConMora,
      recaudacionPorMetodo,
      promedioDiasAtraso,
    };
  };

  // 💳 Generar nuevo recibo
  const generarRecibo = (datos) => {
    const alumno = alumnos.find((a) => a.id === datos.alumnoId);
    if (!alumno) return null;

    const montoDescuento = (alumno.montoCuota * alumno.descuento) / 100;
    const subtotal = alumno.montoCuota - montoDescuento;
    const montoInteres = datos.interes
      ? (subtotal * datos.tasaInteres) / 100
      : 0;
    const total = subtotal + montoInteres;

    const nuevoRecibo = {
      id: recibos.length + 1,
      numero: String(recibos.length + 1).padStart(5, "0"),
      prefijo: "R",
      fecha: datos.fecha || new Date().toISOString().split("T")[0],
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre,
      alumnoDni: alumno.dni,
      curso: alumno.curso,
      concepto: datos.concepto,
      periodo: datos.periodo,
      montoCuota: alumno.montoCuota,
      descuento: alumno.descuento,
      montoDescuento,
      interes: datos.tasaInteres || 0,
      montoInteres,
      subtotal,
      total,
      metodoPago: datos.metodoPago,
      estado: "pagado",
      observaciones: datos.observaciones || "",
      fechaVencimiento: datos.fechaVencimiento,
      diasAtraso: datos.diasAtraso || 0,
      responsable: datos.responsable,
      responsableDni: datos.responsableDni,
    };

    setRecibos((prev) => [...prev, nuevoRecibo]);
    return nuevoRecibo;
  };

  // 🔍 Obtener recibo por número
  const obtenerRecibo = (numero) => {
    return recibos.find((r) => r.numero === numero);
  };

  // ❌ Anular recibo
  const anularRecibo = (id) => {
    const recibo = recibos.find((r) => r.id === id);
    if (!recibo) return false;

    if (
      window.confirm(
        `¿Anular recibo ${recibo.prefijo}-${recibo.numero}?\n\nAlumno: ${
          recibo.alumnoNombre
        }\nMonto: $${recibo.total.toLocaleString()}`
      )
    ) {
      setRecibos((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "anulado" } : r))
      );
      return true;
    }
    return false;
  };

  // 📄 Ver detalle
  const manejarDetalle = (id) => {
    const recibo = recibos.find((r) => r.id === id);
    console.log("Detalle del recibo:", recibo);
    // Aquí podrías abrir un modal o navegar a una página de detalle
  };

  // 🖨️ Imprimir/Descargar recibo
  const manejarImprimir = (id) => {
    const recibo = recibos.find((r) => r.id === id);
    console.log("Imprimir recibo:", recibo);
    // Aquí implementarías la lógica de impresión/PDF
  };

  return {
    recibos: recibosFiltrados,
    busqueda,
    setBusqueda,
    metodoPago,
    setMetodoPago,
    estadoRecibo,
    setEstadoRecibo,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    periodoSeleccionado,
    setPeriodoSeleccionado,
    obtenerEstadisticas,
    generarRecibo,
    obtenerRecibo,
    anularRecibo,
    manejarDetalle,
    manejarImprimir,
    alumnos,
  };
};
