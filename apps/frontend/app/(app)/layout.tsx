import AppHeader from "@/components/layouts/appHeader";
import AppFooter from "@/components/layouts/appFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans antialiased">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
