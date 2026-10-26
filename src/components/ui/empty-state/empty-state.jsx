import CustomButton from '@/components/ui/custom-button'
import Text from '@/components/ui/text'

/**
 * Molecule: 空状态（由文本 + 操作按钮组合而成）
 */
function EmptyState({ title, description, ctaLabel, onCtaClick }) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Text variant="h6" style={{ marginBottom: 8 }}>
        {title}
      </Text>
      <Text variant="body2" style={{ opacity: 0.8 }}>
        {description}
      </Text>
      {ctaLabel ? (
        <div style={{ marginTop: 16 }}>
          <CustomButton onClick={onCtaClick}>{ctaLabel}</CustomButton>
        </div>
      ) : null}
    </div>
  )
}

export default EmptyState

