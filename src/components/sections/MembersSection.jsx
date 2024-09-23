import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchMembers = async () => {
  const response = await axios.get("http://localhost:8080/members");
  return response.data;
};

const formatID = (id) => {
  return id.toString().padStart(3, "0");
};

const MembersSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    SSN: "",
    FNAME: "",
    LNAME: "",
    EMAIL: "",
    DNO: "",
    PNO: "",
    pw: "",
  });

  const queryClient = useQueryClient();

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.SSN - b.SSN);
  }, [members]);

  const addMemberMutation = useMutation({
    mutationFn: (newMember) =>
      axios.post("http://localhost:8080/addmembers", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries("members");
      toast.success("เพิ่มสมาชิกสำเร็จ");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(
        "ไม่สามารถเพิ่มสมาชิกได้: " + error.response?.data?.error ||
          error.message
      );
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember) =>
      axios.put(
        `http://localhost:8080/updatemembers/${updatedMember.SSN}`,
        updatedMember
      ),
    onSuccess: () => {
      queryClient.invalidateQueries("members");
      toast.success("แก้ไขข้อมูลสมาชิกสำเร็จ");
      setIsModalOpen(false);
      setEditingMember(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(
        "ไม่สามารถแก้ไขข้อมูลสมาชิกได้: " + error.response?.data?.error ||
          error.message
      );
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (SSN) =>
      axios.delete(`http://localhost:8080/deletemembers/${SSN}`),
    onSuccess: () => {
      queryClient.invalidateQueries("members");
      toast.success("ลบสมาชิกสำเร็จ");
    },
    onError: (error) => {
      toast.error(
        "ไม่สามารถลบสมาชิกได้: " + error.response?.data?.error || error.message
      );
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateMemberMutation.mutate(formData);
    } else {
      addMemberMutation.mutate(formData);
    }
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({ ...member, pw: "" });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      SSN: "",
      FNAME: "",
      LNAME: "",
      EMAIL: "",
      DNO: "",
      PNO: "",
      pw: "",
    });
  };

  const filteredMembers = sortedMembers.filter((member) =>
    Object.values(member).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error.message}</div>;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">จัดการสมาชิก</CardTitle>
        <Button
          onClick={() => {
            setEditingMember(null);
            resetForm();
            setIsModalOpen(true);
          }}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มสมาชิก
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>นามสกุล</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.SSN}>
                <TableCell>{formatID(member.SSN)}</TableCell>
                <TableCell>{member.FNAME}</TableCell>
                <TableCell>{member.LNAME}</TableCell>
                <TableCell>{member.EMAIL}</TableCell>
                <TableCell>{member.DNAME}</TableCell>
                <TableCell>{member.PNAME}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(member)}>
                        <Edit className="mr-2 h-4 w-4" /> แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteMemberMutation.mutate(member.SSN)}
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "แก้ไขสมาชิก" : "เพิ่มสมาชิก"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {["SSN", "FNAME", "LNAME", "EMAIL", "DNO", "PNO", "pw"].map(
              (key) => (
                <div key={key} className="mb-4">
                  <Label htmlFor={key}>
                    {key === "SSN"
                      ? "ID"
                      : key === "FNAME"
                      ? "ชื่อ"
                      : key === "LNAME"
                      ? "นามสกุล"
                      : key === "EMAIL"
                      ? "Email"
                      : key === "DNO"
                      ? "แผนก"
                      : key === "PNO"
                      ? "ตำแหน่ง"
                      : key === "pw"
                      ? "รหัสผ่าน"
                      : key}
                  </Label>
                  <Input
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={key !== "pw" || !editingMember}
                    type={key === "pw" ? "password" : "text"}
                    disabled={key === "SSN" && editingMember}
                  />
                </div>
              )
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MembersSection;
