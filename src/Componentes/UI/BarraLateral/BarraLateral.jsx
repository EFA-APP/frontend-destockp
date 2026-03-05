import Articulo from "./Articulo";
import { useTamañoBarraLateral } from "../../../store/useTamanoBarraLateral";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import * as Icons from "../../../assets/Icons";
import { useSeccionesUI } from "../../../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";

// Función para parsear el string del icono que viene del backend (ej: "<InventarioIcono size={20} />")
const parseIcono = (iconStr) => {
  if (!iconStr || typeof iconStr !== "string") return iconStr;

  // Extraemos el nombre del componente del tag (ej: "InventarioIcono")
  const match = iconStr.match(/<(\w+)/);
  if (match && match[1]) {
    const IconComponent = Icons[match[1]];
    // Retornamos el componente con un tamaño por defecto
    return IconComponent ? <IconComponent size={20} /> : null;
  }

  return iconStr;
};

const BarraLateral = () => {
  const { isExpanded, setIsExpanded } = useTamañoBarraLateral();
  const usuario = useAuthStore((state) => state.usuario);
  const [openItem, setOpenItem] = useState(null);

  const { secciones: seccionesApi } = useSeccionesUI();

  // Extraemos todos los códigos de sección permitidos del usuario
  const codigosSeccionPermitidos = useMemo(() => {
    console.log(usuario)
    if (!usuario?.roles) return [];

    const codigos = new Set();
    usuario.roles.forEach(rol => {
      if (rol.permisos && Array.isArray(rol.permisos)) {
        rol.permisos.forEach(p => {
          if (p.codigoSeccion) codigos.add(p.codigoSeccion);
        });
      }
    });
    return Array.from(codigos);
  }, [usuario]);


  // Transformamos y filtramos el menú según los datos de la API y permisos
  const menuFiltrado = useMemo(() => {
    // Siempre incluimos Inicio
    const inicioItem = {
      id: "inicio",
      nombre: "Inicio",
      icono: <Icons.InicioIcono size={18} />,
      redireccion: "/panel/",
      submenu: []
    };

    const seccionesFiltradas = seccionesApi
      .filter(seccion => seccion.activo && codigosSeccionPermitidos.includes(seccion.permisoRequerido))
      .map(seccion => ({
        id: seccion.id_seccion,
        nombre: seccion.nombre,
        icono: parseIcono(seccion.icono) || <Icons.InicioIcono size={18} />, // Fallback icon
        redireccion: seccion.redireccion,
        submenu: seccion.subMenus?.filter(sm => sm.activo).map(sm => ({
          nombre: sm.nombre,
          redireccion: sm.redireccion
        })) || []
      }));

    return [inicioItem, ...seccionesFiltradas];
  }, [seccionesApi, codigosSeccionPermitidos]);

  const handleArticuloClick = (e, itemId) => {
    if (!isExpanded) {
      // Si está colapsado, expande y abre el submenú
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(true);
    }
  };

  const toggleItem = (id) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setOpenItem(id);
    } else {
      setOpenItem(openItem === id ? null : id);
    }
  };

  return (
    <div className="block ">
      <aside
        className={`bg-[var(--fill)]! md:bg-transparent! pt-2 fixed transition-all duration-300 ease-in-out start-3 top-0 rtl:pe-4 rtl:ps-0 flex flex-col  z-[99999999] `}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* LOGO */}
        <div className="flex items-center py-2 px-2">
          <Link to="/" data-discover="true">
            <img
              alt="logo"
              className="block w-10 rounded-full"
              src="/efa-logo.png"
            />
          </Link>
        </div>

        {/* ITEMS */}
        <div className="relative h-[calc(100vh-85px)]">
          <div className="mt-4 space-y-2 border-t pt-2 border-[var(--border-subtle)]">
            <div className="min-w-full table">
              <div className="pe-4 rtl:pe-0 rtl:ps-4 list-none">
                <div className="mt-4 space-y-2 border-t pt-2 first:mt-0 first:border-t-0 first:pt-0 border-[var(--border-subtle)] hide-menu">
                  <div className="mt-1 flex flex-col pl-2">
                    {menuFiltrado.map((item) => (
                      <div key={item.id} onClick={(e) => handleArticuloClick(e, item.id)}>
                        <Articulo
                          nombre={isExpanded ? item.nombre : ""}
                          icono={item.icono}
                          redireccion={item.redireccion}
                          submenu={isExpanded ? item.submenu : undefined}
                          isOpen={openItem === item.id}
                          onToggle={() => toggleItem(item.id)}
                          isCollapsed={!isExpanded}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BarraLateral;
