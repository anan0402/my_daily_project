const VARIANT_STYLES = {
  heading: {
    fontFamily: 'var(--font-mono)',
    fontSize: '3rem',
    fontWeight: 600,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  subheading: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  body: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 500,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    fontWeight: 400,
  },
}

function Text({
  variant = 'body',
  as,
  style,
  children,
  ...props
}) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.body

  const defaultTags = {
    heading: 'h1',
    subheading: 'h2',
    body: 'p',
    caption: 'span',
    label: 'label',
    mono: 'span',
  }

  const Component = as || defaultTags[variant] || 'span'

  const combinedStyle = {
    ...variantStyle,
    margin: 0,
    ...style,
  }

  return (
    <Component style={combinedStyle} {...props}>
      {children}
    </Component>
  )
}

export default Text
