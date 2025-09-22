# Create directories
$directories = @(
    "frontend\src\assets",
    "frontend\src\components",
    "frontend\src\pages",
    "frontend\src\layouts",
    "frontend\src\services",
    "frontend\src\store",
    "frontend\src\hooks",
    "frontend\src\utils",
    "frontend\src\routes",
    "frontend\src\context",
    "frontend\src\constants",
    "frontend\src\types",
    "frontend\public"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir"
    } else {
        Write-Host "Directory already exists: $dir"
    }
}

# Create package.json
$packageJson = @{
    "name" = "tuition-management-frontend"
    "private" = $true
    "version" = "0.1.0"
    "type" = "module"
    "scripts" = @{
        "dev" = "vite"
        "build" = "tsc && vite build"
        "lint" = "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
        "preview" = "vite preview"
    }
    "dependencies" = @{
        "@headlessui/react" = "^1.7.17"
        "@heroicons/react" = "^2.1.1"
        "@reduxjs/toolkit" = "^2.0.1"
        "axios" = "^1.6.2"
        "date-fns" = "^3.3.1"
        "formik" = "^2.4.5"
        "jwt-decode" = "^4.0.0"
        "react" = "^18.2.0"
        "react-datepicker" = "^4.16.0"
        "react-dom" = "^18.2.0"
        "react-dropzone" = "^14.2.3"
        "react-helmet-async" = "^2.0.4"
        "react-hot-toast" = "^2.4.1"
        "react-icons" = "^5.0.1"
        "react-pdf" = "^7.7.0"
        "react-quill" = "^2.0.0"
        "react-redux" = "^9.0.4"
        "react-router-dom" = "^6.20.1"
        "recharts" = "^2.10.4"
        "yup" = "^1.3.3"
    }
    "devDependencies" = @{
        "@types/node" = "^20.10.5"
        "@types/react" = "^18.2.39"
        "@types/react-dom" = "^18.2.17"
        "@typescript-eslint/eslint-plugin" = "^6.12.0"
        "@typescript-eslint/parser" = "^6.12.0"
        "@vitejs/plugin-react" = "^4.2.0"
        "autoprefixer" = "^10.4.16"
        "eslint" = "^8.54.0"
        "eslint-plugin-react-hooks" = "^4.6.0"
        "eslint-plugin-react-refresh" = "^0.4.4"
        "postcss" = "^8.4.31"
        "tailwindcss" = "^3.3.5"
        "typescript" = "^5.3.2"
        "vite" = "^5.0.0"
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "frontend\package.json" -Encoding utf8
Write-Host "Created package.json"

# Create tsconfig.json
$tsconfig = @{
    "compilerOptions" = @{
        "target" = "ES2020"
        "useDefineForClassFields" = $true
        "lib" = @("DOM", "DOM.Iterable", "ESNext")
        "allowJs" = $false
        "skipLibCheck" = $true
        "esModuleInterop" = $true
        "allowSyntheticDefaultImports" = $true
        "strict" = $true
        "forceConsistentCasingInFileNames" = $true
        "module" = "ESNext"
        "moduleResolution" = "bundler"
        "resolveJsonModule" = $true
        "isolatedModules" = $true
        "noEmit" = $true
        "jsx" = "react-jsx"
        "baseUrl" = "./src"
        "paths" = @{
            "@/*" = @("./*")
        }
    }
    "include" = @("src")
    "references" = @(@{"path" = "./tsconfig.node.json"})
}

$tsconfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "frontend\tsconfig.json" -Encoding utf8
Write-Host "Created tsconfig.json"

# Create tsconfig.node.json
$tsconfigNode = @{
    "compilerOptions" = @{
        "composite" = $true
        "skipLibCheck" = $true
        "module" = "ESNext"
        "moduleResolution" = "bundler"
        "allowSyntheticDefaultImports" = $true
    }
    "include" = @("vite.config.ts")
}

$tsconfigNode | ConvertTo-Json -Depth 10 | Out-File -FilePath "frontend\tsconfig.node.json" -Encoding utf8
Write-Host "Created tsconfig.node.json"

# Create vite.config.ts
$viteConfig = @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
"@

[System.IO.File]::WriteAllText("$PWD\frontend\vite.config.ts", $viteConfig)
Write-Host "Created vite.config.ts"

# Create tailwind.config.js
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
"@

[System.IO.File]::WriteAllText("$PWD\frontend\tailwind.config.js", $tailwindConfig)
Write-Host "Created tailwind.config.js"

# Create postcss.config.js
$postcssConfig = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@

[System.IO.File]::WriteAllText("$PWD\frontend\postcss.config.js", $postcssConfig)
Write-Host "Created postcss.config.js"

# Create .eslintrc.cjs
$eslintConfig = @"
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '18.2',
    },
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn',
  },
}
"@

[System.IO.File]::WriteAllText("$PWD\frontend\.eslintrc.cjs", $eslintConfig)
Write-Host "Created .eslintrc.cjs"

Write-Host "Frontend setup completed successfully!"
Write-Host "Next steps:"
Write-Host "1. Navigate to the frontend directory: cd frontend"
Write-Host "2. Install dependencies: npm install"
Write-Host "3. Start the development server: npm run dev"
