export default function AdminSectionTitle({ children, className = '' }) {
  return (
    <h2 className={`text-sm font-semibold text-amber-200 mb-3 ${className}`.trim()}>
      {children}
    </h2>
  );
}

