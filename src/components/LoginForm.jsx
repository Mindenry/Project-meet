import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onToggleForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check for admin login first
      if (email === "admin@mut.ac.th" && password === "admin123") {
        const adminData = {
          email,
          role: "admin",
          firstName: "Admin",
          lastName: "User"
        };
        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(adminData));
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          sessionStorage.setItem('user', JSON.stringify(adminData));
          sessionStorage.setItem('isAuthenticated', 'true');
        }
        
        toast.success("เข้าสู่ระบบสำเร็จ");
        navigate('/dashboard', { replace: true });
        return;
      }

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
        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
          sessionStorage.setItem('isAuthenticated', 'true');
        }

        toast.success("เข้าสู่ระบบสำเร็จ");
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        Login MUT Reserve
      </h2>
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          placeholder="Email"
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          placeholder="Password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="flex items-center justify-between text-sm text-white">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          Remember me
        </label>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-[#e94560] text-white font-bold rounded-md hover:bg-[#ff6b6b] transition duration-300 disabled:opacity-50"
      >
        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
};

export default LoginForm;