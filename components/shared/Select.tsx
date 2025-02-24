import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  fullWidth?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function Select({
  label,
  fullWidth = false,
  className = "",
  options,
  id,
  ...props
}: SelectProps) {
  const baseStyles =
    "bg-input border border-border rounded-md text-foreground text-sm px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring";
  const widthStyles = fullWidth ? "w-full" : "";
  const combinedClassName = `${baseStyles} ${widthStyles} ${className}`.trim();

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
      <select id={id} className={combinedClassName} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
