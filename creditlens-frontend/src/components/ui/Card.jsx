export default function Card({ children, className = "", as: Element = "div", ...props }) {
  return <Element className={`glass-card ${className}`.trim()} {...props}>{children}</Element>;
}
