import { useState } from "react"
import { Link } from "react-router-dom"
import { useLogin } from "../hooks/useLogin"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import ThemeToggle from "./ThemeToggle"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { mutate, isLoading } = useLogin()

  const handleLogin = (e) => {
    e.preventDefault()
    mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md"
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/register" className="font-medium text-primary hover:text-primary/80">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login

