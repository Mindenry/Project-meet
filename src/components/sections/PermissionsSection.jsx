import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import PermissionModal from "../modals/PermissionModal";
import axios from "axios";

const API_URL = "http://localhost:8080";

const PermissionsSection = () => {
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [availableAccessOptions, setAvailableAccessOptions] = useState([]);

  // ดึงข้อมูลสิทธิ์จาก API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`${API_URL}/accessmenus`);
        console.log("Permissions data:", response.data); // ตรวจสอบข้อมูลที่ได้จาก API
        const groupedPermissions = groupPermissionsByRole(response.data); // จัดกลุ่มข้อมูล
        setPermissions(groupedPermissions); // เก็บข้อมูลสิทธิ์ใน state
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสิทธิ์");
      }
    };

    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${API_URL}/positions`); // API ที่ดึงข้อมูลตำแหน่ง
        setAvailablePositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง");
      }
    };

    const fetchAccessOptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/menus`); // แก้เป็น menus
        setAvailableAccessOptions(response.data);
      } catch (error) {
        console.error("Error fetching menus:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู");
      }
    };

    fetchPermissions();
    fetchPositions();
    fetchAccessOptions();
  }, []);

  // ฟังก์ชันสำหรับจัดกลุ่มตำแหน่งที่มีสิทธิ์การเข้าถึงหลายอัน
  const groupPermissionsByRole = (permissions) => {
    return permissions.reduce((acc, current) => {
      const { PNAME, MNAME, NO } = current; // รวม NO
      const existingRole = acc.find((item) => item.PNAME === PNAME);

      if (existingRole) {
        existingRole.MNAME.push(MNAME); // ถ้า PNAME มีอยู่แล้ว ให้เพิ่ม MNAME เข้าไปในอาร์เรย์
      } else {
        acc.push({ PNAME, MNAME: [MNAME], NO }); // ถ้ายังไม่มี ให้สร้างออบเจกต์ใหม่
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
    console.log("Permission data:", permission); // ตรวจสอบค่าที่รับมา
    const { PNUM, MNUM, NO } = permission;

    if (!PNUM || !MNUM || !NO) {
      console.error("PNUM, MNUM หรือ NO ไม่มีค่า");
      return;
    }

    try {
      await axios.delete(`${API_URL}/accessmenus`, {
        data: {
          PNUM,
          MNUM,
          NO, // เพิ่ม NO
        },
      });
      toast.success("ลบสิทธิ์สำเร็จ");
      fetchPermissions(); // รีเฟรชข้อมูลหลังจากลบ
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("เกิดข้อผิดพลาดในการลบสิทธิ์");
    }
  };

  const handleSavePermission = async (permissionData) => {
    try {
      console.log("Data to be saved:", permissionData);

      const accessMNUM = permissionData.access
        .map((mname) => {
          const accessOption = availableAccessOptions.find(
            (option) =>
              option.MNAME ===
              (typeof mname === "string" ? mname.trim() : mname)
          );
          return accessOption ? accessOption.MNUMBER : null;
        })
        .filter((num) => num !== null);

      console.log("Access MNUM:", accessMNUM);

      const pnum = permissionData.PNUM;
      console.log("PNUM to be saved:", pnum);

      const payload = {
        role: permissionData.role,
        access: accessMNUM,
        PNUM: pnum, // เพิ่มการตรวจสอบค่า PNUM ด้วย
      };

      console.log("Payload being sent:", payload); // log เพื่อดูข้อมูลที่จะส่ง

      if (editingPermission) {
        await axios.put(
          `${API_URL}/accessmenus/${editingPermission.NO}`,
          payload
        );
        addNotification("อัปเดตสิทธิ์เรียบร้อยแล้ว");
      } else {
        await axios.post(`${API_URL}/accessmenus`, payload);
        addNotification("เพิ่มสิทธิ์เรียบร้อยแล้ว");
      }

      setIsModalOpen(false);
      const response = await axios.get(`${API_URL}/accessmenus`);
      const groupedPermissions = groupPermissionsByRole(response.data);
      setPermissions(groupedPermissions);
    } catch (error) {
      console.error("Error saving permission:", error);
      if (error.response) {
        console.error("API Response Error:", error.response.data); // log รายละเอียดของ error จาก API
      }
      toast.error("เกิดข้อผิดพลาดในการบันทึกสิทธิ์");
    }
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

  // ค้นหาสิทธิ์ตามที่กรอกใน input
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
            {filteredPermissions.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.PNAME}</TableCell>
                <TableCell>{item.MNAME.join(", ")}</TableCell>
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
                        onClick={() => handleDeletePermission(item)} // ต้องแน่ใจว่า item นี้มี PNUM และ MNUM
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
        permission={editingPermission} // ข้อมูลที่กำลังแก้ไข
        positions={availablePositions} // ส่งตำแหน่ง
        accessOptions={availableAccessOptions} // ส่งสิทธิ์การเข้าถึง (ข้อมูลจาก menus)
      />
    </Card>
  );
};

export default PermissionsSection;
