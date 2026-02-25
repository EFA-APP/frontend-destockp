import React from 'react'
import { Link } from 'react-router-dom'

const ArticulosNotificacion = ({ redireccion, icono, titulo, descripcion, hora }) => {
    return (
        <Link
            to={redireccion}
            className="flex items-center gap-3 px-4 py-3 rounded-md! hover:bg-[var(--primary-subtle)] transition-all group border border-transparent hover:border-[var(--primary)]/10"
        >
            {/* Icon Container */}
            <div className="flex-shrink-0 h-10 w-10 rounded-md! bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:border-[var(--primary)]/20 transition-colors">
                {React.isValidElement(icono) ? React.cloneElement(icono, { size: 16 }) : icono}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h5 className="text-[11px] font-bold text-[var(--text-theme)]! group-hover:text-[var(--primary)] transition-colors truncate leading-tight">
                        {titulo}
                    </h5>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] whitespace-nowrap pt-0.5 uppercase tracking-tighter">
                        {hora}
                    </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors line-clamp-1 mt-0.5">
                    {descripcion}
                </p>
            </div>
        </Link>
    )
}

export default ArticulosNotificacion