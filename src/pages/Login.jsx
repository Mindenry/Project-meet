import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import Background from "../components/Background";
import { useQuery } from "@tanstack/react-query";

const Login = () => {
  const [ssn, setSSN] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    data: employees,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/login");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("กำลังโหลดข้อมูลพนักงาน กรุณารอสักครู่");
      return;
    }

    if (isError) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง");
      return;
    }

    // ตรวจสอบการเข้าสู่ระบบของ admin
    if (ssn === "admin" && password === "admin123") {
      login({ username: "admin", role: "admin" });
      toast.success("เข้าสู่ระบบ Admin สำเร็จ");
      navigate("/dashboard");
      return;
    }

    // ตรวจสอบการเข้าสู่ระบบของพนักงาน
    const employee = employees.find(
      (emp) => emp.SSN === ssn && emp.PW === password
    );
    if (employee) {
      login({ username: employee.FNAME, role: "user", ssn: employee.SSN });
      toast.success("เข้าสู่ระบบสำเร็จ");
      navigate("/dashboard");
    } else {
      toast.error("รหัสผ่านหรือ SSN ไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#131640] via-[#1c2272] to-[#2029a5]">
      <Background />
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 w-96 max-w-full shadow-xl relative z-10">
        <div className="mb-8">
          <img
            src="/images/logomut.png"
            alt="MUT Reserve Logo"
            className="w-48 mx-auto"
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            เข้าสู่ระบบ MUT Reserve
          </h2>
          <input
            type="text"
            value={ssn}
            onChange={(e) => setSSN(e.target.value)}
            placeholder="SSN (หรือ admin สำหรับผู้ดูแลระบบ)"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-[#e94560] text-white font-bold rounded-md hover:bg-[#ff6b6b] transition duration-300"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
