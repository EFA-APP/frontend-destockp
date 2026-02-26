import { useMemo, useState } from "react";

/* =====================================================
   MOCK BACKEND (lista plana como vendría de la API)
===================================================== */
const CUENTAS_BACKEND = [
  {
    id: 1,
    codigo: "1",
    nombre: "ACTIVO",
    tipo: "ACTIVO",
    nivel: 1,
    imputable: false,
    activa: true,
  },
  {
    id: 2,
    codigo: "1.1",
    nombre: "Activo Corriente",
    tipo: "ACTIVO",
    nivel: 2,
    padreId: 1,
    imputable: false,
    activa: true,
  },
  {
    id: 3,
    codigo: "1.1.01",
    nombre: "Caja",
    tipo: "ACTIVO",
    subtipo: "DISPONIBILIDAD",
    nivel: 3,
    padreId: 2,
    imputable: true,
    activa: true,
  },
  {
    id: 4,
    codigo: "1.1.02",
    nombre: "Banco Cuenta Corriente",
    tipo: "ACTIVO",
    subtipo: "DISPONIBILIDAD",
    nivel: 3,
    padreId: 2,
    imputable: true,
    activa: true,
  },

  {
    id: 9,
    codigo: "2",
    nombre: "PASIVO",
    tipo: "PASIVO",
    nivel: 1,
    imputable: false,
    activa: true,
  },
  {
    id: 10,
    codigo: "2.1",
    nombre: "Pasivo Corriente",
    tipo: "PASIVO",
    nivel: 2,
    padreId: 9,
    imputable: false,
    activa: true,
  },
  {
    id: 11,
    codigo: "2.1.01",
    nombre: "Proveedores",
    tipo: "PASIVO",
    nivel: 3,
    padreId: 10,
    imputable: true,
    activa: true,
  },

  {
    id: 15,
    codigo: "3",
    nombre: "PATRIMONIO NETO",
    tipo: "PATRIMONIO",
    nivel: 1,
    imputable: false,
    activa: true,
  },
  {
    id: 16,
    codigo: "3.1",
    nombre: "Capital",
    tipo: "PATRIMONIO",
    nivel: 2,
    padreId: 15,
    imputable: true,
    activa: true,
  },

  {
    id: 18,
    codigo: "4",
    nombre: "INGRESOS",
    tipo: "RESULTADO",
    nivel: 1,
    imputable: false,
    activa: true,
  },
  {
    id: 19,
    codigo: "4.1",
    nombre: "Ingresos por Educación",
    tipo: "RESULTADO",
    nivel: 2,
    padreId: 18,
    imputable: false,
    activa: true,
  },
  {
    id: 20,
    codigo: "4.1.01",
    nombre: "Cuotas Escolares Nivel Inicial",
    tipo: "RESULTADO",
    nivel: 3,
    padreId: 19,
    imputable: true,
    activa: true,
  },

  {
    id: 26,
    codigo: "5",
    nombre: "EGRESOS",
    tipo: "RESULTADO",
    nivel: 1,
    imputable: false,
    activa: true,
  },
];

/* =====================================================
   HELPERS (LÓGICA PURA, ESTO IRÍA EN EL BACKEND)
===================================================== */
const construirArbol = (lista) => {
  const map = new Map();
  const roots = [];

  lista.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  map.forEach((item) => {
    if (item.padreId) {
      const padre = map.get(item.padreId);
      if (padre) padre.children.push(item);
    } else {
      roots.push(item);
    }
  });

  // ordenar por código contable
  const ordenar = (nodos) => {
    nodos.sort((a, b) => a.codigo.localeCompare(b.codigo));
    nodos.forEach((n) => ordenar(n.children));
  };

  ordenar(roots);
  return roots;
};

const filtrarArbol = (nodos, busqueda, tipo) => {
  return nodos
    .map((nodo) => {
      const hijos = filtrarArbol(nodo.children, busqueda, tipo);

      const coincideBusqueda =
        nodo.codigo.includes(busqueda) ||
        nodo.nombre.toLowerCase().includes(busqueda.toLowerCase());

      const coincideTipo = tipo === "TODOS" || nodo.tipo === tipo;

      if ((coincideBusqueda && coincideTipo) || hijos.length > 0) {
        return { ...nodo, children: hijos };
      }

      return null;
    })
    .filter(Boolean);
};

/* =====================================================
   HOOK FINAL
===================================================== */
export const usePlanDeCuentas = () => {
  // esto simula el fetch del backend
  const [rawCuentas, setRawCuentas] = useState(CUENTAS_BACKEND);

  // filtros de UI
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  // estructura lista para la tabla
  const cuentas = useMemo(() => {
    const arbol = construirArbol(rawCuentas);
    return filtrarArbol(arbol, busqueda, tipo);
  }, [rawCuentas, busqueda, tipo]);

  /* ================= ACCIONES ================= */
  const manejarEditar = (cuenta) => {
    console.log("Editar:", cuenta);
  };

  const manejarEliminar = (cuenta) => {
    if (!cuenta.imputable) {
      alert("No se puede desactivar una cuenta padre.");
      return;
    }

    if (window.confirm(`¿Desactivar ${cuenta.codigo}?`)) {
      setRawCuentas((prev) =>
        prev.map((c) => (c.id === cuenta.id ? { ...c, activa: false } : c))
      );
    }
  };

  const agregarCuenta = (nueva) => {
    setRawCuentas((prev) => [
      ...prev,
      {
        ...nueva,
        id: Math.max(...prev.map((c) => c.id)) + 1,
      },
    ]);
  };

  return {
    cuentas, // 👈 árbol listo para la tabla
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
    agregarCuenta,
  };
};
