import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-ring";
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-accent hover:bg-accent-hover text-accent-foreground",
    secondary:
      "bg-secondary hover:bg-secondary-hover text-secondary-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  const combinedClassName =
    `${baseStyles} ${widthStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
