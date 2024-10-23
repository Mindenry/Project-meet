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
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, booking }) => {
  if (!booking) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการยกเลิกการจอง</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการยกเลิกการจองห้องประชุมหมายเลข {booking.CFRNUM} ในวันที่{" "}
            {format(new Date(booking.BDATE), "dd/MM/yyyy")} เวลา{" "}
            {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
            {format(new Date(booking.ENDTIME), "HH:mm")} น. ใช่หรือไม่?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600">
            ยืนยันการยกเลิก
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelConfirmationModal;