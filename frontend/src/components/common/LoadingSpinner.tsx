export default function LoadingSpinner({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}