import { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { AgregarIcono } from "../../../../assets/Icons";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearRecibo = () => {
  const [numeroRecibo] = useState({
    prefijo: "R",
    numero: "00007",
  });

  // Lista de alumnos (simulada - en producción vendría de useAlumnos)
  const alumnos = [
    {
      id: 1,
      nombre: "Lucía Gómez",
      dni: "45123456",
      curso: "5° A",
      montoCuota: 15000,
      descuento: 20,
      responsable: "María Gómez",
      responsableDni: "30111222",
      aplicarInteres: true,
      tasaInteres: 2,
    },
    {
      id: 2,
      nombre: "Juan Pérez",
      dni: "43123478",
      curso: "4° B",
      montoCuota: 18000,
      descuento: 0,
      responsable: "Carlos Pérez",
      responsableDni: "28123456",
      aplicarInteres: true,
      tasaInteres: 2,
    },
    {
      id: 3,
      nombre: "Sofía López",
      dni: "47111222",
      curso: "6° A",
      montoCuota: 16000,
      descuento: 0,
      responsable: "Laura López",
      responsableDni: "29111999",
      aplicarInteres: true,
      tasaInteres: 2.5,
    },
    {
      id: 4,
      nombre: "Mateo Fernández",
      dni: "44199887",
      curso: "3° A",
      montoCuota: 14000,
      descuento: 50,
      responsable: "Ana Fernández",
      responsableDni: "30123489",
      aplicarInteres: true,
      tasaInteres: 2,
    },
  ];

  // Periodos disponibles
  const periodos = [
    { value: "2024-01", label: "Enero 2024" },
    { value: "2024-02", label: "Febrero 2024" },
    { value: "2024-03", label: "Marzo 2024" },
    { value: "2024-04", label: "Abril 2024" },
    { value: "2024-05", label: "Mayo 2024" },
    { value: "2024-06", label: "Junio 2024" },
    { value: "2024-07", label: "Julio 2024" },
    { value: "2024-08", label: "Agosto 2024" },
    { value: "2024-09", label: "Septiembre 2024" },
    { value: "2024-10", label: "Octubre 2024" },
    { value: "2024-11", label: "Noviembre 2024" },
    { value: "2024-12", label: "Diciembre 2024" },
  ];

  // Función para calcular totales
  const calcularTotales = (alumnoId, aplicarInteresBoolean, diasAtraso) => {
    const alumno = alumnos.find((a) => a.id === parseInt(alumnoId));
    if (!alumno) return { subtotal: 0, descuento: 0, interes: 0, total: 0 };

    const montoDescuento = (alumno.montoCuota * alumno.descuento) / 100;
    const subtotal = alumno.montoCuota - montoDescuento;

    let montoInteres = 0;
    if (aplicarInteresBoolean && diasAtraso > 0) {
      // Calcular interés por días de atraso
      const mesesAtraso = Math.ceil(diasAtraso / 30);
      montoInteres = subtotal * (alumno.tasaInteres / 100) * mesesAtraso;
    }

    const total = subtotal + montoInteres;

    return {
      montoCuota: alumno.montoCuota,
      porcentajeDescuento: alumno.descuento,
      montoDescuento,
      subtotal,
      tasaInteres: alumno.tasaInteres,
      montoInteres,
      total,
    };
  };

  const camposRecibo = [
    // ═══════════════════════════════════════
    // DATOS DEL RECIBO
    // ═══════════════════════════════════════
    {
      name: "prefijo",
      label: "Prefijo",
      type: "text",
      required: true,
      defaultValue: numeroRecibo.prefijo,
      readOnly: true,
      section: "Recibo",
    },
    {
      name: "numeroRecibo",
      label: "Número de Recibo",
      type: "text",
      required: true,
      defaultValue: numeroRecibo.numero,
      readOnly: true,
      section: "Recibo",
      helpText: "Número automático generado por el sistema",
    },
    {
      name: "fechaPago",
      label: "Fecha de Pago",
      type: "date",
      required: true,
      defaultValue: new Date().toISOString().split("T")[0],
      section: "Recibo",
    },

    // ═══════════════════════════════════════
    // DATOS DEL ALUMNO
    // ═══════════════════════════════════════
    {
      name: "alumnoId",
      label: "Alumno",
      type: "select",
      required: true,
      section: "Alumno",
      options: [
        { value: "", label: "-- Seleccionar Alumno --" },
        ...alumnos.map((a) => ({
          value: a.id,
          label: `${a.nombre} - ${a.dni} - ${a.curso}`,
        })),
      ],
      helpText: "Seleccione el alumno que realiza el pago",
      onChange: (value, formData, setFieldValue) => {
        // Cuando selecciona un alumno, cargar sus datos automáticamente
        const alumno = alumnos.find((a) => a.id === parseInt(value));
        if (alumno) {
          setFieldValue("alumnoDni", alumno.dni);
          setFieldValue("curso", alumno.curso);
          setFieldValue("responsable", alumno.responsable);
          setFieldValue("responsableDni", alumno.responsableDni);

          // Calcular totales iniciales
          const totales = calcularTotales(value, false, 0);
          setFieldValue("montoCuota", totales.montoCuota);
          setFieldValue("descuento", totales.porcentajeDescuento);
          setFieldValue("montoDescuento", totales.montoDescuento);
          setFieldValue("subtotal", totales.subtotal);
          setFieldValue("total", totales.total);
        }
      },
    },
    {
      name: "alumnoDni",
      label: "DNI del Alumno",
      type: "text",
      readOnly: true,
      section: "Alumno",
    },
    {
      name: "curso",
      label: "Curso",
      type: "text",
      readOnly: true,
      section: "Alumno",
    },
    {
      name: "responsable",
      label: "Responsable de Pago",
      type: "text",
      readOnly: true,
      section: "Alumno",
    },
    {
      name: "responsableDni",
      label: "DNI del Responsable",
      type: "text",
      readOnly: true,
      section: "Alumno",
    },

    // ═══════════════════════════════════════
    // CONCEPTO Y PERÍODO
    // ═══════════════════════════════════════
    {
      name: "periodo",
      label: "Período de la Cuota",
      type: "select",
      required: true,
      section: "Concepto",
      options: [{ value: "", label: "-- Seleccionar Período --" }, ...periodos],
      helpText: "Mes al que corresponde el pago",
    },
    {
      name: "concepto",
      label: "Concepto",
      type: "text",
      required: true,
      defaultValue: "Cuota mensual",
      section: "Concepto",
      placeholder: "Ej: Cuota Enero 2024, Matrícula, etc.",
    },

    // ═══════════════════════════════════════
    // DATOS DEL PAGO
    // ═══════════════════════════════════════
    {
      name: "metodoPago",
      label: "Método de Pago",
      type: "select",
      required: true,
      defaultValue: "Efectivo",
      section: "Pago",
      options: [
        { value: "Efectivo", label: "Efectivo" },
        { value: "Transferencia", label: "Transferencia Bancaria" },
        { value: "Mercado Pago", label: "Mercado Pago" },
        { value: "Débito", label: "Tarjeta de Débito" },
        { value: "Crédito", label: "Tarjeta de Crédito" },
        { value: "Cheque", label: "Cheque" },
      ],
    },
    {
      name: "fechaVencimiento",
      label: "Fecha de Vencimiento Original",
      type: "date",
      section: "Pago",
      helpText: "Fecha en que vencía la cuota (para calcular mora)",
    },
    {
      name: "aplicarInteres",
      label: "¿Aplicar interés por mora?",
      type: "checkbox",
      defaultValue: false,
      section: "Pago",
      helpText: "Marcar si el pago se realiza fuera de término",
      onChange: (value, formData, setFieldValue) => {
        if (!value) {
          setFieldValue("montoInteres", 0);
          const totales = calcularTotales(formData.alumnoId, false, 0);
          setFieldValue("total", totales.subtotal);
        }
      },
    },
    {
      name: "diasAtraso",
      label: "Días de Atraso",
      type: "number",
      min: 0,
      defaultValue: 0,
      section: "Pago",
      helpText: "Cantidad de días transcurridos desde el vencimiento",
      dependsOn: "aplicarInteres",
      onChange: (value, formData, setFieldValue) => {
        if (formData.aplicarInteres && formData.alumnoId) {
          const totales = calcularTotales(
            formData.alumnoId,
            true,
            parseInt(value) || 0
          );
          setFieldValue("montoInteres", totales.montoInteres);
          setFieldValue("tasaInteres", totales.tasaInteres);
          setFieldValue("total", totales.total);
        }
      },
    },

    // ═══════════════════════════════════════
    // MONTOS (READ-ONLY, CALCULADOS)
    // ═══════════════════════════════════════
    {
      name: "montoCuota",
      label: "Monto de la Cuota",
      type: "number",
      readOnly: true,
      section: "Totales",
      prefix: "$",
    },
    {
      name: "descuento",
      label: "Descuento (%)",
      type: "number",
      readOnly: true,
      section: "Totales",
      suffix: "%",
    },
    {
      name: "montoDescuento",
      label: "Monto Descuento",
      type: "number",
      readOnly: true,
      section: "Totales",
      prefix: "$",
    },
    {
      name: "subtotal",
      label: "Subtotal (después de descuento)",
      type: "number",
      readOnly: true,
      section: "Totales",
      prefix: "$",
    },
    {
      name: "tasaInteres",
      label: "Tasa de Interés (%)",
      type: "number",
      readOnly: true,
      section: "Totales",
      suffix: "%",
      dependsOn: "aplicarInteres",
    },
    {
      name: "montoInteres",
      label: "Monto de Interés",
      type: "number",
      readOnly: true,
      section: "Totales",
      prefix: "$",
      dependsOn: "aplicarInteres",
    },
    {
      name: "total",
      label: "TOTAL A PAGAR",
      type: "number",
      readOnly: true,
      section: "Totales",
      prefix: "$",
      className: "text-2xl font-bold text-green-400",
    },

    // ═══════════════════════════════════════
    // OBSERVACIONES
    // ═══════════════════════════════════════
    {
      name: "observaciones",
      label: "Observaciones",
      type: "textarea",
      fullWidth: true,
      section: "Observaciones",
      placeholder: "Información adicional sobre el pago...",
      rows: 3,
    },
  ];

  const handleSubmit = (data) => {
    const alumno = alumnos.find((a) => a.id === parseInt(data.alumnoId));

    const reciboCompleto = {
      id: Date.now(),
      numero: data.numeroRecibo,
      prefijo: data.prefijo,
      numeroCompleto: `${data.prefijo}-${data.numeroRecibo}`,
      fecha: data.fechaPago,
      alumnoId: data.alumnoId,
      alumnoNombre: alumno.nombre,
      alumnoDni: data.alumnoDni,
      curso: data.curso,
      concepto: data.concepto,
      periodo: data.periodo,
      montoCuota: data.montoCuota,
      descuento: data.descuento,
      montoDescuento: data.montoDescuento,
      interes: data.tasaInteres || 0,
      montoInteres: data.montoInteres || 0,
      subtotal: data.subtotal,
      total: data.total,
      metodoPago: data.metodoPago,
      estado: "pagado",
      observaciones: data.observaciones || "",
      fechaVencimiento: data.fechaVencimiento || "",
      diasAtraso: data.diasAtraso || 0,
      responsable: data.responsable,
      responsableDni: data.responsableDni,
    };

    console.log("Recibo generado:", reciboCompleto);

    const mensajeMora =
      data.diasAtraso > 0
        ? `\n⚠️ Pago con ${
            data.diasAtraso
          } días de atraso\nInterés aplicado: $${data.montoInteres.toFixed(
            2
          )} (${data.tasaInteres}%)`
        : "\n✓ Pago realizado en término";

    alert(
      `✓ Recibo generado exitosamente\n\n` +
        `Recibo: ${reciboCompleto.numeroCompleto}\n` +
        `Alumno: ${reciboCompleto.alumnoNombre}\n` +
        `Concepto: ${reciboCompleto.concepto}\n` +
        `Período: ${new Date(reciboCompleto.periodo + "-01").toLocaleDateString(
          "es-AR",
          { month: "long", year: "numeric" }
        )}\n` +
        `Método: ${reciboCompleto.metodoPago}\n` +
        `Total: $${reciboCompleto.total.toFixed(2)}` +
        mensajeMora +
        `\n\nRevisa la consola para ver los detalles completos.`
    );
  };

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta="Crear Recibo de Cobranza"
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior="/panel/escuela/recibos"
        />
      </div>

      {/* Formulario de Recibo */}
      <FormularioDinamico
        titulo="Nuevo Recibo de Pago"
        subtitulo="Complete los datos del recibo de cobranza"
        campos={camposRecibo}
        onSubmit={handleSubmit}
        submitLabel="Generar Recibo"
      />
    </div>
  );
};

export default CrearRecibo;
