import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export const showToast = (message, type = "info") => {
  switch (type) {
    case "success":
      toast.success(message)
      break
    case "error":
      toast.error(message)
      break
    case "warning":
      toast.warn(message)
      break
    default:
      toast.info(message)
  }
}

const Toast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  )
}

export default Toast

