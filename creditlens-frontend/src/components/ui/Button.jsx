import { Link } from "react-router-dom";

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  to,
  href,
  ...props
}) {
  const classes = `button button-${variant} ${className}`.trim();

  if (to) {
    return <Link className={classes} to={to} {...props}>{children}</Link>;
  }

  if (href) {
    return <a className={classes} href={href} {...props}>{children}</a>;
  }

  return <button className={classes} type={type} {...props}>{children}</button>;
}
