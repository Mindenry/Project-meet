import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const AboutSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>DashBoard Admin Advance สำหรับจัดการข้อมูล Backend</p>
        <p>Version: 1.1.1 Beta</p>
        <p>ผู้พัฒนา: ทีมพัฒนาซอฟต์แวร์ Team Avenger EIEI</p>
        <p>ติดต่อ: support@teamgameover.com</p>
        <h3 className="text-xl font-semibold">ฟีเจอร์หลัก:</h3>
        <ul className="list-disc list-inside">
          <li>จัดการสมาชิก</li>
          <li>จัดการห้องพัก</li>
          <li>จัดการการเข้าถึง</li>
          <li>จัดการบัญชีดำ</li>
          <li>จัดการการยกเลิก</li>
          <li>รายงานและสถิติ</li>
          <li>จัดการสิทธิ์การใช้งาน</li>
        </ul>
        <p className="text-sm text-gray-600">
          © 2024 MUT Reserve. All rights reserved.
        </p>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
