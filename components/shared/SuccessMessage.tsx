interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({
  message,
  className = "",
}: SuccessMessageProps) {
  return (
    <div className={`text-green-600 text-sm flex items-center ${className}`}>
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      {message}
    </div>
  );
}
