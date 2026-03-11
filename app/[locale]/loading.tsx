export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 bg-surface" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-20 w-full bg-surface rounded-xl" />
        ))}
      </div>
    </div>
  );
}
