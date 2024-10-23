import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const PermissionModal = ({
  isOpen,
  onClose,
  onSave,
  permission,
  positions,
  accessOptions,
}) => {
  // Initial state: role (PNUM) and access (array of MNUM)
  const [role, setRole] = React.useState(permission?.PNUM || ""); // Use PNUM instead of role
  const [access, setAccess] = React.useState(
    permission?.access?.map((item) => item.MNUM) || []
  ); // Use MNUM instead of MNAME

  React.useEffect(() => {
    if (permission) {
      setRole(permission.PNUM); // Update with PNUM
      setAccess(permission.access.map((item) => item.MNUM)); // Update with MNUM
    } else {
      setRole("");
      setAccess([]);
    }
  }, [permission]);

  const handleSave = () => {
    onSave({ role, access, PNUM: role }); // ตรวจสอบให้แน่ใจว่า PNUM มีค่า
    onClose();
  };

  const toggleAccess = (mnum) => {
    setAccess((prev) =>
      prev.includes(mnum) ? prev.filter((i) => i !== mnum) : [...prev, mnum]
    );
  };

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
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.PNUMBER} value={pos.PNUMBER}>
                    {pos.PNAME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">สิทธิ์การเข้าถึง</Label>
            <div className="col-span-3 space-y-2">
              {accessOptions.map((item) => (
                <div key={item.MNUMBER} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.MNUMBER}
                    checked={access.includes(item.MNUMBER)} // ใช้ MNUMBER ในการตรวจสอบการเข้าถึง
                    onCheckedChange={() => toggleAccess(item.MNUMBER)} // เปลี่ยนค่าโดยใช้ MNUMBER
                  />
                  <label
                    htmlFor={item.MNUMBER}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.MNAME}
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
