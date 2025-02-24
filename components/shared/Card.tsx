interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-background border border-border rounded-md p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function CardHeader({
  title,
  description,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-xl leading-8 font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-muted leading-relaxed">{description}</p>
      )}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
