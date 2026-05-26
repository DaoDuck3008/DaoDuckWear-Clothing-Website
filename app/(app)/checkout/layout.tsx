import AuthGuard from "@/components/guards/authGuard";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
