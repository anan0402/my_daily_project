import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { yupResolver } from '@hookform/resolvers/yup'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import { invitePlanMemberInputSchema, useInvitePlanMember } from '@/features/plans/api/invite-plan-member'
import { useRemovePlanMember } from '@/features/plans/api/remove-plan-member'
import { ROLE_LABELS, getInitials, getMemberName } from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './invite-plan-dialog.css'

const DEFAULT_VALUES = { email: '', role: 'editor' }

/**
 * Owner mời thành viên bằng email hoặc copy link mời, chọn Can edit / Can view.
 */
function InvitePlanDialog({ plan, open, onClose }) {
  const currentUser = useSelector(selectCurrentUser)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(invitePlanMemberInputSchema),
    defaultValues: DEFAULT_VALUES
  })

  const inviteMutation = useInvitePlanMember({
    mutationConfig: {
      onSuccess: (_plan, { email }) => {
        toast.success(`Invited ${email}`)
        reset(DEFAULT_VALUES)
      },
      onError: (error) => toast.error(getErrorMessage(error))
    }
  })
  const removeMemberMutation = useRemovePlanMember({
    mutationConfig: { onError: (error) => toast.error(getErrorMessage(error)) }
  })

  const onSubmit = ({ email, role }) => {
    inviteMutation.mutate({ planId: plan._id, email, role })
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}${paths.app.plan.getHref(plan._id)}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Invitation link copied')
    } catch {
      // Clipboard API cần HTTPS hoặc localhost (vite --host qua IP LAN sẽ lỗi)
      toast.error(`Could not copy. Share this link: ${link}`)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="invite-plan-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <div className="plan-dialog-header">
        <div>
          <h2 id="invite-plan-title" className="plan-dialog-title">Invite to plan</h2>
          <p className="plan-dialog-subtitle">
            People you invite don&apos;t need to be your friends. They join with a link.
          </p>
        </div>
        <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="invite-plan-form">
        <div className="plan-dialog-field invite-plan-email">
          <label htmlFor="invite-email" className="plan-dialog-label">Email</label>
          <input
            id="invite-email"
            type="email"
            autoFocus
            autoComplete="off"
            placeholder="name@example.com"
            className="plan-dialog-input"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="plan-dialog-error">{errors.email.message}</p>}
        </div>
        <div className="plan-dialog-field">
          <label htmlFor="invite-role" className="plan-dialog-label">Access</label>
          <select id="invite-role" className="plan-dialog-input invite-plan-select" {...register('role')}>
            <option value="editor">{ROLE_LABELS.editor}</option>
            <option value="viewer">{ROLE_LABELS.viewer}</option>
          </select>
        </div>
        <button type="submit" className="plan-dialog-submit invite-plan-submit" disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? 'Inviting…' : 'Invite'}
        </button>
      </form>

      <button type="button" className="invite-plan-copy" onClick={handleCopyLink}>
        Copy invitation link
      </button>

      <p className="plan-dialog-label invite-plan-members-label">
        {plan.members.length} {plan.members.length === 1 ? 'member' : 'members'}
      </p>
      <ul className="invite-plan-members">
        {plan.members.map((member) => {
          const name = getMemberName(member, currentUser)
          return (
            <li key={member._id} className="invite-plan-member">
              <span className="invite-plan-member-avatar" aria-hidden="true">{getInitials(name)}</span>
              <span className="invite-plan-member-info">
                <span className="invite-plan-member-name">{name}</span>
                {member.email && <span className="invite-plan-member-email">{member.email}</span>}
              </span>
              <span className="invite-plan-member-role">{ROLE_LABELS[member.role]}</span>
              {member.role !== 'owner' && (
                <button
                  type="button"
                  className="invite-plan-member-remove"
                  onClick={() => removeMemberMutation.mutate({ planId: plan._id, memberId: member._id })}
                  disabled={removeMemberMutation.isPending}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Dialog>
  )
}

export default InvitePlanDialog
