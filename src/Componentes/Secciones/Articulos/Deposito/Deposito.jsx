import React, { useState } from "react";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import {
    InventarioIcono,
    ArcaIcono,
    PersonaIcono,
    CheckIcono,
    AdvertenciaIcono,
    AgregarIcono,
    EditarIcono,
    BorrarIcono
} from "../../../../assets/Icons";
import { MapPin, Package, AlertTriangle, TrendingUp, Settings2 } from "lucide-react";

const Deposito = () => {
    // --- ESTADO ---
    const [sucursales, setSucursales] = useState([
        { id: 1, nombre: "Casa Central", responsable: "Juan Pérez", stockTotal: 12500, estado: "Óptimo", color: "emerald", tendencia: "+12%" },
        { id: 2, nombre: "Sucursal Norte", responsable: "María García", stockTotal: 2000, estado: "Alerta", color: "amber", tendencia: "-5%" },
        { id: 3, nombre: "Sucursal Sur", responsable: "Carlos Rodríguez", stockTotal: 5000, estado: "Suficiente", color: "blue", tendencia: "+2%" },
        { id: 4, nombre: "Depósito Logístico", responsable: "Ana Martínez", stockTotal: 3400, estado: "Lleno", color: "purple", tendencia: "+18%" },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modoModal, setModoModal] = useState("crear"); // 'crear' | 'editar'
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

    // --- LÓGICA CRUD ---
    const handleNuevaSucursal = () => {
        setModoModal("crear");
        setSucursalSeleccionada(null);
        setModalOpen(true);
    };

    const handleEditarSucursal = (suc) => {
        setModoModal("editar");
        setSucursalSeleccionada(suc);
        setModalOpen(true);
    };

    const handleSave = (data) => {
        if (modoModal === "crear") {
            const nuevo = {
                ...data,
                id: Date.now(),
                tendencia: "+0%", // Default para nuevos
                color: getColorByEstado(data.estado)
            };
            setSucursales([...sucursales, nuevo]);
        } else {
            setSucursales(sucursales.map(s => s.id === sucursalSeleccionada.id ? { ...s, ...data, color: getColorByEstado(data.estado) } : s));
        }
        setModalOpen(false);
    };

    const getColorByEstado = (estado) => {
        const map = {
            "Óptimo": "emerald",
            "Alerta": "amber",
            "Suficiente": "blue",
            "Lleno": "purple"
        };
        return map[estado] || "emerald";
    };

    // --- CONFIGURACIÓN FORMULARIO ---
    const camposDeposito = [
        {
            name: "nombre",
            label: "Nombre del Depósito",
            type: "text",
            required: true,
            placeholder: "Ej: Sucursal Oeste",
            section: "Identificación"
        },
        {
            name: "responsable",
            label: "Responsable / Encargado",
            type: "text",
            required: true,
            placeholder: "Nombre completo",
            section: "Identificación"
        },
        {
            name: "stockTotal",
            label: "Stock Inicial",
            type: "number",
            required: true,
            min: 0,
            section: "Inventario"
        },
        {
            name: "estado",
            label: "Estado de Operación",
            type: "select",
            options: [
                { value: "Óptimo", label: "Óptimo (Funcionamiento Normal)" },
                { value: "Suficiente", label: "Suficiente (Stock en rango)" },
                { value: "Alerta", label: "Alerta (Bajo Stock)" },
                { value: "Lleno", label: "Lleno (Capacidad Máxima)" }
            ],
            section: "Inventario",
            defaultValue: "Óptimo"
        }
    ];

    // --- CONFIGURACIÓN TABLA ---
    const stockPorProducto = [
        { id: 1, nombre: "Mermelada de Arándanos", sku: "PROD-001", central: 500, norte: 100, sur: 200, logistico: 400, total: 1200 },
        { id: 2, nombre: "Mermelada de Durazno", sku: "PROD-002", central: 300, norte: 50, sur: 150, logistico: 350, total: 850 },
        { id: 3, nombre: "Mermelada de Frutilla", sku: "PROD-003", central: 800, norte: 200, sur: 400, logistico: 700, total: 2100 }
    ];

    const columnas = [
        {
            key: "nombre",
            etiqueta: "Producto",
            renderizar: (valor, fila) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center text-[var(--primary)] font-bold border border-[var(--border-subtle)] text-[11px]">
                        {valor[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold leading-none mb-0.5">{valor}</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-mono">{fila.sku}</span>
                    </div>
                </div>
            )
        },
        { key: "central", etiqueta: "C. Central" },
        { key: "norte", etiqueta: "S. Norte" },
        { key: "sur", etiqueta: "S. Sur" },
        { key: "logistico", etiqueta: "Dep. Logístico" },
        {
            key: "total",
            etiqueta: "Total Global",
            renderizar: (v) => (
                <span className="px-2 py-1 bg-[var(--primary-subtle)] text-[var(--primary)] font-black rounded-md border border-[var(--primary)]/10 text-[11px]">
                    {v.toLocaleString()}
                </span>
            )
        }
    ];

    // --- UI HELPERS ---
    const getStatusConfig = (color) => {
        const configs = {
            emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", icon: <CheckIcono size={12} /> },
            amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", icon: <AdvertenciaIcono size={12} /> },
            blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", icon: <CheckIcono size={12} /> },
            purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", icon: <Package size={12} /> },
        };
        return configs[color] || configs.emerald;
    };

    return (
        <ContenedorSeccion className="px-4 py-8">
            {/* 1. ENCABEZADO STANDALONE (Limpio y formal) */}
            <EncabezadoSeccion
                ruta={"Inventario > Depósito"}
                icono={<InventarioIcono size={20} />}
            />

            {/* 2. BARRA DE ACCIONES (Elegante y funcional) */}
            <div className="flex items-center justify-end mb-8 -mt-4 animate-in fade-in slide-in-from-right-4 duration-700">
                <button
                    onClick={handleNuevaSucursal}
                    className="flex items-center gap-2.5 px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-md shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group/btn"
                >
                    <div className="p-1 bg-white/20 rounded-md group-hover/btn:rotate-90 transition-transform duration-500">
                        <AgregarIcono size={12} />
                    </div>
                    Nuevo Depósito
                </button>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">


                {/* CARDS DE SUCURSAL PREMIUM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sucursales.map((suc) => {
                        const config = getStatusConfig(suc.color);
                        return (
                            <div
                                key={suc.id}
                                className="group relative bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-5 transition-all duration-500 hover:shadow-2xl hover:border-[var(--primary)]/30 overflow-hidden"
                            >
                                {/* Fondo decorativo dinámico */}
                                <div className={`absolute -right-6 -top-6 w-24 h-24 ${config.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000`} />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center border ${config.border} shadow-inner`}>
                                        <MapPin size={20} className={config.text} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleEditarSucursal(suc)}
                                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                                            title="Configurar"
                                        >
                                            <Settings2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 mb-5">
                                    <h3 className="text-[15px] font-black text-[var(--text-primary)] leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">{suc.nombre}</h3>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-medium)]" />
                                        <span className="text-[11px] font-medium tracking-tight truncate">{suc.responsable}</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between relative z-10">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <TrendingUp size={12} className={suc.tendencia.startsWith('+') ? 'text-emerald-500' : 'text-amber-500'} />
                                            <span className={`text-[10px] font-bold ${suc.tendencia.startsWith('+') ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                                                {suc.tendencia}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-none">{suc.stockTotal.toLocaleString()}</p>
                                        <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Unidades Físicas</span>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg ${config.bg} border ${config.border} backdrop-blur-md`}>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${config.text}`}>{suc.estado}</span>
                                    </div>
                                </div>

                                {/* Barra de capacidad minimalista */}
                                <div className="mt-5 h-1 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden border border-[var(--border-subtle)]/30">
                                    <div
                                        className={`h-full bg-gradient-to-r from-[var(--primary-subtle)] to-[var(--primary)] transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min((suc.stockTotal / 4000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* TABLA CONSOLIDAD - CONSISTENCIA VISUAL */}
                <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--surface)] to-[var(--surface-hover)]/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/10 text-[var(--primary)]">
                                <ArcaIcono size={20} />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-black text-[var(--text-primary)] leading-tight">Matriz de Distribución</h2>
                                <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Visibilidad global de productos por punto geográfico.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 md:p-4">
                        <DataTable
                            columnas={columnas}
                            datos={stockPorProducto}
                            mostrarBuscador={true}
                            placeholderBuscador="Filtrar por nombre o SKU..."
                            mostrarAcciones={false}
                            className="border-none shadow-none"
                        />
                    </div>
                </div>
            </div>

            {/* MODAL DE GESTIÓN (CRUD) */}
            <ModalDetalleBase
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                width="max-w-[550px]"
            >
                <FormularioDinamico
                    titulo={modoModal === "crear" ? "Nuevo Punto de Depósito" : "Configurar Depósito"}
                    subtitulo={modoModal === "crear" ? "Complete los datos para dar de alta una nueva ubicación." : "Actualice la información del depósito seleccionado."}
                    campos={camposDeposito}
                    initialData={sucursalSeleccionada}
                    onSubmit={handleSave}
                    onCancel={() => setModalOpen(false)}
                    submitLabel={modoModal === "crear" ? "Confirmar Alta" : "Guardar Cambios"}
                />
            </ModalDetalleBase>
        </ContenedorSeccion>
    );
};

export default Deposito;
