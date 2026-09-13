# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type‑aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Installation and Setup Instructions

### Prerequisites
- **Node.js** (>= 18.x recommended)
- **npm** (>= 9) or **yarn**

### Clone the repository
```bash
git clone https://github.com/raj-varma01/multi-tenant-frontend.git
cd multi-tenant-frontend
```

### Install dependencies
```bash
npm install
# or, if you prefer Yarn
# yarn install
```

### Run the development server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to view the app with hot‑module replacement.

### Build for production
```bash
npm run build
```
The optimized static files are emitted to the `dist/` directory, ready for deployment.

---
