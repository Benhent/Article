import { useState, useEffect, type FormEvent, useRef, type ChangeEvent } from "react"
import { useAuthStore } from "../../../store/authStore"
import { User, Camera, Save, RefreshCw } from "lucide-react"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { toast } from "react-hot-toast"
import { uploadAvatarToCloudinary } from "../../../config/cloudinary"

const ProfilePage = () => {
  const { user, updateProfile, isLoading, error, message } = useAuthStore()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    link: "",
    national: "",
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        link: user.link || "",
        national: user.national || "",
      })
      setAvatarPreview(user.avatarUrl || null)
      setIsPageLoading(false)
    }
  }, [user])

  // Show toast messages for errors and success
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    if (message) {
      toast.success(message)
    }
  }, [error, message])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)

      // Revoke previous object URL to avoid memory leaks
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }

      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitLoading(true)

    try {
      let avatarUrl = user?.avatarUrl || ""

      // Jika ada file avatar baru, upload ke Cloudinary
      if (avatar) {
        try {
          toast.loading("Uploading image...")
          avatarUrl = await uploadAvatarToCloudinary(avatar)
          toast.dismiss()
          toast.success("Image uploaded successfully")
        } catch (uploadError) {
          toast.dismiss()
          toast.error("Failed to upload image")
          console.error("Upload error:", uploadError)
          setIsSubmitLoading(false)
          return
        }
      }

      // Kirim data profil dengan URL avatar ke backend
      await updateProfile(formData.name, formData.username, formData.link, formData.national, avatarUrl)

      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Update profile error:", err)
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsPageLoading(true)
      toast.success("Profile refreshed")
    } catch (err) {
      console.error("Failed to refresh profile:", err)
      toast.error("Failed to refresh profile data")
    } finally {
      setIsPageLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center">Update Your Profile</h2>
          <button
            onClick={handleRefresh}
            className="text-gray-300 hover:text-white"
            disabled={isLoading || isSubmitLoading}
            title="Refresh profile data"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = user?.avatarUrl || "/placeholder.svg"
                    e.currentTarget.onerror = null // Prevent infinite loop
                  }}
                />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 cursor-pointer"
              onClick={handleAvatarClick}
              title="Change avatar"
            >
              <Camera size={16} className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
              aria-label="Upload avatar"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              name="name"
              type="text"
              placeholder={user?.name}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              name="username"
              type="text"
              placeholder={user?.username}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isSubmitLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="link">
              Website/Social Link
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="link"
              name="link"
              type="url"
              placeholder={user?.link}
              value={formData.link}
              onChange={handleChange}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="national">
              Country
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="national"
              name="national"
              type="text"
              placeholder={user?.national}
              value={formData.national}
              onChange={handleChange}
              disabled={isSubmitLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center ${isLoading || isSubmitLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              type="submit"
              disabled={isLoading || isSubmitLoading}
            >
              {isSubmitLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
