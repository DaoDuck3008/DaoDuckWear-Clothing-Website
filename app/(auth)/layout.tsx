import GuestGuard from "@/components/guards/guestGuard";
import AppHeader from "@/components/layouts/appHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestGuard><AppHeader/>{children}</GuestGuard>;
}
