import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { BarChart3, FileText, Users, Settings, LogOut, BookOpen, MessageSquare, LandPlot, UserCog, Mail, MessageCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { useAuthStore } from "../store/authStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    title: "Tổng quan",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "Bài báo",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Tác giả",
    href: "/admin/authors",
    icon: Users,
  },
  {
    title: "Số báo",
    href: "/admin/issues",
    icon: BookOpen,
  },
  {
    title:"Lĩnh vực",
    href: "/admin/fields",
    icon: LandPlot,
  },
  {
    title: "Phản biện",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Liên hệ",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    title: "Thảo luận",
    href: "/admin/discussions",
    icon: MessageCircle,
  }
]

interface AdminSidebarProps {
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
  isMobile?: boolean
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen, isMobile = false }: AdminSidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
      {/* Sidebar cho màn hình lớn */}
      {!isMobile && (
        <aside className="hidden md:flex flex-col w-64 border-r bg-background">
          <div className="p-6 border-b">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <img src="/logo-lhu.png" alt="Logo" className="h-10 w-auto mr-2" />
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={user?.name || "Admin"} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "AD"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span>{user?.name || "Admin User"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      )}

      {/* Sidebar cho màn hình nhỏ */}
      {isMobile && sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background">
          <div className="flex items-center justify-between p-6 border-b">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-6 w-6" />
              <span>Quản trị báo khoa học</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
                onClick={() => setSidebarOpen?.(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={user?.name || "Admin"} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "AD"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span>{user?.name || "Admin User"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      )}
    </>
  )
}