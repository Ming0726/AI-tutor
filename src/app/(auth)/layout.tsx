export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto mt-12 w-full max-w-md rounded-card bg-card p-8 shadow-card">{children}</div>
    </div>
  );
}
