import { cn } from '@/lib/utils';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  className, 
  children, 
  as: Component = 'h3',
  ...props 
}: CardTitleProps) {
  return (
    <Component className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </Component>
  );
}
