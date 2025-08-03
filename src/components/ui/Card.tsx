import React, { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  allowOverflow?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', allowOverflow = false, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      bordered: 'bg-white border-2 border-gray-200',
      elevated: 'bg-white border border-gray-200 shadow-lg'
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-lg',
          allowOverflow ? 'overflow-visible' : 'overflow-hidden',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('px-6 py-4 border-b border-gray-200 bg-gray-50', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('px-6 py-4', className)}
      {...props}
    />
  )
)

CardBody.displayName = 'CardBody'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardBody, CardFooter }