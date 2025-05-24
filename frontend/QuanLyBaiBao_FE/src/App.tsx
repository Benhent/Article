import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
// components
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
// import {ProtectedRoute} from "./pages/root/rootLayout";
// import {RedirectAuthenticatedUser} from "./pages/auth/authLayout";
import AdminLayout from "./pages/Admin/adminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
// auth pages
import RegisterPage from "./pages/auth/_authpages/RegisterPage";
import LoginPage from "./pages/auth/_authpages/LoginPage";
import ForgotPasswordPage from "./pages/auth/_authpages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/_authpages/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/_authpages/VerifyEmailPage";
// dropdown pages
import ProfilePage from "./pages/root/_rootpages/Profile";
import Security from "./pages/root/_rootpages/Security";
import Review from "./pages/root/_rootpages/Review";
// user interface pages
import Dashboard from "./pages/root/_rootpages/Dashboard";
import Article from "./pages/root/_rootpages/Article";
import PostArticle from "./pages/root/_rootpages/Postarticle";
import Guide from "./pages/root/_rootpages/Guide";
import Contact from "./pages/root/_rootpages/Contact";

import TestFetchField from "./pages/root/_rootpages/test";

// partial pages
import ArticleCreate from "./pages/partial/article/articleCreate";
import ArticleDetail from "./pages/partial/article/articleDetail";
import ArticleEdit from "./pages/partial/article/articleEdit";
import ReviewDetail from "./pages/partial/review/reviewDetail";
import ReviewJudge from "./pages/partial/review/reviewJudge";

// admin pages
import AdminDashboard from "./pages/Admin/_adminpages/adminDashboard";
import ArticleManage from "./pages/Admin/_adminpages/articleManage";
import AuthorManage from "./pages/Admin/_adminpages/authorManage";
import FieldManage from "./pages/Admin/_adminpages/fieldManage";
import IssueManage from "./pages/Admin/_adminpages/issueManage";
import ReviewManage from "./pages/Admin/_adminpages/reviewManage";
import UserManage from "./pages/Admin/_adminpages/userManage";
import ContactManage from "./pages/Admin/_adminpages/contactManage";
import DiscussionManage from "./pages/Admin/_adminpages/discussionManage";

const App: React.FC = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) return <LoadingSpinner />;

  // Danh sách các private routes
  const privateRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
  const isPrivateRoute = privateRoutes.some(route => location.pathname.startsWith(route));
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isPrivateRoute && !isAdminRoute && <NavBar />}
      <main className={`flex-1 ${!isPrivateRoute && !isAdminRoute ? 'pt-16' : ''}`}>
        <Routes>

          <Route path='/test' element={<TestFetchField />} />

          {/* public routes */}
          <Route path='/' element={<Dashboard />}/>
          <Route path='/article' element={<Article />}/>
          
          <Route path='/guide' element={<Guide />}/>
          <Route path='/contact' element={<Contact />}/>
          <Route path='/security' element={<Security />}/>
          <Route path='/profile' element={<ProfilePage />}/>
          <Route path='/post-article' element={<PostArticle />}/>
          <Route path='/my-reviews' element={<Review />}/>
          <Route path='/my-reviews/:id' element={<ReviewJudge />}/>
          <Route path='/post-article/create' element={<ArticleCreate />}/>
          <Route path='/post-article/:id' element={<ArticleDetail />}/>
          <Route path='/post-article/:id/edit' element={<ArticleEdit />}/>
          
          {/* admin routes */}
          <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path='/admin/dashboard' element={<AdminDashboard />}/>
            <Route path='/admin/articles' element={<ArticleManage />}/>
            <Route path='/admin/articles/create' element={<ArticleCreate />}/>
            <Route path='/admin/articles/:id' element={<ArticleDetail />}/>
            <Route path='/admin/articles/:id/edit' element={<ArticleEdit />}/>
            <Route path='/admin/authors' element={<AuthorManage />}/>
            <Route path='/admin/issues' element={<IssueManage />}/>
            <Route path='/admin/fields' element={<FieldManage />}/>
            <Route path='/admin/reviews' element={<ReviewManage />}/>
            <Route path='/admin/reviews/:id' element={<ReviewDetail />}/>
            <Route path='/admin/users' element={<UserManage />}/>
            <Route path='/admin/contact' element={<ContactManage />}/>
            <Route path='/admin/discussions' element={<DiscussionManage />}/>
          </Route>

          {/* auth routes */}
          <Route path='/signup' element={<div className="flex items-center justify-center min-h-screen"><RegisterPage/></div>}/>
          <Route path='/login' element={<div className="flex items-center justify-center min-h-screen"><LoginPage /></div>}/>
          <Route path='/forgot-password' element={<div className="flex items-center justify-center min-h-screen"><ForgotPasswordPage /></div>}/>
          <Route path='/reset-password/:token' element={<div className="flex items-center justify-center min-h-screen"><ResetPasswordPage /></div>}/>
          <Route path='/verify-email' element={<div className="flex items-center justify-center min-h-screen"><VerifyEmailPage /></div>} />

          {/* catch all routes */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
      {!isPrivateRoute && !isAdminRoute && <Footer />}
      <Toaster />
    </div>
  );
}

export default App;