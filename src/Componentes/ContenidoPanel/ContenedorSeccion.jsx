import React from "react";

const ContenedorSeccion = ({ children }) => {
  return (
    <div className="px-1 mb-20 md:mb-0 md:px-5 md:py-4 border-0 card no-inset no-ring bg-[var(--primary)]/5 rounded-md">
      {children}
    </div>
  );
};

export default ContenedorSeccion;
