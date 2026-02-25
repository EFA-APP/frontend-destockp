import React from 'react'

const ContenedorSeccion = ({ children }) => {
    return (
        <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--surface-active)] shadow-md rounded-md!">
            {children}
        </div>
    )
}

export default ContenedorSeccion