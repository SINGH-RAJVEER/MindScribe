import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import useAuthStore from "../store/authStore"; 

export const useLogin = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { user, access_token } = data; 
      
      setUser(user, access_token); 

      showToast(data.message || "Login successful!", "success");
      navigate("/dashboard");
    },
    onError: (err) => {
      showToast(err.message || "Login failed!", "error");
    },
  });
};
