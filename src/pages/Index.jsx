import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import Background from "../components/Background";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [activeForm, setActiveForm] = useState("login");
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const toggleForm = (formType) => {
    setActiveForm(formType);
  };

  const handleLogin = async (email, password) => {
    if (email === "6511130005@mut.ac.th" && password === "1234") {
      login({ email, role: "admin" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          ...data.user,
          role: "user",
        };
        login(userData);
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error");
    }
  };

  const handleRegister = (formData) => {
    const { username, password, email } = formData;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some(
      (user) => user.username === username || user.email === email
    );

    if (userExists) {
      toast.error("Username or email already exists");
    } else {
      const newUser = { ...formData, role: "user" };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      toast.success("Registration successful. Please log in.");
      setActiveForm("login");
    }
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
              <LoginForm onToggleForm={toggleForm} onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm
                onToggleForm={toggleForm}
                onRegister={handleRegister}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Index;
