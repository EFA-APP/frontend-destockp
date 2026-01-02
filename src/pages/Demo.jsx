import React, { useState, useEffect } from "react";
import {
  Plus,
  BookOpen,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Calculator,
} from "lucide-react";

const SistemaContable = () => {
  const [activeTab, setActiveTab] = useState("plan");
  const [cuentas, setCuentas] = useState([]);
  const [asientos, setAsientos] = useState([]);
  const [nextAsientoNum, setNextAsientoNum] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cuentasData = localStorage.getItem("cuentas");
        const asientosData = localStorage.getItem("asientos");
        const asientoNumData = localStorage.getItem("nextAsientoNum");

        if (cuentasData) {
          setCuentas(JSON.parse(cuentasData.value));
        } else {
          setCuentas(getPlanCuentasInicial());
        }

        if (asientosData) {
          setAsientos(JSON.parse(asientosData.value));
        }

        if (asientoNumData) {
          setNextAsientoNum(JSON.parse(asientoNumData.value));
        }
      } catch (error) {
        setCuentas(getPlanCuentasInicial());
      }
    };

    loadInitialData();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    if (cuentas.length > 0) {
      localStorage.setItem("cuentas", JSON.stringify(cuentas));
    }
  }, [cuentas]);

  useEffect(() => {
    if (asientos.length > 0) {
      localStorage.setItem("asientos", JSON.stringify(asientos));
    }
  }, [asientos]);

  useEffect(() => {
    localStorage.setItem("nextAsientoNum", JSON.stringify(nextAsientoNum));
  }, [nextAsientoNum]);

  const getPlanCuentasInicial = () => [
    { codigo: "1", nombre: "ACTIVO", tipo: "titulo", nivel: 1, padre: null },

    {
      codigo: "1.1",
      nombre: "Activo Corriente",
      tipo: "subtitulo",
      nivel: 2,
      padre: "1",
    },
    {
      codigo: "1.1.1",
      nombre: "Caja EFA",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.1",
      naturaleza: "deudora",
    },
    {
      codigo: "1.1.2",
      nombre: "Banco EFA",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.1",
      naturaleza: "deudora",
    },
    {
      codigo: "1.1.3",
      nombre: "Alumnos Deudores",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.1",
      naturaleza: "deudora",
    },
    {
      codigo: "1.1.4",
      nombre: "Stock Producción (Mermeladas)",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.1",
      naturaleza: "deudora",
    },

    {
      codigo: "1.2",
      nombre: "Activo No Corriente",
      tipo: "subtitulo",
      nivel: 2,
      padre: "1",
    },
    {
      codigo: "1.2.1",
      nombre: "Muebles y Útiles",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.2",
      naturaleza: "deudora",
    },
    {
      codigo: "1.2.2",
      nombre: "Instalaciones del Colegio",
      tipo: "cuenta",
      nivel: 3,
      padre: "1.2",
      naturaleza: "deudora",
    },

    { codigo: "2", nombre: "PASIVO", tipo: "titulo", nivel: 1, padre: null },

    {
      codigo: "2.1",
      nombre: "Pasivo Corriente",
      tipo: "subtitulo",
      nivel: 2,
      padre: "2",
    },
    {
      codigo: "2.1.1",
      nombre: "Proveedores",
      tipo: "cuenta",
      nivel: 3,
      padre: "2.1",
      naturaleza: "acreedora",
    },
    {
      codigo: "2.1.2",
      nombre: "Sueldos a Pagar",
      tipo: "cuenta",
      nivel: 3,
      padre: "2.1",
      naturaleza: "acreedora",
    },

    {
      codigo: "3",
      nombre: "PATRIMONIO NETO",
      tipo: "titulo",
      nivel: 1,
      padre: null,
    },
    {
      codigo: "3.1",
      nombre: "Capital Institucional",
      tipo: "cuenta",
      nivel: 2,
      padre: "3",
      naturaleza: "acreedora",
    },
    {
      codigo: "3.2",
      nombre: "Resultados Acumulados",
      tipo: "cuenta",
      nivel: 2,
      padre: "3",
      naturaleza: "acreedora",
    },

    { codigo: "4", nombre: "INGRESOS", tipo: "titulo", nivel: 1, padre: null },
    {
      codigo: "4.1",
      nombre: "Ingresos por Cuotas Escolares",
      tipo: "cuenta",
      nivel: 2,
      padre: "4",
      naturaleza: "acreedora",
    },
    {
      codigo: "4.2",
      nombre: "Ventas Producción (Mermeladas)",
      tipo: "cuenta",
      nivel: 2,
      padre: "4",
      naturaleza: "acreedora",
    },

    { codigo: "5", nombre: "EGRESOS", tipo: "titulo", nivel: 1, padre: null },
    {
      codigo: "5.1",
      nombre: "Sueldos Docentes",
      tipo: "cuenta",
      nivel: 2,
      padre: "5",
      naturaleza: "deudora",
    },
    {
      codigo: "5.2",
      nombre: "Sueldos No Docentes",
      tipo: "cuenta",
      nivel: 2,
      padre: "5",
      naturaleza: "deudora",
    },
    {
      codigo: "5.3",
      nombre: "Insumos Producción",
      tipo: "cuenta",
      nivel: 2,
      padre: "5",
      naturaleza: "deudora",
    },
    {
      codigo: "5.4",
      nombre: "Servicios del Colegio",
      tipo: "cuenta",
      nivel: 2,
      padre: "5",
      naturaleza: "deudora",
    },
  ];

  // === ASIENTOS AUTOMÁTICOS FICTICIOS (BASE SISTEMA REAL) ===

  const registrarCobroCuota = (monto, medio = "Caja") => {
    agregarAsiento({
      fecha: new Date().toISOString().split("T")[0],
      detalle: "Cobro de cuota escolar",
      movimientos: [
        {
          cuenta: medio === "Banco" ? "1.1.2" : "1.1.1",
          debe: monto,
          haber: 0,
        },
        { cuenta: "4.1", debe: 0, haber: monto },
      ],
    });
  };

  const registrarVentaProduccion = (monto) => {
    agregarAsiento({
      fecha: new Date().toISOString().split("T")[0],
      detalle: "Venta de producción - mermeladas",
      movimientos: [
        { cuenta: "1.1.1", debe: monto, haber: 0 },
        { cuenta: "4.2", debe: 0, haber: monto },
      ],
    });
  };

  const agregarAsiento = (asiento) => {
    const nuevoAsiento = { ...asiento, numero: nextAsientoNum };
    setAsientos([...asientos, nuevoAsiento]);
    setNextAsientoNum(nextAsientoNum + 1);
  };

  const eliminarAsiento = (numero) => {
    setAsientos(asientos.filter((a) => a.numero !== numero));
  };

  const calcularMayores = () => {
    const mayores = {};

    cuentas.forEach((cuenta) => {
      if (cuenta.tipo === "cuenta") {
        mayores[cuenta.codigo] = {
          cuenta: cuenta,
          movimientos: [],
          debe: 0,
          haber: 0,
          saldo: 0,
        };
      }
    });

    asientos.forEach((asiento) => {
      asiento.movimientos.forEach((mov) => {
        if (mayores[mov.cuenta]) {
          mayores[mov.cuenta].movimientos.push({
            fecha: asiento.fecha,
            detalle: asiento.detalle,
            debe: mov.debe,
            haber: mov.haber,
            numeroAsiento: asiento.numero,
          });
          mayores[mov.cuenta].debe += mov.debe;
          mayores[mov.cuenta].haber += mov.haber;
        }
      });
    });

    Object.keys(mayores).forEach((codigo) => {
      const mayor = mayores[codigo];
      if (mayor.cuenta.naturaleza === "deudora") {
        mayor.saldo = mayor.debe - mayor.haber;
      } else {
        mayor.saldo = mayor.haber - mayor.debe;
      }
    });

    return mayores;
  };

  const calcularBalance = () => {
    const mayores = calcularMayores();
    const balance = {
      activo: { corriente: 0, noCorriente: 0, total: 0 },
      pasivo: { corriente: 0, noCorriente: 0, total: 0 },
      patrimonioNeto: 0,
      ingresos: 0,
      egresos: 0,
      resultadoEjercicio: 0,
    };

    Object.values(mayores).forEach((mayor) => {
      const saldo = Math.abs(mayor.saldo);
      const codigo = mayor.cuenta.codigo;

      if (codigo.startsWith("1.1")) balance.activo.corriente += saldo;
      else if (codigo.startsWith("1.2")) balance.activo.noCorriente += saldo;
      else if (codigo.startsWith("2.1")) balance.pasivo.corriente += saldo;
      else if (codigo.startsWith("2.2")) balance.pasivo.noCorriente += saldo;
      else if (codigo.startsWith("3")) balance.patrimonioNeto += mayor.saldo;
      else if (codigo.startsWith("4")) balance.ingresos += saldo;
      else if (codigo.startsWith("5")) balance.egresos += saldo;
    });

    balance.activo.total =
      balance.activo.corriente + balance.activo.noCorriente;
    balance.pasivo.total =
      balance.pasivo.corriente + balance.pasivo.noCorriente;
    balance.resultadoEjercicio = balance.ingresos - balance.egresos;

    return balance;
  };

  const resetearDatos = async () => {
    if (
      confirm(
        "¿Está seguro que desea resetear todos los datos? Esta acción no se puede deshacer."
      )
    ) {
      await localStorage.removeItem("cuentas");
      await localStorage.removeItem("asientos");
      await localStorage.removeItem("nextAsientoNum");
      setCuentas(getPlanCuentasInicial());
      setAsientos([]);
      setNextAsientoNum(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              Sistema Contable Institucional - EFA
            </h1>
            <p className="text-blue-100 mt-2">
              Gestión contable del colegio y su producción
            </p>
          </div>

          <div className="flex border-b bg-slate-50">
            {[
              { id: "plan", label: "Plan de Cuentas", icon: BookOpen },
              { id: "asientos", label: "Asientos", icon: FileText },
              { id: "diario", label: "Libro Diario", icon: FileText },
              { id: "mayor", label: "Libro Mayor", icon: BookOpen },
              { id: "balance", label: "Balance", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-white hover:text-blue-500"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "plan" && <PlanCuentas cuentas={cuentas} />}
          {activeTab === "asientos" && (
            <Asientos
              cuentas={cuentas.filter((c) => c.tipo === "cuenta")}
              agregarAsiento={agregarAsiento}
              asientos={asientos}
              eliminarAsiento={eliminarAsiento}
            />
          )}
          {activeTab === "diario" && (
            <LibroDiario asientos={asientos} cuentas={cuentas} />
          )}
          {activeTab === "mayor" && <LibroMayor mayores={calcularMayores()} />}
          {activeTab === "balance" && (
            <Balance balance={calcularBalance()} mayores={calcularMayores()} />
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={resetearDatos}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Trash2 className="w-5 h-5 inline mr-2" />
            Resetear Todos los Datos
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanCuentas = ({ cuentas }) => {
  const [expandidos, setExpandidos] = useState({});

  const toggleExpand = (codigo) => {
    setExpandidos({ ...expandidos, [codigo]: !expandidos[codigo] });
  };

  const renderCuenta = (cuenta) => {
    const hijos = cuentas.filter((c) => c.padre === cuenta.codigo);
    const tieneHijos = hijos.length > 0;
    const estaExpandido = expandidos[cuenta.codigo];

    return (
      <div key={cuenta.codigo}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-slate-50 rounded-lg transition-all cursor-pointer ${
            cuenta.tipo === "titulo"
              ? "bg-blue-50 font-bold text-blue-900"
              : cuenta.tipo === "subtitulo"
              ? "bg-slate-50 font-semibold text-slate-800"
              : "text-slate-700"
          }`}
          style={{ paddingLeft: `${cuenta.nivel * 24}px` }}
          onClick={() => tieneHijos && toggleExpand(cuenta.codigo)}
        >
          {tieneHijos && (
            <span className="mr-2">
              {estaExpandido ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {!tieneHijos && <span className="w-6" />}
          <span className="font-mono text-sm mr-4 min-w-[80px]">
            {cuenta.codigo}
          </span>
          <span className="flex-1">{cuenta.nombre}</span>
          {cuenta.tipo === "cuenta" && (
            <span
              className={`text-xs px-3 py-1 rounded-full ${
                cuenta.naturaleza === "deudora"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {cuenta.naturaleza === "deudora" ? "Deudora" : "Acreedora"}
            </span>
          )}
        </div>
        {tieneHijos && (estaExpandido || cuenta.tipo === "titulo") && (
          <div>{hijos.map((hijo) => renderCuenta(hijo))}</div>
        )}
      </div>
    );
  };

  const cuentasRaiz = cuentas.filter((c) => c.padre === null);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Plan de Cuentas
      </h2>
      <div className="space-y-1">
        {cuentasRaiz.map((cuenta) => renderCuenta(cuenta))}
      </div>
    </div>
  );
};

const Asientos = ({ cuentas, agregarAsiento, asientos, eliminarAsiento }) => {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [detalle, setDetalle] = useState("");
  const [movimientos, setMovimientos] = useState([
    { cuenta: "", debe: 0, haber: 0 },
    { cuenta: "", debe: 0, haber: 0 },
  ]);

  const agregarMovimiento = () => {
    setMovimientos([...movimientos, { cuenta: "", debe: 0, haber: 0 }]);
  };

  const actualizarMovimiento = (index, campo, valor) => {
    const nuevosMovimientos = [...movimientos];
    nuevosMovimientos[index][campo] =
      campo === "cuenta" ? valor : parseFloat(valor) || 0;
    setMovimientos(nuevosMovimientos);
  };

  const eliminarMovimiento = (index) => {
    if (movimientos.length > 2) {
      setMovimientos(movimientos.filter((_, i) => i !== index));
    }
  };

  const calcularTotales = () => {
    const debe = movimientos.reduce((sum, m) => sum + m.debe, 0);
    const haber = movimientos.reduce((sum, m) => sum + m.haber, 0);
    return { debe, haber };
  };

  const guardarAsiento = () => {
    const { debe, haber } = calcularTotales();

    if (Math.abs(debe - haber) > 0.01) {
      alert("El asiento no está balanceado. Debe y Haber deben ser iguales.");
      return;
    }

    if (!detalle.trim()) {
      alert("Debe ingresar un detalle para el asiento.");
      return;
    }

    if (movimientos.some((m) => !m.cuenta || (m.debe === 0 && m.haber === 0))) {
      alert("Todos los movimientos deben tener una cuenta y un importe.");
      return;
    }

    agregarAsiento({ fecha, detalle, movimientos: [...movimientos] });

    setFecha(new Date().toISOString().split("T")[0]);
    setDetalle("");
    setMovimientos([
      { cuenta: "", debe: 0, haber: 0 },
      { cuenta: "", debe: 0, haber: 0 },
    ]);
  };

  const totales = calcularTotales();
  const balanceado = Math.abs(totales.debe - totales.haber) < 0.01;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Registro de Asientos
      </h2>

      <div className="bg-slate-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Detalle
            </label>
            <input
              type="text"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Descripción del asiento..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {movimientos.map((mov, index) => (
            <div
              key={index}
              className="flex gap-3 items-center bg-white p-3 rounded-lg"
            >
              <select
                value={mov.cuenta}
                onChange={(e) =>
                  actualizarMovimiento(index, "cuenta", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione cuenta...</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.codigo} value={cuenta.codigo}>
                    {cuenta.codigo} - {cuenta.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={mov.debe || ""}
                onChange={(e) =>
                  actualizarMovimiento(index, "debe", e.target.value)
                }
                placeholder="Debe"
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.01"
                value={mov.haber || ""}
                onChange={(e) =>
                  actualizarMovimiento(index, "haber", e.target.value)
                }
                placeholder="Haber"
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {movimientos.length > 2 && (
                <button
                  onClick={() => eliminarMovimiento(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300">
          <button
            onClick={agregarMovimiento}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Movimiento
          </button>

          <div className="flex gap-6 items-center">
            <div className="text-right">
              <div className="text-sm text-slate-600">Total Debe</div>
              <div className="text-lg font-bold text-slate-800">
                ${totales.debe.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Total Haber</div>
              <div className="text-lg font-bold text-slate-800">
                ${totales.haber.toFixed(2)}
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                balanceado
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {balanceado ? "Balanceado" : "Desbalanceado"}
            </div>
          </div>
        </div>

        <button
          onClick={guardarAsiento}
          disabled={!balanceado}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Guardar Asiento
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Asientos Registrados
        </h3>
        {asientos.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No hay asientos registrados aún.
          </p>
        ) : (
          <div className="space-y-4">
            {asientos
              .slice()
              .reverse()
              .map((asiento) => (
                <div
                  key={asiento.numero}
                  className="bg-slate-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-blue-600">
                        Asiento N° {asiento.numero}
                      </span>
                      <span className="mx-3 text-slate-400">|</span>
                      <span className="text-slate-600">{asiento.fecha}</span>
                      <div className="text-sm text-slate-600 mt-1">
                        {asiento.detalle}
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarAsiento(asiento.numero)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {asiento.movimientos.map((mov, idx) => {
                      const cuenta = cuentas.find(
                        (c) => c.codigo === mov.cuenta
                      );
                      return (
                        <div
                          key={idx}
                          className="flex justify-between text-sm bg-white p-2 rounded"
                        >
                          <span className="font-mono">
                            {mov.cuenta} - {cuenta?.nombre}
                          </span>
                          <div className="flex gap-8">
                            <span className="w-24 text-right">
                              {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "-"}
                            </span>
                            <span className="w-24 text-right">
                              {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : "-"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LibroDiario = ({ asientos, cuentas }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Libro Diario</h2>

      {asientos.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          No hay asientos registrados en el libro diario.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-3 text-left">
                  N°
                </th>
                <th className="border border-slate-300 px-4 py-3 text-left">
                  Fecha
                </th>
                <th className="border border-slate-300 px-4 py-3 text-left">
                  Detalle
                </th>
                <th className="border border-slate-300 px-4 py-3 text-right">
                  Debe
                </th>
                <th className="border border-slate-300 px-4 py-3 text-right">
                  Haber
                </th>
              </tr>
            </thead>
            <tbody>
              {asientos.map((asiento) => (
                <React.Fragment key={asiento.numero}>
                  <tr className="bg-blue-50">
                    <td className="border border-slate-300 px-4 py-2 font-bold">
                      {asiento.numero}
                    </td>
                    <td className="border border-slate-300 px-4 py-2">
                      {asiento.fecha}
                    </td>
                    <td
                      className="border border-slate-300 px-4 py-2 font-semibold"
                      colSpan="3"
                    >
                      {asiento.detalle}
                    </td>
                  </tr>
                  {asiento.movimientos.map((mov, idx) => {
                    const cuenta = cuentas.find((c) => c.codigo === mov.cuenta);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-4 py-2"></td>
                        <td className="border border-slate-300 px-4 py-2"></td>
                        <td className="border border-slate-300 px-4 py-2 pl-8">
                          <span className="font-mono text-sm">
                            {mov.cuenta}
                          </span>{" "}
                          - {cuenta?.nombre}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                          {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "-"}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                          {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-semibold">
                    <td
                      colSpan="3"
                      className="border border-slate-300 px-4 py-2 text-right"
                    >
                      Totales del Asiento
                    </td>
                    <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                      $
                      {asiento.movimientos
                        .reduce((sum, m) => sum + m.debe, 0)
                        .toFixed(2)}
                    </td>
                    <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                      $
                      {asiento.movimientos
                        .reduce((sum, m) => sum + m.haber, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LibroMayor = ({ mayores }) => {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");

  const mayoresConMovimientos = Object.values(mayores).filter(
    (m) => m.movimientos.length > 0
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Libro Mayor</h2>

      {mayoresConMovimientos.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          No hay movimientos registrados en el libro mayor.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Seleccione una cuenta
            </label>
            <select
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Ver todas las cuentas con movimientos</option>
              {mayoresConMovimientos.map((mayor) => (
                <option key={mayor.cuenta.codigo} value={mayor.cuenta.codigo}>
                  {mayor.cuenta.codigo} - {mayor.cuenta.nombre}
                </option>
              ))}
            </select>
          </div>

          {(cuentaSeleccionada
            ? [mayores[cuentaSeleccionada]]
            : mayoresConMovimientos
          ).map((mayor) => (
            <div
              key={mayor.cuenta.codigo}
              className="mb-8 bg-slate-50 p-6 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  <span className="font-mono">{mayor.cuenta.codigo}</span> -{" "}
                  {mayor.cuenta.nombre}
                </h3>
                <span
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    mayor.cuenta.naturaleza === "deudora"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  Naturaleza:{" "}
                  {mayor.cuenta.naturaleza === "deudora"
                    ? "Deudora"
                    : "Acreedora"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-4 py-3 text-left">
                        Fecha
                      </th>
                      <th className="border border-slate-300 px-4 py-3 text-left">
                        Detalle
                      </th>
                      <th className="border border-slate-300 px-4 py-3 text-center">
                        Asiento N°
                      </th>
                      <th className="border border-slate-300 px-4 py-3 text-right">
                        Debe
                      </th>
                      <th className="border border-slate-300 px-4 py-3 text-right">
                        Haber
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mayor.movimientos.map((mov, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-4 py-2">
                          {mov.fecha}
                        </td>
                        <td className="border border-slate-300 px-4 py-2">
                          {mov.detalle}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center font-mono">
                          {mov.numeroAsiento}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                          {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "-"}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                          {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td
                        colSpan="3"
                        className="border border-slate-300 px-4 py-3 text-right"
                      >
                        Totales
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-right font-mono">
                        ${mayor.debe.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 px-4 py-3 text-right font-mono">
                        ${mayor.haber.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-slate-800 text-white font-bold">
                      <td
                        colSpan="3"
                        className="border border-slate-300 px-4 py-3 text-right"
                      >
                        Saldo {mayor.saldo >= 0 ? "Deudor" : "Acreedor"}
                      </td>
                      <td
                        colSpan="2"
                        className="border border-slate-300 px-4 py-3 text-right font-mono text-lg"
                      >
                        ${Math.abs(mayor.saldo).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const Balance = ({ balance, mayores }) => {
  const totalPasivoMasPN =
    balance.pasivo.total + balance.patrimonioNeto + balance.resultadoEjercicio;
  const descuadre = Math.abs(balance.activo.total - totalPasivoMasPN);
  const balanceado = descuadre < 0.01;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Balance General y Estado de Resultados
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Balance General */}
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-600">
            Balance General
          </h3>

          {/* Activo */}
          <div className="mb-6">
            <div className="bg-blue-100 px-4 py-2 font-bold text-blue-900 rounded-t">
              ACTIVO
            </div>
            <div className="bg-white p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Activo Corriente</span>
                <span className="font-mono">
                  ${balance.activo.corriente.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Activo No Corriente</span>
                <span className="font-mono">
                  ${balance.activo.noCorriente.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-blue-600 font-bold text-lg">
                <span>TOTAL ACTIVO</span>
                <span className="font-mono">
                  ${balance.activo.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Pasivo y Patrimonio Neto */}
          <div>
            <div className="bg-orange-100 px-4 py-2 font-bold text-orange-900 rounded-t">
              PASIVO
            </div>
            <div className="bg-white p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Pasivo Corriente</span>
                <span className="font-mono">
                  ${balance.pasivo.corriente.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Pasivo No Corriente</span>
                <span className="font-mono">
                  ${balance.pasivo.noCorriente.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold">
                <span>Total Pasivo</span>
                <span className="font-mono">
                  ${balance.pasivo.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-purple-100 px-4 py-2 font-bold text-purple-900 mt-4">
              PATRIMONIO NETO
            </div>
            <div className="bg-white p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">
                  Capital y Resultados Acumulados
                </span>
                <span className="font-mono">
                  ${balance.patrimonioNeto.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Resultado del Ejercicio</span>
                <span
                  className={`font-mono ${
                    balance.resultadoEjercicio >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${balance.resultadoEjercicio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-purple-600 font-bold text-lg">
                <span>TOTAL PASIVO + PN</span>
                <span className="font-mono">
                  ${totalPasivoMasPN.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Verificación */}
          <div
            className={`mt-4 p-4 rounded-lg ${
              balanceado ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">
                {balanceado ? "✓ Balance Verificado" : "✗ Balance Descuadrado"}
              </span>
              {!balanceado && (
                <span className="font-mono">
                  Diferencia: ${descuadre.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estado de Resultados */}
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-green-600">
            Estado de Resultados
          </h3>

          <div className="bg-white p-4 space-y-4">
            <div>
              <div className="bg-green-100 px-4 py-2 font-bold text-green-900 rounded-t">
                INGRESOS
              </div>
              <div className="p-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Ingresos</span>
                  <span className="font-mono text-green-600">
                    ${balance.ingresos.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-red-100 px-4 py-2 font-bold text-red-900 rounded-t">
                EGRESOS
              </div>
              <div className="p-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Egresos</span>
                  <span className="font-mono text-red-600">
                    ${balance.egresos.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-slate-800">
              <div
                className={`p-4 rounded-lg ${
                  balance.resultadoEjercicio >= 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl">
                    {balance.resultadoEjercicio >= 0 ? "UTILIDAD" : "PÉRDIDA"}{" "}
                    DEL EJERCICIO
                  </span>
                  <span
                    className={`font-mono text-2xl font-bold ${
                      balance.resultadoEjercicio >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${Math.abs(balance.resultadoEjercicio).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de Saldos por Cuenta */}
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Detalle de Saldos por Cuenta
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-3 text-left">
                  Código
                </th>
                <th className="border border-slate-300 px-4 py-3 text-left">
                  Cuenta
                </th>
                <th className="border border-slate-300 px-4 py-3 text-center">
                  Naturaleza
                </th>
                <th className="border border-slate-300 px-4 py-3 text-right">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(mayores)
                .filter((m) => Math.abs(m.saldo) > 0.01)
                .sort((a, b) => a.cuenta.codigo.localeCompare(b.cuenta.codigo))
                .map((mayor) => (
                  <tr key={mayor.cuenta.codigo} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-4 py-2 font-mono text-sm">
                      {mayor.cuenta.codigo}
                    </td>
                    <td className="border border-slate-300 px-4 py-2">
                      {mayor.cuenta.nombre}
                    </td>
                    <td className="border border-slate-300 px-4 py-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          mayor.cuenta.naturaleza === "deudora"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {mayor.cuenta.naturaleza === "deudora" ? "D" : "A"}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                      ${Math.abs(mayor.saldo).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SistemaContable;
