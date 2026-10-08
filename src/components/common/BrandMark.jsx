export default function BrandMark({
  className = "",
  animated = false,
  src,
}) {
  const logoSrc = src || `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <img
      src={logoSrc}
      alt="Nishkaiv Solution logo"
      className={`object-contain ${className}`}
      style={{ display: "block" }}
    />
  );
}

export function BrandIntro() {
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <div
      className="brand-intro"
      role="status"
      aria-live="polite"
      aria-label="Loading Nishkaiv Solution portal"
    >
      {/* Background ambient radial glow */}
      <div className="brand-intro__glow" aria-hidden="true" />

      <div className="brand-intro__content">
        {/* Outer Spinner + Inner Nishkaiv Logo */}
        <div className="brand-intro__spinner-wrapper">
          <svg
            className="brand-intro__arc-ring"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="swiggyArcGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FF7A00" />
                <stop offset="50%" stopColor="#FF4D00" />
                <stop offset="100%" stopColor="#D32F2F" />
              </linearGradient>
            </defs>

            {/* Subtle background circular track */}
            <circle
              cx="110"
              cy="110"
              r="96"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="4"
            />

            {/* Active arc */}
            <path
              d="M 110 14 A 96 96 0 0 1 206 110"
              stroke="url(#swiggyArcGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>

          {/* Nishkaiv Logo */}
          <div className="brand-intro__logo-container">
            <img
              src={logoSrc}
              alt="Nishkaiv Solution Logo"
              className="brand-intro__mark brand-intro__mark--img"
            />
          </div>
        </div>

        {/* Loading text */}
        <p className="brand-intro__text">
          Loading<span className="brand-intro__dots">...</span>
        </p>
      </div>
    </div>
  );
}