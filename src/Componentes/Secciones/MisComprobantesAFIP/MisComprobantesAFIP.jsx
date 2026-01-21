import React from 'react'
import EncabezadoSeccion from '../../UI/EncabezadoSeccion/EncabezadoSeccion';
import { ArcaIcono } from '../../../assets/Icons';
import TablaMisComprobantesAFIP from '../../Tablas/MisComprobantesAFIP/TablaMisComprobantesAFIP';

const MisComprobantesAFIP = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Mis Comprobantes AFIP"} icono={<ArcaIcono size={20} />} />

      <TablaMisComprobantesAFIP/>
    </div>
  );
}

export default MisComprobantesAFIP