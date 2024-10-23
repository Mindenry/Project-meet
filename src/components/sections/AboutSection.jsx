import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  Users,
  Home,
  Shield,
  UserX,
  XCircle,
  BarChart3,
  Lock,
} from "lucide-react";

const AboutSection = () => {
  const features = [
    { name: "จัดการสมาชิก", icon: Users },
    { name: "จัดการห้องพัก", icon: Home },
    { name: "จัดการการเข้าถึง", icon: Shield },
    { name: "จัดการบัญชีดำ", icon: UserX },
    { name: "จัดการการยกเลิก", icon: XCircle },
    { name: "รายงานและสถิติ", icon: BarChart3 },
    { name: "จัดการสิทธิ์การใช้งาน", icon: Lock },
  ];

  return (
    <Card className="max-w-4xl mx-auto overflow-hidden shadow-xl rounded-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">About System</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-600">
              DashBoard Admin Advance
            </h2>
            <p className="text-gray-600">สำหรับจัดการข้อมูล Backend</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Version:</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  1.2.1 Beta Early Access
                </Badge>
              </div>
              <Progress value={70} className="h-2 bg-blue-100" />
            </div>
            <p className="text-sm text-gray-500">
              ผู้พัฒนา: ทีมพัฒนาซอฟต์แวร์ Team Avenger EIEI
            </p>
            <p className="text-sm text-gray-500">
              ติดต่อ: support@teamgameover.com
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">
              ฟีเจอร์หลัก
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-md"
                >
                  <feature.icon className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm text-gray-700">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">
          © 2024 MUT Reserve. All rights reserved.
        </p>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
