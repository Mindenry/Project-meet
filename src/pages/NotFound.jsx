import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">ไม่พบหน้าที่คุณกำลังค้นหา</p>
        <Link
          to="/dashboard"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
