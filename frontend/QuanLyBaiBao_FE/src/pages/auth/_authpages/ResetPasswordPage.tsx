import { useState, type FormEvent } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useAuthStore } from "../../../store/authStore"
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../../../components/LoadingSpinner"
import PasswordStrengthMeter from "../../../components/PasswordStrengthMeter"

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  const { token } = useParams()
  const { resetPassword, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (confirmPassword) {
      setPasswordsMatch(e.target.value === confirmPassword)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setPasswordsMatch(password === e.target.value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordsMatch(false)
      return
    }

    if (!token) return

    const success = await resetPassword(token, password, confirmPassword)
    // if (success) {
    //   setIsSuccess(true)
    //   setTimeout(() => {
    //     navigate("/login")
    //   }, 3000)
    // }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Your Password</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******************"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && <PasswordStrengthMeter password={password} />}
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    className={`shadow appearance-none border ${!passwordsMatch ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="******************"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!passwordsMatch && <p className="text-red-500 text-xs italic">Passwords do not match.</p>}
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
                  type="submit"
                >
                  <Lock className="mr-2" size={20} />
                  Reset Password
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold text-white mt-4">Password Reset Successful</h2>
            <p className="text-gray-300 mt-2">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-green-500 hover:text-green-400 font-bold flex items-center justify-center">
            <ArrowLeft className="mr-2" size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword