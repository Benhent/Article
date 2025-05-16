import { useState, useEffect } from "react"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useArticleStore } from "../../../store/rootStore"
import { useAuthStore } from "../../../store/authStore"
import type { Article } from "../../../types/article"
import { Eye, Users, FileText, TrendingUp, Calendar, Search, Filter, Download, Settings, Bell } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface MonthlyView {
  month: string
  views: number
}

interface ArticleStatus {
  draft: number
  submitted: number
  under_review: number
  revision_requested: number
  accepted: number
  rejected: number
  published: number
}

interface DashboardStats {
  totalViews: number
  activeUsers: number
  totalArticles: number
  publishedArticles: number
  totalUsers: number
  articlesByStatus: ArticleStatus
}

const AdminDashboard = () => {
  const { articles, fetchArticles } = useArticleStore()
  const { users, fetchUsers } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    activeUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalUsers: 0,
    articlesByStatus: {
      draft: 0,
      submitted: 0,
      under_review: 0,
      revision_requested: 0,
      accepted: 0,
      rejected: 0,
      published: 0,
    },
  })

  // Monthly views data for chart
  const [monthlyViews, setMonthlyViews] = useState<MonthlyView[]>([])

  useEffect(() => {
    fetchArticles()
    fetchUsers()
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 50) + 10,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchArticles, fetchUsers])

  useEffect(() => {
    if (articles.length > 0) {
      const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0)
      const publishedArticles = articles.filter(article => article.status === 'published').length
      
      // Calculate articles by status
      const articlesByStatus: ArticleStatus = {
        draft: 0,
        submitted: 0,
        under_review: 0,
        revision_requested: 0,
        accepted: 0,
        rejected: 0,
        published: 0,
      }

      articles.forEach(article => {
        if (article.status in articlesByStatus) {
          articlesByStatus[article.status as keyof ArticleStatus]++
        }
      })

      // Generate monthly views data
      const monthlyData: MonthlyView[] = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
        const views = Math.floor(Math.random() * 1000) + 100 // Simulated data
        return { month, views }
      })

      setStats(prev => ({
        ...prev,
        totalViews,
        totalArticles: articles.length,
        publishedArticles,
        articlesByStatus,
        totalUsers: users.length,
      }))
      setMonthlyViews(monthlyData)
    }
  }, [articles, users])

  // Filter articles based on search term and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get top viewed articles
  const topArticles = [...filteredArticles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)

  // Get recent articles
  const recentArticles = [...filteredArticles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Prepare data for status pie chart
  const statusData = Object.entries(stats.articlesByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <h3 className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</h3>
            </div>
            <Eye className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <h3 className="text-2xl font-bold">{stats.totalArticles}</h3>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Views Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Views</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Article Status Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Article Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="revision_requested">Revision Requested</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Top Articles and Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Articles */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Viewed Articles</h2>
          <div className="space-y-4">
            {topArticles.map((article) => (
              <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.viewCount?.toLocaleString()} views
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Articles */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Articles</h2>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {article.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            New Article
          </Button>
          <Button className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            New Issue
          </Button>
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button className="w-full">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard 