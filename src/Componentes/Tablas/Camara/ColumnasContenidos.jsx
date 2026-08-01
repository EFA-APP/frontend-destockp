export const ETIQUETA_TIPO_CONTENIDO = {
  NOTICIA: "Noticias",
  SERVICIO: "Capacitaciones",
  CAMPANA: "Campañas",
};

export const columnasContenidos = [
  { key: "titulo", etiqueta: "Título" },
  { 
    key: "tipo", 
    etiqueta: "Tipo", 
    renderizar: (val, fila) => ETIQUETA_TIPO_CONTENIDO[fila.tipo] || fila.tipo 
  },
  { key: "estado", etiqueta: "Estado" },
  { 
    key: "fecha", 
    etiqueta: "Fecha", 
    renderizar: (val, fila) => fila.fecha ? new Date(fila.fecha).toLocaleDateString() : "-"
  },
];
