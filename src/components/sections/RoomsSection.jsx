import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Plus, Trash2, CheckCircle, Edit, XCircle } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8080";

const fetchRooms = async () => {
  const response = await axios.get(`${API_URL}/room`);
  return response.data;
};

const fetchBuildings = async () => {
  const response = await axios.get(`${API_URL}/buildings`);
  return response.data;
};

const fetchFloors = async () => {
  const response = await axios.get(`${API_URL}/floors`);
  return response.data;
};

const fetchRoomtypes = async () => {
  const response = await axios.get(`${API_URL}/roomtypes`);
  return response.data;
};

const fetchStatusrooms = async () => {
  const response = await axios.get(`${API_URL}/statusrooms`);
  return response.data;
};

const RoomsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [dialogState, setDialogState] = useState({
    type: null,
    isOpen: false,
    data: null,
  });

  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings"],
    queryFn: fetchBuildings,
  });

  const { data: floors = [] } = useQuery({
    queryKey: ["floors"],
    queryFn: fetchFloors,
  });

  const { data: roomtypes = [] } = useQuery({
    queryKey: ["roomtypes"],
    queryFn: fetchRoomtypes,
  });

  const { data: statusrooms = [] } = useQuery({
    queryKey: ["statusrooms"],
    queryFn: fetchStatusrooms,
  });

  const addRoomMutation = useMutation({
    mutationFn: (newRoom) => axios.post(`${API_URL}/addroom`, newRoom),
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      toast.success("เพิ่มห้องประชุมสำเร็จ");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error("ไม่สามารถเพิ่มห้องประชุมได้: " + error.message);
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: (updatedRoom) =>
      axios.put(`${API_URL}/updateroom/${updatedRoom.CFRNUMBER}`, updatedRoom),
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      toast.success("อัปเดตข้อมูลห้องประชุมสำเร็จ");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error("ไม่สามารถอัปเดตข้อมูลห้องประชุมได้: " + error.message);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (CFRNUMBER) =>
      axios.delete(`${API_URL}/deleteroom/${CFRNUMBER}`),
    onSuccess: () => {
      queryClient.invalidateQueries("rooms");
      toast.success("ลบห้องประชุมสำเร็จ");
    },
    onError: (error) => {
      toast.error("ไม่สามารถลบห้องประชุมได้: " + error.message);
    },
  });

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

  const handleSaveRoom = (roomData) => {
    if (editingRoom) {
      updateRoomMutation.mutate(roomData);
    } else {
      addRoomMutation.mutate(roomData);
    }
  };

  const handleDeleteRoom = () => {
    deleteRoomMutation.mutate(dialogState.data.CFRNUMBER);
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const handleApproveRoom = (approveData) => {
    console.log("Approving room:", approveData);
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const handleCloseRoom = () => {
    console.log("Closing room:", dialogState.data);
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
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoadingRooms) return <div>กำลังโหลด...</div>;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">จัดการห้องประชุม</CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleAction("add")} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องประชุม
          </Button>
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
                  <TableCell>{room.STATUSROOMNAME}</TableCell>
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
        buildings={buildings}
        floors={floors}
        roomtypes={roomtypes}
        statusrooms={statusrooms}
      />
      <ConfirmDialog
        isOpen={dialogState.type === "delete"}
        onClose={() =>
          setDialogState({ type: null, isOpen: false, data: null })
        }
        onConfirm={handleDeleteRoom}
        title="ยืนยันการลบห้องประชุม"
        message={`คุณต้องการลบห้องประชุม ${dialogState.data?.CFRNAME} ใช่หรือไม่?`}
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
        message={`คุณต้องการปิดใช้งานห้องประชุม ${dialogState.data?.CFRNAME} ใช่หรือไม่?`}
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
    CFRNUMBER: "",
    CFRNAME: "",
    BDNUM: "",
    FLNUM: "",
    RTNUM: "",
    STUROOM: "",
    CAPACITY: "",
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        CFRNUMBER: "",
        CFRNAME: "",
        BDNUM: "",
        FLNUM: "",
        RTNUM: "",
        STUROOM: "",
        CAPACITY: "",
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
            <Label htmlFor="CFRNUMBER" className="text-right">
              ID
            </Label>
            <Input
              id="CFRNUMBER"
              value={formData.CFRNUMBER}
              onChange={(e) => handleChange("CFRNUMBER", e.target.value)}
              className="col-span-3"
              disabled={!!room} // ไม่อนุญาตให้แก้ไข ID เมื่อกำลังแก้ไขห้องที่มีอยู่แล้ว
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CFRNAME" className="text-right">
              ชื่อห้อง
            </Label>
            <Input
              id="CFRNAME"
              value={formData.CFRNAME}
              onChange={(e) => handleChange("CFRNAME", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="BDNUM" className="text-right">
              ตึก
            </Label>
            <Select
              value={formData.BDNUM}
              onValueChange={(value) => handleChange("BDNUM", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกตึก" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem
                    key={building.BDNUMBER}
                    value={building.BDNUMBER.toString()}
                  >
                    {building.BDNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="FLNUM" className="text-right">
              ชั้น
            </Label>
            <Select
              value={formData.FLNUM}
              onValueChange={(value) => handleChange("FLNUM", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกชั้น" />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem
                    key={floor.FLNUMBER}
                    value={floor.FLNUMBER.toString()}
                  >
                    {floor.FLNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CAPACITY" className="text-right">
              จำนวน
            </Label>
            <Input
              id="CAPACITY"
              type="number"
              value={formData.CAPACITY}
              onChange={(e) => handleChange("CAPACITY", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="RTNUM" className="text-right">
              ประเภท
            </Label>
            <Select
              value={formData.RTNUM}
              onValueChange={(value) => handleChange("RTNUM", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                {roomtypes.map((roomtype) => (
                  <SelectItem
                    key={roomtype.RTNUMBER}
                    value={roomtype.RTNUMBER.toString()}
                  >
                    {roomtype.RTNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="STUROOM" className="text-right">
              สถานะ
            </Label>
            <Select
              value={formData.STUROOM}
              onValueChange={(value) => handleChange("STUROOM", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusrooms.map((statusroom) => (
                  <SelectItem
                    key={statusroom.STATUSROOMID}
                    value={statusroom.STATUSROOMID.toString()}
                  >
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
    CFRNUMBER: "",
    CFRNAME: "",
    BDNUM: "",
    FLNUM: "",
    RTNUM: "",
    STUROOM: "",
    CAPACITY: "",
    reason: "",
  });

  useEffect(() => {
    if (room) {
      setFormData({ ...room, reason: "" });
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
            <Label htmlFor="CFRNUMBER" className="text-right">
              ID
            </Label>
            <Input
              id="CFRNUMBER"
              value={formData.CFRNUMBER}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CFRNAME" className="text-right">
              ชื่อห้อง
            </Label>
            <Input
              id="CFRNAME"
              value={formData.CFRNAME}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="BDNAME" className="text-right">
              ตึก
            </Label>
            <Input
              id="BDNAME"
              value={formData.BDNAME}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="FLNAME" className="text-right">
              ชั้น
            </Label>
            <Input
              id="FLNAME"
              value={formData.FLNAME}
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
