import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Home,
  BookOpen,
  MessageSquare,
  Settings,
  FileText,
  Search,
  HelpCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef<HTMLDivElement>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const isAdmin = user?.role === "admin"
  const isEditor = user?.role === "editor"
  const isReviewer = user?.role === "reviewer"
  const isAuthor = user?.role === "author" || true // Default to showing author options if no role specified

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-primary/20 text-primary" : ""
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-background"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/logo-lhu.png" alt="Logo" className="h-10 w-auto mr-2" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 ${isActive("/")}`}
            >
              Trang chủ
            </Link>
            <Link
              to="/article"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 ${isActive("/article")}`}
            >
              Ấn phẩm
            </Link>
            <Link
              to="/post-article"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 ${isActive("/guidelines")}`}
            >
              Gửi bài
            </Link>
            <Link
              to="/guide"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 ${isActive("/guide")}`}
            >
              Hướng dẫn
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 ${isActive("/contact")}`}
            >
              Liên hệ
            </Link>
            <button
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150 flex items-center"
              onClick={() => navigate("/search")}
            >
              Tìm kiếm
            </button>
          </div>

          {/* Desktop Authentication Controls */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-primary" />
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name || user?.username}</span>
                  <ChevronDown size={16} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg py-1 z-10 border"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="px-4 py-2 text-sm hover:bg-primary/10 transition duration-150 flex items-center"
                      >
                        <User size={16} className="mr-2" />
                        Thông tin tài khoản
                      </Link>

                      {(isAdmin || isEditor || isReviewer) && (
                        <Link
                          to="/admin/articles"
                          className="px-4 py-2 text-sm hover:bg-primary/10 transition duration-150 flex items-center"
                        >
                          <Settings size={16} className="mr-2" />
                          Quản lý
                        </Link>
                      )}

                      {isAuthor && (
                        <Link
                          to="/my-articles"
                          className="px-4 py-2 text-sm hover:bg-primary/10 transition duration-150 flex items-center"
                        >
                          <FileText size={16} className="mr-2" />
                          Bài báo của tôi
                        </Link>
                      )}

                      <div className="border-t mt-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition duration-150 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition duration-150"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition duration-150"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 top-16 z-40 bg-background border-t overflow-y-auto"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center ${isActive("/")}`}
                onClick={closeMenu}
              >
                <Home size={18} className="mr-2" />
                Trang chủ
              </Link>
              <Link
                to="/publications"
                className={`px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center ${isActive("/publications")}`}
                onClick={closeMenu}
              >
                <BookOpen size={18} className="mr-2" />
                Ấn phẩm
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center ${isActive("/contact")}`}
                onClick={closeMenu}
              >
                <MessageSquare size={18} className="mr-2" />
                Liên hệ
              </Link>
              <Link
                to="/guidelines"
                className={`px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center ${isActive("/guidelines")}`}
                onClick={closeMenu}
              >
                <HelpCircle size={18} className="mr-2" />
                Hướng dẫn
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center ${isActive("/search")}`}
                onClick={closeMenu}
              >
                <Search size={18} className="mr-2" />
                Tìm kiếm
              </Link>
            </div>

            {/* Mobile Authentication Controls */}
            <div className="pt-4 pb-3 border-t">
              {isAuthenticated ? (
                <div className="px-2 space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{user?.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center"
                    onClick={closeMenu}
                  >
                    <User size={18} className="mr-2" />
                    Thông tin tài khoản
                  </Link>
                  {(isAdmin || isEditor || isReviewer) && (
                    <Link
                      to="/manage"
                      className="px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center"
                      onClick={closeMenu}
                    >
                      <Settings size={18} className="mr-2" />
                      Quản lý
                    </Link>
                  )}
                  {isAuthor && (
                    <Link
                      to="/my-articles"
                      className="px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150 flex items-center"
                      onClick={closeMenu}
                    >
                      <FileText size={18} className="mr-2" />
                      Bài báo của tôi
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      closeMenu()
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition duration-150 flex items-center"
                  >
                    <LogOut size={18} className="mr-2" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="px-2 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 transition duration-150"
                    onClick={closeMenu}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition duration-150 text-center"
                    onClick={closeMenu}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default NavBar