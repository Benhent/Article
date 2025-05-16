import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const RedirectAuthenticatedUser: React.FC = () => {
    const { user } = useAuthStore();
  
    if (user && user.isVerified && user.role === 'admin') {
      return <Navigate to='/' replace />;
    }
  
    return (
      <div className="w-full h-full flex overflow-hidden">
        <Outlet />
      </div>
    );
  };