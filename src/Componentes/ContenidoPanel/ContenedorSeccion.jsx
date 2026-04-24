import React from "react";

const ContenedorSeccion = ({ children }) => {
  return (
    <div className="px-5 py-4 border-0 card no-inset no-ring bg-[var(--primary)]/5 rounded-md">
      {children}
    </div>
  );
};

export default ContenedorSeccion;
