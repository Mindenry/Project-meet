import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const PermissionModal = ({
  isOpen,
  onClose,
  onSave,
  permission,
  positions,
  accessOptions,
}) => {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedAccess, setSelectedAccess] = useState([]);

  useEffect(() => {
    if (permission) {
      setSelectedPosition(permission.PNUM);
      setSelectedAccess(permission.MNUMS || []);
    } else {
      setSelectedPosition("");
      setSelectedAccess([]);
    }
  }, [permission, isOpen]);

  const handleSave = () => {
    if (!selectedPosition) {
      alert("กรุณาเลือกตำแหน่ง");
      return;
    }

    if (selectedAccess.length === 0) {
      alert("กรุณาเลือกสิทธิ์");
      return;
    }

    onSave({
      PNUMBER: selectedPosition,
      access: selectedAccess,
    });
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
            <Label htmlFor="position" className="text-right">
              ตำแหน่ง
            </Label>
            <Select
              value={selectedPosition}
              onValueChange={setSelectedPosition}
            >
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">สิทธิ์การเข้าถึง</Label>
            <div className="col-span-3 space-y-2">
              {accessOptions.map((option) => (
                <div
                  key={option.MNUMBER}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`access-${option.MNUMBER}`}
                    checked={selectedAccess.includes(option.MNUMBER)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAccess([...selectedAccess, option.MNUMBER]);
                      } else {
                        setSelectedAccess(
                          selectedAccess.filter((id) => id !== option.MNUMBER)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`access-${option.MNUMBER}`}>
                    {option.MNAME}
                  </Label>
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
