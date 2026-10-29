import { getInitials, getPersonName } from '@/features/plans/utils/plan-helpers'
import { getAvatarSrc } from '@/utils/get-avatar-src'
import './avatar-stack.css'

/**
 * Cụm avatar: tối đa `max` người, còn lại hiện "+N"
 * @param {Array} people - [{ _id, displayName, avatar }]
 * @param {'small'|'medium'} [size]
 */
function AvatarStack({ people = [], max = 3, inverse = false, size = 'medium' }) {
  const visiblePeople = people.slice(0, max)
  const hiddenCount = people.length - visiblePeople.length

  return (
    <div
      className={`avatar-stack avatar-stack--${size} ${inverse ? 'is-inverse' : ''}`}
      aria-label={`${people.length} ${people.length === 1 ? 'person' : 'people'}`}
    >
      {visiblePeople.map((person) => {
        const name = getPersonName(person)
        const avatarSrc = person.avatar ? getAvatarSrc(person.avatar) : null
        return (
          <span key={person._id} className="avatar-stack-item" title={name}>
            {avatarSrc
              ? <img src={avatarSrc} alt="" referrerPolicy="no-referrer" />
              : getInitials(name)}
          </span>
        )
      })}
      {hiddenCount > 0 && (
        <span className="avatar-stack-item avatar-stack-more">+{hiddenCount}</span>
      )}
    </div>
  )
}

export default AvatarStack
