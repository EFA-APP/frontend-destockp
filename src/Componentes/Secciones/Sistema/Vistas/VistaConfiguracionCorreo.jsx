import React, { useState } from "react";
import { VolverIcono } from "../../../../assets/Icons";
import { useObtenerUnidadesNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { useGuardarConfiguracionSmtp, useProbarConfiguracionSmtp, useHistorialCorreos } from "../../../../Backend/Correos/queries";
import DataTable from "../../../UI/DataTable/DataTable";

const VistaConfiguracionCorreo = ({ empresa, onClose }) => {
  const [activeTab, setActiveTab] = useState("configuracion");
  const [codigoUnidadNegocio, setCodigoUnidadNegocio] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    host: "",
    puerto: 587,
    secure: false,
    usuario: "",
    passwordPlain: "",
    from: "",
  });
  const [emailPrueba, setEmailPrueba] = useState("");

  const { data: unidades } = useObtenerUnidadesNegocio({
    codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
  });

  const { mutateAsync: guardarConfiguracion, isPending: guardando } = useGuardarConfiguracionSmtp();
  const { mutateAsync: probarConfiguracion, isPending: probando } = useProbarConfiguracionSmtp();

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      await guardarConfiguracion({
        ...formData,
        codigoEmpresa: Number(empresa.codigo || empresa.codigoSecuencial),
        codigoUnidadNegocio: Number(codigoUnidadNegocio),
        puerto: Number(formData.puerto),
      });
      alert("Configuración SMTP guardada correctamente.");
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleProbar = async () => {
    if (!formData.host || !formData.usuario || !formData.passwordPlain || !formData.from) {
      alert("Por favor, complete todos los campos de configuración SMTP (Host, Usuario, Contraseña, Remitente).");
      return;
    }
    if (!emailPrueba) {
      alert("Ingrese un email de prueba.");
      return;
    }
    try {
      await probarConfiguracion({
        configuracion: {
          ...formData,
          codigoEmpresa: Number(empresa.codigo || empresa.codigoSecuencial),
          codigoUnidadNegocio: Number(codigoUnidadNegocio),
          puerto: Number(formData.puerto),
        },
        emailDestino: emailPrueba
      });
      alert("Correo de prueba enviado correctamente.");
    } catch (error) {
      const msgs = error?.response?.data?.message;
      alert(`Error al probar: ${Array.isArray(msgs) ? msgs.join(", ") : error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-all group"
          >
            <VolverIcono size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
              Configuración de Correos
            </h1>
            <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-1">
              Servidor SMTP e historial para <span className="text-black">{empresa.nombre}</span>
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-black/10 mb-6">
        <button
          className={`pb-2 px-4 text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'configuracion' ? 'border-b-2 border-black text-black' : 'text-[var(--text-muted)] hover:text-black'}`}
          onClick={() => setActiveTab('configuracion')}
        >
          Configuración SMTP
        </button>
        <button
          className={`pb-2 px-4 text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'historial' ? 'border-b-2 border-black text-black' : 'text-[var(--text-muted)] hover:text-black'}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Envíos
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "configuracion" && (
        <form onSubmit={handleGuardar} className="flex flex-col gap-4 max-w-2xl bg-white p-6 rounded-md border border-black/10 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Unidad de Negocio</label>
            <select
              value={codigoUnidadNegocio}
              onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
              className="p-2 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30"
            >
              <option value={0}>Toda la empresa (Default)</option>
              {unidades?.map((u) => (
                <option key={u.codigoSecuencial} value={u.codigoSecuencial}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Host SMTP</label>
              <input type="text" value={formData.host} onChange={(e) => setFormData({...formData, host: e.target.value})} placeholder="smtp.gmail.com" required className="p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Puerto</label>
              <input type="number" value={formData.puerto} onChange={(e) => setFormData({...formData, puerto: e.target.value})} placeholder="587" required className="p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-bold">
              <input type="checkbox" checked={formData.secure} onChange={(e) => setFormData({...formData, secure: e.target.checked})} className="accent-black" />
              Conexión Segura (SSL/TLS)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Usuario</label>
              <input type="text" value={formData.usuario} onChange={(e) => setFormData({...formData, usuario: e.target.value})} required className="p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Contraseña</label>
              <input type="password" value={formData.passwordPlain} onChange={(e) => setFormData({...formData, passwordPlain: e.target.value})} required className="p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Remitente (From)</label>
            <input type="text" value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} placeholder='"Mi Empresa" <noreply@miempresa.com>' required className="p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
          </div>

          <div className="border-t border-black/10 pt-4 mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">Email para Prueba</label>
              <div className="flex gap-2">
                <input type="email" value={emailPrueba} onChange={(e) => setEmailPrueba(e.target.value)} placeholder="test@ejemplo.com" className="flex-1 p-2 border border-black/10 rounded-md text-[13px] focus:outline-none focus:border-black/30" />
                <button type="button" onClick={handleProbar} disabled={probando} className="px-4 py-2 bg-[var(--primary)] text-white font-bold text-[12px] rounded-md hover:bg-[var(--primary)]/90 disabled:opacity-50">
                  {probando ? "Probando..." : "Probar Conexión"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={guardando} className="w-full py-3 bg-black text-white font-black uppercase tracking-widest text-[12px] rounded-md hover:bg-black/80 transition-all shadow-md mt-2 disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "historial" && (
        <HistorialTab empresa={empresa} />
      )}
    </div>
  );
};

const HistorialTab = ({ empresa }) => {
  const [pagina, setPagina] = useState(1);
  const { data, isLoading } = useHistorialCorreos({
    codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
    pagina,
    limite: 20
  });

  const columns = [
    { name: "Fecha", selector: row => new Date(row.fechaEnvio).toLocaleString(), sortable: true },
    { name: "Asunto", selector: row => row.asunto, sortable: true },
    { name: "Destinatarios", selector: row => row.destinatarios.join(', ') },
    { 
      name: "Estado", 
      selector: row => row.estado,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.estado === 'ENVIADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {row.estado}
        </span>
      )
    },
    { name: "Error", selector: row => row.motivoError || '-' },
  ];

  return (
    <div className="flex-1 bg-white border border-black/10 rounded-md overflow-hidden">
      <DataTable
        columns={columns}
        data={data?.data || []}
        progressPending={isLoading}
        pagination
        paginationServer
        paginationTotalRows={data?.meta?.total || 0}
        onChangePage={(page) => setPagina(page)}
      />
    </div>
  );
};

export default VistaConfiguracionCorreo;
