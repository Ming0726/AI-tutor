export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-card bg-card p-10 text-center shadow-card">
        <h1 className="font-display text-5xl text-text-primary">AI Tutor</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Learn faster with warm, focused AI explanations, quizzes, and cards.
        </p>
        <button
          type="button"
          className="mt-8 rounded-card bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Start Learning
        </button>
      </section>
    </main>
  );
}
