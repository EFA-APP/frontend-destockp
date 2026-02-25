
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
    <div className="absolute right-0 top-full mt-2 z-50 w-screen sm:w-[380px] rounded-md! bg-[var(--surface)] border border-[var(--border-subtle)] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">
            Notificaciones
          </h3>
          <span className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium">Alertas del sistema y avisos</span>
        </div>
        <span className="inline-flex items-center rounded-md! bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
          1 nuevo
        </span>
      </div>

      {/* LISTA CON SCROLL */}
      <div className="max-h-[400px] overflow-y-auto px-1 py-1 custom-scrollbar bg-[var(--surface)]">
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

      {/* FOOTER */}
      <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--fill-secondary)]/10">
        <button className="w-full py-2! text-[10px]! font-bold! text-[var(--text-muted)]! hover:text-[var(--primary)]! transition-colors uppercase tracking-widest">
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
};

export default MenuNotificacion;
