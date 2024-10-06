import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const PermissionModal = ({ isOpen, onClose, onSave, permission }) => {
  const [role, setRole] = React.useState(permission?.role || "");
  const [access, setAccess] = React.useState(permission?.access || []);

  const handleSave = () => {
    onSave({ role, access });
    onClose();
  };

  const toggleAccess = (item) => {
    setAccess((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const positions = [
    "ผู้ดูแลระบบ",
    "ผู้จัดการ",
    "พนักงาน",
    "ลูกค้า",
    "ผู้ใช้ทั่วไป",
  ];

  const accessOptions = [
    "จองห้อง",
    "ยกเลิกการจอง",
    "ดูรายงาน",
    "จัดการผู้ใช้",
    "จัดการห้อง",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {permission ? "แก้ไขสิทธิ์" : "เพิ่มสิทธิ์"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              ตำแหน่ง
            </Label>
            <Select onValueChange={setRole} defaultValue={role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">สิทธิ์การเข้าถึง</Label>
            <div className="col-span-3 space-y-2">
              {accessOptions.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={access.includes(item)}
                    onCheckedChange={() => toggleAccess(item)}
                  />
                  <label
                    htmlFor={item}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionModal;
