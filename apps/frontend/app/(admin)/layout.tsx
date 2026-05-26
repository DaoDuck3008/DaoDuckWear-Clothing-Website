import AdminLayoutClient from "@/components/layouts/adminLayoutClient";
import AuthGuard from "@/components/guards/authGuard";
import RoleGuard from "@/components/guards/roleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["ADMIN", "STAFF", "MANAGER"]}>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </RoleGuard>
    </AuthGuard>
  );
}
