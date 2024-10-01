import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Bell,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Edit,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
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
import { Label } from "../ui/label";
import axios from "axios";

const fetchRoom = async () => {
  const response = await axios.get("http://localhost:8080/room");
  return response.data;
};
const fetchBuildings = async () => {
  const response = await axios.get("http://localhost:8080/buildings");
  return response.data;
};
const fetchFloors = async () => {
  const response = await axios.get("http://localhost:8080/floors");
  return response.data;
};
const fetchRoomtypes = async () => {
  const response = await axios.get("http://localhost:8080/roomtypes");
  return response.data;
};
const fetchStatusrooms = async () => {
  const response = await axios.get("http://localhost:8080/statusrooms");
  return response.data;
};

const RoomsSection = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]); // State สำหรับตึก
  const [floors, setFloors] = useState([]); // State สำหรับชั้น
  const [roomtypes, setRoomtypes] = useState([]); // State สำหรับประเภทห้อง
  const [statusrooms, setStatusrooms] = useState([]); // State สำหรับสถานะห้อง
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [dialogState, setDialogState] = useState({
    type: null,
    isOpen: false,
    data: null,
  });

  useEffect(() => {
    loadRooms();
    loadBuildings(); // ดึงข้อมูลตึกเมื่อคอมโพเนนต์โหลด
    loadFloors();
    loadRoomtypes();
    loadStatusrooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomsData = await fetchRoom();
      console.log("Rooms data:", roomsData); // ตรวจสอบข้อมูล
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("ไม่สามารถดึงข้อมูลห้องประชุมได้");
    }
  };

  const loadBuildings = async () => {
    try {
      const buildingsData = await fetchBuildings();
      console.log("Buildings data:", buildingsData); // ตรวจสอบข้อมูลตึก
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("ไม่สามารถดึงข้อมูลตึกได้");
    }
  };
  const loadFloors = async () => {
    try {
      const floorsData = await fetchFloors();
      console.log("Floors data:", floorsData); // ตรวจสอบข้อมูลชั้น
      setFloors(floorsData);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
    }
  };
  const loadRoomtypes = async () => {
    try {
      const roomtypesData = await fetchRoomtypes();
      console.log("Roomtype data:", roomtypesData); // ตรวจสอบข้อมูลชั้น
      setRoomtypes(roomtypesData);
    } catch (error) {
      console.error("Error fetching roomtypes:", error);
      toast.error("ไม่สามารถดึงข้อมูลประเภทได้");
    }
  };
  const loadStatusrooms = async () => {
    try {
      const statusroomsData = await fetchStatusrooms();
      console.log("Statusrooms data:", statusroomsData); // ตรวจสอบข้อมูลชั้น
      setStatusrooms(statusroomsData);
    } catch (error) {
      console.error("Error fetching statusrooms:", error);
      toast.error("ไม่สามารถดึงข้อมูลสถานะได้");
    }
  };

  const handleAction = (action, room = null) => {
    switch (action) {
      case "add":
        setEditingRoom(null);
        setIsModalOpen(true);
        break;
      case "edit":
        setEditingRoom(room);
        setIsModalOpen(true);
        break;
      case "delete":
      case "approve":
      case "close":
        setDialogState({ type: action, isOpen: true, data: room });
        break;
      default:
        break;
    }
  };

  const updateRooms = (updatedRooms, message) => {
    setRooms(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    addNotification(message);
    toast.success(message);
  };

  // const handleSaveRoom = async (roomData) => {
  //   try {
  //     if (editingRoom) {
  //       // Update existing room
  //       await axios.put(`http://localhost:8080/room/${roomData.id}`, roomData);
  //       const updatedRooms = rooms.map((room) =>
  //         room.id === roomData.id ? roomData : room
  //       );
  //       updateRooms(updatedRooms, "อัปเดตข้อมูลห้องประชุมเรียบร้อยแล้ว");
  //     } else {
  //       // Add new room
  //       const response = await axios.post(
  //         "http://localhost:8080/room",
  //         roomData
  //       );
  //       const newRoom = response.data; // Assuming the backend returns the new room
  //       updateRooms([...rooms, newRoom], "เพิ่มห้องประชุมเรียบร้อยแล้ว");
  //     }
  //     setIsModalOpen(false);
  //   } catch (error) {
  //     console.error("Error saving room:", error);
  //     toast.error("ไม่สามารถบันทึกข้อมูลห้องประชุมได้");
  //   }
  // };

  const handleSaveRoom = async (roomData) => {
    try {
      if (editingRoom) {
        // Update existing room
        await axios.put(`http://localhost:8080/room/${roomData.id}`, roomData);
        const updatedRooms = rooms.map((room) =>
          room.id === roomData.id ? { ...room, ...roomData } : room
        );
        updateRooms(updatedRooms, "อัปเดตข้อมูลห้องประชุมเรียบร้อยแล้ว");
      } else {
        // Add new room
        const response = await axios.post(
          "http://localhost:8080/room",
          roomData
        );
        const newRoom = response.data; // Assuming the backend returns the new room
        updateRooms([...rooms, newRoom], "เพิ่มห้องประชุมเรียบร้อยแล้ว");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลห้องประชุมได้");
    }
  };

  const handleDeleteRoom = () => {
    const updatedRooms = rooms.filter(
      (room) => room.id !== dialogState.data.id
    );
    updateRooms(
      updatedRooms,
      `ลบห้องประชุม ${dialogState.data.name} เรียบร้อยแล้ว`
    );
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const handleApproveRoom = (approveData) => {
    const updatedRooms = rooms.map((room) =>
      room.id === approveData.id
        ? { ...room, ...approveData, status: "อนุมัติ" }
        : room
    );
    updateRooms(
      updatedRooms,
      `อนุมัติห้องประชุม ${approveData.name} เรียบร้อยแล้ว`
    );
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const handleCloseRoom = () => {
    const updatedRooms = rooms.map((room) =>
      room.id === dialogState.data.id ? { ...room, status: "ปิดใช้งาน" } : room
    );
    updateRooms(
      updatedRooms,
      `ปิดการใช้งานห้องประชุม ${dialogState.data.name} เรียบร้อยแล้ว`
    );
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const filteredRooms = rooms.filter((room) =>
    Object.values(room).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">จัดการห้องประชุม</CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleAction("add")} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องประชุม
          </Button>
          <Bell
            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setNotifications([])}
          />
          {notifications.length > 0 && (
            <span className="absolute top-4 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาห้องประชุม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ชื่อห้อง</TableHead>
                <TableHead>ตึก</TableHead>
                <TableHead>ชั้น</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ความจุ</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.CFRNUMBER}>
                  <TableCell>{room.CFRNUMBER}</TableCell>
                  <TableCell>{room.CFRNAME}</TableCell>
                  <TableCell>{room.BDNAME}</TableCell>
                  <TableCell>{room.FLNAME}</TableCell>
                  <TableCell>{room.RTNAME}</TableCell>
                  <TableCell>{room.status || "ว่าง"}</TableCell>
                  <TableCell>{room.CAPACITY}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAction("edit", room)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("approve", room)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> อนุมัติ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("delete", room)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> ลบ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("close", room)}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> ปิดการใช้งาน
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoom}
        room={editingRoom}
        buildings={buildings} // ส่ง buildings ไปที่ RoomModal
        floors={floors} // ส่ง floorsไปที่ RoomModal
        roomtypes={roomtypes} // ส่ง roomtypesไปที่ RoomModal
        statusrooms={statusrooms}
      />

      <ConfirmDialog
        isOpen={dialogState.type === "delete"}
        onClose={() =>
          setDialogState({ type: null, isOpen: false, data: null })
        }
        onConfirm={handleDeleteRoom}
        title="ยืนยันการลบห้องประชุม"
        message={`คุณต้องการลบห้องประชุม ${dialogState.data?.name} ใช่หรือไม่?`}
      />
      <ApproveDialog
        isOpen={dialogState.type === "approve"}
        onClose={() =>
          setDialogState({ type: null, isOpen: false, data: null })
        }
        onApprove={handleApproveRoom}
        room={dialogState.data}
      />
      <ConfirmDialog
        isOpen={dialogState.type === "close"}
        onClose={() =>
          setDialogState({ type: null, isOpen: false, data: null })
        }
        onConfirm={handleCloseRoom}
        title="ยืนยันการปิดใช้งานห้องประชุม"
        message={`คุณต้องการปิดใช้งานห้องประชุม ${dialogState.data?.name} ใช่หรือไม่?`}
      />
    </Card>
  );
};

const RoomModal = ({
  isOpen,
  onClose,
  onSave,
  room,
  buildings,
  floors,
  roomtypes,
  statusrooms,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    floor: "",
    building: "",
    capacity: "",
    type: "",
    status: "",
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        id: "",
        name: "",
        floor: "",
        building: "",
        capacity: "",
        type: "",
        status: "",
      });
    }
  }, [room]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {room ? "แก้ไขห้องประชุม" : "เพิ่มห้องประชุม"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              ชื่อห้อง
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building" className="text-right">
              ตึก
            </Label>
            <Select
              value={formData.building}
              onValueChange={(value) => handleChange("building", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกตึก" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.BDID} value={building.BDID}>
                    {building.BDNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="text-right">
              ชั้น
            </Label>
            <Select
              value={formData.floor}
              onValueChange={(value) => handleChange("floor", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกชั้น" />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id}>
                    {floor.FLNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right">
              จำนวน
            </Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              ประเภท
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                {roomtypes.map((roomtype) => (
                  <SelectItem key={roomtype.id} value={roomtype.id}>
                    {roomtype.RTNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              สถานะ
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusrooms.map((statusroom) => (
                  <SelectItem key={statusroom.id} value={statusroom.id}>
                    {statusroom.STATUSROOMNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{message}</p>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          ยกเลิก
        </Button>
        <Button onClick={onConfirm} variant="destructive">
          ยืนยัน
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const ApproveDialog = ({ isOpen, onClose, onApprove, room }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    floor: "",
    building: "",
    capacity: "",
    type: "VIP",
    status: "อนุมัติ",
    reason: "",
  });

  useEffect(() => {
    if (room) {
      setFormData({ ...room, status: "อนุมัติ", reason: "" });
    }
  }, [room]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>อนุมัติห้อง VIP</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              ชื่อห้อง
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building" className="text-right">
              ตึก
            </Label>
            <Input
              id="building"
              value={formData.building}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="text-right">
              ชั้น
            </Label>
            <Input
              id="floor"
              value={formData.floor}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              เหตุผล
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              className="col-span-3"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            อนุมัติ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomsSection;
