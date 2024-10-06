import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({ onToggleForm, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password, rememberMe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        Login MUT Reserve
      </h2>
      <div className="relative">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          placeholder="Username"
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
        <button
          type="button"
          onClick={() => onToggleForm("register")}
          className="text-[#e94560] hover:underline"
        >
          Register here
        </button>
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-[#e94560] text-white font-bold rounded-md hover:bg-[#ff6b6b] transition duration-300"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
