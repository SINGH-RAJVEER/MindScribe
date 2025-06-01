import { useState } from "react"
import { Link } from "react-router-dom"
import { useRegister } from "../hooks/useRegister"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import ThemeToggle from "./ThemeToggle"

function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { mutate, isLoading } = useRegister()

  const handleRegister = (e) => {
    e.preventDefault()
    mutate({ username, email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-t-md"
              />
            </div>
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
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-b-md"
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
