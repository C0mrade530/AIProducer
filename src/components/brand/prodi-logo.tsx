export function ProdiLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#prodi-bg)" />
      {/* Geometric P lettermark */}
      <path
        d="M11 8.5C11 8.22 11.22 8 11.5 8H18.5C21.81 8 24.5 10.69 24.5 14C24.5 17.31 21.81 20 18.5 20H14.5V23.5C14.5 23.78 14.28 24 14 24H11.5C11.22 24 11 23.78 11 23.5V8.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Inner cutout for the P hole */}
      <rect x="14.5" y="11.5" width="5" height="5" rx="2.5" fill="url(#prodi-bg)" />
      <defs>
        <linearGradient id="prodi-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(262, 85%, 58%)" />
          <stop offset="1" stopColor="hsl(220, 90%, 56%)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ProdiLogoMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#prodi-mark)" />
      <path
        d="M11 8.5C11 8.22 11.22 8 11.5 8H18.5C21.81 8 24.5 10.69 24.5 14C24.5 17.31 21.81 20 18.5 20H14.5V23.5C14.5 23.78 14.28 24 14 24H11.5C11.22 24 11 23.78 11 23.5V8.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <rect x="14.5" y="11.5" width="5" height="5" rx="2.5" fill="url(#prodi-mark)" />
      <defs>
        <linearGradient id="prodi-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(262, 85%, 58%)" />
          <stop offset="1" stopColor="hsl(220, 90%, 56%)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
