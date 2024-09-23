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
import PermissionModal from "../modals/PermissionModal";
import { usePermissions } from "../../hooks/usePermissions";

const PermissionsSection = () => {
  const { permissions, addPermission, updatePermission, deletePermission } =
    usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleDeletePermission = (role) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบสิทธิ์นี้?")) {
      deletePermission(role);
      addNotification("ลบสิทธิ์เรียบร้อยแล้ว");
    }
  };

  const handleSavePermission = (permissionData) => {
    if (editingPermission) {
      updatePermission(permissionData);
      addNotification("อัปเดตสิทธิ์เรียบร้อยแล้ว");
    } else {
      addPermission(permissionData);
      addNotification("เพิ่มสิทธิ์เรียบร้อยแล้ว");
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

  const filteredPermissions = permissions.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          จัดการสิทธิ์การใช้งาน
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddPermission} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มบทบาท
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
            placeholder="ค้นหาสิทธิ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>บทบาท</TableHead>
              <TableHead>สิทธิ์การเข้าถึง</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((item) => (
              <TableRow key={item.role}>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.access.join(", ")}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditPermission(item)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    <Edit className="h-4 w-4 mr-1" /> แก้ไข
                  </Button>
                  <Button
                    onClick={() => handleDeletePermission(item.role)}
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
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePermission}
        permission={editingPermission}
      />
    </Card>
  );
};

export default PermissionsSection;
