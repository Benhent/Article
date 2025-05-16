import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const ProtectedRoute: React.FC = () => {
    const { user } = useAuthStore();
  
    if (!user) {
      return <Navigate to='/login' replace />;
    }
  
    if (!user.isVerified) {
      return <Navigate to='/verify-email' replace />;
    }
  
    return (
      <div className="w-full h-full flex overflow-hidden">
        <Outlet />
      </div>
    );
  };