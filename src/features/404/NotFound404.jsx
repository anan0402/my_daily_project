import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router'

import CustomButton from '@/components/atoms/CustomButton/CustomButton'
import './NotFound404.css'

function NotFound404() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-card__code">404</p>
        <p className="not-found-card__title">Page not found</p>
        <p className="not-found-card__description">
          The page you are looking for does not exist or has been moved.
        </p>
        <CustomButton
          component={RouterLink}
          to="/"
          size="large"
          variable="primary"
        >
          Go to homepage
        </CustomButton>
        <p className="not-found-card__footer">
          Need to login?{' '}
          <Link component={RouterLink} to="/login" underline="none">
            <span className="not-found-card__link">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default NotFound404
