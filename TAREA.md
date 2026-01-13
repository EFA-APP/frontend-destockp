# ESTRUCTURA DE PROYECTO:
--> Componentes
    |-> Modales
    |-> Articulos (Modal de Producto y Materia Prima)
        |-> Contactos (Modal de Cliente y Proveedor)

# Cada Sección cuenta con una subsección
-----> Secciones
        |-> Articulos
            |-> CrearArticulos
                |-> CrearMateriaPrima
                |-> CrearProductos
            |-> MateriaPrima
            |-> Productos
        |-> Compras
            |-> CrearFacturaProveedor
            |-> FacturaProveedor
        |-> Configuración
        |-> Contabilidad
            |-> PlanDeCuentas
            |-> Asientos
            |-> LibroDiario
            |-> LibroMayor
            |-> Balance
            |-> CrearContabilidad
                |-> CrearPlanDeCuenta
                |-> CrearAsiento
        |-> Contactos
            |-> Clientes
            |-> Proveedores
            |-> CrearContactos
                |-> CrearClientes
                |-> CrearProveedores
        |-> Escuela
            |-> Alumnos
            |-> CrearEscuela
                |-> CrearAlumnos
                |-> CrearRecibo
            |-> Cuotas
            |-> Recibos
        |-> Inicio
        |-> Ventas
            |-> CrearVentas
                |->  CrearFactura
                |->  CrearNotaCredito
                |->  CrearNotaDebito
                |->  CrearNotaordenDeVenta
            |->  Factura
            |->  NotaDeCredito
            |->  NotaDeDebito
            |->  OrdenDeVentas

# Tablas, aca se encuenra todas las tablas de cada seccion
-----> Tablas