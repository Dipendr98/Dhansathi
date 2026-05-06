import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6 antialiased relative">
      {/* Tricolor bar */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-50">
        <div className="h-full flex-1 bg-saffron" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-india-green" />
      </div>

      {/* Decorative blurs */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Outlet />

      <footer className="fixed bottom-6 w-full text-center px-6">
        <p className="text-[10px] font-mono text-outline-variant uppercase tracking-[0.2em]">
          &copy; 2024 Digital Sovereign Financial Services
        </p>
      </footer>
    </div>
  );
}
