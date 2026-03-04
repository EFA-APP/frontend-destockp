import { useState } from "react";
import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { CandadoIcono, PersonaIcono } from "../../../../../assets/Icons";
import ModalAsignarRolUsuario from "../../../../Modales/Configuracion/RolesPermisos/ModalAsignarRolUsuario";
import TablaConTabs from "../../../../UI/TablaConTabs/TablaConTabs";
import ContenedorSeccion from "../../../../ContenidoPanel/ContenedorSeccion";
import TablaRoles from "../../../../Tablas/Configuracion/RolesPermisos/TablaRoles/TablaRoles";
import TablaUsuarios from "../../../../Tablas/Configuracion/RolesPermisos/TablaUsuarios/TablaUsuarios";

const RolesPermisos = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const vistas = [
        {
            titulo: "Roles",
            icono: <CandadoIcono size={20} />,
            renderTabla: () => <TablaRoles />
        },
        {
            titulo: "Usuarios",
            icono: <PersonaIcono size={20} />,
            renderTabla: () => (
                <TablaUsuarios
                    onAsignarRol={(usuario) => {
                        setUsuarioSeleccionado(usuario);
                        setIsModalOpen(true);
                    }}
                />
            )
        }
    ];

    return (
        <div className="px-3 py-4 border-0 card no-inset no-ring shadow-md rounded-md w-full">
            <EncabezadoSeccion
                ruta={"Configuración > Usuarios y Roles"}
                icono={<CandadoIcono size={22} />}
            />

            <ContenedorSeccion>
                <TablaConTabs
                    vistas={vistas}
                    vistaInicial={0}
                />
            </ContenedorSeccion>

            <ModalAsignarRolUsuario
                isOpen={isModalOpen}
                usuario={usuarioSeleccionado}
                onClose={() => {
                    setIsModalOpen(false);
                    setUsuarioSeleccionado(null);
                }}
            />
        </div>
    );
};

export default RolesPermisos;
