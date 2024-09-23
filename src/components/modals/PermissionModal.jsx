import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

const PermissionModal = ({ isOpen, onClose, onSave, permission }) => {
  const [formData, setFormData] = useState({
    role: "",
    access: [],
  });

  const accessOptions = [
    "จัดการสมาชิก",
    "จัดการห้องพัก",
    "จัดการการเข้าถึง",
    "จัดการบัญชีดำ",
    "จัดการการยกเลิก",
    "ดูรายงาน",
    "จัดการสิทธิ์",
  ];

  useEffect(() => {
    if (permission) {
      setFormData(permission);
    } else {
      setFormData({
        role: "",
        access: [],
      });
    }
  }, [permission]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      access: prevData.access.includes(value)
        ? prevData.access.filter((item) => item !== value)
        : [...prevData.access, value],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {permission ? "แก้ไขสิทธิ์" : "เพิ่มสิทธิ์"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                บทบาท
              </Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">สิทธิ์การเข้าถึง</Label>
              <div className="col-span-3 space-y-2">
                {accessOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <Checkbox
                      id={option}
                      checked={formData.access.includes(option)}
                      onCheckedChange={() => handleCheckboxChange(option)}
                    />
                    <label
                      htmlFor={option}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionModal;
