// Auth disabled - always allow access
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
