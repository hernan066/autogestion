# 🌾 Ringo Agromarket - Portal de Autogestión de Clientes

¡Bienvenido al **Portal de Autogestión de Clientes** de **Ringo Agromarket**! Esta es una aplicación web moderna, premium y de alta gama construida sobre **React** y **Vite**, diseñada para ofrecer una experiencia nativa móvil (con enfoque en dispositivos móviles) de fidelización, acumulación de puntos y beneficios para los clientes del agromarket.

Con un diseño visual de vanguardia basado en **Glassmorphism**, contrastes profundos y una paleta de colores de lujo (**Luxury Black, White & Gold-Yellow**), este portal permite a los clientes gestionar su perfil, verificar sus puntos acumulados y recomendar amigos para expandir la comunidad.

---

## 🌟 Características Destacadas

### 1. 🎛️ Centro de Beneficios y Puntos
* **Saldo en Tiempo Real:** Visualización destacada de los puntos acumulados por las compras realizadas en Ringo Agromarket.
* **Equivalente Monetario:** Conversión automática de puntos a pesos argentinos (`$ ARS`) calculada a partir de las tasas de conversión oficiales provistas por el backend.
* **Calculadora de Canje Interactiva:** Un control deslizante interactivo que simula el descuento exacto en pesos que obtendrá el cliente según los puntos que decida canjear en su próxima compra.

### 2. 👥 Sistema de Invitados (Referidos)
* **Enlace Único de Recomendación:** Generación dinámica de un link personalizado asociado al ID único del cliente para capturar referidos automáticamente.
* **Compartir Fácil en WhatsApp:** Botón directo preconfigurado con un mensaje persuasivo y el enlace personalizado del cliente para compartir a través de WhatsApp en un toque.
* **Monitoreo de Amigos:** Lista detallada en tiempo real de los amigos que se han registrado usando su enlace de invitación y la cantidad de puntos de recompensa ganados por cada uno.

### 3. 🛡️ Autenticación Segura y Modo Sandbox
* **Acceso con Google:** Integración moderna con **Google Identity Services (GSI)** para un inicio de sesión rápido, seguro y sin contraseñas mediante OAuth 2.0.
* **Modo de Prueba Local (Sandbox):** Un panel dedicado para desarrolladores y administradores que permite simular el inicio de sesión instantáneo de cualquier cliente cargando su dirección de correo electrónico existente sin requerir credenciales reales de Google.
* **Captura de Enlaces de Campaña:** Capacidad para almacenar dinámicamente referencias de campañas (`ref`, `link`, `tenant`) desde la URL y asociarlas al registro inicial del cliente en el backend.

### 4. 📝 Gestión de Perfil de Facturación
* **Actualización en Caliente:** Formulario interactivo para actualizar nombre, apellido y datos de contacto.
* **Compatibilidad de Prefijo de Teléfono:** Formato telefónico autocompletado y validado con el código de país argentino (`+54`).
* **Datos de Facturación:** Registro directo de CUIT o DNI para agilizar el proceso de facturación electrónica y fiscal en la caja del agromarket.

---

## 🎨 Sistema de Diseño y Estética Premium

La interfaz de usuario ha sido pulida para emular la sensación de una **aplicación móvil nativa** de alta fidelidad:
* **Paleta de Colores:** Diseñada meticulosamente en torno a negros de alta tecnología (`#000000`, `#0c0c0c`), elementos traslúcidos con desenfoque de fondo (Glassmorphism), y un acento dorado/amarillo brillante (`#ffcc00`) que evoca exclusividad y recompensa.
* **Tipografía Avanzada:** Uso exclusivo de **Outfit** (vía Google Fonts), una fuente geométrica moderna excelente para interfaces dinámicas y números grandes.
* **Micro-animaciones de Fluidos:** Efectos de pulso en el anillo de puntos, transiciones fluidas en hover de botones y animaciones elegantes de entrada para pantallas (`animate-fade-in`).
* **Diseño Orientado a Móviles (Mobile-First):** Estructura adaptada perfectamente a una anchura máxima de `480px` centrada en pantalla con un menú inferior de navegación flotante ultra-estilizado, ideal para ser anclada a la pantalla de inicio del teléfono del cliente.

---

## 📁 Estructura del Proyecto

La estructura del código fuente está optimizada para la legibilidad, mantenimiento y modularidad:

```bash
autogestion/
├── public/                 # Recursos estáticos (Logotipos, iconos)
├── src/
│   ├── assets/             # Archivos multimedia adicionales
│   ├── components/         # Componentes reactivos modulares
│   │   ├── DashboardView.jsx  # Puntos acumulados y simulador interactivo de canjes
│   │   ├── LoginView.jsx      # Autenticación con Google y panel de pruebas Sandbox
│   │   ├── ProfileForm.jsx    # Actualización de datos del perfil y facturación
│   │   └── ReferralsCard.jsx  # Generación de links de referidos y lista de invitados
│   ├── App.css             # Estilos de layouts, cabeceras, botones y animaciones
│   ├── App.jsx             # Orquestador del estado global de la sesión y enrutamiento interno
│   ├── index.css           # Tokens de diseño CSS (variables de color, fuentes, scrollbars)
│   └── main.jsx            # Punto de entrada de la aplicación React
├── .env                    # Configuración de variables de entorno
├── eslint.config.js        # Configuración de análisis de código estático (Linter)
├── index.html              # Plantilla base HTML5
├── package.json            # Scripting y dependencias del proyecto
└── vite.config.js          # Configuración del empaquetador Vite
```

---

## ⚙️ Configuración y Variables de Entorno

El proyecto interactúa dinámicamente con una API REST backend. Configura tus variables creando un archivo `.env` en la raíz del proyecto:

```env
# ID de Cliente de Google Cloud Console para la autenticación
VITE_GOOGLE_CLIENT_ID=tu_google_client_id_aqui.apps.googleusercontent.com

# Ruta base del backend donde se encuentra la API del sistema de recompensas
VITE_API_URL=http://localhost:3040
```

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Clonar el repositorio e ingresar a la carpeta
```bash
cd autogestion
```

### 2. Instalar dependencias
Asegúrate de contar con Node.js v18+ instalado. Luego, ejecuta:
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
Levanta la aplicación localmente en modo desarrollo con HMR (Hot Module Replacement) instantáneo:
```bash
npm run dev
```
*Por defecto, Vite abrirá la aplicación en [http://localhost:5173](http://localhost:5173) o el siguiente puerto libre disponible.*

### 4. Construcción para Producción
Para compilar la aplicación optimizada para producción (compresión de assets, minificación de código):
```bash
npm run build
```
*Los archivos listos para desplegar se generarán en el directorio `/dist`.*

---

## 🛠️ Buenas Prácticas de Desarrollo
* **Uso de CSS Puro:** La aplicación está desarrollada utilizando CSS Vanilla modular para un control total y óptimo del rendimiento sin dependencias extrañas (cero TailwindCSS por especificaciones del proyecto).
* **Compatibilidad de Linter:** El código cumple con las reglas estrictas de ESLint. Puedes validar la calidad y consistencia del código ejecutando `npm run lint`.

---

Desarrollado con ❤️ para la comunidad de **Ringo Agromarket**.
