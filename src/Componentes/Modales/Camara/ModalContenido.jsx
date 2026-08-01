import React from "react";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import FormularioDinamico from "../../UI/FormularioReutilizable/FormularioDinamico";

const ModalContenido = ({ isOpen, onClose, registroAEditar, onSubmit }) => {
  if (!isOpen) return null;

  const campos = [
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "NOTICIA", label: "Noticias" },
        { value: "SERVICIO", label: "Capacitaciones" },
        { value: "CAMPANA", label: "Campañas" },
      ],
      required: true,
    },
    {
      name: "titulo",
      label: "Título",
      type: "text",
      required: true,
    },
    {
      name: "cuerpo",
      label: "Cuerpo",
      type: "textarea",
      required: true,
    },
    {
      name: "imagenUrl",
      label: "URL de la Imagen",
      type: "text",
    },
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
    },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "BORRADOR", label: "Borrador" },
        { value: "PUBLICADO", label: "Publicado" },
      ],
    },
    {
      name: "categoria",
      label: "Categoría",
      type: "text",
      hidden: (formData) => formData.tipo !== "CAMPANA",
    },
    {
      name: "copete",
      label: "Copete",
      type: "text",
      hidden: (formData) => formData.tipo !== "CAMPANA",
    }
  ];

  const handleSubmit = (data) => {
    if (data.tipo !== "CAMPANA") {
      delete data.categoria;
      delete data.copete;
    }
    onSubmit(data);
  };

  return (
    <ModalDetalleBase
      isOpen={isOpen}
      onClose={onClose}
      titulo={registroAEditar ? "Editar Contenido" : "Crear Contenido"}
    >
      <FormularioDinamico
        campos={campos}
        initialData={registroAEditar}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalDetalleBase>
  );
};

export default ModalContenido;
