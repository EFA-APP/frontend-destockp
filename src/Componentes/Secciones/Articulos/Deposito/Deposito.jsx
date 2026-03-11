import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DataTable from "../../../UI/DataTable/DataTable";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import {
    InventarioIcono,
    ArcaIcono,
    AgregarIcono,
} from "../../../../assets/Icons";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { camposDeposito } from "../../../Tablas/Articulos/Deposito/camposDepositos";
import TarjetaDeposito from "./TarjetaDeposito.jsx";
import TablaDepositoStock from "../../../Tablas/Articulos/Deposito/TablaDepositoStock";

/**
 * Componente Deposito: Gestión de sucursales y stock global.
 * Integrado con el backend real para CRUD de depósitos.
 */
const Deposito = () => {
    const {
        depositos,
        cargando,
        crearDeposito,
        actualizarDeposito,
        estaCreando,
        estaActualizando
    } = useDepositoUI();
    const navigate = useNavigate();

    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

    // --- LÓGICA CRUD ---
    const handleNuevaSucursal = () => {
        navigate("/panel/inventario/depositos/nuevo");
    };

    const handleEditarSucursal = (suc) => {
        navigate(`/panel/inventario/depositos/editar/${suc.codigoSecuencial}`);
    };


    return (
        <ContenedorSeccion className="px-4 py-8">
            {/* 1. ENCABEZADO STANDALONE */}
            <EncabezadoSeccion
                ruta={"Inventario > Depósito"}
                icono={<InventarioIcono size={20} />}
            />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* CARDS DE SUCURSAL REALES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cargando ? (
                        [1, 2, 3, 4].map(n => (
                            <div key={n} className="h-48 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] animate-pulse" />
                        ))
                    ) : (
                        depositos.map((suc) => (
                            <TarjetaDeposito
                                key={suc.codigoSecuencial}
                                suc={suc}
                                onEdit={handleEditarSucursal}
                            />
                        ))
                    )}
                </div>

                {/* 2. BARRA DE ACCIONES */}
                <div className="flex items-center justify-start mb-4 -mt-2 animate-in fade-in slide-in-from-right-4 duration-700">
                    <button
                        onClick={handleNuevaSucursal}
                        className="flex items-center gap-2.5 px-2 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-md shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group/btn cursor-pointer"
                    >
                        <AgregarIcono size={10} />
                        Nuevo Depósito
                    </button>
                </div>

                {/* TABLA CONSOLIDADO MODULARIZADA */}
                <TablaDepositoStock />
            </div>

        </ContenedorSeccion>
    );
};

export default Deposito;
