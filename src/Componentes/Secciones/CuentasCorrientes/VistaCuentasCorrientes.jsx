import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Users, Eye } from "lucide-react";
import DataTable from "../../UI/DataTable/DataTable";
import DrawerComprobantesContacto from "../../Tablas/CuentasCorrientes/DrawerComprobantesContacto";
import DashboardCuentaCorriente from "./DashboardCuentaCorriente";
import { useListarCuentasCorrientes } from "../../../Backend/CuentasCorrientes/queries/useListarCuentasCorrientes";

const VistaCuentasCorrientes = () => {
  const [tipo, setTipo] = useState("INGRESO");
  const [search, setSearch] = useState("");
  const [pagina, setPagina] = useState(1);
  const limite = 20;

  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: response, isLoading } = useListarCuentasCorrientes({
    tipo,
    search,
    pagina,
    limite,
  });

  const contactos = response?.data || [];
  const total = response?.total || 0;
  const paginas = Math.ceil(total / limite);

  const handleTabChange = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setPagina(1);
    setSearch("");
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagina(1);
  };

  const handleRowClick = (row) => {
    setContactoSeleccionado(row);
    setIsDrawerOpen(true);
  };

  const formatearMoneda = (monto) => {
    if (monto == null) return "$ 0.00";
    return Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });
  };

  const columnas = [
    {
      key: "nombre",
      etiqueta: "Contacto",
      renderizar: (valor, fila) => {
        const nombre = fila.razonSocial || fila.nombre || "";
        const apellido = fila.apellido || "";
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#1FAE6D] font-black mr-3">
              {(nombre[0] || "").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {`${nombre} ${apellido}`.trim()}
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                {fila.entidad || "Contacto"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "documento",
      etiqueta: "Documento",
      renderizar: (valor, fila) => (
        <span className="text-sm font-bold text-gray-800 font-mono tracking-tight">
          {fila.documento || "-"}
        </span>
      ),
    },
    {
      key: "saldo",
      etiqueta: "Saldo",
      renderizar: (valor, fila) => {
        const saldo = Number(fila.saldo || 0);
        const saldoAFavor = Number(fila.saldoAFavor || 0);
        const color = saldo < 0 ? "text-rose-600" : "text-gray-900";
        return (
          <div className="flex flex-col">
            {saldo > 0 && (
              <span className={`text-base font-black tabular-nums ${color}`}>
                {formatearMoneda(Math.abs(saldo))}
              </span>
            )}
            {saldoAFavor > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                {formatearMoneda(saldoAFavor)} (A favor)
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-6 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER CORPORATIVO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Contactos</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Cuenta Corriente</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users color={"#1FAE6D"} size={28} strokeWidth={3} />
            Cuentas Corrientes
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            {tipo === "INGRESO"
              ? `Visualiza y gestiona saldos a cobrar de clientes. Actualmente hay ${total} cuentas activas.`
              : `Visualiza y gestiona obligaciones de pago a proveedores. Actualmente hay ${total} cuentas activas.`}
          </p>
        </div>
      </div>

      <DashboardCuentaCorriente tipo={tipo} />

      <div className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-200 overflow-hidden flex flex-col flex-1">
        {/* TOOLBAR */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex bg-white border border-gray-200 p-1 rounded-md self-start shadow-sm">
            <button
              onClick={() => handleTabChange("INGRESO")}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-md transition-colors cursor-pointer ${
                tipo === "INGRESO"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Por Cobrar (Ingresos)
            </button>
            <button
              onClick={() => handleTabChange("EGRESO")}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-md transition-colors cursor-pointer ${
                tipo === "EGRESO"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Por Pagar (Egresos)
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={(e) => e.target.select()}
              className="block w-full h-11 pl-10 pr-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm"
              placeholder="Buscar por nombre, documento..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <DataTable
            columnas={columnas}
            datos={contactos}
            loading={isLoading}
            mostrarAcciones={true}
            acciones={[
              {
                icono: <Eye size={14} />,
                label: "Ver comprobantes",
                onClick: (fila) => handleRowClick(fila),
              },
            ]}
            id_tabla="cuentas_corrientes"
            emptyMessage={
              search
                ? "No se encontraron contactos que coincidan con tu búsqueda."
                : `No hay saldos pendientes de ${tipo === "INGRESO" ? "cobro" : "pago"}.`
            }
          />
        </div>

        {/* Paginación */}
        {total > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Página {pagina} de {paginas || 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                disabled={pagina >= paginas}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DrawerComprobantesContacto
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setContactoSeleccionado(null);
        }}
        contacto={contactoSeleccionado}
        tipo={tipo}
      />
    </div>
  );
};

export default VistaCuentasCorrientes;
