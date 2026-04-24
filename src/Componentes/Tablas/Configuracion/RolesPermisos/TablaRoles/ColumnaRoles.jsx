export const columnasRoles = [
    { etiqueta: "ID", key: "codigoSecuencial" },
    { etiqueta: "Nombre del Rol", key: "nombre" },
    { etiqueta: "Descripción", key: "descripcion" },
    {
        etiqueta: "Secciones Permitidas",
        key: "permisos",
        renderizar: (valor) => (
            <div className="flex flex-wrap gap-1">
                {valor?.map((sec, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[12px] font-medium rounded-md shadow-sm flex items-center gap-1.5  hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                        {sec}
                    </span>
                ))}
            </div>
        )
    },
];