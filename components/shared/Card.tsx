interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-background border border-border rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow ${className}`}
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
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-2xl leading-relaxed font-bold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}
