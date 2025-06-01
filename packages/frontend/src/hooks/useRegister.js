import { useMutation } from "@tanstack/react-query"
import { registerUser } from "../api/authApi"
import { useNavigate } from "react-router-dom"
import { showToast } from "../components/Toast"

export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      showToast(data.message, "success")
      navigate("/login")
    },
    onError: (err) => {
        showToast(err.message || "Registration failed!", "error")
      },
  })
}
