import { useNavigate, useSearchParams } from "react-router-dom";
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
    const [searchParams] = useSearchParams();
    const id = searchParams.get("codigoSecuencial");
    
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
            // Sanitización del payload: eliminamos metadatos que el backend prohíbe en el cuerpo del PATCH
            // eslint-disable-next-line no-unused-vars
            const { 
                codigoSecuencial: _cs, 
                codigoEmpresa: _ce, 
                createdAt: _ca, 
                updatedAt: _ua, 
                id: _id, 
                ...payload 
            } = data;

            if (esEdicion) {
                // El backend espera los datos limpios; el código va por query param (gestionado en la API)
                await actualizarDeposito(id, payload);
            } else {
                await crearDeposito(payload);
            }
            navigate("/panel/inventario/depositos");
        } catch (error) {
            console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} depósito:`, error);
        }
    };

    // Si estamos en edición y aún no tenemos los datos del depósito pero sigue cargando
    if (esEdicion && !depositoAEditar && cargando) {
        return (
            <ContenedorSeccion className="px-3 py-4">
                <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl animate-pulse">
                    <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full mb-4" />
                    <div className="h-4 w-48 bg-white/5 rounded-full mb-2" />
                    <div className="h-3 w-32 bg-white/5 rounded-full" />
                </div>
            </ContenedorSeccion>
        );
    }

    if (esEdicion && !depositoAEditar && !cargando) {
        return (
            <ContenedorSeccion className="px-3 py-4">
                <div className="text-white text-center p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl shadow-xl backdrop-blur-sm">
                    <p className="text-rose-500 font-black uppercase tracking-widest mb-2">Error de Identificación</p>
                    <p className="text-white/60 font-medium italic">El depósito con código <span className="text-white font-bold">#{id}</span> no fue encontrado o no existe.</p>
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
            />
        </ContenedorSeccion>
    );
};

export default GestionarDeposito;
