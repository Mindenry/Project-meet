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

const RoomsSection = () => {
  const [rooms, setRooms] = useState([]);
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
  }, []);

  const loadRooms = () => {
    const storedRooms = JSON.parse(localStorage.getItem("rooms")) || [];
    setRooms(storedRooms);
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

  const handleSaveRoom = (roomData) => {
    const updatedRooms = editingRoom
      ? rooms.map((room) => (room.id === roomData.id ? roomData : room))
      : [...rooms, { ...roomData, id: Date.now().toString() }];
    updateRooms(
      updatedRooms,
      editingRoom
        ? "อัปเดตข้อมูลห้องประชุมเรียบร้อยแล้ว"
        : "เพิ่มห้องประชุมเรียบร้อยแล้ว"
    );
    setIsModalOpen(false);
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
                <TableHead>ชั้น</TableHead>
                <TableHead>ตึก</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>วว/ดด/ปป</TableHead>
                <TableHead>ตั้งแต่เวลา</TableHead>
                <TableHead>ถึง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.id}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.building}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.date || "-"}</TableCell>
                  <TableCell>{room.startTime || "-"}</TableCell>
                  <TableCell>{room.endTime || "-"}</TableCell>
                  <TableCell>{room.status}</TableCell>
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

const RoomModal = ({ isOpen, onClose, onSave, room }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    floor: "",
    building: "",
    capacity: "",
    type: "ธรรมดา",
    date: "",
    startTime: "",
    endTime: "",
    status: "ว่าง",
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
        type: "ธรรมดา",
        date: "",
        startTime: "",
        endTime: "",
        status: "ว่าง",
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
                {[1, 2, 3, 4, 5].map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {["อาคาร A", "อาคาร B", "อาคาร C"].map((building) => (
                  <SelectItem key={building} value={building}>
                    {building}
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
                {["ธรรมดา", "VIP"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              วันที่
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              เวลาเริ่ม
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              เวลาสิ้นสุด
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="col-span-3"
            />
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
                {["ว่าง", "ไม่ว่าง", "ปิดปรับปรุง"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
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
    date: "",
    startTime: "",
    endTime: "",
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
