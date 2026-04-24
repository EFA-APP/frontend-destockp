import { useEffect, useState } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useActualizarPerfil } from "../../../Backend/Autenticacion/queries/Usuario/useActualizarPerfil.mutation";
import { useCambiarContrasena } from "../../../Backend/Autenticacion/queries/Usuario/useCambiarContrasena.mutation";
import { useAlertas } from "../../../store/useAlertas";
import { ConfiguracionIcono, CuentaIcono } from "../../../assets/Icons";
import Boton from "../../UI/Boton/Boton";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import InputReutilizable from "../../UI/InputReutilizable/InputReutilizable";
import ModalConfiguracionVisual from "../../Modales/Empresa/ModalConfiguracionVisual";
import ModalConfiguracionFiscal from "../../Modales/Empresa/ModalConfiguracionFiscal";

const Configuracion = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const { mutate: actualizarPerfil, isPending: estaActualizandoPerfil } =
    useActualizarPerfil();
  const { mutate: cambiarContrasena, isPending: estaCambiandoPass } =
    useCambiarContrasena();
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  // States Datos Personales
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");

  // States Modales Empresa
  const [modalVisualOpen, setModalVisualOpen] = useState(false);
  const [modalFiscalOpen, setModalFiscalOpen] = useState(false);

  // States Contraseña
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNueva, setConfirmarNueva] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setApellido(usuario.apellido || "");
      setEmail(usuario.correoElectronico || "");
    }
  }, [usuario]);

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      agregarAlerta({
        type: "warning",
        message: "Nombre y Apellido son requeridos.",
      });
      return;
    }
    actualizarPerfil({ nombre, apellido });
  };

  const handleCambiarPass = async (e) => {
    e.preventDefault();
    if (!contrasenaActual || !nuevaContrasena || !confirmarNueva) {
      agregarAlerta({
        type: "warning",
        message: "Complete todos los campos de contraseña.",
      });
      return;
    }
    if (nuevaContrasena !== confirmarNueva) {
      agregarAlerta({
        type: "error",
        message: "Las nuevas contraseñas no coinciden.",
      });
      return;
    }
    cambiarContrasena(
      { contrasenaActual, nuevaContrasena },
      {
        onSuccess: () => {
          setContrasenaActual("");
          setNuevaContrasena("");
          setConfirmarNueva("");
        },
      },
    );
  };

  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return (
    <div className="w-full py-6 px-4 md:px-6 h-auto space-y-6">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Configuración > Mi Perfil"}
        icono={<ConfiguracionIcono />}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-12 gap-6">
        {/* TARJETA RESUMEN / AVATAR */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-6 shadow-md flex flex-col items-center text-center     hover:border-[var(--primary)]/20 ">
            {/* AVATAR FORMAL */}
            <div className="group relative w-24 h-24 rounded-full bg-[var(--surface-hover)] border-2 border-[var(--border-subtle)] flex items-center justify-center text-black text-3xl font-bold shadow-md mb-4 select-none cursor-pointer">
              <span className="text-[var(--primary)]">{iniciales || "?"}</span>
              {/* Overlay Hover */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center  ">
                <svg
                  className="w-5 h-5 text-black mb-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span className="text-[10px] text-black font-medium uppercase">
                  Cambiar
                </span>
              </div>
            </div>

            <h3 className="text-[18px] font-bold text-black tracking-tight">
              {nombre} {apellido}
            </h3>

            <div className="mt-1">
              <span className="text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-subtle)] px-2.5 py-0.5 rounded-md border border-[var(--primary)]/20 uppercase tracking-wider">
                {usuario?.roles?.[0]?.nombre || "Usuario"}
              </span>
            </div>

            <p className="text-[13px] text-[var(--text-muted)] mt-1.5 font-medium">
              {email}
            </p>

            <div className="w-full border-t border-[var(--border-subtle)] mt-5 pt-4 text-left space-y-2">
              <div className="flex justify-between items-center p-1.5 rounded-md">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  ID de Usuario
                </span>
                <span className="font-mono text-[13px] font-bold text-[var(--primary)]">
                  #{usuario?.codigoSecuencial?.toString().padStart(4, "0")}
                </span>
              </div>
              <div className="flex justify-between items-center p-1.5 rounded-md">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Empresa
                </span>
                <span className="text-[13px] font-bold text-black">
                  #{usuario?.codigoEmpresa}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIOS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* DATOS PERSONALES */}
          <form
            onSubmit={handleGuardarPerfil}
            className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-5 shadow-md    "
          >
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-subtle)] pb-3">
              <div className="text-[var(--primary)]">
                <CuentaIcono size={16} />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-black uppercase tracking-tight">
                  Datos Personales
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  Información básica de tu cuenta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputReutilizable
                label={"Nombre"}
                valor={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <InputReutilizable
                label={"Apellido"}
                valor={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
              <div className="md:col-span-2 opacity-60">
                <InputReutilizable
                  label={"Correo Electrónico (Solo Lectura)"}
                  valor={email}
                  onChange={() => {}}
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Boton
                texto={
                  estaActualizandoPerfil ? "Guardando..." : "Guardar Perfil"
                }
                bg={"bg-[var(--primary)]!"}
                tipo="submit"
                disabled={estaActualizandoPerfil}
              />
            </div>
          </form>

          {/* CAMBIO DE CONTRASEÑA */}
          <form
            onSubmit={handleCambiarPass}
            className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-5 shadow-md     delay-100"
          >
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-subtle)] pb-3">
              <div className="text-rose-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-black uppercase tracking-tight">
                  Seguridad de la Cuenta
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  Actualizar contraseña de acceso.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <InputReutilizable
                label={"Contraseña Actual"}
                tipo={"password"}
                valor={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputReutilizable
                  label={"Nueva Contraseña"}
                  tipo={"password"}
                  valor={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                />
                <InputReutilizable
                  label={"Confirmar Nueva Contraseña"}
                  tipo={"password"}
                  valor={confirmarNueva}
                  onChange={(e) => setConfirmarNueva(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Boton
                texto={
                  estaCambiandoPass ? "Cambiando..." : "Actualizar Contraseña"
                }
                bg={"bg-rose-600!"}
                tipo="submit"
                disabled={estaCambiandoPass}
              />
            </div>
          </form>

          {/* MI EMPRESA (ADMINS ONLY) */}
          {(usuario?.roles?.some((r) => r.nombre.includes("Admin")) ||
            usuario?.codigoSecuencial === 1) && (
            <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-5 shadow-md     delay-200">
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-subtle)] pb-3">
                <div className="text-emerald-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-black uppercase tracking-tight">
                    Mi Empresa
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">
                    Gestión administrativa y fiscal del negocio.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--surface-hover)] p-4 rounded-lg border border-[var(--border-subtle)] flex flex-col justify-between items-start gap-4">
                  <div>
                    <h5 className="text-[13px] font-bold text-black! uppercase tracking-tight">
                      Configuración Fiscal y AFIP
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Suscripción certificados, ambientes, punto de venta y
                      datos maestros.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalFiscalOpen(true)}
                    className="px-3 py-1.5 bg-black/5 border border-black/10 hover:bg-black/10 text-[12px] font-bold text-black rounded-md  uppercase tracking-wider"
                  >
                    Gestionar AFIP
                  </button>
                </div>

                <div className="bg-[var(--surface-hover)] p-4 rounded-lg border border-[var(--border-subtle)] flex flex-col justify-between items-start gap-4">
                  <div>
                    <h5 className="text-[13px] font-bold text-black! uppercase tracking-tight">
                      Diseño y White-Labeling
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Logo corporativo y paleta de colores del sistema.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalVisualOpen(true)}
                    className="px-3 py-1.5 bg-black/5 border border-black/10 hover:bg-black/10 text-[12px] font-bold text-black rounded-md  uppercase tracking-wider"
                  >
                    Configuración Visual
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES DE EMPRESA */}
      <ModalConfiguracionVisual
        isOpen={modalVisualOpen}
        onClose={() => setModalVisualOpen(false)}
      />

      <ModalConfiguracionFiscal
        isOpen={modalFiscalOpen}
        onClose={() => setModalFiscalOpen(false)}
      />
    </div>
  );
};

export default Configuracion;
