import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  fullWidth?: boolean;
  error?: string;
}

export function Textarea({
  label,
  fullWidth = false,
  className = "",
  error,
  id,
  ...props
}: TextareaProps) {
  const baseStyles =
    "resize-y bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring";
  const widthStyles = fullWidth ? "w-full" : "";
  const errorStyles = error ? "border-red-500 focus:border-red-500" : "";
  const combinedClassName =
    `${baseStyles} ${widthStyles} ${errorStyles} ${className}`.trim();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <textarea id={id} className={combinedClassName} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
