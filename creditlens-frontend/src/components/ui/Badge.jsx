export default function Badge({ children, className = "", ...props }) {
  return <span className={`eyebrow-pill ${className}`.trim()} {...props}>{children}</span>;
}
