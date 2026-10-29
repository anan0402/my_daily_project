import { useSelector } from 'react-redux'

import { getInitials, getMemberName } from '@/features/plans/utils/plan-helpers'
import { selectCurrentUser } from '@/lib/store/user-slice'
import './avatar-stack.css'

/**
 * Cụm avatar thành viên: tối đa `max` người, còn lại hiện "+N"
 * @param {Array} members - [{ _id, name }]
 */
function AvatarStack({ members = [], max = 3, inverse = false }) {
  const currentUser = useSelector(selectCurrentUser)
  const visibleMembers = members.slice(0, max)
  const hiddenCount = members.length - visibleMembers.length

  return (
    <div
      className={`avatar-stack ${inverse ? 'is-inverse' : ''}`}
      aria-label={`${members.length} ${members.length === 1 ? 'member' : 'members'}`}
    >
      {visibleMembers.map((member) => {
        const name = getMemberName(member, currentUser)
        return (
          <span key={member._id} className="avatar-stack-item" title={name}>
            {getInitials(name)}
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
