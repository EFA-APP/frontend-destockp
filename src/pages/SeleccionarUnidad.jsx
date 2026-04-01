import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../Backend/Autenticacion/store/authenticacion.store";
import { useSeleccionarUnidad } from "../Backend/Autenticacion/queries/Usuario/useSeleccionarUnidad.mutation";
import { Building2, Store, School, Factory, ArrowRight } from "lucide-react";

const SeleccionarUnidad = () => {
    const usuario = useAuthStore(state => state.usuario);
    const { mutate: seleccionar, isPending } = useSeleccionarUnidad();
    const navigate = useNavigate();

    const handleSeleccionar = (un) => {
        seleccionar({
            codigoUsuarioSecuencial: usuario.codigoSecuencial,
            codigoUnidadNegocioSecuencial: un.codigoSecuencial
        }, {
            onSuccess: () => navigate("/panel")
        });
    };

    // Helper para iconos dinámicos según el nombre o config
    const getIcon = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes("fabrica") || n.includes("taller")) return <Factory size={32} />;
        if (n.includes("colegio") || n.includes("escuela")) return <School size={32} />;
        if (n.includes("local") || n.includes("tienda")) return <Store size={32} />;
        return <Building2 size={32} />;
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)",
            padding: "20px"
        }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-main)" }}>
                    Hola, {usuario?.nombre} 👋
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                    ¿En qué actividad vas a trabajar hoy?
                </p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                width: "100%",
                maxWidth: "900px"
            }}>
                {usuario?.unidadesNegocio?.map((un) => (
                    <div 
                        key={un.codigoSecuencial}
                        onClick={() => !isPending && handleSeleccionar(un)}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "16px",
                            padding: "32px",
                            cursor: isPending ? "wait" : "pointer",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-8px)";
                            e.currentTarget.style.borderColor = "var(--primary)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "var(--border)";
                        }}
                    >
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "12px",
                            background: "var(--primary-container, rgba(var(--p-h), var(--p-s), var(--p-l), 0.1))",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "20px"
                        }}>
                            {getIcon(un.nombre)}
                        </div>

                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "8px" }}>
                            {un.nombre}
                        </h3>
                        
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                            Entrar a {un.nombre}
                        </p>

                        <div style={{
                            marginTop: "20px",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "500"
                        }}>
                            Continuar <ArrowRight size={16} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "40px" }}>
                <button 
                    onClick={() => {
                        useAuthStore.getState().clearAuth();
                        navigate("/");
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default SeleccionarUnidad;
