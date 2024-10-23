import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

const QRCodeModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const qrContent = `
การจองห้องประชุม
รหัสการจอง: ${booking.RESERVERID}
วันที่: ${format(new Date(booking.BDATE), "dd/MM/yyyy")}
เวลาเริ่มต้น: ${format(new Date(booking.STARTTIME), "HH:mm")}
เวลาสิ้นสุด: ${format(new Date(booking.ENDTIME), "HH:mm")}
ห้องประชุม: ${booking.CFRNUM}
  `.trim();

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `booking-${booking.RESERVERID}.png`;
      link.href = url;
      link.click();
      toast.success("ดาวน์โหลด QR Code สำเร็จ");
    }
  };

  const handleShare = async () => {
    try {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        if (blob) {
          const file = new File([blob], "qr-code.png", { type: "image/png" });
          if (navigator.share) {
            await navigator.share({
              files: [file],
              title: 'QR Code การจองห้องประชุม',
              text: qrContent
            });
            toast.success("แชร์ QR Code สำเร็จ");
          } else {
            toast.error("บราวเซอร์ของคุณไม่รองรับการแชร์");
          }
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("ไม่สามารถแชร์ QR Code ได้");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            QR Code สำหรับการจอง
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* QR Code Section */}
          <div className="flex-1 flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <QRCodeSVG
                value={qrContent}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลด
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                แชร์
              </Button>
            </div>
          </div>

          {/* Booking Details Section */}
          <div className="flex-1 space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">วันที่</p>
                  <p className="font-semibold">
                    {format(new Date(booking.BDATE), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">เวลา</p>
                  <p className="font-semibold">
                    {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
                    {format(new Date(booking.ENDTIME), "HH:mm")} น.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">รหัสห้องประชุม</p>
                  <p className="font-semibold">{booking.CFRNUM}</p>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">รหัสการจอง</p>
                <p className="text-lg font-mono font-bold text-gray-700">
                  {booking.RESERVERID}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;