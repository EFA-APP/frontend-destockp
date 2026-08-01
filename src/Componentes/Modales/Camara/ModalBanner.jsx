import React from "react";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const ModalBanner = ({ isOpen, onClose, registroAEditar, onSubmit }) => {
  if (!isOpen) return null;

  const campos = [
    {
      name: "imagenUrl",
      label: "URL de la Imagen",
      type: "text",
      required: true,
    },
    {
      name: "orden",
      label: "Orden",
      type: "number",
    },
    {
      name: "fechaInicioVigencia",
      label: "Fecha Inicio Vigencia",
      type: "date",
    },
    {
      name: "fechaFinVigencia",
      label: "Fecha Fin Vigencia",
      type: "date",
    },
    {
      name: "linkDestino",
      label: "Link Destino",
      type: "text",
    }
  ];

  return (
    <ModalDetalleBase
      isOpen={isOpen}
      onClose={onClose}
      titulo={registroAEditar ? "Editar Banner" : "Crear Banner"}
    >
      <FormularioDinamico
        campos={campos}
        initialData={registroAEditar}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </ModalDetalleBase>
  );
};

export default ModalBanner;
