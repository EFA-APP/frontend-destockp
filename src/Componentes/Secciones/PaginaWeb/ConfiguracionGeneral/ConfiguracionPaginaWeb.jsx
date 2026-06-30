import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  Globe,
  Settings,
  Palette,
  BookOpen,
  Image,
  Share2,
  Mail,
  Phone,
  MapPin,
  Menu,
} from "lucide-react";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { axiosInitial } from "../../../../Backend/Config";


export default function ConfiguracionPaginaWeb() {
  const usuario = useAuthStore((state) => state.usuario);
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);
  const navigate = useNavigate();

  // Navigation / Preview States
  const [activeTab, setActiveTab] = useState("general");
  const [viewport, setViewport] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Form Field States
  const [subDominio, setSubDominio] = useState("");
  const [dominioPersonalizado, setDominioPersonalizado] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [favicon, setFavicon] = useState("");
  const [colorPrimario, setColorPrimario] = useState("#4f46e5");
  const [colorSecundario, setColorSecundario] = useState("#06b6d4");
  const [historia, setHistoria] = useState("");

  // Socials
  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    whatsapp: "",
  });

  // Contact Details
  const [direccion, setDireccion] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");

  // Gallery
  const [gallery, setGallery] = useState([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState("");

  // Custom Sections
  const [customSections, setCustomSections] = useState([]);

  // Fetch Existing Data on Mount
  useEffect(() => {
    const fetchExistingConfig = async () => {
      if (!usuario || !usuario.codigoEmpresa) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await axiosInitial.get(
          `/paginas-web/empresa/${usuario.codigoEmpresa}`,
        );
        if (data) {
          setSubDominio(data.subDominio || "");
          setDominioPersonalizado(data.dominioPersonalizado || "");
          setTitulo(data.titulo || "");
          setDescripcion(data.descripcion || "");
          setLogo(data.logo || "");
          setBanner(data.banner || "");
          setFavicon(data.favicon || "");
          setColorPrimario(data.colorPrimario || "#4f46e5");
          setColorSecundario(data.colorSecundario || "#06b6d4");
          setHistoria(data.historia || "");

          // Load Socials & Contact details from redesSociales JSON array
          let loadedDireccion = "";
          let loadedEmail = "";
          let loadedTelefono = "";

          if (Array.isArray(data.redesSociales)) {
            const mapped = {
              facebook: "",
              instagram: "",
              linkedin: "",
              whatsapp: "",
            };
            data.redesSociales.forEach((s) => {
              if (s && s.plataforma) {
                const plat = s.plataforma.toLowerCase();
                if (plat === "email") loadedEmail = s.url || "";
                else if (plat === "telefono") loadedTelefono = s.url || "";
                else if (plat === "direccion") loadedDireccion = s.url || "";
                else mapped[plat] = s.url || "";
              }
            });
            setSocials(mapped);
          }

          setDireccion(
            loadedDireccion || usuario.direccion || "Av. Las Heras 1234, CABA",
          );
          setCorreoContacto(
            loadedEmail || usuario.correoElectronico || "contacto@empresa.com",
          );
          setTelefonoContacto(
            loadedTelefono || usuario.telefono || "5493415550199",
          );

          // Load Gallery
          if (Array.isArray(data.galeria)) {
            setGallery(
              data.galeria.sort((a, b) => (a.orden || 0) - (b.orden || 0)),
            );
          }

          // Load Sections
          if (Array.isArray(data.secciones)) {
            setCustomSections(
              data.secciones.sort((a, b) => (a.orden || 0) - (b.orden || 0)),
            );
          }
        } else {
          // Initialize defaults based on user info
          setSubDominio(
            usuario.nombreEmpresa?.toLowerCase().replace(/\s+/g, "-") || "",
          );
          setTitulo(usuario.nombreEmpresa || "Mi Empresa Corporativa");
          setDescripcion(
            "Soluciones líderes e innovación para el sector industrial.",
          );
          setLogo(usuario.configuracionVisual?.logoUrl || "");
          setBanner(
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
          );
          setHistoria(
            "Fundada con la convicción de innovar y brindar respuestas de alta calidad, nos dedicamos apasionadamente a la excelencia y a impulsar el crecimiento continuo de nuestros clientes y aliados estratégicos.",
          );
          setDireccion(usuario.direccion || "Av. Las Heras 1234, CABA");
          setCorreoContacto(
            usuario.correoElectronico || "contacto@empresa.com",
          );
          setTelefonoContacto(usuario.telefono || "5493415550199");

          setCustomSections([
            {
              titulo: "Misión y Propósito",
              contenido:
                "Generar valor y soluciones de vanguardia para potenciar la competitividad de las industrias nacionales.",
              visible: true,
              orden: 0,
            },
          ]);

          setGallery([
            {
              url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
              visible: true,
              orden: 0,
            },
            {
              url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
              visible: true,
              orden: 1,
            },
          ]);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "";
        const isNotFound =
          errorMsg.includes("no existe") ||
          err.response?.status === 404 ||
          err.response?.status === 400;

        if (!isNotFound) {
          console.error("[FETCH_CONFIG_ERROR]", err);
          agregarAlerta({
            type: "error",
            message:
              "No se pudo recuperar la configuración de la página web corporativa.",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExistingConfig();
  }, [usuario]);

  // Save Config Handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!subDominio.trim()) {
      agregarAlerta({
        type: "warning",
        message: "El subdominio es requerido.",
      });
      return;
    }
    if (!titulo.trim()) {
      agregarAlerta({
        type: "warning",
        message: "El título de la página es requerido.",
      });
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        codigoEmpresa: usuario.codigoEmpresa,
        subDominio: subDominio.trim().toLowerCase(),
        dominioPersonalizado: dominioPersonalizado.trim() || undefined,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        logo: logo.trim() || undefined,
        banner: banner.trim() || undefined,
        favicon: favicon.trim() || undefined,
        colorPrimario,
        colorSecundario,
        historia: historia.trim(),
        redesSociales: [
          ...Object.entries(socials)
            .filter(([_, url]) => url && url.trim() !== "")
            .map(([plataforma, url], idx) => ({
              plataforma: plataforma.toUpperCase(),
              url: url.trim(),
              visible: true,
              orden: idx,
            })),
          {
            plataforma: "EMAIL",
            url: correoContacto.trim(),
            visible: true,
            orden: 10,
          },
          {
            plataforma: "TELEFONO",
            url: telefonoContacto.trim(),
            visible: true,
            orden: 11,
          },
          {
            plataforma: "DIRECCION",
            url: direccion.trim(),
            visible: true,
            orden: 12,
          },
        ].filter((s) => s.url && s.url.trim() !== ""),
        galeria: gallery.map((g, idx) => ({
          url: g.url,
          visible: g.visible !== false,
          orden: idx,
        })),
        secciones: customSections.map((s, idx) => ({
          titulo: s.titulo,
          contenido: s.contenido,
          visible: s.visible !== false,
          orden: idx,
        })),
      };

      await axiosInitial.post("/paginas-web/guardar", payload);
      agregarAlerta({
        type: "success",
        message:
          "¡La configuración de tu página web corporativa ha sido guardada exitosamente!",
      });
    } catch (err) {
      console.error("[SAVE_CONFIG_ERROR]", err);
      agregarAlerta({
        type: "error",
        message:
          err.response?.data?.message ||
          "No se pudo guardar la configuración de la página web.",
      });
    } finally {
      setGuardando(false);
    }
  };

  // Section List Actions
  const agregarSeccion = () => {
    setCustomSections([
      ...customSections,
      {
        titulo: "Nueva Sección Personalizada",
        contenido: "Escribe contenido formal aquí...",
        visible: true,
        orden: customSections.length,
      },
    ]);
  };

  const eliminarSeccion = (idx) => {
    const filtrado = customSections.filter((_, i) => i !== idx);
    // Reorder
    filtrado.forEach((s, i) => (s.orden = i));
    setCustomSections(filtrado);
  };

  const moverSeccion = (index, direccion) => {
    const nuevaLista = [...customSections];
    const destino = index + direccion;
    if (destino < 0 || destino >= nuevaLista.length) return;
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[destino];
    nuevaLista[destino] = temp;
    nuevaLista.forEach((sec, idx) => {
      sec.orden = idx;
    });
    setCustomSections(nuevaLista);
  };

  const actualizarCampoSeccion = (idx, campo, valor) => {
    const copia = [...customSections];
    copia[idx] = { ...copia[idx], [campo]: valor };
    setCustomSections(copia);
  };

  // Gallery Actions
  const agregarGaleria = () => {
    if (!nuevaImagenUrl.trim()) return;
    setGallery([
      ...gallery,
      { url: nuevaImagenUrl.trim(), visible: true, orden: gallery.length },
    ]);
    setNuevaImagenUrl("");
  };

  const eliminarGaleria = (idx) => {
    const filtrado = gallery.filter((_, i) => i !== idx);
    filtrado.forEach((g, i) => (g.orden = i));
    setGallery(filtrado);
  };

  const moverGaleria = (index, direccion) => {
    const nuevaLista = [...gallery];
    const destino = index + direccion;
    if (destino < 0 || destino >= nuevaLista.length) return;
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[destino];
    nuevaLista[destino] = temp;
    nuevaLista.forEach((g, idx) => {
      g.orden = idx;
    });
    setGallery(nuevaLista);
  };


  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[var(--surface-hover)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[14px] font-bold text-[var(--text-muted)] uppercase tracking-widest animate-pulse">
            Cargando Configuración de Landing Page...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-slate-50">
      {/* LEFT COLUMN: BUILDER SETTINGS (45% lg width) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white rounded-md border border-slate-200 shadow-sm flex flex-col overflow-hidden h-fit">
        {/* Title Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Globe size={20} />
            </div>
            <div className="text-left">
              <h1 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                Página Corporativa
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-0.5">
                Multi-Tenant Landing Builder
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={guardando}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all font-black text-[11px] uppercase tracking-widest disabled:opacity-50 shadow-md active:scale-95 cursor-pointer"
          >
            {guardando ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Guardar
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-[var(--border-subtle)] overflow-x-auto select-none custom-scrollbar">
          {[
            { id: "general", label: "General", icon: <Settings size={13} /> },
            { id: "aspecto", label: "Apariencia", icon: <Palette size={13} /> },
            { id: "historia", label: "Historia", icon: <BookOpen size={13} /> },
            { id: "secciones", label: "Secciones", icon: <Layers size={13} /> },
            { id: "galeria", label: "Galería", icon: <Image size={13} /> },
            {
              id: "redes",
              label: "Redes & Contacto",
              icon: <Share2 size={13} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md font-black text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white border border-[var(--border-subtle)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Form Container */}
        <form onSubmit={handleSave} className="flex-1 p-6 space-y-6 text-left">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Estructura y Dominio
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Subdominio de la Empresa (Slug URL) *
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all">
                  <span className="bg-slate-50 px-3.5 py-3 text-[13px] font-bold text-slate-400 border-r border-slate-200">
                    ventryx.fun/pagina/
                  </span>
                  <input
                    type="text"
                    required
                    value={subDominio}
                    onChange={(e) =>
                      setSubDominio(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    placeholder="nombre-empresa"
                    className="flex-1 px-4 py-3 text-[13px] font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] italic leading-tight mt-1">
                  Dirección pública que tus clientes utilizarán para ver tu
                  catálogo. Solo números, letras y guiones.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Dominio Personalizado (Opcional)
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all">
                  <span className="bg-slate-50 px-3.5 py-3 text-[13px] font-bold text-slate-400 border-r border-slate-200">
                    https://
                  </span>
                  <input
                    type="text"
                    value={dominioPersonalizado}
                    onChange={(e) => setDominioPersonalizado(e.target.value)}
                    placeholder="www.miempresa.com"
                    className="flex-1 px-4 py-3 text-[13px] font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">
                Identidad y Textos Básicos
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Título Principal del Sitio *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Pampeana Acopio Logístico"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Eslogan / Descripción Destacada
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Escribe una breve frase corporativa atractiva para captar la atención de tus visitantes..."
                  rows={4}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: APARIENCIA */}
          {activeTab === "aspecto" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Branding & Paleta Visual
              </h2>

              {/* Direct Color Selectors */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Color Primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorPrimario}
                      onChange={(e) => setColorPrimario(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 overflow-hidden"
                    />
                    <input
                      type="text"
                      value={colorPrimario}
                      onChange={(e) => setColorPrimario(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-xl text-[12px] font-mono text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Color Secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorSecundario}
                      onChange={(e) => setColorSecundario(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 overflow-hidden"
                    />
                    <input
                      type="text"
                      value={colorSecundario}
                      onChange={(e) => setColorSecundario(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-xl text-[12px] font-mono text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">
                Recursos Visuales (URLs)
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  URL del Logo Corporativo
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  URL de Imagen Banner (Fondo Hero)
                </label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  URL del Favicon (Icono Navegador)
                </label>
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="https://ejemplo.com/favicon.ico"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIA */}
          {activeTab === "historia" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Trayectoria Institucional
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reseña / Quiénes Somos
                </label>
                <textarea
                  value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  placeholder="Cuenta la historia de tu empresa, cuándo se fundó, su trayectoria y la pasión por el servicio..."
                  rows={10}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SECCIONES DINAMICAS */}
          {activeTab === "secciones" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider">
                  Secciones Corporativas
                </h2>
                <button
                  type="button"
                  onClick={agregarSeccion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-black uppercase text-[var(--primary)] tracking-wider transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  Añadir
                </button>
              </div>

              {customSections.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-[13px] text-slate-400 font-medium leading-normal">
                    No has creado ninguna sección dinámica.
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-normal">
                    Las secciones sirven para agregar políticas,
                    certificaciones, servicios o información destacada.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customSections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm relative space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[var(--primary)] uppercase tracking-wider">
                          Sección #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moverSeccion(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moverSeccion(idx, 1)}
                            disabled={idx === customSections.length - 1}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarSeccion(idx)}
                            className="p-1 rounded bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Título de la Sección
                        </label>
                        <input
                          type="text"
                          value={sec.titulo}
                          onChange={(e) =>
                            actualizarCampoSeccion(
                              idx,
                              "titulo",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-slate-200 rounded-md text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Contenido / Descripción
                        </label>
                        <textarea
                          value={sec.contenido}
                          onChange={(e) =>
                            actualizarCampoSeccion(
                              idx,
                              "contenido",
                              e.target.value,
                            )
                          }
                          rows={4}
                          className="px-3 py-2 border border-slate-200 rounded-md text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`visible-sec-${idx}`}
                          checked={sec.visible !== false}
                          onChange={(e) =>
                            actualizarCampoSeccion(
                              idx,
                              "visible",
                              e.target.checked,
                            )
                          }
                          className="rounded text-[var(--primary)] focus:ring-[var(--primary)]/10"
                        />
                        <label
                          htmlFor={`visible-sec-${idx}`}
                          className="text-[10px] font-bold text-slate-500 select-none cursor-pointer"
                        >
                          Sección visible públicamente
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GALERIA DE IMAGENES */}
          {activeTab === "galeria" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Galería Fotográfica
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pega la URL de una imagen en Unsplash..."
                  value={nuevaImagenUrl}
                  onChange={(e) => setNuevaImagenUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={agregarGaleria}
                  className="px-4 py-2 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-wider shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  Añadir
                </button>
              </div>

              {gallery.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-[13px] text-slate-400 font-medium">
                    Tu galería está vacía.
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-normal">
                    Agrega enlaces a imágenes corporativas para mostrar tu
                    planta, tus acopios o tus productos destacados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  {gallery.map((g, idx) => (
                    <div
                      key={idx}
                      className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative aspect-video flex flex-col justify-end p-2 shadow-sm"
                    >
                      <img
                        src={g.url}
                        alt={`Galeria #${idx}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        onError={(e) =>
                          (e.target.src =
                            "https://images.unsplash.com/photo-1594818821900-a40b852441c9?w=300")
                        }
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0 opacity-60" />

                      <div className="relative z-10 flex items-center justify-between w-full">
                        <span className="text-[10px] font-black text-white/90 drop-shadow">
                          Pos. {idx + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moverGaleria(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/90 text-slate-800 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moverGaleria(idx, 1)}
                            disabled={idx === gallery.length - 1}
                            className="p-1 rounded bg-white/90 text-slate-800 disabled:opacity-40 cursor-pointer"
                          >
                            <ArrowDown size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarGaleria(idx)}
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REDES Y CONTACTO */}
          {activeTab === "redes" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Datos de Contacto
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} />
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Córdoba 1420, Rosario"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} />
                    Correo de Atención
                  </label>
                  <input
                    type="email"
                    value={correoContacto}
                    onChange={(e) => setCorreoContacto(e.target.value)}
                    placeholder="info@empresa.com"
                    className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} />
                    Teléfono Comercial
                  </label>
                  <input
                    type="text"
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value)}
                    placeholder="+54 9 341 555-0199"
                    className="px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
              </div>

              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">
                Redes Sociales Corporativas
              </h2>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Facebook URL
                  </span>
                  <input
                    type="text"
                    value={socials.facebook}
                    onChange={(e) =>
                      setSocials({ ...socials, facebook: e.target.value })
                    }
                    placeholder="https://facebook.com/mi-pagina"
                    className="px-3.5 py-2.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Instagram URL
                  </span>
                  <input
                    type="text"
                    value={socials.instagram}
                    onChange={(e) =>
                      setSocials({ ...socials, instagram: e.target.value })
                    }
                    placeholder="https://instagram.com/mi-perfil"
                    className="px-3.5 py-2.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    LinkedIn URL
                  </span>
                  <input
                    type="text"
                    value={socials.linkedin}
                    onChange={(e) =>
                      setSocials({ ...socials, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/company/mi-empresa"
                    className="px-3.5 py-2.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    WhatsApp (Número con código de país)
                  </span>
                  <input
                    type="text"
                    value={socials.whatsapp}
                    onChange={(e) =>
                      setSocials({ ...socials, whatsapp: e.target.value })
                    }
                    placeholder="Ej: 5493415550199"
                    className="px-3.5 py-2.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-[var(--primary)] bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* RIGHT COLUMN: REACTIVE SIMULATED PREVIEW (55% lg width, sticky) */}
      <div className="w-full lg:w-[55%] xl:w-[60%] lg:sticky lg:top-[80px] lg:h-[calc(100vh-120px)] flex flex-col p-4 bg-slate-200/50 rounded-md border border-slate-200 select-none overflow-hidden">
        {/* Device Controls */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {[
              {
                id: "desktop",
                icon: <Laptop size={13} />,
                label: "Escritorio",
              },
              { id: "tablet", icon: <Tablet size={13} />, label: "Tablet" },
              {
                id: "mobile",
                icon: <Smartphone size={13} />,
                label: "Celular",
              },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setViewport(d.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                  viewport === d.id
                    ? "bg-[var(--primary)] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {d.icon}
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Vista Previa en Vivo
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 flex justify-center items-start overflow-hidden">
          <div
            className={`bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-500 ease-in-out ${
              viewport === "desktop"
                ? "w-full"
                : viewport === "tablet"
                  ? "w-[768px]"
                  : "w-[375px]"
            }`}
          >
            {/* Viewport Header (Mock Browser URL Bar) */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 max-w-lg mx-auto bg-slate-200/60 rounded-md px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span className="truncate">
                    {subDominio
                      ? `https://ventryx.fun/pagina/${subDominio}`
                      : "https://ventryx.fun/pagina/..."}
                  </span>
                </div>
                {subDominio && (
                  <a
                    href={`/pagina/${subDominio}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--primary)] hover:underline cursor-pointer flex items-center"
                  >
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            {/* MOCK LANDING PAGE VIEWPORT (Scrollable) */}
            <div
              className="flex-1 overflow-y-auto bg-white font-sans text-left relative scroll-smooth custom-scrollbar"
              style={{ "--primary": colorPrimario, "--secondary": colorSecundario }}
            >
              {/* Dynamic Theme Color Stylesheet */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                :root {
                  --primary: ${colorPrimario};
                  --secondary: ${colorSecundario};
                }
                .preview-btn-primary {
                  background-color: var(--primary);
                  color: white;
                }
                .preview-btn-primary:hover {
                  background-color: var(--primary);
                  opacity: 0.9;
                }
                .text-highlight {
                  color: var(--primary);
                }
              `,
                }}
              />

              {/* Mock Navbar */}
              <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-2.5">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-8 h-8 object-contain rounded"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                      style={{
                        background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                      }}
                    >
                      <Building2 size={16} />
                    </div>
                  )}
                  <span className="font-black text-[14px] text-slate-800 uppercase tracking-tight truncate max-w-[150px]">
                    {titulo || "Mi Empresa"}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-5 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <span className="hover:text-slate-800 cursor-pointer">
                    Inicio
                  </span>
                  <span className="hover:text-slate-800 cursor-pointer">
                    Nosotros
                  </span>
                  {customSections.filter((s) => s.visible !== false).length >
                    0 && (
                    <span className="hover:text-slate-800 cursor-pointer">
                      Servicios
                    </span>
                  )}
                  <span className="hover:text-slate-800 cursor-pointer">
                    Galería
                  </span>
                  <span className="hover:text-slate-800 cursor-pointer">
                    Contacto
                  </span>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600"
                >
                  Portal
                </button>
              </nav>

              {/* Mock Hero Section */}
              <header className="px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50/50">
                <div className="md:col-span-7 space-y-4">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-highlight"
                    style={{ backgroundColor: `${colorPrimario}15` }}
                  >
                    Sitio Corporativo Oficial
                  </span>
                  <h1 className="text-[26px] md:text-[38px] font-black tracking-tight leading-none text-slate-800 uppercase">
                    {descripcion ||
                      "LÍDERES EN SERVICIOS CORPORATIVOS E INDUSTRIALES"}
                  </h1>
                  <p className="text-[12px] md:text-[13px] text-slate-500 font-medium leading-relaxed max-w-md">
                    Soluciones integrales de alta trazabilidad diseñadas
                    formalmente para maximizar la eficiencia empresarial en el
                    mercado moderno.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="preview-btn-primary px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                    >
                      Catálogo <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider"
                    >
                      Nosotros
                    </button>
                  </div>
                </div>
                <div className="md:col-span-5">
                  <div className="rounded-xl overflow-hidden shadow-xl border border-white bg-slate-200 p-2 relative aspect-video">
                    {banner ? (
                      <img
                        src={banner}
                        alt="Banner"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full rounded-md bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-[12px]">
                        Sin Imagen Banner
                      </div>
                    )}
                    {/* Simulated float card */}
                    <div className="absolute -bottom-2 -left-2 bg-white p-2.5 rounded-md shadow border border-slate-100 flex items-center gap-2">
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                        <ShieldCheck size={14} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          Calidad
                        </span>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight mt-0.5">
                          Certificada
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* About Us (History) Section */}
              <section className="px-6 py-12 border-t border-slate-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest text-highlight"
                        style={{
                          backgroundColor: `${colorPrimario}15`,
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Trayectoria
                      </span>
                      <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tight mt-2.5">
                        Nuestra Historia
                      </h2>
                      <div
                        className="w-12 h-1 rounded-full mt-2"
                        style={{ backgroundColor: colorPrimario }}
                      />
                    </div>

                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                      {historia ||
                        "Somos una organización comprometida con la innovación y el desarrollo productivo. Brindamos servicios que potencian el rendimiento y generan un impacto comercial positivo."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-md border border-slate-100 bg-slate-50">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-highlight mb-1">
                          Misión
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">
                          Garantizar la mejor calidad con excelencia operativa
                          sostenible en cada proceso.
                        </p>
                      </div>

                      <div className="p-3 rounded-md border border-slate-100 bg-slate-50">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-highlight mb-1">
                          Valores
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">
                          Transparencia, profesionalismo, ética, compromiso
                          social e innovación.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-3.5">
                    {/* Simulated Corporate Features */}
                    {[
                      {
                        title: "Seguridad Robusta",
                        desc: "Monitoreo constante e infraestructura cloud certificada.",
                        icon: <ShieldCheck size={16} />,
                      },
                      {
                        title: "Soporte Especializado",
                        desc: "Atención comercial dedicada y consultoría personalizada.",
                        icon: <Cpu size={16} />,
                      },
                    ].map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-3 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all"
                      >
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                          }}
                        >
                          {feat.icon}
                        </div>
                        <div className="text-left">
                          <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                            {feat.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                            {feat.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Dynamic Custom Sections */}
              {customSections
                .filter((s) => s.visible !== false)
                .map((sec, idx) => (
                  <section
                    key={idx}
                    className={`px-6 py-12 border-t border-slate-100 text-left ${idx % 2 === 0 ? "bg-slate-50/40" : "bg-white"}`}
                  >
                    <div className="max-w-3xl space-y-3">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest text-highlight"
                        style={{
                          backgroundColor: `${colorPrimario}15`,
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Servicios
                      </span>
                      <h3 className="text-[18px] font-black text-slate-800 uppercase tracking-tight">
                        {sec.titulo || "Título de Sección"}
                      </h3>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                        {sec.contenido ||
                          "Escribe el contenido detallado aquí..."}
                      </p>
                    </div>
                  </section>
                ))}

              {/* Gallery Section */}
              <section className="px-6 py-12 border-t border-slate-100 bg-white">
                <div className="text-center space-y-2 mb-8">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest text-highlight"
                    style={{
                      backgroundColor: `${colorPrimario}15`,
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Visual
                  </span>
                  <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tight">
                    Nuestra Galería
                  </h2>
                  <div
                    className="w-10 h-1 bg-[var(--primary)] rounded-full mx-auto"
                    style={{ backgroundColor: colorPrimario }}
                  />
                </div>

                {gallery.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center text-[11px] text-slate-400 font-medium">
                    No hay imágenes para mostrar en la galería.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((g, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden aspect-square relative shadow border border-slate-100 bg-slate-50"
                      >
                        <img
                          src={g.url}
                          alt={`Galeria ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Contact & Footer Section */}
              <footer className="bg-slate-900 text-white px-6 py-10 text-[11px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10 pb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-white">
                        <Building2 size={12} />
                      </div>
                      <span className="font-black text-[12px] uppercase tracking-wider">
                        {titulo || "Mi Empresa"}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      Conectando soluciones de vanguardia con las necesidades de
                      tu empresa. Garantía, acopio y distribución profesional.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-400">
                      Información de Contacto
                    </h4>
                    <div className="space-y-2 text-slate-300 font-medium">
                      <p className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-500" />
                        {direccion}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500" />
                        {correoContacto}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-500" />
                        {telefonoContacto}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium">
                  <span>
                    © {new Date().getFullYear()} {titulo || "Mi Empresa"}. Todos
                    los derechos reservados.
                  </span>
                  <div className="flex items-center gap-4 text-[13px]">
                    {socials.facebook && (
                      <span className="hover:text-white cursor-pointer">
                        Fb
                      </span>
                    )}
                    {socials.instagram && (
                      <span className="hover:text-white cursor-pointer">
                        Ig
                      </span>
                    )}
                    {socials.linkedin && (
                      <span className="hover:text-white cursor-pointer">
                        In
                      </span>
                    )}
                    {socials.whatsapp && (
                      <span
                        className="hover:text-white cursor-pointer font-bold"
                        style={{ color: "#25d366" }}
                      >
                        Wa
                      </span>
                    )}
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
