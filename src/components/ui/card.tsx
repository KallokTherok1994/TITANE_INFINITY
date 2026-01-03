/**
 * TITANE∞ v26.2.0 — Card Component (Titanium Dark)
 * Container component with Titanium Dark design system
 * Elevated surface with subtle shadows and borders
 * @license MIT
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
  children: React.ReactNode;
}

export function Card({ 
  className = '', 
  hoverable = false,
  elevated = false,
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg 
        bg-titanium-bg-elevated 
        border border-titanium-border-default 
        ${elevated ? 'shadow-md' : 'shadow'}
        ${hoverable ? 'hover:shadow-md hover:bg-titanium-bg-interactive transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xl font-semibold leading-tight text-titanium-text-primary ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-base text-titanium-text-secondary ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
