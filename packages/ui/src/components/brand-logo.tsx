import React from 'react'
import { cn } from '@ankita/utils'

export interface BrandLogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Display variant
   * - 'default': website header & navigation (responsive sizing)
   * - 'invoice': optimized dimensions for A4 printable / PDF invoice (110x90px)
   * - 'mark': emblem mark only without text
   * - 'footer': styled for footer presentation
   */
  variant?: 'default' | 'invoice' | 'mark' | 'footer'
  /**
   * Whether to display brand text alongside the logo emblem
   */
  showText?: boolean
  /**
   * Optional custom image source (defaults to /logo.png)
   */
  src?: string
  /**
   * Custom alt text for accessibility
   */
  alt?: string
  /**
   * Additional class name for the wrapper link / container
   */
  className?: string
  /**
   * Additional class name for the image tag
   */
  imageClassName?: string
  /**
   * Subtitle text (e.g. 'B2B Wholesale', 'Admin Portal', 'Jetpur')
   */
  subtitle?: string
  /**
   * Optional link target. Set to false or empty string to disable link wrapper
   */
  asLink?: boolean
}

export function BrandLogo({
  variant = 'default',
  showText = true,
  src = '/logo.png',
  alt = 'Ankita Processors',
  className,
  imageClassName,
  subtitle,
  asLink = true,
  href = '/',
  ...props
}: BrandLogoProps) {
  // Determine sizing and styling based on variant
  let imgClasses = 'site-logo'
  let imgWidth = 180
  let imgHeight = 56

  if (variant === 'invoice') {
    imgClasses = 'invoice-logo w-[110px] h-[90px]'
    imgWidth = 110
    imgHeight = 90
  } else if (variant === 'mark') {
    imgClasses = 'h-10 w-10 md:h-12 md:w-12 object-contain'
    imgWidth = 48
    imgHeight = 48
  } else if (variant === 'footer') {
    imgClasses = 'h-14 w-14 object-contain'
    imgWidth = 56
    imgHeight = 56
  }

  const imageElement = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={imgWidth}
      height={imgHeight}
      loading="eager"
      decoding="async"
      className={cn(
        'object-contain object-center select-none shrink-0 transition-transform duration-200',
        imgClasses,
        imageClassName
      )}
      style={{
        aspectRatio: '1 / 1',
      }}
    />
  )

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 sm:gap-3', className)}>
      {imageElement}
      {showText && variant !== 'mark' && variant !== 'invoice' && (
        <div className="flex flex-col text-left">
          <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-foreground transition-colors group-hover:text-primary leading-tight">
            Ankita Processors
          </span>
          {subtitle && (
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground leading-none mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (!asLink) {
    return content
  }

  return (
    <a
      href={href}
      className={cn('site-logo-link group transition-opacity hover:opacity-95', className)}
      {...props}
    >
      {content}
    </a>
  )
}
