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
      <rect width="32" height="32" rx="8" fill="#0a0a1a" />
      {/* Play triangle — символ запуска */}
      <path
        d="M12 8.5L24 16L12 23.5V8.5Z"
        fill="white"
      />
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
      <rect width="32" height="32" rx="8" fill="#0a0a1a" />
      <path
        d="M12 8.5L24 16L12 23.5V8.5Z"
        fill="white"
      />
    </svg>
  )
}
