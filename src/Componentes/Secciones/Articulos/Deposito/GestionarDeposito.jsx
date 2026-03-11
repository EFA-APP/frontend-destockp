import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDepositoUI } from "../../../../Backend/Articulos/hooks/Deposito/useDepositoUI.jsx";
import { InventarioIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";
import { camposDeposito } from "../../../Tablas/Articulos/Deposito/camposDepositos";

/**
 * Componente GestionarDeposito: Maneja tanto el Alta como la Edición de depósitos.
 */
const GestionarDeposito = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Si existe ID, estamos en modo Edición
    const {
        depositos,
        crearDeposito,
        actualizarDeposito,
        estaCreando,
        estaActualizando,
        cargando
    } = useDepositoUI();

    const esEdicion = Boolean(id);

    // Buscar los datos del depósito si es edición
    const depositoAEditar = esEdicion
        ? depositos.find(d => String(d.codigoSecuencial) === id)
        : null;

    const handleSubmit = async (data) => {
        try {
            if (esEdicion) {
                await actualizarDeposito(id, data);
            } else {
                await crearDeposito(data);
            }
            navigate("/panel/inventario/depositos");
        } catch (error) {
            console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} depósito:`, error);
        }
    };

    if (esEdicion && !depositoAEditar && !cargando) {
        return (
            <ContenedorSeccion className="px-3 py-4">
                <div className="text-white text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl">
                    Depósito no encontrado.
                </div>
            </ContenedorSeccion>
        );
    }

    return (
        <ContenedorSeccion className="px-3 py-4">
            <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-xl mb-6 overflow-hidden">
                <EncabezadoSeccion
                    ruta={esEdicion ? "Edición de Sucursal" : "Gestión de Sucursales"}
                    icono={<InventarioIcono size={18} />}
                    volver={true}
                    redireccionAnterior={"/panel/inventario/depositos"}
                />
            </div>

            <FormularioDinamico
                titulo={esEdicion ? "Configurar Depósito" : "Alta de Punto de Depósito"}
                subtitulo={esEdicion
                    ? `Actualice la información de ${depositoAEditar?.nombre || 'la sucursal'}.`
                    : "Registre una nueva ubicación física para la gestión de stock global."}
                campos={camposDeposito}
                initialData={depositoAEditar}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/panel/inventario/depositos")}
                submitLabel={esEdicion
                    ? (estaActualizando ? "Guardando..." : "Guardar Cambios")
                    : (estaCreando ? "Procesando..." : "Confirmar Alta")}
                loading={esEdicion ? estaActualizando : estaCreando}
            />
        </ContenedorSeccion>
    );
};

export default GestionarDeposito;
