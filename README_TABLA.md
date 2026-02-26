# Guía de React Query para Tablas Reutilizables

## 📋 Tabla de Contenidos

1. [Instalación y Configuración](#instalación-y-configuración)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Configuración del Provider](#configuración-del-provider)
4. [Servicios API](#servicios-api)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Implementación en Componentes](#implementación-en-componentes)
7. [Patrones Avanzados](#patrones-avanzados)
8. [Best Practices](#best-practices)

---

## Instalación y Configuración

### 1. Instalar React Query

```bash
npm install @tanstack/react-query
# o
yarn add @tanstack/react-query
```

### 2. Instalar DevTools (opcional pero recomendado)

```bash
npm install @tanstack/react-query-devtools
```

---

## Estructura de Carpetas

```
src/
├── api/
│   ├── config/
│   │   └── queryClient.js          # Configuración de React Query
│   ├── services/
│   │   ├── inventarioService.js    # Llamadas API de inventario
│   │   ├── ventasService.js        # Llamadas API de ventas
│   │   └── clientesService.js      # Llamadas API de clientes
│   └── hooks/
│       ├── useInventarioQuery.js   # Hooks de inventario
│       ├── useVentasQuery.js       # Hooks de ventas
│       └── useClientesQuery.js     # Hooks de clientes
├── components/
│   ├── UI/
│   │   └── TablaReutilizable/
│   └── tables/
│       ├── TablaInventario/
│       │   ├── TablaInventario.jsx
│       │   ├── columnasInventario.js
│       │   └── useTablaInventario.js
│       └── TablaVentas/
└── App.jsx
```

---

## Configuración del Provider

### `src/api/config/queryClient.js`

```javascript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo en que los datos se consideran "frescos"
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos permanecen en caché
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)

      // Reintentar peticiones fallidas
      retry: 1,

      // Refetch cuando la ventana gana foco
      refetchOnWindowFocus: false,

      // Refetch cuando se reconecta la red
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentar mutaciones fallidas
      retry: 1,
    },
  },
});
```

### `src/App.jsx`

```javascript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./Backend/config/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu aplicación */}
      <YourRoutes />

      {/* DevTools - solo en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

---

## Servicios API

### `src/api/services/inventarioService.js`

```javascript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const inventarioService = {
  // Obtener todos los productos
  obtenerProductos: async (filtros = {}) => {
    const { busqueda, categoria, pagina = 1, limite = 10 } = filtros;
    const params = new URLSearchParams();

    if (busqueda) params.append("busqueda", busqueda);
    if (categoria) params.append("categoria", categoria);
    params.append("pagina", pagina);
    params.append("limite", limite);

    const { data } = await apiClient.get(`/productos?${params}`);
    return data;
  },

  // Obtener un producto por ID
  obtenerProductoPorId: async (id) => {
    const { data } = await apiClient.get(`/productos/${id}`);
    return data;
  },

  // Crear producto
  crearProducto: async (producto) => {
    const { data } = await apiClient.post("/productos", producto);
    return data;
  },

  // Actualizar producto
  actualizarProducto: async ({ id, ...producto }) => {
    const { data } = await apiClient.put(`/productos/${id}`, producto);
    return data;
  },

  // Eliminar producto
  eliminarProducto: async (id) => {
    const { data } = await apiClient.delete(`/productos/${id}`);
    return data;
  },

  // Actualizar stock
  actualizarStock: async ({ id, cantidad }) => {
    const { data } = await apiClient.patch(`/productos/${id}/stock`, {
      cantidad,
    });
    return data;
  },
};
```

---

## Hooks Personalizados

### `src/api/hooks/useInventarioQuery.js`

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarioService } from "../services/inventarioService";

// Keys para las queries (importante para la invalidación de caché)
export const inventarioKeys = {
  all: ["inventario"],
  lists: () => [...inventarioKeys.all, "list"],
  list: (filtros) => [...inventarioKeys.lists(), filtros],
  details: () => [...inventarioKeys.all, "detail"],
  detail: (id) => [...inventarioKeys.details(), id],
};

// Hook para obtener lista de productos
export const useProductos = (filtros = {}) => {
  return useQuery({
    queryKey: inventarioKeys.list(filtros),
    queryFn: () => inventarioService.obtenerProductos(filtros),
    // Opciones específicas para esta query
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Hook para obtener un producto específico
export const useProducto = (id) => {
  return useQuery({
    queryKey: inventarioKeys.detail(id),
    queryFn: () => inventarioService.obtenerProductoPorId(id),
    enabled: !!id, // Solo ejecutar si hay un ID
  });
};

// Hook para crear producto
export const useCrearProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventarioService.crearProducto,
    onSuccess: () => {
      // Invalidar y refetch
      queryClient.invalidateQueries({ queryKey: inventarioKeys.lists() });
    },
    onError: (error) => {
      console.error("Error al crear producto:", error);
      // Aquí puedes manejar errores con toast/notificaciones
    },
  });
};

// Hook para actualizar producto
export const useActualizarProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventarioService.actualizarProducto,
    // Optimistic update
    onMutate: async (nuevoProducto) => {
      // Cancelar queries salientes
      await queryClient.cancelQueries({
        queryKey: inventarioKeys.detail(nuevoProducto.id),
      });

      // Snapshot del valor anterior
      const previousProducto = queryClient.getQueryData(
        inventarioKeys.detail(nuevoProducto.id)
      );

      // Actualizar optimistamente
      queryClient.setQueryData(
        inventarioKeys.detail(nuevoProducto.id),
        nuevoProducto
      );

      return { previousProducto };
    },
    onError: (err, nuevoProducto, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(
        inventarioKeys.detail(nuevoProducto.id),
        context.previousProducto
      );
    },
    onSettled: (data, error, variables) => {
      // Refetch después de error o éxito
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.lists() });
    },
  });
};

// Hook para eliminar producto
export const useEliminarProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventarioService.eliminarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.lists() });
    },
  });
};

// Hook para actualizar stock
export const useActualizarStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventarioService.actualizarStock,
    onSuccess: (data, variables) => {
      // Invalidar el producto específico y las listas
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.lists() });
    },
  });
};
```

---

## Implementación en Componentes

### `src/components/tables/TablaInventario/useTablaInventario.js`

```javascript
import { useState } from "react";
import {
  useProductos,
  useCrearProducto,
  useActualizarProducto,
  useEliminarProducto,
} from "../../../Backend/hooks/useInventarioQuery";

export const useTablaInventario = () => {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [categoria, setCategoria] = useState("");

  // Query para obtener productos
  const {
    data: productos,
    isLoading,
    isError,
    error,
    isFetching,
  } = useProductos({ busqueda, categoria, pagina, limite: 10 });

  // Mutations
  const crearProductoMutation = useCrearProducto();
  const actualizarProductoMutation = useActualizarProducto();
  const eliminarProductoMutation = useEliminarProducto();

  const manejarAgregar = async (nuevoProducto) => {
    try {
      await crearProductoMutation.mutateAsync(nuevoProducto);
      // Mostrar toast de éxito
      alert("Producto creado exitosamente");
    } catch (error) {
      // Mostrar toast de error
      alert("Error al crear producto");
    }
  };

  const manejarEditar = async (producto) => {
    try {
      await actualizarProductoMutation.mutateAsync(producto);
      alert("Producto actualizado exitosamente");
    } catch (error) {
      alert("Error al actualizar producto");
    }
  };

  const manejarEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await eliminarProductoMutation.mutateAsync(id);
        alert("Producto eliminado exitosamente");
      } catch (error) {
        alert("Error al eliminar producto");
      }
    }
  };

  return {
    // Datos
    productos: productos?.data || [],
    totalPaginas: productos?.totalPaginas || 1,
    total: productos?.total || 0,

    // Estados de carga
    isLoading,
    isError,
    error,
    isFetching, // Para mostrar un spinner mientras refetch

    // Estados de mutations
    isCreating: crearProductoMutation.isPending,
    isUpdating: actualizarProductoMutation.isPending,
    isDeleting: eliminarProductoMutation.isPending,

    // Filtros
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    categoria,
    setCategoria,

    // Handlers
    manejarAgregar,
    manejarEditar,
    manejarEliminar,
  };
};
```

### `src/components/tables/TablaInventario/TablaInventario.jsx`

```javascript
import TablaReutilizable from "../../UI/TablaReutilizable/TablaReutilizable";
import { columnasInventario } from "./columnasInventario";
import { useTablaInventario } from "./useTablaInventario";
import { AgregarIcono, BuscadorIcono } from "../../../assets/Icons";

const TablaInventario = () => {
  const {
    productos,
    isLoading,
    isError,
    error,
    isFetching,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
    manejarAgregar,
    manejarEditar,
    manejarEliminar,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTablaInventario();

  // Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Error al cargar productos: {error.message}
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)] shadow-md rounded-md">
      {/* Indicador de refetch */}
      {isFetching && (
        <div className="absolute top-2 right-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)]"></div>
        </div>
      )}

      {/* BUSCADOR Y AGREGAR PRODUCTO */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <button
          onClick={manejarAgregar}
          disabled={isCreating}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-10 px-4 shadow-md"
        >
          {isCreating ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <AgregarIcono />
          )}
          {isCreating ? "Creando..." : "Agregar producto"}
        </button>

        <div className="relative w-[220px]">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border-[.5px]! border-gray-100/10! flex h-10 rounded-md! disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-0 border-ld placeholder:text-gray-100/50! focus-visible:ring-0 z-10 w-full pl-8 placeholder:text-xs text-[var(--primary)]! focus:outline-none focus:border-2 focus:border-[var(--primary)]! shadow-md"
            placeholder="Ingrese el producto a buscar"
          />
          <div className="absolute top-2 left-2">
            <BuscadorIcono />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <TablaReutilizable
        columnas={columnasInventario}
        datos={productos}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        mostrarAcciones={true}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TablaInventario;
```

---

## Patrones Avanzados

### 1. Prefetching (Precarga de datos)

```javascript
import { useQueryClient } from "@tanstack/react-query";
import { inventarioKeys } from "../../../Backend/hooks/useInventarioQuery";
import { inventarioService } from "../../../Backend/services/inventarioService";

const TablaInventario = () => {
  const queryClient = useQueryClient();

  // Prefetch al hacer hover sobre un producto
  const prefetchProducto = (id) => {
    queryClient.prefetchQuery({
      queryKey: inventarioKeys.detail(id),
      queryFn: () => inventarioService.obtenerProductoPorId(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div onMouseEnter={() => prefetchProducto(productoId)}>
      {/* Contenido */}
    </div>
  );
};
```

### 2. Infinite Queries (Scroll infinito)

```javascript
import { useInfiniteQuery } from "@tanstack/react-query";

export const useProductosInfinitos = (filtros = {}) => {
  return useInfiniteQuery({
    queryKey: ["productos", "infinite", filtros],
    queryFn: ({ pageParam = 1 }) =>
      inventarioService.obtenerProductos({ ...filtros, pagina: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
  });
};
```

### 3. Dependent Queries (Queries dependientes)

```javascript
// Obtener producto y luego sus detalles de stock
export const useProductoConStock = (id) => {
  const { data: producto } = useProducto(id);

  const { data: stock } = useQuery({
    queryKey: ["stock", id],
    queryFn: () => inventarioService.obtenerStock(id),
    enabled: !!producto, // Solo ejecutar si existe el producto
  });

  return { producto, stock };
};
```

### 4. Parallel Queries (Queries paralelas)

```javascript
export const useDashboardData = () => {
  const productos = useProductos();
  const ventas = useVentas();
  const clientes = useClientes();

  return {
    isLoading: productos.isLoading || ventas.isLoading || clientes.isLoading,
    productos: productos.data,
    ventas: ventas.data,
    clientes: clientes.data,
  };
};
```

---

## Best Practices

### ✅ DO (Hacer)

1. **Usar query keys consistentes**

   ```javascript
   export const productKeys = {
     all: ["productos"],
     lists: () => [...productKeys.all, "list"],
     list: (filters) => [...productKeys.lists(), filters],
   };
   ```

2. **Invalidar queries relacionadas después de mutations**

   ```javascript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["productos"] });
   };
   ```

3. **Manejar estados de carga y error**

   ```javascript
   if (isLoading) return <Spinner />;
   if (isError) return <ErrorMessage error={error} />;
   ```

4. **Usar optimistic updates para mejor UX**

   ```javascript
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey: ["productos"] });
     const previous = queryClient.getQueryData(["productos"]);
     queryClient.setQueryData(["productos"], newData);
     return { previous };
   };
   ```

5. **Configurar staleTime según la naturaleza de los datos**
   - Datos que cambian frecuentemente: 30 segundos - 1 minuto
   - Datos estables: 5 - 10 minutos
   - Datos estáticos: Infinity

### ❌ DON'T (No hacer)

1. **No usar React Query como estado global**

   ```javascript
   // ❌ Mal - usar para estado local de UI
   const { data: modalOpen } = useQuery(["modal"], () => true);

   // ✅ Bien - usar useState
   const [modalOpen, setModalOpen] = useState(false);
   ```

2. **No hacer fetch manual innecesariamente**

   ```javascript
   // ❌ Mal
   useEffect(() => {
     fetch("/api/productos").then(/* ... */);
   }, []);

   // ✅ Bien
   const { data } = useQuery(["productos"], fetchProductos);
   ```

3. **No olvidar manejar errores**

   ```javascript
   // ❌ Mal
   const { data } = useQuery(["productos"], fetchProductos);

   // ✅ Bien
   const { data, isError, error } = useQuery(["productos"], fetchProductos);
   if (isError) return <Error message={error.message} />;
   ```

4. **No hacer queries dentro de loops**

   ```javascript
   // ❌ Mal
   productos.map((p) => {
     const { data } = useQuery(["detalle", p.id], () => fetch(p.id));
   });

   // ✅ Bien - usar una sola query con todos los IDs
   const { data } = useQuery(["detalles"], () => fetchMultiple(ids));
   ```

---

## Recursos Adicionales

- [Documentación oficial de TanStack Query](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Ejemplos oficiales](https://tanstack.com/query/latest/docs/react/examples/react/basic)

---

## Checklist de Implementación

- [ ] Instalar @tanstack/react-query
- [ ] Configurar QueryClientProvider en App.jsx
- [ ] Crear estructura de carpetas (api/services, api/hooks)
- [ ] Implementar servicios API
- [ ] Crear hooks personalizados con React Query
- [ ] Implementar manejo de estados (loading, error)
- [ ] Configurar invalidación de caché
- [ ] Agregar optimistic updates (opcional)
- [ ] Instalar y configurar DevTools
- [ ] Testear queries y mutations
