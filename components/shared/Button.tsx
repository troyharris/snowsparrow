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
    "font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95";
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-accent text-accent-foreground shadow-sm hover:shadow-md",
    secondary:
      "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md",
    outline: "border-2 border-input hover:bg-accent/10 hover:border-accent",
  };

  const combinedClassName =
    `${baseStyles} ${widthStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
