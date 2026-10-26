import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CustomButton from '@/components/ui/custom-button'
import './confirm-dialog.css'

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) {
  return (
    <Dialog open={open} onClose={onCancel} className="confirm-dialog">
      <DialogTitle className="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent className="confirm-dialog-content">
        <p>{message}</p>
      </DialogContent>
      <DialogActions className="confirm-dialog-actions">
        <CustomButton variable="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </CustomButton>
        <CustomButton onClick={onConfirm} disabled={isLoading}>
          {confirmText}
        </CustomButton>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
