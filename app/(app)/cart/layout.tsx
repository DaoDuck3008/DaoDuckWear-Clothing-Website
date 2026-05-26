import AuthGuard from "@/components/guards/authGuard";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
