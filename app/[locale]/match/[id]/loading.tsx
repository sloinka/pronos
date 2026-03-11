export default function MatchLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="skeleton h-48 w-full bg-surface rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton h-40 w-full bg-surface rounded-xl" />
        <div className="skeleton h-40 w-full bg-surface rounded-xl" />
      </div>
      <div className="skeleton h-48 w-full bg-surface rounded-xl" />
      <div className="skeleton h-32 w-full bg-surface rounded-xl" />
      <div className="skeleton h-40 w-full bg-surface rounded-xl" />
    </div>
  );
}
