import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  )
}

export const useToast = () => {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  )

  return { showToast, ToastComponent }
}

export default Toast
