import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AccessModal from "../modals/AccessModal";
import { useAccessRecords } from "../../hooks/useAccessRecords";

const AccessSection = () => {
  const { accessRecords, addAccess, updateAccess, deleteAccess } =
    useAccessRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleAddAccess = () => {
    setEditingAccess(null);
    setIsModalOpen(true);
  };

  const handleEditAccess = (access) => {
    setEditingAccess(access);
    setIsModalOpen(true);
  };

  const handleDeleteAccess = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบบันทึกการเข้าถึงนี้?")) {
      deleteAccess(id);
      addNotification("ลบบันทึกการเข้าถึงเรียบร้อยแล้ว");
    }
  };

  const handleSaveAccess = (accessData) => {
    if (editingAccess) {
      updateAccess(accessData);
      addNotification("อัปเดตบันทึกการเข้าถึงเรียบร้อยแล้ว");
    } else {
      addAccess(accessData);
      addNotification("เพิ่มบันทึกการเข้าถึงเรียบร้อยแล้ว");
    }
    setIsModalOpen(false);
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    toast.success(message);
  };

  const filteredRecords = accessRecords.filter((record) =>
    Object.values(record).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          จัดการการเข้าถึงห้อง
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddAccess} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มการเข้าถึง
          </Button>
          <div className="relative">
            <Bell
              className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setNotifications([])}
            />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาการเข้าถึง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>หมายเลขห้อง</TableHead>
              <TableHead>วันที่เริ่มต้น</TableHead>
              <TableHead>วันที่สิ้นสุด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.username}</TableCell>
                <TableCell>{record.roomNumber}</TableCell>
                <TableCell>{record.startDate}</TableCell>
                <TableCell>{record.endDate}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditAccess(record)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    แก้ไข
                  </Button>
                  <Button
                    onClick={() => handleDeleteAccess(record.id)}
                    variant="destructive"
                    size="sm"
                  >
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccess}
        access={editingAccess}
      />
    </Card>
  );
};

export default AccessSection;
