import './simple-card-layout.css'

function SimpleCardLayout({ title, description, children }) {
  return (
    <div className="simple-card-layout">
      <div className="simple-card">
        <div className="simple-card__content">
          {(title || description) && (
            <div className="simple-card__header">
              {title ? <h2 className="simple-card__title">{title}</h2> : null}
              {description ? (
                <p className="simple-card__description">{description}</p>
              ) : null}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default SimpleCardLayout
