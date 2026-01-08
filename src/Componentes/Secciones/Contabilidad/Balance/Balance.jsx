import React from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { BalanceIcono, DescargarIcono } from "../../../../assets/Icons";
import FechaInput from "../../../UI/FechaInput/FechaInput";

const Balance = () => {
    return (
        <div className="p-6 space-y-6">

            {/* Card principal */}
            <div
                className="rounded-md shadow-md border border-gray-700/40 bg-[var(--fill)]"
            >
                {/* Header */}
                <EncabezadoSeccion ruta={"Balance"} icono={<BalanceIcono size={20} />} />

                {/* Filtros */}
                <div
                    className="px-6 py-4 flex gap-4 border-b border-gray-700/40 items-center"
                >
                    <FechaInput
                        label="Desde:"
                        value={""}
                        onChange={() => console.log("pedro")}
                        size="sm"
                    />
                    <FechaInput
                        label="Hasta:"
                        value={""}
                        onChange={() => console.log("pedro")}
                        size="sm"
                    />

                    <button className="w-auto h-10 mt-5 px-2  text-left text-[var(--primary)]! rounded-md! bg-[var(--primary)]/10! flex items-center gap-2 cursor-pointer hover:bg-[var(--primary)]/5!" >
                        <DescargarIcono />
                        Exportar Excel
                    </button>

                </div>

                {/* Contenido */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

                    {/* ACTIVO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Activo</h3>

                        <div
                            className="rounded-md border border-gray-700/40 bg-[var(--fill2)]"
                        >
                            <FilaCuenta label="Caja y Bancos" monto={15000} />
                            <FilaCuenta label="Créditos por Cobrar" monto={8000} />
                            <FilaTotal label="Total Activo Corriente" monto={23000} />

                            <div className="border-t border-gray-700/40" />

                            <FilaCuenta label="Bienes de Uso" monto={50000} />
                            <FilaTotal label="Total Activo No Corriente" monto={50000} />

                            <FilaTotalFinal label="TOTAL ACTIVO" monto={73000} />
                        </div>
                    </div>

                    {/* PASIVO + PATRIMONIO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                            Pasivo y Patrimonio
                        </h3>

                        <div
                            className="rounded-md border border-gray-700/40 bg-[var(--fill2)]"
                        >
                            <FilaCuenta label="Proveedores" monto={12000} />
                            <FilaCuenta label="Deudas CP" monto={5000} />
                            <FilaTotal label="Total Pasivo Corriente" monto={17000} />

                            <div className="border-t border-gray-700/40" />

                            <FilaCuenta label="Deudas LP" monto={30000} />
                            <FilaTotal label="Total Pasivo No Corriente" monto={30000} />

                            <FilaCuenta label="Patrimonio Neto" monto={28000} />

                            <FilaTotalFinal label="TOTAL PASIVO + PN" monto={75000} />
                        </div>
                    </div>
                </div>

                {/* Estado del balance */}
                <div
                    className="bg-[var(--primary-opacity-10)] px-6 py-4 border-t border-[var(--primary)] flex justify-between items-center"
                >
                    <p className="text-sm text-[var(--primary)] font-semibold">
                        Total Activo: <span className="text-white">$73.000</span>
                    </p>

                    <p className="text-sm text-red-400 font-semibold">
                        Desbalanceado ✖
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ───────────── Subcomponentes ───────────── */

const FilaCuenta = ({ label, monto }) => (
    <div className="flex justify-between px-4 py-2 text-sm text-gray-300">
        <span>{label}</span>
        <span className="text-white">${monto.toLocaleString()}</span>
    </div>
);

const FilaTotal = ({ label, monto }) => (
    <div className="flex justify-between px-4 py-2 text-sm font-medium text-gray-200 border-t border-gray-700/40">
        <span>{label}</span>
        <span>${monto.toLocaleString()}</span>
    </div>
);

const FilaTotalFinal = ({ label, monto }) => (
    <div
        className="flex justify-between px-4 py-3 text-sm font-semibold bg-[var(--primary-opcaity-10)]"
    >
        <span className="text-[var(--primary)]">{label}</span>
        <span className="text-[var(--primary)]">
            ${monto.toLocaleString()}
        </span>
    </div>
);

export default Balance;
