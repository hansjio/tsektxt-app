import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <MobileNavigation />
        <main className="mx-auto max-w-none px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
