import React, { useState } from "react";
import { useBeneficiosAdmin } from "../../../../Backend/Camara/hooks/useBeneficiosAdmin";
import { usePerfilesComercioAdmin } from "../../../../Backend/Camara/hooks/usePerfilesComercioAdmin";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import ModalBeneficio from "../../../Modales/Camara/ModalBeneficio";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Check,
  X,
  PlusCircle,
  Plus,
  Search,
  Pause,
  Play,
  UserX,
} from "lucide-react";
import { PortalIcono } from "../../../../assets/Icons";

const Beneficios = () => {
  const [activeTab, setActiveTab] = useState("metricas");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroComercio, setFiltroComercio] = useState("");

  const {
    beneficios,
    cargandoBeneficios,
    crearBeneficio,
    aprobarBeneficio,
    rechazarBeneficio,
    pausarBeneficio,
    reanudarBeneficio,
  } = useBeneficiosAdmin(filtroEstado ? { estado: filtroEstado } : {});

  const { comercios = [], cargandoComercios, pausarUsuarios } = usePerfilesComercioAdmin();

  const [modalBeneficio, setModalBeneficio] = useState({ isOpen: false });
  const [modalRechazar, setModalRechazar] = useState({
    isOpen: false,
    id: null,
  });
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const handleAprobar = async (row) => {
    await aprobarBeneficio(row.codigo);
  };

  const handleRechazar = (row) => {
    setModalRechazar({ isOpen: true, id: row.codigo });
  };

  const handleConfirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      alert("Debes ingresar un motivo para rechazar este beneficio.");
      return;
    }
    await rechazarBeneficio({
      id: modalRechazar.id,
      dto: { motivoRechazo },
    });
    setModalRechazar({ isOpen: false, id: null });
    setMotivoRechazo("");
  };

  const handlePausar = async (row) => {
    await pausarBeneficio(row.codigo);
  };

  const handleReanudar = async (row) => {
    await reanudarBeneficio(row.codigo);
  };

  const handlePausarUsuarios = async (com) => {
    if (!com.codigoContactoComercio) return;
    if (window.confirm("¿Estás seguro de que deseas desactivar a todos los usuarios vinculados a este comercio?")) {
      await pausarUsuarios(com.codigoContactoComercio);
    }
  };

  const handleSubmitBeneficio = async (data) => {
    await crearBeneficio(data);
    setModalBeneficio({ isOpen: false });
  };

  const beneficiosFiltrados = beneficios.filter((b) => {
    const matchComercio = filtroComercio ? b.codigoEmpresa === Number(filtroComercio) || b.codigoContactoComercio === Number(filtroComercio) : true;
    const searchLower = filtroBusqueda.toLowerCase();
    const matchBusqueda = searchLower
      ? (b.titulo && b.titulo.toLowerCase().includes(searchLower)) ||
        (b.descripcion && b.descripcion.toLowerCase().includes(searchLower))
      : true;
    return matchComercio && matchBusqueda;
  });

  // Cálculos para métricas
  const totalBeneficios = beneficiosFiltrados.length;
  const pendientes = beneficiosFiltrados.filter((b) => b.estado === "PENDING").length;
  const activos = beneficiosFiltrados.filter((b) => b.estado === "ACTIVE").length;

  const estadoLabels = {
    ACTIVE: "ACTIVO",
    PENDING: "PENDIENTE",
    RECHAZADO: "RECHAZADO",
    PAUSED: "PAUSADO",
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* Header (Estilo Comprobantes) */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span>CÁMARA</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>BENEFICIOS</span>
          </div>
          <div className="flex items-center gap-2.5">
            <PortalIcono color="#1FAE6D" size={30} />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Gestión de Beneficios
            </h1>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1.5">
            Administrá centralmente las promociones, convenios y comercios
            asociados de la cámara.
          </p>
        </div>
        <div>
          <button
            onClick={() => setModalBeneficio({ isOpen: true })}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md font-bold uppercase tracking-wider text-[11px] shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} className="text-gray-500" />
            Añadir Beneficio
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        <button
          onClick={() => setActiveTab("metricas")}
          className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === "metricas"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Métricas
        </button>
        <button
          onClick={() => setActiveTab("beneficios")}
          className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === "beneficios"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Beneficios
        </button>
        <button
          onClick={() => setActiveTab("comercios")}
          className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === "comercios"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Comercios Asociados
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "metricas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-md p-6 shadow-xl relative overflow-hidden">
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-5" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Total Beneficios
              </p>
              <p className="text-5xl font-black tracking-tight text-white tabular-nums">
                {totalBeneficios}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-amber-500 w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Pendientes de Aprobación
                </p>
              </div>
              <p className="text-4xl font-black tracking-tight text-gray-900 tabular-nums">
                {pendientes}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-emerald-500 w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Beneficios Activos
                </p>
              </div>
              <p className="text-4xl font-black tracking-tight text-gray-900 tabular-nums">
                {activos}
              </p>
            </div>
          </div>
        )}

        {activeTab === "beneficios" && (
          <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Estado:
                </span>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-gray-500 focus:ring-gray-500 font-medium text-gray-700 bg-white"
                >
                  <option value="">Todos</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="RECHAZADO">Rechazados</option>
                  <option value="PAUSED">Pausados</option>
                </select>

                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-4">
                  Comercio:
                </span>
                <select
                  value={filtroComercio}
                  onChange={(e) => setFiltroComercio(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-gray-500 focus:ring-gray-500 font-medium text-gray-700 bg-white max-w-[200px]"
                >
                  <option value="">Todos</option>
                  {comercios.map((c) => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.nombre || `Comercio #${c.codigo}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar beneficio..." 
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:border-gray-500 focus:ring-gray-500 min-w-[250px]"
                />
              </div>
            </div>
            <div className="flex-1 p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Imagen</th>
                    <th className="px-6 py-4 font-bold">Comercio ID</th>
                    <th className="px-6 py-4 font-bold">Título</th>
                    <th className="px-6 py-4 font-bold">Descuento</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cargandoBeneficios ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm font-bold text-gray-400"
                      >
                        Cargando beneficios...
                      </td>
                    </tr>
                  ) : beneficiosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm font-bold text-gray-400"
                      >
                        No hay beneficios registrados
                      </td>
                    </tr>
                  ) : (
                    beneficiosFiltrados.map((b) => (
                      <tr
                        key={b.codigo}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {b.fotos && b.fotos.length > 0 ? (
                            <img
                              src={b.fotos[0]}
                              alt={b.titulo}
                              className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-200">
                              SIN IMAGEN
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                          {b.codigoEmpresa || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">
                            {b.titulo}
                          </p>
                          {b.descripcion && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]">
                              {b.descripcion}
                            </p>
                          )}
                          {b.estado === "RECHAZADO" && b.motivoRechazo && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 max-w-[200px]">
                              <span className="font-bold uppercase tracking-wider block mb-0.5">Motivo del rechazo:</span>
                              {b.motivoRechazo}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                          {b.descuento || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              b.estado === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.estado === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : b.estado === "RECHAZADO"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.estado === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : b.estado === "PENDING"
                                    ? "bg-amber-500"
                                    : b.estado === "RECHAZADO"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                              }`}
                            ></span>
                            {estadoLabels[b.estado] || b.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.estado === "PENDING" && (
                              <button
                                onClick={() => handleAprobar(b)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors tooltip"
                                title="Aprobar"
                              >
                                <Check size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            {b.estado === "ACTIVE" && (
                              <button
                                onClick={() => handlePausar(b)}
                                className="p-1.5 rounded-md hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors tooltip"
                                title="Pausar"
                              >
                                <Pause size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            {b.estado === "PAUSED" && (
                              <button
                                onClick={() => handleReanudar(b)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors tooltip"
                                title="Reanudar"
                              >
                                <Play size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            {b.estado === "PENDING" && (
                              <button
                                onClick={() => handleRechazar(b)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors tooltip"
                                title="Rechazar"
                              >
                                <X size={16} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "comercios" && (
          <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Comercios Registrados
              </p>
            </div>
            <div className="flex-1 p-4">
              {cargandoComercios ? (
                <p className="text-sm font-bold text-gray-400">
                  Cargando comercios...
                </p>
              ) : comercios.length === 0 ? (
                <p className="text-sm font-bold text-gray-400">
                  No hay comercios asociados registrados en el perfil.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comercios.map((com) => (
                    <div
                      key={com.codigo}
                      className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                    >
                      {com.logoUrl ? (
                        <img
                          src={com.logoUrl}
                          alt={com.nombre}
                          className="w-12 h-12 object-cover rounded-full border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                          {com.nombre
                            ? com.nombre.substring(0, 2).toUpperCase()
                            : "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">
                          {com.nombre || `Comercio #${com.codigoContactoComercio}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {com.direccion || "Sin dirección"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button
                          onClick={() => handlePausarUsuarios(com)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors tooltip"
                          title="Pausar Todos Los Usuarios"
                        >
                          <UserX size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ModalBeneficio
        isOpen={modalBeneficio.isOpen}
        onClose={() => setModalBeneficio({ isOpen: false })}
        onSubmit={handleSubmitBeneficio}
        comercios={comercios}
      />

      <ModalConfirmacion
        open={modalRechazar.isOpen}
        onClose={() => {
          setModalRechazar({ isOpen: false, id: null });
          setMotivoRechazo("");
        }}
        onConfirm={handleConfirmarRechazo}
        titulo="Rechazar Beneficio"
        mensaje="¿Estás seguro de que deseas rechazar este beneficio? Esta acción actualizará su estado."
      >
        <textarea
          className="w-full mt-4 p-3 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none h-24"
          placeholder="Escribe el motivo del rechazo aquí..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
      </ModalConfirmacion>
    </div>
  );
};

export default Beneficios;
