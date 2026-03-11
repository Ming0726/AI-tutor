import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toast } from "@/components/ui/Toast";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Sidebar />
      <div className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
      <Toast />
    </AuthGuard>
  );
}
