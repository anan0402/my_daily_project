import { Link } from 'react-router'
import PawIcon from '@/components/atoms/PawIcon'
import './AuthCardLayout.css'

function AuthCardLayout({ title, subtitle, alert, children, footerText, footerLinkText, footerLinkTo }) {
  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <div className="auth-layout__left">
        <Link to="/" className="auth-layout__logo">
          <PawIcon size={24} />
          <span className="auth-layout__logo-text auth-layout__logo-text--light">Daily days</span>
        </Link>

        <div className="auth-layout__tagline">
          <p className="auth-layout__tagline-title">
            The simplest way to stay on top of your work.
          </p>
          <p className="auth-layout__tagline-subtitle">
            No clutter. No noise. Just tasks.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-layout__right">
        {/* Mobile logo */}
        <Link to="/" className="auth-layout__logo auth-layout__logo--mobile">
          <PawIcon size={24} />
          <span className="auth-layout__logo-text">Daily days</span>
        </Link>

        <div className="auth-layout__form-container">
          <h2 className="auth-layout__title">{title}</h2>
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}

          {alert && <div className="auth-layout__alert">{alert}</div>}

          <div className="auth-layout__form">
            {children}
          </div>

          {footerText && (
            <p className="auth-layout__footer">
              {footerText}{" "}
              {footerLinkTo && (
                <Link to={footerLinkTo} className="auth-layout__footer-link">
                  {footerLinkText}
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCardLayout
