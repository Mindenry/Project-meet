import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { format } from "date-fns";

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, booking }) => {
  if (!booking) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการยกเลิกการจอง</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือไม่ที่ต้องการยกเลิกการจองนี้?
            <br />
            <br />
            <strong>รายละเอียดการจอง:</strong>
            <br />
            ห้อง: {booking.roomName}
            <br />
            วันที่: {format(new Date(booking.date), "dd MMM yyyy")}
            <br />
            เวลา: {booking.time}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            ยืนยันการยกเลิก
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelConfirmationModal;
