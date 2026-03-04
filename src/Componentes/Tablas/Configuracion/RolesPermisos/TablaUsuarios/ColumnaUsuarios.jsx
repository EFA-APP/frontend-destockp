export const columnasUsuarios = [
    { etiqueta: "Nombre", key: "nombre", renderizar: (valor, fila) => `${fila.nombre} ${fila.apellido}` },
    { etiqueta: "Correo", key: "correoElectronico" },
    {
        etiqueta: "Rol Asignado",
        key: "roles",
        renderizar: (valor) => valor ? (
            <span className="px-2 py-1 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold rounded-md uppercase">
                {valor.map(rol => rol.nombre).join(", ")}
            </span>
        ) : (
            <span className="text-[var(--text-secondary)] italic text-xs">Sin asignar</span>
        )
    },
];