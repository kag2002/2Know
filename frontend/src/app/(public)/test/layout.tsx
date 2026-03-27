export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header during test (minimalistic) */}
      <header className="h-14 bg-background border-b flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-lg font-black">2</span>
          </div>
          <span>Know</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground font-medium">
          Hệ thống kiểm tra trực tuyến
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
