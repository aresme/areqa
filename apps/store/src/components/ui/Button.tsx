import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { buttonClass, type ButtonStyleProps } from './buttonStyles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClass({ variant, size, block }), className)}
      {...props}
    />
  );
});

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: LinkProps & ButtonStyleProps) {
  return <Link className={cn(buttonClass({ variant, size, block }), className)} {...props} />;
}
