import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PermissionModal from "../modals/PermissionModal";
import axios from "axios";

const API_URL = "http://localhost:8080";

const PermissionsSection = () => {
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePositions, setAvailablePositions] = useState([]);
  const [availableAccessOptions, setAvailableAccessOptions] = useState([]);

  useEffect(() => {
    fetchPermissions();
    fetchPositions();
    fetchAccessOptions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/accessmenus`);
      const groupedPermissions = groupPermissionsByRole(response.data);
      setPermissions(groupedPermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสิทธิ์");
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_URL}/positions`);
      setAvailablePositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง");
    }
  };

  const fetchAccessOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/menus`);
      setAvailableAccessOptions(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู");
    }
  };

  const groupPermissionsByRole = (permissions) => {
    return permissions.reduce((acc, current) => {
      const { NO, PNUMBER, PNAME, MNUMBER, MNAME } = current;
      const existingRole = acc.find((item) => item.PNUMBER === PNUMBER);

      if (existingRole) {
        existingRole.access.push({ MNUMBER, MNAME });
      } else {
        acc.push({
          NO,
          PNUMBER,
          PNAME,
          access: [{ MNUMBER, MNAME }],
        });
      }
      return acc;
    }, []);
  };

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleDeletePermission = async (permission) => {
    try {
      await axios.delete(`${API_URL}/accessmenus/${permission.NO}`);
      toast.success("ลบสิทธิ์สำเร็จ");
      fetchPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("เกิดข้อผิดพลาดในการลบสิทธิ์");
    }
  };

  const handleSavePermission = async (permissionData) => {
    try {
      const { PNUMBER, access } = permissionData;

      if (editingPermission) {
        // Update existing permissions
        const existingAccess = editingPermission.access.map(a => a.MNUMBER);
        const toAdd = access.filter(a => !existingAccess.includes(a));
        const toRemove = existingAccess.filter(a => !access.includes(a));

        for (const MNUM of toAdd) {
          await axios.post(`${API_URL}/accessmenus`, { PNUM: PNUMBER, MNUM });
        }

        for (const MNUM of toRemove) {
          const accessToRemove = editingPermission.access.find(a => a.MNUMBER === MNUM);
          if (accessToRemove) {
            await axios.delete(`${API_URL}/accessmenus/${accessToRemove.NO}`);
          }
        }

        toast.success("อัปเดตสิทธิ์เรียบร้อยแล้ว");
      } else {
        // Add new permissions
        for (const MNUM of access) {
          await axios.post(`${API_URL}/accessmenus`, { PNUM: PNUMBER, MNUM });
        }
        toast.success("เพิ่มสิทธิ์เรียบร้อยแล้ว");
      }

      setIsModalOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error("Error saving permission:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกสิทธิ์");
    }
  };

  const filteredPermissions = permissions.filter((item) =>
    item.PNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.access.some(a => a.MNAME.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          จัดการสิทธิ์การใช้งาน
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddPermission} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มตำแหน่ง
          </Button>
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
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>สิทธิ์การเข้าถึง</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((item) => (
              <TableRow key={item.PNUMBER}>
                <TableCell>{item.PNAME}</TableCell>
                <TableCell>{item.access.map(a => a.MNAME).join(", ")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditPermission(item)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePermission(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        positions={availablePositions}
        accessOptions={availableAccessOptions}
      />
    </Card>
  );
};

export default PermissionsSection;