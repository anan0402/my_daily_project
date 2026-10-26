function PawIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      {/* toes */}
      <ellipse cx="5.5" cy="5.5" rx="2" ry="2.5" fill="#FF6B2B" />
      <ellipse cx="10.5" cy="3.5" rx="2" ry="2.5" fill="#FF6B2B" />
      <ellipse cx="15.5" cy="4.5" rx="1.8" ry="2.3" fill="#FF6B2B" />
      <ellipse cx="19" cy="8.5" rx="1.6" ry="2.1" fill="#FF6B2B" />
      {/* main pad */}
      <path
        d="M4 12c0-3 2-5 5.5-5s7.5 2 7.5 6c0 3.5-2.5 6-7.5 6S4 15.5 4 12Z"
        fill="#FF6B2B"
      />
    </svg>
  )
}

export default PawIcon
