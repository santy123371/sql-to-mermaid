# 🚀 SQL Schemer

> Transforma esquemas SQL (`init.sql`, DDL) en diagramas de clases UML limpios y compatibles con **Mermaid.js** (`.mmd`) al instante. 100% gratuito y de código abierto.

[![Website](https://img.shields.io/badge/Demo_en_Vivo-sqlschemer.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://sqlschemer.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/santy123371/sql-to-mermaid?style=for-the-badge&logo=github&color=gold)](https://github.com/santy123371/sql-to-mermaid/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/santy123371/sql-to-mermaid?style=for-the-badge&logo=github&color=blue)](https://github.com/santy123371/sql-to-mermaid/network/members)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

🌐 **Sitio Web Oficial / Demo en Vivo**: [https://sqlschemer.vercel.app](https://sqlschemer.vercel.app)

---

## ⭐ ¡Apóyanos con una Estrella!

Si esta herramienta te ayuda a ahorrar tiempo documentando tus bases de datos y arquitecturas de software, **por favor dale una estrella (Star ⭐) a este repositorio en GitHub**:

👉 **[https://github.com/santy123371/sql-to-mermaid](https://github.com/santy123371/sql-to-mermaid)**

¡Tu apoyo nos motiva a seguir manteniéndolo y agregando nuevas funciones para toda la comunidad!

---

## 💡 ¿Qué hace este programa?

Al desarrollar aplicaciones y diseñar bases de datos, documentar las clases y sus relaciones en diagramas UML suele ser una tarea manual y tediosa.

**SQL Schemer** realiza **ingeniería inversa** automática sobre cualquier archivo SQL DDL (`CREATE TABLE`, `FOREIGN KEY`, `PRIMARY KEY`):
1. **Detecta tablas y atributos**: Extrae columnas, tipos de datos SQL y los normaliza a tipos estándar UML (`int`, `string`, `decimal`, `datetime`, `bool`).
2. **Infiere relaciones por Claves Foráneas**: Identifica restricciones `FOREIGN KEY` y genera conexiones con cardinalidades explícitas (`"1" --> "*"`).
3. **Agrega métodos CRUD**: Inyecta métodos típicos de clase (`+registrar()`, `+actualizar()`, `+consultar()`, `+deshabilitar()`).
4. **Renderizado en Vivo**: Previsualiza el diagrama Mermaid con zoom interactivo (hasta 350%), paneo con arrastre de mouse y soporte para pantalla completa.
5. **Exportación inmediata**: Descarga el archivo `.mmd`, cópialo al portapapeles, expórtalo como imagen **SVG vectorial** o ábrelo directamente en **Mermaid Live Editor** con un solo clic.

---

## ✨ Características Principales

- **🎁 100% Gratuito y Open Source**: Sin registros, sin planes de pago y sin límites en la cantidad de tablas.
- **📂 Drag & Drop de Archivos `.sql`**: Arrastra tu archivo `.sql` directamente al editor con validación estricta (rechaza formatos no soportados para mayor estabilidad).
- **🎨 Interfaz Moderna & Animada**: Modo oscuro refinado, fondo dot-grid, micro-interacciones suaves y estadísticas en tiempo real (conteo de tablas, columnas y relaciones).
- **⚙️ Opciones de Personalización**:
  - Orientación: Vertical (`TB`) u Horizontal (`LR`).
  - Activar / Desactivar métodos CRUD.
  - Formateo automático de nombres a `PascalCase`.
- **🧪 Esquemas de Prueba Incluidos**:
  - *SaaS E-Commerce* (10 tablas normalizadas con claves foráneas).
  - *Auth & Roles* (3 tablas para pruebas rápidas).
- **🔒 Privacidad Garantizada**: Todo el análisis y compilación se ejecuta estrictamente en la memoria de tu navegador (lado del cliente).

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI / Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Librería de Diagramas**: [Mermaid.js](https://mermaid.js.org/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Lenguaje**: TypeScript

---

## 📦 Instalación y Ejecución Local

> 🌐 **¿Prefieres no instalar nada?** Puedes acceder directamente a la versión en producción en [https://sqlschemer.vercel.app](https://sqlschemer.vercel.app).

1. **Clona este repositorio**:
   ```bash
   git clone https://github.com/santy123371/sql-to-mermaid.git
   cd sql-to-mermaid
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abre en tu navegador**:
   Visita [http://localhost:3000](http://localhost:3000) para ver la Landing Page o [http://localhost:3000/convert](http://localhost:3000/convert) para usar el Studio.

---

## 📁 Estructura del Proyecto

```text
sql-schemer/
├── init.sql                     # Esquema de prueba (10 tablas normalizadas)
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing Page principal
│   │   ├── convert/page.tsx     # Convertidor Studio con Drag & Drop y visor
│   │   ├── api/sample/route.ts  # Endpoint para servir el esquema demo
│   │   ├── layout.tsx           # Layout raíz
│   │   └── globals.css          # Estilos globales y animaciones
│   ├── components/
│   │   ├── Navbar.tsx           # Barra de navegación con botón Star en GitHub
│   │   └── MermaidRenderer.tsx  # Visor interactivo Mermaid con Pan & Zoom
│   └── lib/
│       └── sql-parser.ts        # Motor de análisis DDL y generador Mermaid
├── public/                      # Assets estáticos
├── LICENSE                      # Licencia MIT
└── README.md                    # Documentación del proyecto
```

---

## 🤝 Contribuciones

¡Las contribuciones son siempre bienvenidas! Si tienes ideas para soportar más dialectos SQL o mejorar la visualización:
1. Haz un Fork del proyecto en [GitHub](https://github.com/santy123371/sql-to-mermaid).
2. Crea tu rama con la nueva función (`git checkout -b feature/nueva-funcion`).
3. Haz tus commits (`git commit -m 'feat: agregar soporte para nueva sintaxis'`).
4. Haz Push a la rama (`git push origin feature/nueva-funcion`).
5. Abre un Pull Request.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](./LICENSE). Siéntete libre de usarlo en tus proyectos personales o profesionales. ¡No olvides dejar tu ⭐ en [GitHub](https://github.com/santy123371/sql-to-mermaid)!
