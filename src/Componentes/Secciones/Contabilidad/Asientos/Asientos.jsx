import TablaAsientos from "../../../Tablas/Contabilidad/Asientos/TablaAsientos";
import { BookOpen } from "lucide-react";

const Asientos = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Contabilidad</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Asientos</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen color="var(--primary)" size={28} strokeWidth={2.5} />
            Asientos Contables
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Explorá y gestioná los asientos del libro diario general.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <TablaAsientos />
      </div>
    </div>
  );
};

export default Asientos;
