export const columnasBanners = [
  { key: "orden", etiqueta: "Orden" },
  { 
    key: "imagenUrl",
    etiqueta: "Imagen", 
    renderizar: (val, fila) => (
      <img 
        src={fila.imagenUrl} 
        alt="Banner" 
        style={{ width: "100px", height: "auto", borderRadius: "4px" }} 
      />
    )
  },
  { 
    key: "fechaInicioVigencia",
    etiqueta: "Inicio Vigencia", 
    renderizar: (val, fila) => fila.fechaInicioVigencia ? new Date(fila.fechaInicioVigencia).toLocaleDateString() : "-"
  },
  { 
    key: "fechaFinVigencia",
    etiqueta: "Fin Vigencia", 
    renderizar: (val, fila) => fila.fechaFinVigencia ? new Date(fila.fechaFinVigencia).toLocaleDateString() : "-"
  },
  { 
    key: "linkDestino",
    etiqueta: "Link Destino", 
    renderizar: (val, fila) => fila.linkDestino ? (
      <a href={fila.linkDestino} target="_blank" rel="noreferrer">Ver Link</a>
    ) : "-"
  }
];
