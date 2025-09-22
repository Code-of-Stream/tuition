// This file helps TypeScript understand path aliases and provides type declarations

// Environment Variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_API_URL: string;
  }
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For Vite's import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Component declarations
declare module '@/pages/auth/Register' {
  import { FC } from 'react';
  const Register: FC;
  export default Register;
}

declare module '@/pages/auth/Login' {
  import { FC } from 'react';
  const Login: FC;
  export default Login;
}

declare module '@/pages/auth/ForgotPassword' {
  import { FC } from 'react';
  const ForgotPassword: FC;
  export default ForgotPassword;
}

declare module '@/pages/auth/ResetPassword' {
  import { FC } from 'react';
  const ResetPassword: FC;
  export default ResetPassword;
}

declare module '@/pages/dashboard/Dashboard' {
  import { FC } from 'react';
  const Dashboard: FC;
  export default Dashboard;
}

declare module '@/pages/profile/Profile' {
  import { FC } from 'react';
  const Profile: FC;
  export default Profile;
}

declare module '@/pages/users/Users' {
  import { FC } from 'react';
  const Users: FC;
  export default Users;
}
