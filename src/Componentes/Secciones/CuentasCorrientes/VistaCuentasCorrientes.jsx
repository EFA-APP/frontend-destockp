import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Users, Eye } from "lucide-react";
import DataTable from "../../UI/DataTable/DataTable";
import DrawerComprobantesContacto from "../../Tablas/CuentasCorrientes/DrawerComprobantesContacto";
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
            <div className="h-9 w-9 rounded-[10px] bg-[var(--color-brand-soft)] border border-[var(--color-brand-primary)]/20 flex items-center justify-center text-[var(--color-brand-primary)] font-bold mr-3 shadow-sm">
              {(nombre[0] || "").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {`${nombre} ${apellido}`.trim()}
              </p>
              <p className="text-xs text-gray-500">
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
        <span className="text-sm text-gray-600">{fila.documento || "-"}</span>
      ),
    },
    {
      key: "saldo",
      etiqueta: "Saldo",
      renderizar: (valor, fila) => {
        const saldo = Number(fila.saldo || 0);
        const color =
          saldo < 0
            ? "text-red-600"
            : saldo > 0
              ? "text-green-600"
              : "text-gray-900";
        return (
          <span className={`text-sm font-semibold ${color}`}>
            {formatearMoneda(Math.abs(saldo))}
            {saldo < 0 ? " (A Favor)" : ""}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50/50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--color-neutral-text-main)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--color-brand-primary)]" />
            Cuentas Corrientes
          </h1>
          <p className="text-xs font-medium text-gray-500 mt-1">
            {tipo === "INGRESO" 
              ? `Visualiza y gestiona saldos a cobrar de clientes. Actualmente hay ${total} cuentas activas.`
              : `Visualiza y gestiona obligaciones de pago a proveedores. Actualmente hay ${total} cuentas activas.`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-sm border border-[var(--color-neutral-border)] overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-[var(--color-neutral-border)] bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex bg-white border border-[var(--color-neutral-border)] p-1 rounded-[10px] self-start shadow-sm">
            <button
              onClick={() => handleTabChange("INGRESO")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                tipo === "INGRESO"
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
                  : "text-[var(--color-neutral-text-muted)] hover:bg-gray-50"
              }`}
            >
              Cuentas por Cobrar (Ingresos)
            </button>
            <button
              onClick={() => handleTabChange("EGRESO")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                tipo === "EGRESO"
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)]"
                  : "text-[var(--color-neutral-text-muted)] hover:bg-gray-50"
              }`}
            >
              Cuentas por Pagar (Egresos)
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
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-neutral-border)] rounded-[10px] text-[13px] leading-5 bg-white placeholder-[var(--color-neutral-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:border-[var(--color-brand-primary)] transition-colors font-medium shadow-sm"
              placeholder="Buscar por nombre, documento..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
          <div className="bg-white px-4 py-3 border-t border-[var(--color-neutral-border)] flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] text-[var(--color-neutral-text-muted)]">
                  Mostrando{" "}
                  <span className="font-bold text-[var(--color-neutral-text-main)]">
                    {(pagina - 1) * limite + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-bold text-[var(--color-neutral-text-main)]">
                    {Math.min(pagina * limite, total)}
                  </span>{" "}
                  de <span className="font-bold text-[var(--color-neutral-text-main)]">{total}</span> resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-[8px] shadow-sm -space-x-px overflow-hidden"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-[var(--color-neutral-border)] bg-white text-sm font-medium text-[var(--color-neutral-text-muted)] hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-[var(--color-neutral-border)] bg-white text-[13px] font-bold text-[var(--color-neutral-text-main)]">
                    Página {pagina} de {paginas || 1}
                  </span>
                  <button
                    onClick={() => setPagina((p) => Math.min(paginas, p + 1))}
                    disabled={pagina >= paginas}
                    className="relative inline-flex items-center px-2 py-2 border border-[var(--color-neutral-border)] bg-white text-sm font-medium text-[var(--color-neutral-text-muted)] hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
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
      />
    </div>
  );
};

export default VistaCuentasCorrientes;
