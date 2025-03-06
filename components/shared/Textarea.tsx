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
    "resize-y bg-input border border-border rounded-xl text-foreground text-base leading-relaxed px-4 py-3 transition-all duration-200 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md";
  const widthStyles = fullWidth ? "w-full" : "";
  const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "";
  const combinedClassName =
    `${baseStyles} ${widthStyles} ${errorStyles} ${className}`.trim();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-base font-semibold text-foreground mb-2"
        >
          {label}
        </label>
      )}
      <textarea id={id} className={combinedClassName} {...props} />
      {error && <p className="text-sm font-medium text-red-500 mt-2">{error}</p>}
    </div>
  );
}
