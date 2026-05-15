import React from "react";

const ContenedorSeccion = ({ children }) => {
  return (
    <div className="px-1 mb-20 md:mb-0 md:px-5 md:py-4 card">{children}</div>
  );
};

export default ContenedorSeccion;
