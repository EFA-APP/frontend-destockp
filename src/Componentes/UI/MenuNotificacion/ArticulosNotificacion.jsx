import React from 'react'
import { OrdenDeVentaIcono } from '../../../assets/Icons'
import { Link } from 'react-router-dom'

const ArticulosNotificacion = ({ redireccion, icono, titulo, descripcion, hora }) => {
    return (
        <Link to={redireccion} className='relative cursor-default select-none gap-2 rounded-sm text-sm outline-none transition-colors focus:bg-[var(--primary-light)]/90! focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-6 py-3 flex justify-between items-center hover:bg-[var(--primary-light)]/10 cursor-pointer group/link w-full'>
            <div className='flex-shrink-0 rounded-full flex justify-center items-center bg-[var(--primary-opacity-10)]! h-11 w-11'>
                {icono}
            </div>
            <div className='ps-4 flex justify-between w-full'>
                <div className='w-3/4 text-start'>
                    <h5 className='mb-1 text-15 font-semibold group-hover/link:text-[var(--primary)]!'>
                        {titulo}
                    </h5>
                    <p className='text-sm text-bodytext line-clamp-1'>
                        {descripcion}
                    </p>
                </div>
                <div className='text-xs block self-start '>
                    <p>{hora}</p>
                </div>
            </div>
        </Link>
  )
}

export default ArticulosNotificacion