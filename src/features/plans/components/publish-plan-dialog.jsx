import { useState } from 'react'
import Dialog from '@mui/material/Dialog'

import './plan-dialog.css'

/**
 * Xác nhận trước khi công khai plan (Publish tách riêng với Invite).
 * @param {Function} onConfirm - ({ allowDuplicate }) => void
 */
function PublishPlanDialog({ open, defaultAllowDuplicate = true, isPending, onConfirm, onClose }) {
  const [allowDuplicate, setAllowDuplicate] = useState(defaultAllowDuplicate)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="publish-plan-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <div className="plan-dialog-header">
        <div>
          <h2 id="publish-plan-title" className="plan-dialog-title">Make this plan public?</h2>
          <p className="plan-dialog-subtitle">
            Anyone with the link can view and copy this plan. Members can still edit.
          </p>
        </div>
        <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <label className="plan-dialog-checkbox">
        <input
          type="checkbox"
          checked={allowDuplicate}
          onChange={(event) => setAllowDuplicate(event.target.checked)}
        />
        Allow others to use this plan as a template
      </label>

      <button
        type="button"
        className="plan-dialog-submit"
        onClick={() => onConfirm({ allowDuplicate })}
        disabled={isPending}
      >
        {isPending ? 'Publishing…' : 'Publish'}
      </button>
    </Dialog>
  )
}

export default PublishPlanDialog
