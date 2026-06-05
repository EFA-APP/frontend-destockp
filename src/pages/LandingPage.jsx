import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Truck,
  Layers,
  GraduationCap,
  X,
  Search,
  Globe,
} from "lucide-react";
import "./LandingPage.css";
import { axiosInitial } from "../Backend/Config";

// Mock Tenant Database with rich corporate and institutional details
const MOCK_TENANTS = {
  "agro-cereales": {
    name: "AgroCereales Pampeana S.A.",
    slogan: "Distribución mayorista y acopio logístico de granos",
    description:
      "Suministro directo y trazabilidad garantizada de granos, semillas y materias primas agropecuarias para la industria nacional y de exportación.",
    history:
      "Fundada en 1998 en el corazón de la región pampeana, AgroCereales nació como un emprendimiento familiar con la misión de acompañar al productor agropecuario. A lo largo de más de 25 años, nos hemos consolidado como referentes del sector, modernizando nuestras plantas de acopio e integrando tecnología digital para garantizar la trazabilidad de cada grano que procesamos. Hoy conectamos el esfuerzo de nuestra tierra con los mercados nacionales e internacionales.",
    primaryColor: "#0f766e", // Teal
    secondaryColor: "#ca8a04", // Gold/Amber
    category: "Sector Agropecuario",
    icon: <Database className="w-6 h-6" />,
    whatsapp: "5493415550199",
    currency: "$",
    bannerImage:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200",
    branches: [
      "Acopio Central (Silo Pampeano)",
      "Terminal Puerto Rosario",
      "Galpón Logístico Oeste",
    ],
    features: [
      {
        title: "Calidad Certificada",
        desc: "Granos analizados y calificados bajo estrictos estándares de humedad y pureza.",
        icon: <ShieldCheck className="w-6 h-6 text-white" />,
      },
      {
        title: "Logística Inmediata",
        desc: "Flota pesada equipada con cartas de porte y trazabilidad digital continua.",
        icon: <Truck className="w-6 h-6 text-white" />,
      },
      {
        title: "Acopio Automatizado",
        desc: "Capacidad de conservación inteligente para entregas consistentes libre de mermas.",
        icon: <Database className="w-6 h-6 text-white" />,
      },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600",
    ],
    customSections: [
      {
        title: "Nuestra Tecnología de Silos",
        content:
          "Nuestros silos de última generación cuentan con sensores de temperatura y humedad conectados en tiempo real a nuestra plataforma web, garantizando las condiciones óptimas de conservación para cada tipo de cultivo.",
        icon: <Layers className="w-6 h-6" />,
      },
      {
        title: "Sustentabilidad y Medioambiente",
        content:
          "Promovemos prácticas de agricultura sostenible colaborando estrechamente con ingenieros agrónomos y agricultores locales para reducir el impacto ambiental y optimizar el rendimiento de la cosecha.",
        icon: <Cpu className="w-6 h-6" />,
      },
    ],
    socials: {
      facebook: "https://facebook.com/agrocereales",
      instagram: "https://instagram.com/agrocereales",
      linkedin: "https://linkedin.com/company/agrocereales",
    },
    products: [
      {
        id: "ag-01",
        name: "Trigo Premium de Exportación",
        category: "Granos",
        price: 16800,
        unit: "TN",
        stock: "12,500",
        image:
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "ag-02",
        name: "Maíz de Acopio Consolidado",
        category: "Granos",
        price: 14200,
        unit: "TN",
        stock: "8,200",
        image:
          "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "ag-03",
        name: "Semilla de Girasol Seleccionada",
        category: "Semillas",
        price: 21500,
        unit: "TN",
        stock: "4,150",
        image:
          "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "ag-04",
        name: "Soya Forrajera Estándar",
        category: "Subproductos",
        price: 13500,
        unit: "TN",
        stock: "6,800",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "ag-05",
        name: "Cebada Cerveceira Grado A",
        category: "Granos",
        price: 18200,
        unit: "TN",
        stock: "3,400",
        image:
          "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "ag-06",
        name: "Semilla de Maíz Híbrido Bolsa",
        category: "Semillas",
        price: 8500,
        unit: "Bolsa",
        stock: "1,500",
        image:
          "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  "escuela-futuro": {
    name: "Colegio Del Futuro",
    slogan: "Formando líderes con innovación tecnológica y valores",
    description:
      "Espacio institucional oficial para la consulta de programas académicos, aranceles escolares vigentes, admisiones e inscripciones online.",
    history:
      "El Colegio Del Futuro abrió sus puertas en 2012 con la meta de revolucionar la educación básica y media. Creemos en una educación holística que fusiona la robótica, la programación y el pensamiento crítico con sólidos valores éticos y el cuidado socioemocional. Nuestro campus cuenta con modernos laboratorios de ciencias y deportes, brindando a nuestros alumnos un entorno propicio para potenciar su curiosidad e ingenio.",
    primaryColor: "#1d4ed8", // Royal Blue
    secondaryColor: "#db2777", // Rose
    category: "Educación Privada",
    icon: <GraduationCap className="w-6 h-6" />,
    whatsapp: "5493415550299",
    currency: "$",
    bannerImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
    branches: [
      "Sede Primaria y Jardín (Calle Belgrano)",
      "Sede Secundaria (Av. Libertador)",
      "Complejo Polideportivo Colegio",
    ],
    features: [
      {
        title: "Excelencia Educativa",
        desc: "Programas bilingües con certificaciones de robótica y tecnología integradas.",
        icon: <Cpu className="w-6 h-6 text-white" />,
      },
      {
        title: "Plataforma de Autogestión",
        desc: "Toda la contabilidad, cuotas y cuenta corriente del alumno en tu celular.",
        icon: <FileText className="w-6 h-6 text-white" />,
      },
      {
        title: "Espacios Deportivos",
        desc: "Polideportivo propio para el desarrollo recreativo de nuestros estudiantes.",
        icon: <Building2 className="w-6 h-6 text-white" />,
      },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600",
    ],
    customSections: [
      {
        title: "Admisiones 2026 Abiertas",
        content:
          "El proceso de admisiones para el próximo año lectivo se encuentra abierto. Completá el formulario de contacto para agendar una reunión con nuestro equipo pedagógico y conocer en detalle nuestro plan curricular y aranceles.",
        icon: <Layers className="w-6 h-6" />,
      },
      {
        title: "Taller Extracurricular de Innovación",
        content:
          "Ofrecemos clubes de ciencia aplicada, ajedrez, robótica competitiva y artes visuales de lunes a jueves en contraturno, fomentando la sociabilización y el desarrollo creativo fuera del aula estándar.",
        icon: <Cpu className="w-6 h-6" />,
      },
    ],
    socials: {
      facebook: "https://facebook.com/colegiodelfuturo",
      instagram: "https://instagram.com/colegiodelfuturo",
      linkedin: "https://linkedin.com/school/colegiodelfuturo",
    },
    products: [
      {
        id: "esc-01",
        name: "Matrícula Nivel Inicial 2026",
        category: "Matrículas",
        price: 45000,
        unit: "Inscripción",
        stock: "Cupos Disponibles",
        image:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "esc-02",
        name: "Cuota Mensual Primaria (1° a 6°)",
        category: "Aranceles",
        price: 28000,
        unit: "Mes",
        stock: "Vigente",
        image:
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "esc-03",
        name: "Matrícula Primaria Oficial 2026",
        category: "Matrículas",
        price: 50000,
        unit: "Inscripción",
        stock: "Cupos Disponibles",
        image:
          "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "esc-04",
        name: "Arancel Taller Anual de Robótica",
        category: "Talleres",
        price: 12500,
        unit: "Taller",
        stock: "Cupos Libres",
        image:
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "esc-05",
        name: "Uniforme Escolar Completo Oficial",
        category: "Indumentaria",
        price: 18500,
        unit: "Kit",
        stock: "En Stock",
        image:
          "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "esc-06",
        name: "Taller Extracurricular de Ajedrez",
        category: "Talleres",
        price: 7800,
        unit: "Taller",
        stock: "Cupos Libres",
        image:
          "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  "construcciones-omega": {
    name: "Constructora Omega S.A.",
    slogan: "Materiales e insumos civiles para obras de gran escala",
    description:
      "Provisión certificada de insumos de hormigón elaborado, aceros estructurales y materiales áridos para desarrollos inmobiliarios, viales y de minería.",
    history:
      "Constructora Omega fue establecida en 2005 para responder al dinámico crecimiento de la infraestructura civil y vial del país. Nos especializamos en la provisión, logística y colocación de hormigón elaborado de alta resistencia y aceros estructurales certificados. Con laboratorios de control propios y una amplia flota de mixers, aseguramos el cumplimiento riguroso de normativas estructurales en obras de gran envergadura.",
    primaryColor: "#b45309", // Amber/Brown
    secondaryColor: "#475569", // Slate
    category: "Materiales y Construcción",
    icon: <Building2 className="w-6 h-6" />,
    whatsapp: "5493415550399",
    currency: "USD",
    bannerImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
    branches: [
      "Obrador Central y Logística",
      "Planta Industrial de Hormigón Premoldeado",
      "Oficinas Corporativas Puerto Madero",
    ],
    features: [
      {
        title: "Despacho con Mixer",
        desc: "Servicio de bombeo de hormigón a pie de obra con mixers propios homologados.",
        icon: <Truck className="w-6 h-6 text-white" />,
      },
      {
        title: "Suministro Certificado",
        desc: "Aceros e insumos bajo normas de seguridad de alta resistencia.",
        icon: <ShieldCheck className="w-6 h-6 text-white" />,
      },
      {
        title: "Stock para Grandes Desarrollos",
        desc: "Capacidad de entrega inmediata para constructoras y fideicomisos.",
        icon: <Database className="w-6 h-6 text-white" />,
      },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=600",
    ],
    customSections: [
      {
        title: "Control de Calidad en Obra",
        content:
          "Realizamos ensayos de probetas de hormigón in-situ y en laboratorio propio bajo normas IRAM para garantizar el asentamiento y resistencia a la compresión requeridos por el cálculo estructural.",
        icon: <Layers className="w-6 h-6" />,
      },
      {
        title: "Logística y Despacho Georreferenciado",
        content:
          "Toda nuestra flota de camiones mezcladores (mixers) y bombas de arrastre cuenta con seguimiento por GPS, permitiendo coordinar descargas continuas sin tiempos muertos en obras críticas.",
        icon: <Cpu className="w-6 h-6" />,
      },
    ],
    socials: {
      facebook: "https://facebook.com/constructoraomega",
      instagram: "https://instagram.com/constructoraomega",
      linkedin: "https://linkedin.com/company/constructoraomega",
    },
    products: [
      {
        id: "co-01",
        name: "Hormigón Elaborado H21 Profesional",
        category: "Hormigón",
        price: 110,
        unit: "M³",
        stock: "Bajo Pedido",
        image:
          "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "co-02",
        name: "Ladrillo Cerámico Portante Retak 18",
        category: "Mampostería",
        price: 4.5,
        unit: "Unidad",
        stock: "14,000",
        image:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "co-03",
        name: "Hierro Nervado AcelorMittal Ø 8mm",
        category: "Metales",
        price: 9.8,
        unit: "Barra",
        stock: "2,500",
        image:
          "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "co-04",
        name: "Cemento Portland Especial (Bolsa 50kg)",
        category: "Ligantes",
        price: 12.5,
        unit: "Bolsa",
        stock: "4,800",
        image:
          "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "co-05",
        name: "Hormigón Elaborado H30 Alta Resistencia",
        category: "Hormigón",
        price: 135,
        unit: "M³",
        stock: "Bajo Pedido",
        image:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "co-06",
        name: "Malla de Acero Cima 15x15 (2x3 Mts)",
        category: "Metales",
        price: 28,
        unit: "Malla",
        stock: "850",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  ventryx: {
    name: "Ventryx Technology Corp",
    slogan: "Sistemas digitales y consultoría informática a medida",
    description:
      "Desarrollo de software de misión crítica, infraestructura en la nube y optimización de flujos de trabajo empresariales.",
    history:
      "Establecida en el año 2020, Ventryx Technology Corp nació con la misión de impulsar la transformación digital de las pequeñas y medianas empresas. Ayudamos a automatizar procesos, integrar sistemas comerciales de última generación y securizar la información corporativa. Acompañamos a nuestros socios tecnológicos en cada paso del camino, desde la concepción de la idea hasta la implementación y soporte en producción.",
    primaryColor: "#4f46e5", // Indigo
    secondaryColor: "#06b6d4", // Cyan
    category: "Servicios Tecnológicos",
    icon: <Cpu className="w-6 h-6" />,
    whatsapp: "5493415550499",
    currency: "USD",
    bannerImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    branches: [
      "Sede Tecnológica Central (Buenos Aires)",
      "Centro Operativo de Nube (Rosario)",
    ],
    features: [
      {
        title: "Desarrollo Ágil",
        desc: "Sistemas web y móviles adaptados a los requerimientos de tu negocio.",
        icon: <Cpu className="w-6 h-6 text-white" />,
      },
      {
        title: "Cloud & Devops",
        desc: "Migración, mantenimiento y monitoreo en infraestructuras AWS y GCP.",
        icon: <Layers className="w-6 h-6 text-white" />,
      },
      {
        title: "Seguridad y Soporte",
        desc: "Auditoría de vulnerabilidades y mesa de ayuda dedicada 24/7.",
        icon: <ShieldCheck className="w-6 h-6 text-white" />,
      },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    ],
    customSections: [
      {
        title: "Consultoría y Arquitectura de Software",
        content:
          "Analizamos la arquitectura actual de sistemas de tu empresa y diseñamos un plan de modernización enfocado en microservicios, APIs robustas y escalabilidad horizontal.",
        icon: <Layers className="w-6 h-6" />,
      },
      {
        title: "Infraestructura Cloud Segura",
        content:
          "Diseñamos topologías de red en la nube bajo el modelo de menor privilegio, asegurando que tus datos y servicios estén aislados, cifrados y listos para auditorías de cumplimiento.",
        icon: <ShieldCheck className="w-6 h-6" />,
      },
    ],
    socials: {
      facebook: "https://facebook.com/ventryx",
      instagram: "https://instagram.com/ventryx",
      linkedin: "https://linkedin.com/company/ventryx",
    },
    products: [
      {
        id: "vx-01",
        name: "Licencia Anual ERP Integrado",
        category: "Software",
        price: 1500,
        unit: "Licencia",
        stock: "Suscripción Activa",
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "vx-02",
        name: "Servicio Mensual de Monitoreo Cloud",
        category: "Servicios",
        price: 350,
        unit: "Mes",
        stock: "Disponible",
        image:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "vx-03",
        name: "Auditoría Completa de Seguridad",
        category: "Consultoría",
        price: 2400,
        unit: "Proyecto",
        stock: "Bajo Pedido",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "vx-04",
        name: "Desarrollo de API Rest a Medida",
        category: "Software",
        price: 4500,
        unit: "Proyecto",
        stock: "Bajo Pedido",
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
};

const LandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Search & Catalog Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("Sugerido");

  // Interaction Modals States (No e-commerce cart, but interactive details)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Contact Form States
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await axiosInitial.get(`/paginas-web/publica/${slug}`);

      if (!data.empresa || !data.empresa.paginaWebActiva) {
        setError("Empresa no encontrada o página desactivada");
        setLoading(false);
        return;
      }

      const companyName = data.empresa.nombre || "";
      const lowerName = companyName.toLowerCase();

      let mockKey = "";
      if (
        lowerName.includes("agro") ||
        lowerName.includes("cereales") ||
        lowerName.includes("pampeana")
      ) {
        mockKey = "agro-cereales";
      } else if (
        lowerName.includes("colegio") ||
        lowerName.includes("futuro") ||
        lowerName.includes("escuela")
      ) {
        mockKey = "escuela-futuro";
      } else if (
        lowerName.includes("constructora") ||
        lowerName.includes("omega") ||
        lowerName.includes("construcciones")
      ) {
        mockKey = "construcciones-omega";
      } else if (
        lowerName.includes("ventryx") ||
        lowerName.includes("technology")
      ) {
        mockKey = "ventryx";
      }

      const mockTenant = mockKey ? MOCK_TENANTS[mockKey] : null;

      // Map dynamic database configuration if available
      let dbTenant = {};
      if (data.paginaWeb) {
        const pw = data.paginaWeb;

        // Map socials list
        const mappedSocials = {};
        if (Array.isArray(pw.redesSociales)) {
          pw.redesSociales.forEach((s) => {
            if (s && s.plataforma && s.url && s.visible !== false) {
              mappedSocials[s.plataforma.toLowerCase()] = s.url;
            }
          });
        }

        // Map custom sections
        const mappedSections = [];
        if (Array.isArray(pw.secciones)) {
          pw.secciones
            .filter((sec) => sec && sec.visible !== false)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0))
            .forEach((sec) => {
              mappedSections.push({
                title: sec.titulo || "Sección Especial",
                content: sec.contenido || "",
                icon: <Layers className="w-6 h-6" />,
              });
            });
        }

        // Map gallery
        let mappedGallery = [];
        if (Array.isArray(pw.galeria)) {
          mappedGallery = pw.galeria
            .filter((img) => img && img.url && img.visible !== false)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0))
            .map((img) => img.url);
        }

        dbTenant = {
          name: pw.titulo || data.empresa.nombre,
          slogan: pw.descripcion || "",
          description: pw.descripcion || "",
          history: pw.historia || "",
          primaryColor: pw.colorPrimario || undefined,
          secondaryColor: pw.colorSecundario || undefined,
          bannerImage: pw.banner || undefined,
          logoImage: pw.logo || undefined,
          favicon: pw.favicon || undefined,
          whatsapp:
            mappedSocials.whatsapp ||
            data.empresa.configuracion?.whatsapp ||
            "5493415550199",
          direccion:
            mappedSocials.direccion ||
            data.empresa.direccion ||
            "Av. Las Heras 1234, CABA",
          correoElectronico:
            mappedSocials.email ||
            data.empresa.correoElectronico ||
            "contacto@empresa.com",
          telefono:
            mappedSocials.telefono || data.empresa.telefono || "5493415550199",
          socials:
            Object.keys(mappedSocials).length > 0 ? mappedSocials : undefined,
          customSections:
            mappedSections.length > 0 ? mappedSections : undefined,
          gallery: mappedGallery.length > 0 ? mappedGallery : undefined,
        };

        // Apply dynamic favicon to document if set
        if (pw.favicon) {
          let link = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "shortcut icon";
            document.getElementsByTagName("head")[0].appendChild(link);
          }
          link.href = pw.favicon;
        }
      }

      // Merge config: DB settings take highest priority, then Mock Profile, then generic fallback
      if (mockTenant) {
        setTenant({
          ...mockTenant,
          ...data.empresa,
          ...dbTenant,
          name: dbTenant.name || data.empresa.nombre || mockTenant.name,
          products: mockTenant.products,
        });
      } else {
        // Generic profile fallback
        setTenant({
          name: dbTenant.name || data.empresa.nombre || "Empresa Demostración",
          slogan:
            dbTenant.slogan ||
            "Servicios comerciales e industriales integrados",
          description:
            dbTenant.description ||
            "Showroom comercial corporativo oficial. Soluciones integrales para la industria moderna.",
          history:
            dbTenant.history ||
            "Somos una organización enfocada en proveer servicios de alta calidad, innovación y eficiencia. Desde nuestros inicios, nos hemos comprometido con el crecimiento de nuestros clientes y el desarrollo tecnológico sostenible.",
          primaryColor: dbTenant.primaryColor || "#6366f1",
          secondaryColor: dbTenant.secondaryColor || "#d946ef",
          category: "Sector General",
          icon: <Building2 className="w-6 h-6" />,
          whatsapp: data.empresa.configuracion?.whatsapp || "5493415550199",
          currency: "$",
          bannerImage:
            dbTenant.bannerImage ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
          branches: ["Casa Central"],
          features: [
            {
              title: "Calidad Garantizada",
              desc: "Procesos certificados bajo estándares internacionales.",
              icon: <ShieldCheck className="w-6 h-6 text-white" />,
            },
            {
              title: "Atención Dedicada",
              desc: "Asesores técnicos especializados para tu proyecto.",
              icon: <Cpu className="w-6 h-6 text-white" />,
            },
          ],
          gallery: dbTenant.gallery || [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400",
          ],
          customSections: dbTenant.customSections || [
            {
              title: "Misión y Propósito",
              content:
                "Generar valor y soluciones de vanguardia para potenciar la competitividad de las industrias nacionales.",
              icon: <Layers className="w-6 h-6" />,
            },
          ],
          socials: dbTenant.socials || {
            facebook: "#",
            instagram: "#",
            linkedin: "#",
          },
          ...data.empresa,
          products: [
            {
              id: "dummy-01",
              name: "Servicio Profesional Estándar",
              category: "Servicios",
              price: 1500,
              unit: "Proyecto",
              stock: "Disponible",
              image:
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
            },
            {
              id: "dummy-02",
              name: "Insumo Corporativo Premium",
              category: "Insumos",
              price: 3200,
              unit: "Unidad",
              stock: "100",
              image:
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
            },
          ],
        });
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Empresa no encontrada o página desactivada"
          : "Error al cargar la página",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Extract Categories automatically from products
  const categories = useMemo(() => {
    if (!tenant) return [];
    const list = new Set(tenant?.products?.map((p) => p.category));
    return ["Todos", ...Array.from(list)];
  }, [tenant]);

  // Filter and Sort Catalog Items
  const filteredProducts = useMemo(() => {
    if (!tenant) return [];
    let items = tenant.products ? [...tenant.products] : [];

    if (selectedCategory !== "Todos") {
      items = items.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      );
    }

    // Sort items
    if (sortBy === "Precio: Menor a Mayor") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Precio: Mayor a Menor") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Alfabético") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [tenant, selectedCategory, searchTerm, sortBy]);

  // Inject active primary/secondary colors dynamically
  useEffect(() => {
    if (tenant) {
      const root = document.documentElement;

      root.style.setProperty(
        "--primary",
        tenant?.configuracionVisual?.colorPrimario,
      );
      root.style.setProperty(
        "--secondary",
        tenant?.configuracionVisual?.colorSecundario || "#d946ef",
      );

      const hex = tenant.primaryColor.replace("#", "");
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        root.style.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
      }
    } else {
      const root = document.documentElement;
      root.style.setProperty(
        "--primary",
        tenant?.configuracionVisual?.colorPrimario,
      );
      root.style.setProperty(
        "--secondary",
        tenant?.configuracionVisual?.colorSecundario,
      );
      root.style.setProperty("--primary-rgb", "99, 102, 241");
    }
  }, [tenant]);

  if (loading) {
    return (
      <div className="loading-screen flex items-center justify-center min-h-screen">
        <div className="spinner text-[var(--primary)] text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md landing-glass rounded-lg">
          <Globe className="w-16 h-16 mx-auto mb-4 text-rose-500 animate-pulse" />
          <h2 className="text-rose-500 text-2xl font-black mb-3">
            Servicio No Disponible
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-semibold mb-6">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormData({ nombre: "", email: "", mensaje: "" });
    }, 4000);
  };

  // Direct single-product WhatsApp inquiry
  const handleProductWhatsAppInquiry = (product) => {
    const message = `*Hola ${tenant.name}* 👋\n\nQuisiera realizar una consulta sobre el siguiente producto:\n• *${product.name}* (${tenant.currency} ${product.price.toLocaleString("es-AR")} por ${product.unit})\n\nMuchas gracias.`;
    const cleanPhone = tenant.whatsapp.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="landing-scope">
      {/* Background Neon Orbs */}
      <div className="landing-orbs-container">
        <div className="landing-orb orb-primary" />
        <div className="landing-orb orb-secondary" />
      </div>

      <div className="landing-content">
        {/* Corporate Header Navigation */}
        <nav className="landing-nav landing-glass">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: tenant.primaryColor }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {tenant?.configuracionVisual?.logoUrl ? (
                <img src={tenant?.configuracionVisual?.logoUrl} alt="" />
              ) : (
                tenant?.icon
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[16px] md:text-[18px] uppercase tracking-tighter text-[var(--text-main)] leading-tight">
                {tenant.name}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)] leading-none">
                {tenant.category}
              </span>
            </div>
          </div>

          <div className="nav-links hidden md:flex">
            <span
              className="nav-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Inicio
            </span>
            <span
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("about")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Historia
            </span>
            {tenant.customSections?.length > 0 && (
              <span
                className="nav-link"
                onClick={() =>
                  document
                    .getElementById("services")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Servicios
              </span>
            )}
            <span
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("catalog")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Catálogo
            </span>
            <span
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("gallery")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Galería
            </span>
            <span
              className="nav-link"
              onClick={() =>
                document
                  .getElementById("contact")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Contacto
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="landing-btn btn-primary"
            >
              Portal Interno
            </button>
          </div>
        </nav>

        {/* Corporate Hero Split Section */}
        <header className="landing-hero-split container mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="inline-block px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full text-[12px] font-black uppercase tracking-widest text-[var(--primary)]">
              Sitio Corporativo Oficial
            </span>
            <h1 className="text-[36px] md:text-[52px] font-black tracking-tight leading-none text-gradient-primary uppercase">
              {tenant.slogan}
            </h1>
            <p className="text-base md:text-lg text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
              {tenant.description}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() =>
                  document
                    .getElementById("catalog")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="landing-btn btn-primary"
              >
                Ver Catálogo <ArrowRight size={14} className="ml-2" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="landing-btn btn-secondary border border-slate-200 bg-white/50 text-[var(--text-main)] hover:bg-slate-50"
              >
                Conócenos
              </button>
            </div>
          </div>
          <div className="md:col-span-5 relative animate-in fade-in zoom-in-95 duration-1000">
            <div className="hero-image-frame rounded-2xl overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
              <img
                src={tenant.bannerImage}
                alt={tenant.name}
                className="w-full h-[320px] md:h-[400px] object-cover rounded-xl transition-all duration-700 hover:scale-105"
              />
            </div>
            {/* Styled accent floating tag */}
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                {tenant.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Sitio Corporativo Oficial
                </span>
                <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight mt-1">
                  {tenant.category}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Institutional Section (About Us & History) */}
        <section
          id="about"
          className="landing-section section-about border-t border-[var(--glass-border)] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--primary-rgb),0.08) 0%, rgba(255,255,255,0.96) 45%, rgba(var(--primary-rgb),0.03) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--primary)]/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[var(--secondary)]/10 blur-3xl rounded-full" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div>
                <span className="section-badge">Quiénes Somos</span>
                <h2 className="section-title text-[var(--text-main)] mt-4">
                  Nuestra Historia
                </h2>
                <div className="w-20 h-1.5 bg-[var(--primary)] rounded-full mt-4" />
              </div>

              <p className="text-base text-[var(--text-muted)] font-medium leading-relaxed">
                {tenant.history}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="info-card">
                  <h4 className="text-sm font-black text-[var(--primary)] uppercase tracking-wider mb-2">
                    Misión
                  </h4>
                  <p className="text-[13px] text-[var(--text-muted)] font-medium leading-relaxed">
                    Excelencia operativa en cada entrega e innovación continua
                    en nuestros servicios.
                  </p>
                </div>

                <div className="info-card">
                  <h4 className="text-sm font-black text-[var(--primary)] uppercase tracking-wider mb-2">
                    Valores
                  </h4>
                  <p className="text-[13px] text-[var(--text-muted)] font-medium leading-relaxed">
                    Transparencia, sustentabilidad, calidad humana y compromiso
                    local.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-6">
                {tenant.features?.map((feat, index) => (
                  <div
                    key={index}
                    className="feature-card-modern text-left flex gap-5 items-start"
                  >
                    <div
                      className="p-4 rounded-2xl text-white shadow-lg flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})`,
                      }}
                    >
                      {feat.icon}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[var(--text-main)] uppercase mb-2 tracking-tight">
                        {feat.title}
                      </h3>

                      <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Customized Corporate Sections */}
        {tenant.customSections?.length > 0 && (
          <section
            id="services"
            className="landing-section section-services border-t border-[var(--glass-border)] relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-10 right-10 w-80 h-80 bg-[var(--primary)] blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--secondary)] blur-3xl rounded-full" />
            </div>

            <div className="relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="section-badge-dark">
                  Especialidades Corporativas
                </span>

                <h2 className="section-title text-white! mt-4">
                  Especialidades & Divisiones
                </h2>

                <p className="section-subtitle mx-auto text-slate-100">
                  Conocé las áreas de servicio e innovación que nos diferencian
                  en el mercado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tenant.customSections.map((section, idx) => (
                  <div
                    key={idx}
                    className="service-card-modern text-left flex gap-6 items-start"
                  >
                    <div className="service-icon-modern">{section.icon}</div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">
                        {section.title}
                      </h3>

                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Corporate Product Catalog */}
        <section
          id="catalog"
          className="landing-section section-catalog border-t border-[var(--glass-border)] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #f8fafc 0%, rgba(var(--primary-rgb),0.05) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 blur-3xl rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col mb-10 text-center! max-w-2xl mx-auto">
              <span className="section-badge">Catálogo Corporativo</span>

              <h2 className="section-title mt-4">Productos e Insumos</h2>

              <p className="section-subtitle mx-auto">
                Explorá nuestra cartera oficial de soluciones comerciales.
              </p>
            </div>

            <div className="catalog-layout">
              <aside className="catalog-sidebar modern-sidebar">
                <div className="sidebar-section">
                  <h3 className="sidebar-title">Búsqueda</h3>

                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      size={14}
                    />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar..."
                      className="sidebar-input"
                    />
                  </div>
                </div>

                <div className="sidebar-section">
                  <h3 className="sidebar-title">Categorías</h3>

                  <div className="category-list">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`category-item ${
                          selectedCategory === cat ? "active" : ""
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="catalog-main">
                <div className="catalog-grid">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="product-card-modern cursor-pointer group"
                      onClick={() => setSelectedProduct(prod)}
                    >
                      <div className="product-image-placeholder">
                        <img src={prod.image} alt={prod.name} loading="lazy" />

                        <div className="product-overlay" />

                        <span className="product-badge">{prod.category}</span>
                      </div>

                      <div className="product-details text-left">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                          Ref: {prod.id}
                        </span>

                        <h3 className="product-name group-hover:text-[var(--primary)] transition-colors">
                          {prod.name}
                        </h3>

                        <div className="product-price-row">
                          <span className="product-price">
                            {tenant.currency}{" "}
                            {prod.price.toLocaleString("es-AR")}
                          </span>

                          <span className="text-[12px] font-bold text-slate-400">
                            / {prod.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Image Gallery Section */}
        <section
          id="gallery"
          className="landing-section section-gallery border-t border-[var(--glass-border)] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-80 h-80 bg-[var(--primary)] blur-3xl rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-badge-dark">Galería</span>

              <h2 className="section-title text-white! mt-4">
                Galería Institucional
              </h2>

              <p className="section-subtitle mx-auto text-slate-300">
                Instalaciones, procesos productivos y eventos corporativos.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {tenant.gallery?.map((imgUrl, index) => (
                <div
                  key={index}
                  className="gallery-modern"
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`Galería ${index + 1}`}
                    className="w-full h-[220px] object-cover transition-all duration-500 group-hover:scale-110"
                  />

                  <div className="gallery-overlay">
                    <span>Ampliar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Corporate Channels */}
        <section
          id="contact"
          className="landing-section section-contact border-t border-[var(--glass-border)] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(var(--primary-rgb),0.08) 0%, #ffffff 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--secondary)]/20 blur-3xl rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-badge">Contacto</span>

              <h2 className="section-title mt-4">Contacto & Redes</h2>

              <p className="section-subtitle mx-auto">
                Consultá nuestras sedes y canales oficiales.
              </p>
            </div>

            <div className="contact-layout">
              <form
                onSubmit={handleContactSubmit}
                className="contact-card-modern space-y-5 text-left"
              >
                {/* mismo contenido */}
              </form>

              <div className="flex flex-col gap-6 text-left">
                <div className="contact-info-modern">
                  {/* mismo contenido */}
                </div>

                <div className="contact-info-modern">
                  {/* mismo contenido */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Footer */}
        <footer className="landing-footer">
          <p>
            © {new Date().getFullYear()} {tenant.name}. Todos los derechos
            reservados.
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 uppercase tracking-widest">
            Portal Corporativo Oficial administrado por EFA ERP Multi-Tenant
          </p>
        </footer>
      </div>

      {/* 🛠️ MODAL: PRODUCT DETAILS (Technial Sheet View) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col text-left">
            {/* Header image */}
            <div className="h-[240px] bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
              <img
                src={
                  selectedProduct.image ||
                  `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800`
                }
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-slate-800 shadow transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-[12px] font-black uppercase tracking-wider rounded-md">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-2">
                    {selectedProduct.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800">
                    {tenant.currency}{" "}
                    {selectedProduct.price.toLocaleString("es-AR")}
                  </span>
                  <span className="block text-[12px] font-bold text-slate-400">
                    por {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Especificaciones y Disponibilidad
                </span>
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
                  <div>
                    <span className="text-[12px] text-slate-400 font-semibold">
                      Estado / Existencia
                    </span>
                    <span className="block text-sm font-bold text-slate-800 uppercase mt-0.5">
                      {selectedProduct.stock}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] text-slate-400 font-semibold">
                      Código Referencia
                    </span>
                    <span className="block text-sm font-bold text-slate-800 uppercase mt-0.5">
                      {selectedProduct.id}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                Este producto forma parte de la oferta corporativa oficial de{" "}
                {tenant.name}. Si desea solicitar cotizaciones por lotes de gran
                escala, especificaciones de producción a medida o condiciones de
                financiamiento comercial, haga clic en el botón de consulta a
                continuación.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleProductWhatsAppInquiry(selectedProduct)}
                  className="flex-grow py-3 bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all hover:brightness-110 active:scale-98 text-center"
                >
                  Consultar vía WhatsApp
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-lg transition-all hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ MODAL: LIGHTBOX IMAGE ZOOM */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setSelectedImage(null)}
            title="Cerrar Zoom"
          >
            <X size={24} />
          </button>
          <img
            src={selectedImage}
            alt="Zoom Imagen"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default LandingPage;
