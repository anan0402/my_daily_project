import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useAddPlanMembers } from '@/features/plans/api/add-plan-members'
import { useCreateInviteLink } from '@/features/plans/api/create-invite-link'
import { useInviteCandidates } from '@/features/plans/api/get-invite-candidates'
import { useRemovePlanMember } from '@/features/plans/api/remove-plan-member'
import { useRevokeInviteLink } from '@/features/plans/api/revoke-invite-link'
import { useUpdatePlanMember } from '@/features/plans/api/update-plan-member'
import { ROLE_LABELS, getInitials, getPersonName } from '@/features/plans/utils/plan-helpers'
import { useDebounce } from '@/hooks/use-debounce'
import { getAvatarSrc } from '@/utils/get-avatar-src'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './invite-plan-dialog.css'

const showError = (error) => toast.error(getErrorMessage(error))

function PersonAvatar({ person }) {
  const name = getPersonName(person)
  return (
    <span className="invite-plan-avatar" aria-hidden="true">
      {person.avatar
        ? <img src={getAvatarSrc(person.avatar)} alt="" referrerPolicy="no-referrer" />
        : getInitials(name)}
    </span>
  )
}

function RoleSelect({ id, value, onChange, disabled, label }) {
  return (
    <select
      id={id}
      className="invite-plan-role"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={label}
    >
      <option value="editor">{ROLE_LABELS.editor}</option>
      <option value="viewer">{ROLE_LABELS.viewer}</option>
    </select>
  )
}

/**
 * Chỉ owner: tìm và thêm người (bạn bè lên đầu, không bắt buộc kết bạn),
 * link mời, đổi quyền / gỡ thành viên.
 */
function InvitePlanDialog({ plan, open, onClose }) {
  const [search, setSearch] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [linkRole, setLinkRole] = useState(plan.inviteLink?.role || 'viewer')
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const debouncedSearch = useDebounce(search.trim(), 300)

  const { data: candidates = [], isFetching: isSearching } = useInviteCandidates({
    planId: plan._id,
    q: debouncedSearch,
    queryConfig: { enabled: open && (debouncedSearch.length === 0 || debouncedSearch.length >= 2) }
  })
  const friends = candidates.filter((person) => person.isFriend)
  const others = candidates.filter((person) => !person.isFriend)

  const addMembersMutation = useAddPlanMembers({
    mutationConfig: {
      onSuccess: (_plan, { userIds }) => {
        const person = candidates.find((item) => item._id === userIds[0])
        toast.success(`Added ${getPersonName(person)}`)
      },
      onError: showError
    }
  })
  const updateMemberMutation = useUpdatePlanMember({ mutationConfig: { onError: showError } })
  const removeMemberMutation = useRemovePlanMember({ mutationConfig: { onError: showError } })
  const createLinkMutation = useCreateInviteLink({
    mutationConfig: {
      onSuccess: () => setIsResetConfirmOpen(false),
      onError: showError
    }
  })
  const revokeLinkMutation = useRevokeInviteLink({
    mutationConfig: {
      onSuccess: () => toast.success('Invitation link revoked'),
      onError: showError
    }
  })

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(plan.inviteLink.url)
      toast.success('Link copied')
    } catch {
      // Clipboard API cần HTTPS hoặc localhost (vite --host qua IP LAN sẽ lỗi)
      toast.error('Could not copy. Select the link and copy it manually.')
    }
  }

  const renderCandidate = (person) => (
    <li key={person._id} className="invite-plan-person">
      <PersonAvatar person={person} />
      <span className="invite-plan-person-info">
        <span className="invite-plan-person-name">{getPersonName(person)}</span>
        {person.username && <span className="invite-plan-person-sub">@{person.username}</span>}
      </span>
      <button
        type="button"
        className="invite-plan-add"
        onClick={() => addMembersMutation.mutate({ planId: plan._id, userIds: [person._id], role: inviteRole })}
        disabled={addMembersMutation.isPending}
      >
        Add
      </button>
    </li>
  )

  const owner = plan.owner

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="invite-plan-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper invite-plan-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <div className="plan-dialog-header">
        <div>
          <h2 id="invite-plan-title" className="plan-dialog-title">Invite to “{plan.title}”</h2>
          <p className="plan-dialog-subtitle">People don&apos;t need to be your friends to join.</p>
        </div>
        <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {/* Tìm người */}
      <div className="invite-plan-search">
        <input
          type="search"
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email…"
          aria-label="Search people"
          className="plan-dialog-input"
        />
        <RoleSelect value={inviteRole} onChange={setInviteRole} label="Access for people you add" />
      </div>

      <div className="invite-plan-results" aria-busy={isSearching}>
        {search.trim().length === 1 && <p className="plan-dialog-hint">Type at least 2 characters.</p>}
        {friends.length > 0 && (
          <>
            <p className="invite-plan-group">Friends</p>
            <ul className="invite-plan-list">{friends.map(renderCandidate)}</ul>
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="invite-plan-group">Others</p>
            <ul className="invite-plan-list">{others.map(renderCandidate)}</ul>
          </>
        )}
        {!isSearching && candidates.length === 0 && search.trim().length !== 1 && (
          <p className="plan-dialog-hint">
            {debouncedSearch ? `No one found for "${debouncedSearch}".` : 'Search for people by name or email.'}
          </p>
        )}
      </div>

      {/* Link mời */}
      <section className="invite-plan-section" aria-labelledby="invite-link-title">
        <div className="invite-plan-section-header">
          <h3 id="invite-link-title" className="plan-dialog-label">Invitation link</h3>
          <RoleSelect
            value={plan.inviteLink?.role || linkRole}
            onChange={(role) => {
              setLinkRole(role)
              // Đổi quyền của link = tạo link mới với quyền đó
              if (plan.inviteLink) createLinkMutation.mutate({ planId: plan._id, role })
            }}
            disabled={createLinkMutation.isPending}
            label="Access for people who join with the link"
          />
        </div>
        {plan.inviteLink ? (
          <>
            <input
              readOnly
              value={plan.inviteLink.url}
              className="plan-dialog-input invite-plan-link"
              aria-label="Invitation link"
              onFocus={(event) => event.target.select()}
            />
            <div className="invite-plan-link-actions">
              <button type="button" className="invite-plan-text-button" onClick={handleCopyLink}>Copy</button>
              <button type="button" className="invite-plan-text-button" onClick={() => setIsResetConfirmOpen(true)}>Reset</button>
              <button
                type="button"
                className="invite-plan-text-button is-danger"
                onClick={() => revokeLinkMutation.mutate(plan._id)}
                disabled={revokeLinkMutation.isPending}
              >
                Revoke
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="invite-plan-text-button"
            onClick={() => createLinkMutation.mutate({ planId: plan._id, role: linkRole })}
            disabled={createLinkMutation.isPending}
          >
            {createLinkMutation.isPending ? 'Creating…' : '+ Create link'}
          </button>
        )}
      </section>

      {/* Người có quyền */}
      <section className="invite-plan-section" aria-labelledby="invite-people-title">
        <h3 id="invite-people-title" className="plan-dialog-label">People with access</h3>
        <ul className="invite-plan-list">
          {owner && (
            <li className="invite-plan-person">
              <PersonAvatar person={owner} />
              <span className="invite-plan-person-info">
                <span className="invite-plan-person-name">{getPersonName(owner)}</span>
              </span>
              <span className="invite-plan-person-sub">Owner</span>
            </li>
          )}
          {plan.members.map((member) => (
            <li key={member._id} className="invite-plan-person">
              <PersonAvatar person={member} />
              <span className="invite-plan-person-info">
                <span className="invite-plan-person-name">{getPersonName(member)}</span>
                {member.username && <span className="invite-plan-person-sub">@{member.username}</span>}
              </span>
              <RoleSelect
                value={member.role}
                onChange={(role) => updateMemberMutation.mutate({ planId: plan._id, userId: member._id, role })}
                disabled={updateMemberMutation.isPending}
                label={`Access for ${getPersonName(member)}`}
              />
              <button
                type="button"
                className="invite-plan-remove"
                onClick={() => removeMemberMutation.mutate({ planId: plan._id, userId: member._id })}
                disabled={removeMemberMutation.isPending}
                aria-label={`Remove ${getPersonName(member)}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        open={isResetConfirmOpen}
        title="Reset invitation link?"
        message="The old link will stop working."
        confirmText="Reset link"
        isLoading={createLinkMutation.isPending}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={() => createLinkMutation.mutate({ planId: plan._id, role: plan.inviteLink?.role || linkRole })}
      />
    </Dialog>
  )
}

export default InvitePlanDialog
