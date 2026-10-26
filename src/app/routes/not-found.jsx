import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router'

import CustomButton from '@/components/ui/custom-button'
import { paths } from '@/config/paths'
import './not-found.css'

function NotFoundRoute() {
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
          to={paths.home.getHref()}
          size="large"
          variable="primary"
        >
          Go to homepage
        </CustomButton>
        <p className="not-found-card__footer">
          Need to login?{' '}
          <Link component={RouterLink} to={paths.auth.login.getHref()} underline="none">
            <span className="not-found-card__link">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default NotFoundRoute
