
import { OrdenDeVentaIcono } from "../../../assets/Icons";
import ArticulosNotificacion from "./ArticulosNotificacion";

export const notificacionesFake = [
    {
        id: 1,
        redireccion: "/ventas/ordenes/123",
        icono: <OrdenDeVentaIcono color={"var(--primary)"} />,
        titulo: "Nueva orden de venta",
        descripcion: "Se creó la orden de venta N° 123",
        hora: "10:20 A.M",
    },
    {
        id: 2,
        redireccion: "/empresas/2",
        icono: <OrdenDeVentaIcono color={"var(--primary)"} />,
        titulo: "Empresa asociada aprobada",
        descripcion: "ENERGY TRADERS SA fue aprobada",
        hora: "10:20 A.M",
    },
    {
        id: 3,
        redireccion: "/pagos",
        icono: <OrdenDeVentaIcono color={"var(--primary)"} />,
        titulo: "Pago registrado",
        descripcion: "Se registró un nuevo pago correctamente",
        hora: "12:20 A.M",
    },
    {
        id: 4,
        redireccion: "/stock",
        icono: <OrdenDeVentaIcono color={"var(--primary)"} />,
        titulo: "Stock bajo",
        descripcion: "El artículo A-234 tiene stock crítico",
        hora: "08:20 A.M",
    },
    {
        id: 5,
        redireccion: "/reportes",
        icono: <OrdenDeVentaIcono color={"var(--primary)"} />,
        titulo: "Reporte generado",
        descripcion: "El reporte mensual ya está disponible",
        hora: "11/10/26",
    },
];


const MenuNotificacion = () => {
  return (
    <div className="fixed right-5 top-12 z-50 mt-3 w-screen sm:w-[360px] rounded-sm           bg-gradient-to-b from-[var(--fill)] to-[var(--fill)]
          border border-gray-300/70
          shadow-[0_25px_70px_rgba(209,112,16,.1)] text-white">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 pb-3 pt-4 border-b border-gray-300/10">
        <h3 className="text-lg font-semibold">
          Notificaciones
        </h3>
        <span className="inline-flex items-center rounded-md bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold">
          1 nuevo
        </span>
      </div>

      {/* LISTA CON SCROLL */}
      <div className="max-h-80 overflow-y-auto px-1 py-2 custom-scrollbar">
        {notificacionesFake.map((notificacion) => (
          <ArticulosNotificacion
            key={notificacion.id}
            redireccion={notificacion.redireccion}
            icono={notificacion.icono}
            titulo={notificacion.titulo}
            descripcion={notificacion.descripcion}
            hora={notificacion.hora}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuNotificacion;
