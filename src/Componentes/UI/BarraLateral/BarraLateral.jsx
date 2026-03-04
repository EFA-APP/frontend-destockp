import Articulo from "./Articulo";
import {
  ArcaIcono,
  CarritoIcono,
  ColegioIcono,
  ContableIcono,
  InicioIcono,
  InventarioIcono,
  PersonaIcono,
  VentasIcono,
} from "../../../assets/Icons";
import { useTamañoBarraLateral } from "../../../store/useTamanoBarraLateral";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const MENU_ITEMS = [
  {
    id: "inicio",
    nombre: "Inicio",
    icono: <InicioIcono size={18} />,
    redireccion: "/panel/",
    permisoRequerido: "Inicio / Dashboard",
  },
  {
    id: "inventario",
    nombre: "Inventario",
    icono: <InventarioIcono size={20} />,
    permisoRequerido: "Inventario (Productos y Materia Prima)",
    submenu: [
      { nombre: "Productos", redireccion: "/panel/inventario/productos" },
      { nombre: "Materia Prima", redireccion: "/panel/inventario/materia-prima" },
    ],
  },
  {
    id: "contactos",
    nombre: "Contactos",
    icono: <PersonaIcono size={20} />,
    permisoRequerido: "Contactos (Clientes y Proveedores)",
    submenu: [
      { nombre: "Clientes", redireccion: "/panel/contactos/clientes" },
      { nombre: "Proveedores", redireccion: "/panel/contactos/proveedores" },
    ],
  },
  {
    id: "ventas",
    nombre: "Ventas",
    icono: <VentasIcono size={18} />,
    permisoRequerido: "Ventas y Facturación",
    submenu: [
      { nombre: "Facturas", redireccion: "/panel/ventas/facturas" },
      { nombre: "Notas de Créditos", redireccion: "/panel/ventas/notas-creditos" },
      { nombre: "Notas de Débito", redireccion: "/panel/ventas/notas-debitos" },
      { nombre: "Orden de venta", redireccion: "/panel/ventas/orden-ventas" },
    ],
  },
  {
    id: "compras",
    nombre: "Compras",
    icono: <CarritoIcono size={19} />,
    permisoRequerido: "Compras y Gastos",
    submenu: [
      { nombre: "Facturas de proveedor", redireccion: "/panel/compras/facturas-proveedores" },
      { nombre: "Notas de Créditos", redireccion: "/panel/compras/notas-creditos" },
    ],
  },
  {
    id: "escuela",
    nombre: "Escuela",
    icono: <ColegioIcono size={19} />,
    permisoRequerido: "Gestión Escolar",
    submenu: [
      { nombre: "Alumnos", redireccion: "/panel/escuela/alumnos" },
      { nombre: "Cuotas", redireccion: "/panel/escuela/cuotas" },
      { nombre: "Recibos", redireccion: "/panel/escuela/recibos" },
    ],
  },
  {
    id: "contabilidad",
    nombre: "Contabilidad",
    icono: <ContableIcono size={18} />,
    permisoRequerido: "Contabilidad",
    submenu: [
      { nombre: "Plan de Cuentas", redireccion: "/panel/contabilidad/cuentas" },
      { nombre: "Asientos", redireccion: "/panel/contabilidad/asientos" },
      { nombre: "Libro Diario", redireccion: "/panel/contabilidad/libro-diario" },
      { nombre: "Libro Mayor", redireccion: "/panel/contabilidad/libro-mayor" },
      { nombre: "Balance", redireccion: "/panel/contabilidad/balance" },
    ],
  },
  {
    id: "afip",
    nombre: "Mis Comprobantes AFIP",
    icono: <ArcaIcono size={18} />,
    redireccion: "/panel/comprobantes-afip",
    permisoRequerido: "Mis Comprobantes AFIP",
  },
];

const BarraLateral = () => {
  const { isExpanded, setIsExpanded } = useTamañoBarraLateral();
  const usuario = useAuthStore((state) => state.usuario);
  const [openItem, setOpenItem] = useState(null);

  // Extraemos todos los permisos del usuario de sus roles
  const permisosUsuario = useMemo(() => {
    if (!usuario?.roles) return [];

    const setPermisos = new Set();
    console.log(setPermisos)
    usuario.roles.forEach(rol => {
      // Si el rol tiene permisos ya aplanados
      if (rol.permisos && Array.isArray(rol.permisos)) {
        rol.permisos.forEach(p => setPermisos.add({ nombre: p.nombre, codigoSeccion: p.codigoSeccion }));
      }
    });
    return Array.from(setPermisos);
  }, [usuario]);

  // Filtramos el menú según los permisos
  const menuFiltrado = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      // El ítem de Inicio siempre se muestra, o si el usuario tiene el permiso específico
      if (item.id === "inicio") return true;
      return permisosUsuario.includes(item.permisoRequerido);
    });
  }, [permisosUsuario]);

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
