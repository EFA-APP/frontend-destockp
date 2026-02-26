import { useState, useMemo } from "react";

export const useAlumnos = () => {
  const [alumnos, setAlumnos] = useState([
    {
      id: 1,
      codigo: "A001",
      nombre: "Lucía",
      apellido: "Gómez",
      dni: "45123456",
      curso: "5° A",
      estado: "suspendido",

      // Responsable de pago
      responsableNombre: "María Gómez",
      responsableDni: "30111222",
      responsableTelefono: "3815558888",

      // Contacto
      email: "lucia@gmail.com",
      telefono: "3815558888",
      direccion: "Belgrano 456",

      // Configuración de cuotas
      montoCuota: 15000,
      descuento: 20,
      diaVencimiento: 10,
      aplicarInteres: true,
      tasaInteres: 2,
      matricula: 50000,
      observaciones: "Beca 20% por promedio destacado",

      fechaIngreso: "2024-03-01",
    },
    {
      id: 2,
      codigo: "A002",
      nombre: "Juan",
      apellido: "Pérez",
      dni: "43123478",
      curso: "4° B",
      estado: "activo",

      responsableNombre: "Carlos Pérez",
      responsableDni: "28123456",
      responsableTelefono: "3815551234",

      email: "juan.perez@gmail.com",
      telefono: "3815551234",
      direccion: "San Martín 123",

      montoCuota: 18000,
      descuento: 0,
      diaVencimiento: 10,
      aplicarInteres: true,
      tasaInteres: 2,
      matricula: 50000,
      observaciones: "",

      fechaIngreso: "2023-08-15",
    },
    {
      id: 3,
      codigo: "A003",
      nombre: "Sofía",
      apellido: "López",
      dni: "47111222",
      curso: "6° A",
      estado: "activo",

      responsableNombre: "Laura López",
      responsableDni: "29111999",
      responsableTelefono: "3815556677",

      email: "sofia.lopez@gmail.com",
      telefono: "3815556677",
      direccion: "Rivadavia 890",

      montoCuota: 16000,
      descuento: 0,
      diaVencimiento: 15,
      aplicarInteres: true,
      tasaInteres: 2.5,
      matricula: 50000,
      observaciones: "",

      fechaIngreso: "2022-03-10",
    },
    {
      id: 4,
      codigo: "A004",
      nombre: "Mateo",
      apellido: "Fernández",
      dni: "44199887",
      curso: "3° A",
      estado: "activo",

      responsableNombre: "Ana Fernández",
      responsableDni: "30123489",
      responsableTelefono: "3815554455",

      email: "mateo.fernandez@gmail.com",
      telefono: "3815554455",
      direccion: "Av. Mitre 234",

      montoCuota: 14000,
      descuento: 50,
      diaVencimiento: 10,
      aplicarInteres: true,
      tasaInteres: 2,
      matricula: 25000,
      observaciones: "50% de descuento por hermano en la institución",

      fechaIngreso: "2024-02-01",
    },
    {
      id: 5,
      codigo: "A005",
      nombre: "Valentina",
      apellido: "Ruiz",
      dni: "46123499",
      curso: "2° B",
      estado: "suspendido",

      responsableNombre: "Jorge Ruiz",
      responsableDni: "27111222",
      responsableTelefono: "3815557788",

      email: "valentina.ruiz@gmail.com",
      telefono: "3815557788",
      direccion: "Lavalle 567",

      montoCuota: 15000,
      descuento: 0,
      diaVencimiento: 10,
      aplicarInteres: true,
      tasaInteres: 2,
      matricula: 50000,
      observaciones: "Suspendido por falta de pago - 3 cuotas adeudadas",

      fechaIngreso: "2023-03-20",
    },
    {
      id: 6,
      codigo: "A006",
      nombre: "Tomás",
      apellido: "Morales",
      dni: "42111987",
      curso: "1° A",
      estado: "baja",

      responsableNombre: "Paula Morales",
      responsableDni: "31122333",
      responsableTelefono: "3815559900",

      email: "tomas.morales@gmail.com",
      telefono: "3815559900",
      direccion: "España 1023",

      montoCuota: 13000,
      descuento: 0,
      diaVencimiento: 5,
      aplicarInteres: false,
      tasaInteres: 0,
      matricula: 50000,
      observaciones: "Baja por cambio de domicilio",

      fechaIngreso: "2024-04-05",
    },
  ]);

  // 📅 Registro de pagos (simula una base de datos)
  const [registroPagos, setRegistroPagos] = useState([
    // Ejemplo: Lucía pagó Enero
    {
      alumnoId: 1,
      mes: 0,
      fechaPago: "2024-01-08",
      metodoPago: "Transferencia",
      numeroRecibo: "R-00001",
      monto: 12000,
    },
    // Juan pagó Enero y Febrero
    {
      alumnoId: 2,
      mes: 0,
      fechaPago: "2024-01-10",
      metodoPago: "Efectivo",
      numeroRecibo: "R-00002",
      monto: 18000,
    },
    {
      alumnoId: 2,
      mes: 1,
      fechaPago: "2024-02-12",
      metodoPago: "Transferencia",
      numeroRecibo: "R-00003",
      monto: 18000,
    },
    {
      alumnoId: 2,
      mes: 2,
      fechaPago: "2024-03-15",
      metodoPago: "Efectivo",
      numeroRecibo: "R-00004",
      monto: 18000,
    },
    // Sofía pagó Enero, Febrero y Marzo
    {
      alumnoId: 3,
      mes: 0,
      fechaPago: "2024-01-15",
      metodoPago: "Transferencia",
      numeroRecibo: "R-00005",
      monto: 16000,
    },
    {
      alumnoId: 3,
      mes: 1,
      fechaPago: "2024-02-16",
      metodoPago: "Efectivo",
      numeroRecibo: "R-00006",
      monto: 16000,
    },
    {
      alumnoId: 3,
      mes: 2,
      fechaPago: "2024-03-18",
      metodoPago: "Transferencia",
      numeroRecibo: "R-00007",
      monto: 16000,
    },
    // Mateo pagó solo Enero y Febrero
    {
      alumnoId: 4,
      mes: 0,
      fechaPago: "2024-01-12",
      metodoPago: "Efectivo",
      numeroRecibo: "R-00008",
      monto: 7000,
    },
    {
      alumnoId: 4,
      mes: 1,
      fechaPago: "2024-02-14",
      metodoPago: "Transferencia",
      numeroRecibo: "R-00009",
      monto: 7000,
    },
  ]);

  const [busqueda, setBusqueda] = useState("");

  // 🗓️ Fecha actual (simular para pruebas)
  const fechaActual = new Date("2024-04-02"); // Cambia esto para simular diferentes fechas

  // 💰 Calcular monto con descuento
  const calcularMontoFinal = (montoCuota, descuento) => {
    return montoCuota - (montoCuota * descuento) / 100;
  };

  // 📅 Generar fecha de vencimiento para un mes
  const generarFechaVencimiento = (año, mes, diaVencimiento) => {
    return new Date(año, mes, diaVencimiento);
  };

  // 🔍 Verificar si una cuota está vencida
  const estaVencida = (fechaVencimiento) => {
    return fechaActual > fechaVencimiento;
  };

  // 🧮 Calcular interés por mora
  const calcularInteresMora = (montoBase, tasaInteres, mesesVencidos) => {
    if (mesesVencidos <= 0) return 0;
    return montoBase * (tasaInteres / 100) * mesesVencidos;
  };

  // 📊 Generar cuotas para cada alumno (calculado dinámicamente)
  const alumnosConCuotas = useMemo(() => {
    return alumnos.map((alumno) => {
      const cuotas = {};
      const montoFinal = calcularMontoFinal(
        alumno.montoCuota,
        alumno.descuento
      );

      // Generar cuotas para 12 meses
      for (let mes = 0; mes < 12; mes++) {
        const fechaVencimiento = generarFechaVencimiento(
          2024,
          mes,
          alumno.diaVencimiento
        );
        const pago = registroPagos.find(
          (p) => p.alumnoId === alumno.id && p.mes === mes
        );

        let estado = "pendiente";
        let interes = 0;

        if (pago) {
          estado = "pagado";
        } else if (estaVencida(fechaVencimiento)) {
          estado = "vencido";
          // Calcular interés solo si aplica
          if (alumno.aplicarInteres) {
            const mesesVencidos = Math.floor(
              (fechaActual - fechaVencimiento) / (1000 * 60 * 60 * 24 * 30)
            );
            interes = calcularInteresMora(
              montoFinal,
              alumno.tasaInteres,
              mesesVencidos
            );
          }
        }

        cuotas[mes] = {
          estado,
          monto: montoFinal,
          montoConInteres: montoFinal + interes,
          interes,
          fechaVencimiento: fechaVencimiento.toISOString().split("T")[0],
          fechaPago: pago?.fechaPago || null,
          metodoPago: pago?.metodoPago || null,
          numeroRecibo: pago?.numeroRecibo || null,
        };
      }

      // Calcular estado general y cuotas adeudadas
      const cuotasArray = Object.values(cuotas);
      const cuotasVencidas = cuotasArray.filter(
        (c) => c.estado === "vencido"
      ).length;
      const cuotasPendientes = cuotasArray.filter(
        (c) =>
          c.estado === "pendiente" && !estaVencida(new Date(c.fechaVencimiento))
      ).length;

      let estadoCuota = "al_dia";
      if (cuotasVencidas > 0) {
        estadoCuota = "vencido";
      } else if (cuotasPendientes > 0) {
        estadoCuota = "pendiente";
      }

      return {
        ...alumno,
        cuotas,
        estadoCuota,
        cuotasAdeudadas: cuotasVencidas,
      };
    });
  }, [alumnos, registroPagos, fechaActual]);

  // 🔍 Filtro mejorado
  const alumnosFiltrados = alumnosConCuotas.filter((a) => {
    const texto = busqueda.toLowerCase();
    return (
      a.nombre.toLowerCase().includes(texto) ||
      a.apellido.toLowerCase().includes(texto) ||
      a.dni.includes(texto) ||
      a.codigo.toLowerCase().includes(texto) ||
      a.curso.toLowerCase().includes(texto) ||
      a.responsableNombre.toLowerCase().includes(texto)
    );
  });

  // 💳 Registrar un pago
  const registrarPago = (alumnoId, mes, datosPago) => {
    const alumno = alumnos.find((a) => a.id === alumnoId);
    if (!alumno) return;

    const montoFinal = calcularMontoFinal(alumno.montoCuota, alumno.descuento);
    const numeroRecibo = `R-${String(registroPagos.length + 1).padStart(
      5,
      "0"
    )}`;

    const nuevoPago = {
      alumnoId,
      mes,
      fechaPago: datosPago.fechaPago || new Date().toISOString().split("T")[0],
      metodoPago: datosPago.metodoPago || "Efectivo",
      numeroRecibo,
      monto: datosPago.monto || montoFinal,
      observaciones: datosPago.observaciones || "",
    };

    setRegistroPagos((prev) => [...prev, nuevoPago]);

    // Si tenía cuotas adeudadas, actualizar estado del alumno
    const alumnoActualizado = alumnosConCuotas.find((a) => a.id === alumnoId);
    if (alumnoActualizado && alumnoActualizado.cuotasAdeudadas > 0) {
      // Si pagó la última cuota vencida, cambiar estado a activo
      const cuotasVencidasRestantes = Object.values(
        alumnoActualizado.cuotas
      ).filter((c, idx) => c.estado === "vencido" && idx !== mes).length;

      if (cuotasVencidasRestantes === 0 && alumno.estado === "suspendido") {
        setAlumnos((prev) =>
          prev.map((a) => (a.id === alumnoId ? { ...a, estado: "activo" } : a))
        );
      }
    }

    return nuevoPago;
  };

  // ➕ Agregar alumno
  const agregarAlumno = (data) => {
    const nuevoAlumno = {
      id: alumnos.length + 1,
      codigo: `A${String(alumnos.length + 1).padStart(3, "0")}`,
      ...data,
      fechaIngreso: new Date().toISOString().split("T")[0],
      estado: data.estado || "activo",
    };

    setAlumnos((prev) => [...prev, nuevoAlumno]);
    return nuevoAlumno;
  };

  // ✏️ Editar alumno
  const manejarEditar = (id, data) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  };

  // 🗑️ Eliminar alumno
  const manejarEliminar = (id) => {
    const alumno = alumnosConCuotas.find((a) => a.id === id);
    const mensaje =
      alumno.cuotasAdeudadas > 0
        ? `¿Eliminar a ${alumno.nombre} ${alumno.apellido}?\n\nATENCIÓN: Adeuda ${alumno.cuotasAdeudadas} cuota(s).`
        : `¿Eliminar a ${alumno.nombre} ${alumno.apellido}?`;

    if (window.confirm(mensaje)) {
      setAlumnos((prev) => prev.filter((a) => a.id !== id));
      // También eliminar sus pagos
      setRegistroPagos((prev) => prev.filter((p) => p.alumnoId !== id));
    }
  };

  // 📊 Ver detalle de alumno
  const manejarDetalle = (id) => {
    const alumno = alumnosConCuotas.find((a) => a.id === id);
    console.log("Detalle del alumno:", alumno);
  };

  // 📈 Estadísticas generales
  const obtenerEstadisticas = () => {
    const totalAlumnos = alumnosConCuotas.length;
    const activos = alumnosConCuotas.filter(
      (a) => a.estado === "activo"
    ).length;
    const suspendidos = alumnosConCuotas.filter(
      (a) => a.estado === "suspendido"
    ).length;

    const totalDeuda = alumnosConCuotas.reduce((sum, a) => {
      const deudaAlumno = Object.values(a.cuotas)
        .filter((c) => c.estado === "vencido")
        .reduce((s, c) => s + c.montoConInteres, 0);
      return sum + deudaAlumno;
    }, 0);

    const alumnosConDeuda = alumnosConCuotas.filter(
      (a) => a.cuotasAdeudadas > 0
    ).length;

    // Estadísticas de recaudación
    const totalRecaudado = registroPagos.reduce((sum, p) => sum + p.monto, 0);
    const recaudacionMesActual = registroPagos
      .filter((p) => {
        const fechaPago = new Date(p.fechaPago);
        return (
          fechaPago.getMonth() === fechaActual.getMonth() &&
          fechaPago.getFullYear() === fechaActual.getFullYear()
        );
      })
      .reduce((sum, p) => sum + p.monto, 0);

    return {
      totalAlumnos,
      activos,
      suspendidos,
      totalDeuda,
      alumnosConDeuda,
      totalRecaudado,
      recaudacionMesActual,
      totalPagos: registroPagos.length,
    };
  };

  // 📄 Obtener recibo por ID
  const obtenerRecibo = (numeroRecibo) => {
    const pago = registroPagos.find((p) => p.numeroRecibo === numeroRecibo);
    if (!pago) return null;

    const alumno = alumnosConCuotas.find((a) => a.id === pago.alumnoId);
    return {
      ...pago,
      alumno,
    };
  };

  return {
    alumnos: alumnosFiltrados,
    alumnosCompletos: alumnosConCuotas, // Para la tabla de cuotas
    busqueda,
    setBusqueda,
    agregarAlumno,
    manejarEditar,
    manejarEliminar,
    manejarDetalle,
    calcularMontoFinal,
    obtenerEstadisticas,
    registrarPago,
    obtenerRecibo,
    registroPagos,
  };
};
