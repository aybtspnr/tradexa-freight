export function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-md px-6 text-center">
        {/* Wrench icon */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
            <svg
              className="h-10 w-10 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17l-7.5 7.5a2.828 2.828 0 004.24 0l7.5-7.5a2.828 2.828 0 000-4.24L11.42 15.17zM14.828 2.586a6.5 6.5 0 00-9.192 9.192l1.414 1.414a1.5 1.5 0 002.121 0l5.657-5.657a1.5 1.5 0 000-2.121L14.828 2.586z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          Em manutenção
        </h1>

        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Estamos realizando melhorias na plataforma. Em breve tudo estará de volta ao normal.
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Agradecemos pela compreensão.
        </p>

        {/* Decorative bar */}
        <div className="mt-8 mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
      </div>
    </div>
  );
}
