import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import { useAuthStore } from "../../../store/authStore";
import { IconType } from "react-icons";

const LoginPage = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { login, isLoading, error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-auto"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-sixth to-fifth text-transparent bg-clip-text">
                    Sign In
                </h2>

                <form onSubmit={handleLogin}>
                    <Input
                        icon={Mail as IconType}
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        icon={Lock as IconType}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="flex items-center mb-6">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-fifth hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-fourth to-third text-white font-bold rounded-lg shadow-lg hover:from-third hover:to-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            "Login"
                        )}
                    </motion.button>
                </form>
            </div>
            <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-fifth hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;