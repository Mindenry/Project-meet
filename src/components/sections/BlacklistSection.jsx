import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Bell, Edit, Trash2 } from "lucide-react";
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
import BlacklistModal from "../modals/BlacklistModal";
import { useBlacklist } from "../../hooks/useBlacklist";

const BlacklistSection = () => {
  const { blacklist, addBlacklist, updateBlacklist, deleteBlacklist } =
    useBlacklist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlacklist, setEditingBlacklist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleAddBlacklist = () => {
    setEditingBlacklist(null);
    setIsModalOpen(true);
  };

  const handleEditBlacklist = (blacklistItem) => {
    setEditingBlacklist(blacklistItem);
    setIsModalOpen(true);
  };

  const handleDeleteBlacklist = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้ออกจากบัญชีดำ?")) {
      deleteBlacklist(id);
      addNotification("ลบผู้ใช้ออกจากบัญชีดำเรียบร้อยแล้ว");
    }
  };

  const handleSaveBlacklist = (blacklistData) => {
    if (editingBlacklist) {
      updateBlacklist(blacklistData);
      addNotification("อัปเดตรายการบัญชีดำเรียบร้อยแล้ว");
    } else {
      addBlacklist(blacklistData);
      addNotification("เพิ่มผู้ใช้ลงในบัญชีดำเรียบร้อยแล้ว");
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

  const filteredBlacklist = blacklist.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">จัดการบัญชีดำ</CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddBlacklist} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มบัญชีดำ
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
            placeholder="ค้นหาบัญชีดำ..."
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
              <TableHead>เหตุผล</TableHead>
              <TableHead>วันที่เพิ่ม</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlacklist.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.dateAdded}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditBlacklist(item)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    <Edit className="h-4 w-4 mr-1" /> แก้ไข
                  </Button>
                  <Button
                    onClick={() => handleDeleteBlacklist(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <BlacklistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlacklist}
        blacklistItem={editingBlacklist}
      />
    </Card>
  );
};

export default BlacklistSection;
