import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

const QRCodeModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code สำหรับการเข้าใช้งานห้อง</DialogTitle>
          <DialogDescription>
            สแกน QR Code นี้เพื่อเข้าใช้งานห้อง {booking.roomCode}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center p-6">
          <QRCodeSVG value={booking.accessCode} size={200} />
        </div>
        <div className="text-center mt-4">
          <p className="font-semibold">รหัสการเข้าใช้งาน:</p>
          <p className="text-2xl font-bold">{booking.accessCode}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
