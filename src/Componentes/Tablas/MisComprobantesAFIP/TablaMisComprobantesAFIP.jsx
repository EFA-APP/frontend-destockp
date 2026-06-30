import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMisComprobantesAFIP } from "../../../Backend/hooks/MisComprobantesAFIP/useMisComprobantesAFIP";

const EXTENSIONES_VALIDAS = [".xlsx", ".xls"];

const esExtensionValida = (file) => {
  const nombre = file.name.toLowerCase();
  return EXTENSIONES_VALIDAS.some((ext) => nombre.endsWith(ext));
};

const TablaMisComprobantesAFIP = () => {
  const navigate = useNavigate();
  const {
    archivoRecibidos,
    setArchivoRecibidos,
    resultados,
    cargando,
    error,
    validar,
    limpiarCache,
  } = useMisComprobantesAFIP();

  const inputRecibidosRef = useRef(null);

  const handleCrearEgreso = (fila) => {
    navigate("/panel/comprobantes/crear", {
      state: {
        arcaData: {
          puntoVenta: fila.puntoVenta,
          numeroComprobante: fila.numeroComprobante,
          cae: fila.cae,
          vtoCae: fila.vtoCae,
          fecha: fila.fecha,
          codigoTipo: fila.tipo != null ? Number(fila.tipo) : null,
          denominacion: fila.denominacion,
          cuit: fila.numeroDocumento,
          total: fila.total,
          operacion: fila.operacion,
          montosSugeridos: fila.montosSugeridos ?? [],
          otrosTributos: fila.otrosTributos ?? 0,
        },
      },
    });
  };

  const [errorRecibidos, setErrorRecibidos] = useState(null);
  const [progreso, setProgreso] = useState(0);

  // Auto-validar al subir archivo
  useEffect(() => {
    if (archivoRecibidos) validar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivoRecibidos]);

  // Barra de progreso simulada
  useEffect(() => {
    if (!cargando) {
      setProgreso((prev) => (prev > 0 ? 100 : 0));
      return;
    }
    setProgreso(5);
    const id = setInterval(() => {
      setProgreso((prev) => (prev >= 88 ? prev : Math.min(88, prev + Math.random() * 10 + 3)));
    }, 250);
    return () => clearInterval(id);
  }, [cargando]);

  useEffect(() => {
    if (progreso !== 100) return;
    const t = setTimeout(() => setProgreso(0), 700);
    return () => clearTimeout(t);
  }, [progreso]);

  const manejarCambioRecibidos = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!esExtensionValida(file)) {
      setErrorRecibidos("Solo se aceptan archivos .xlsx o .xls");
      e.target.value = "";
      return;
    }
    setErrorRecibidos(null);
    setArchivoRecibidos(file);
  };

  const registrados = resultados
    ? resultados.filter((r) => r.estado === "REGISTRADO").length
    : 0;
  const noRegistrados = resultados
    ? resultados.filter((r) => r.estado === "NO_REGISTRADO").length
    : 0;

  return (
    <div className="space-y-6 p-2">
      <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">
        Validación ARCA
      </h2>

      {/* Input oculto — activado por el dropzone del componente padre */}
      <input
        id="input-recibidos"
        ref={inputRecibidosRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={manejarCambioRecibidos}
      />
      {archivoRecibidos && (
        <p className="text-xs text-black/50 font-medium">
          Archivo seleccionado: <span className="text-[var(--primary)] font-semibold">{archivoRecibidos.name}</span>
        </p>
      )}
      {errorRecibidos && (
        <p className="text-xs text-red-500">{errorRecibidos}</p>
      )}

      {/* Barra de progreso */}
      {progreso > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--primary)]">
              {progreso < 100 ? "Procesando archivo..." : "¡Listo!"}
            </span>
            <span className="text-xs text-black/40">{Math.round(progreso)}%</span>
          </div>
          <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      {/* Error global */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Sección de resultados */}
      {resultados && (
        <div className="space-y-4">
          {/* Cabecera de resultados con botón limpiar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Resultados
            </span>
            {resultados !== null && (
              <button
                type="button"
                onClick={limpiarCache}
                className="text-xs text-gray-500 underline hover:text-rose-500 transition cursor-pointer"
              >
                Limpiar resultados
              </button>
            )}
          </div>

          {/* Contadores resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700">{registrados}</p>
              <p className="text-xs text-green-600 uppercase tracking-wider mt-1 font-semibold">
                REGISTRADO
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center shadow-sm">
              <p className="text-2xl font-bold text-red-700">{noRegistrados}</p>
              <p className="text-xs text-red-600 uppercase tracking-wider mt-1 font-semibold">
                NO REGISTRADO
              </p>
            </div>
          </div>

          {/* Tabla de detalle */}
          <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Pto. Venta
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Número</th>
                  <th className="px-3 py-3 text-left font-semibold">CAE</th>
                  <th className="px-3 py-3 text-left font-semibold">CUIT</th>
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Denominación
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Operación
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Estado</th>
                  <th className="px-3 py-3 text-left font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultados.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">{item.tipo ?? "-"}</td>
                    <td className="px-3 py-2">{item.puntoVenta ?? "-"}</td>
                    <td className="px-3 py-2">
                      {item.numeroComprobante ?? "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {item.cae ?? "-"}
                    </td>
                    <td className="px-3 py-2">{item.numeroDocumento ?? "-"}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {item.total != null
                        ? Number(item.total).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{item.denominacion ?? "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          "px-2 py-0.5 rounded text-xs font-bold",
                          item.operacion === "INGRESO"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700",
                        ].join(" ")}
                      >
                        {item.operacion}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          "px-2 py-0.5 rounded text-xs font-bold",
                          item.estado === "REGISTRADO"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        ].join(" ")}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {item.estado === "NO_REGISTRADO" &&
                        item.operacion === "EGRESO" && (
                          <button
                            type="button"
                            onClick={() => handleCrearEgreso(item)}
                            className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600 transition-colors cursor-pointer"
                          >
                            Crear EGRESO
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaMisComprobantesAFIP;
