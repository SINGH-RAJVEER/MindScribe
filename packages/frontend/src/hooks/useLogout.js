import { useNavigate } from 'react-router-dom'

import { useMutation } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import { showToast } from '../components/Toast'

export const useLogout = () => {
  const { logout } = useAuthStore()

  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      logout()
      showToast("Logout Successfully", "success")
      navigate('/login')
    },
    onError: (error) => {
        console.log(error)
      const errorMessage = error?.response?.data?.detail || 'Logout failed. Please try again.'
      showToast(errorMessage,"error")
    },
  })
}