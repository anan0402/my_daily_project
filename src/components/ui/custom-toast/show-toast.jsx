import { toast } from 'react-toastify'
import CustomToast from './custom-toast'

const options = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeButton: false
}

export const showSuccessToast = (message) => {
  toast(
    <CustomToast
      title="Success"
      message={message}
      variant="success"
    />,
    options
  )
}

export const showErrorToast = (message) => {
  toast(
    <CustomToast
      title="Error"
      message={message}
      variant="error"
    />,
    options
  )
}