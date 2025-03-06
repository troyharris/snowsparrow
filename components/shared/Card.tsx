interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-accent/20 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  className?: string;
}

export function CardHeader({
  title,
  description,
  icon,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {icon && (
        <span 
          className="material-icons text-3xl text-accent/80 group-hover:text-accent transition-colors"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="space-y-2 flex-1">
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}
