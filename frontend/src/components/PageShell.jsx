export default function PageShell({ title, children }) {
  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">{title}</h2>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </section>
  )
}
