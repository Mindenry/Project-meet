import React from "react";
import { Navigate } from "react-router-dom";
import Background from "../components/Background";
import LoginForm from "../components/LoginForm";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const [activeForm, setActiveForm] = React.useState("login");
  const { isAuthenticated } = useAuth();

  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleForm = (formType) => {
    setActiveForm(formType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#131640] via-[#1c2272] to-[#2029a5]">
      <Background />
      <motion.div
        className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 w-96 max-w-full shadow-xl relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <img
            src="/images/logomut.png"
            alt="MUT Reserve Logo"
            className="w-48 mx-auto"
          />
        </div>
        <AnimatePresence mode="wait">
          {activeForm === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm onToggleForm={toggleForm} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm onToggleForm={toggleForm} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Index;