import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Search, FileText, CreditCard, Wallet, Receipt, User } from 'lucide-react';
import DataTable from '../../UI/DataTable/DataTable';
import DateRangePicker from '../../UI/DateRangePicker/DateRangePicker';
import { useListarComprobantesPorContacto } from '../../../Backend/CuentasCorrientes/queries/useListarComprobantesPorContacto';
import { format } from 'date-fns';

// Valores reales del enum Prisma `EstadoComprobante` (comprobantes-ms/prisma/schema.prisma).
// El backend filtra por coincidencia exacta contra este enum, no acepta valores libres.
const ESTADO_LABELS = {
  BORRADOR: 'Borrador',
  CONFIRMADO: 'Confirmado',
  PENDIENTE_PAGO: 'Pendiente de pago',
  PARCIALMENTE_ABONADO: 'Parcialmente abonado',
  ABONADO: 'Abonado',
  ANULADO: 'Anulado',
};

const DrawerComprobantesContacto = ({ isOpen, onClose, contacto }) => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [estado, setEstado] = useState('TODOS');

  const codigoContacto = contacto?.codigoSecuencial || contacto?.codigoContacto;

  const { data: response, isLoading } = useListarComprobantesPorContacto(codigoContacto, {
    desde,
    hasta,
    estado,
  });

  const comprobantes = response?.comprobantes || [];

  const handleClose = () => {
    onClose();
    // Reset filters
    setDesde('');
    setHasta('');
    setEstado('TODOS');
  };

  const formatearMoneda = (monto) => {
    if (monto == null) return '$ 0.00';
    return Number(monto).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    });
  };

  const columnas = [
    {
      key: 'fechaEmision',
      etiqueta: 'Fecha',
      renderizar: (valor, fila) => (
        <span className="text-[13px] font-medium text-gray-600 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {fila.fechaEmision
            ? format(new Date(fila.fechaEmision), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      key: 'numeroComprobante',
      etiqueta: 'Comprobante',
      renderizar: (valor, fila) => {
        const ptoVta = String(fila.puntoVenta || 1).padStart(4, "0");
        const nro = String(fila.numeroComprobante || 0).padStart(8, "0");
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-gray-900 leading-none mb-1">{`${ptoVta}-${nro}`}</p>
              <p className="text-[11px] text-gray-500 font-medium leading-none">Tipo: {fila.codigoTipoComprobante}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'estado',
      etiqueta: 'Estado',
      renderizar: (valor, fila) => {
        const est = fila.estado || 'BORRADOR';
        let color = 'bg-gray-100 text-gray-700 border-gray-200';
        if (est === 'ABONADO') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (est === 'PENDIENTE_PAGO' || est === 'PARCIALMENTE_ABONADO') color = 'bg-amber-50 text-amber-700 border-amber-200';
        if (est === 'ANULADO') color = 'bg-rose-50 text-rose-700 border-rose-200';
        if (est === 'CONFIRMADO') color = 'bg-blue-50 text-blue-700 border-blue-200';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider shadow-sm ${color}`}>
            {ESTADO_LABELS[est] || est}
          </span>
        );
      },
    },
    {
      key: 'total',
      etiqueta: 'Total',
      renderizar: (valor, fila) => (
        <span className="text-[14px] font-bold text-gray-900">
          {formatearMoneda(fila.total)}
        </span>
      ),
    },
    {
      key: 'saldoPendiente',
      etiqueta: 'Saldo Pendiente',
      renderizar: (valor, fila) => {
        const saldo = Number(fila.saldoPendiente || 0);
        return (
          <span className={`text-[14px] font-bold ${saldo > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
            {formatearMoneda(saldo)}
          </span>
        );
      },
    },
  ];

  if (!isOpen) return null;

  const saldoActual = Number(contacto?.saldo || 0);
  const isAFavor = saldoActual < 0;
  
  const nombreContacto = contacto?.razonSocial || contacto?.nombre || 'Contacto';
  const inicial = nombreContacto.charAt(0).toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
        <div className="w-screen max-w-4xl transform transition-transform duration-300 ease-in-out shadow-2xl">
          <div className="flex h-full flex-col bg-white overflow-hidden rounded-l-2xl">
            {/* Header Rediseñado */}
            <div className="px-8 py-6 bg-white border-b border-[var(--color-neutral-border)] flex items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--color-brand-soft)] to-transparent rounded-full opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

              <div className="flex gap-5 items-center z-10">
                <div className="h-16 w-16 rounded-[14px] bg-[var(--color-brand-soft)] border border-[var(--color-brand-primary)]/20 flex items-center justify-center text-[var(--color-brand-primary)] text-2xl font-bold shadow-sm">
                  {inicial}
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[var(--color-neutral-text-main)] tracking-tight">
                    {nombreContacto} {contacto?.apellido ? ` ${contacto.apellido}` : ''}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                      <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                      {contacto?.documento || 'Sin documento'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-md border shadow-sm ${
                      isAFavor 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : saldoActual > 0 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      <Wallet className={`w-3.5 h-3.5 ${isAFavor ? 'text-emerald-500' : saldoActual > 0 ? 'text-rose-500' : 'text-gray-500'}`} />
                      Saldo: {formatearMoneda(Math.abs(saldoActual))} {isAFavor ? '(A Favor)' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-xl bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none p-2.5 border border-transparent hover:border-gray-200 transition-all cursor-pointer z-10 shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-8 py-5 border-b border-[var(--color-neutral-border)] bg-gray-50/80 flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Filtrar por Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="block w-full h-[42px] rounded-xl border border-gray-200 bg-white px-3.5 text-[13px] font-semibold text-gray-700 focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none cursor-pointer shadow-sm transition-all"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="BORRADOR">{ESTADO_LABELS.BORRADOR}</option>
                  <option value="CONFIRMADO">{ESTADO_LABELS.CONFIRMADO}</option>
                  <option value="PENDIENTE_PAGO">{ESTADO_LABELS.PENDIENTE_PAGO}</option>
                  <option value="PARCIALMENTE_ABONADO">{ESTADO_LABELS.PARCIALMENTE_ABONADO}</option>
                  <option value="ABONADO">{ESTADO_LABELS.ABONADO}</option>
                  <option value="ANULADO">{ESTADO_LABELS.ANULADO}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Rango de Fechas
                </label>
                <div className="h-[42px]">
                  <DateRangePicker
                    fechaDesde={desde}
                    fechaHasta={hasta}
                    onChange={(desdeStr, hastaStr) => {
                      setDesde(desdeStr);
                      setHasta(hastaStr);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="rounded-xl border border-[var(--color-neutral-border)] overflow-hidden shadow-sm">
                <DataTable
                  columnas={columnas}
                  datos={comprobantes}
                  loading={isLoading}
                  mostrarAcciones={false}
                  emptyMessage="No se encontraron comprobantes para este contacto con los filtros aplicados."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DrawerComprobantesContacto;

