import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
// import {ProtectedRoute} from "./pages/root/rootLayout";
// import {RedirectAuthenticatedUser} from "./pages/auth/authLayout";
import AdminLayout from "./pages/Admin/adminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import RegisterPage from "./pages/auth/_authpages/RegisterPage";
import LoginPage from "./pages/auth/_authpages/LoginPage";
import ForgotPasswordPage from "./pages/auth/_authpages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/_authpages/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/_authpages/VerifyEmailPage";

import Dashboard from "./pages/root/_rootpages/Dashboard";
import Article from "./pages/root/_rootpages/Article";
import Guide from "./pages/root/_rootpages/Guide";
import Contact from "./pages/root/_rootpages/Contact";

import ProfilePage from "./pages/root/_rootpages/Profile";
import Security from "./pages/root/_rootpages/Security";
import PostArticle from "./pages/root/_rootpages/Postarticle";
import ArticleManage from "./pages/Admin/_adminpages/articleManage";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import ArticleCreate from "./pages/Admin/_adminpages/partial/article/articleCreate";
import ArticleDetail from "./pages/Admin/_adminpages/partial/article/articleDetail";
import ArticleEdit from "./pages/Admin/_adminpages/partial/article/articleEdit";
import TestFetchField from "./pages/root/_rootpages/test";
import AuthorManage from "./pages/Admin/_adminpages/authorManage";
import FieldManage from "./pages/Admin/_adminpages/fieldManage";
import IssueManage from "./pages/Admin/_adminpages/issueManage";
import AdminDashboard from "./pages/Admin/_adminpages/adminDashboard";
import ReviewManage from "./pages/Admin/_adminpages/reviewManage";
import ReviewDetail from "./pages/Admin/_adminpages/partial/review/reviewDetail";

const App: React.FC = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) return <LoadingSpinner />;

  // Danh sách các private routes
  const privateRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
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
          </Route>

          {/* auth routes */}
          <Route path='/signup' element={<div className="flex items-center justify-center min-h-screen"><RegisterPage/></div>}/>
          <Route path='/login' element={<div className="flex items-center justify-center min-h-screen"><LoginPage /></div>}/>
          <Route path='/forgot-password' element={<div className="flex items-center justify-center min-h-screen"><ForgotPasswordPage /></div>}/>
          <Route path='/reset-password/:token' element={<div className="flex items-center justify-center min-h-screen"><ResetPasswordPage /></div>}/>
          <Route path='/verify-email' element={<div className="flex items-center justify-center min-h-screen"><VerifyEmailPage /></div>} />

          {/* <Route element={<RedirectAuthenticatedUser/>}>
            <Route 
          </Route> */}
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