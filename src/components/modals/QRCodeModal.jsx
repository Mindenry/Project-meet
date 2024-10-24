import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Calendar, Clock, MapPin, Sparkles, Scan, QrCode } from "lucide-react";
import { toast } from "sonner";

const QRCodeModal = ({ isOpen, onClose, booking }) => {
  const qrRef = useRef(null);

  if (!booking) return null;

  const qrContent = `
การจองห้องประชุม
รหัสการจอง: ${booking.RESERVERID}
วันที่: ${format(new Date(booking.BDATE), "dd/MM/yyyy")}
เวลาเริ่มต้น: ${format(new Date(booking.STARTTIME), "HH:mm")}
เวลาสิ้นสุด: ${format(new Date(booking.ENDTIME), "HH:mm")}
ห้องประชุม: ${booking.CFRNAME}
  `.trim();

  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) {
      toast.error("ไม่สามารถดาวน์โหลด QR Code ได้");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = (new XMLSerializer()).serializeToString(svgElement);
    const DOMURL = window.URL || window.webkitURL || window;
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = DOMURL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      const imgURI = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      const link = document.createElement('a');
      link.download = `booking-${booking.RESERVERID}.png`;
      link.href = imgURI;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("ดาวน์โหลด QR Code สำเร็จ");
    };

    img.src = url;
  };

  const handleShare = async () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) {
        throw new Error("ไม่พบ QR Code");
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = (new XMLSerializer()).serializeToString(svgElement);
      const DOMURL = window.URL || window.webkitURL || window;
      const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      const url = DOMURL.createObjectURL(svgBlob);

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          DOMURL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("ไม่สามารถสร้างไฟล์ได้");
        }

        const file = new File([blob], `booking-${booking.RESERVERID}.png`, {
          type: "image/png",
        });

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: "QR Code การจองห้องประชุม",
            text: qrContent,
          });
          toast.success("แชร์ QR Code สำเร็จ");
        } else {
          const shareUrl = URL.createObjectURL(blob);
          const tempLink = document.createElement("a");
          tempLink.href = shareUrl;
          tempLink.download = `booking-${booking.RESERVERID}.png`;
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(shareUrl);
          toast.success("ดาวน์โหลด QR Code แทนการแชร์สำเร็จ");
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("ไม่สามารถแชร์ QR Code ได้");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-b from-gray-50 to-white/95 backdrop-blur-sm border-0 shadow-[0_0_1.5rem_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-4">
        <DialogHeader className="relative pt-6">
          <div className="absolute top-4 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-90" />
          <DialogTitle className="text-2xl font-bold text-center">
            <div className="relative inline-flex items-center">
              <QrCode className="w-7 h-7 mr-3 animate-pulse text-purple-600" />
              <span className="relative text-black-800 dark:text-black-300">
                QR Code สำหรับการจอง
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-8 p-6">
          <div className="flex-1 flex flex-col items-center space-y-6">
            <div 
              ref={qrRef}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-25 blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:blur-2xl animate-pulse" />
              <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
                <QRCodeSVG
                  value={qrContent}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
                <Scan className="absolute -bottom-3 -right-3 w-8 h-8 text-purple-500 animate-pulse" />
                <Sparkles className="absolute -top-3 -left-3 w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลด
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
              >
                <Share2 className="w-4 h-4 mr-2" />
                แชร์
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 space-y-5 transform hover:scale-[1.01]">
              <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 transition-colors hover:from-blue-100 hover:to-blue-200/50">
                <div className="p-2.5 bg-blue-500/10 rounded-lg shadow-inner">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600/70">วันที่</p>
                  <p className="font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {format(new Date(booking.BDATE), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 transition-colors hover:from-purple-100 hover:to-purple-200/50">
                <div className="p-2.5 bg-purple-500/10 rounded-lg shadow-inner">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-600/70">เวลา</p>
                  <p className="font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {format(new Date(booking.STARTTIME), "HH:mm")} -{" "}
                    {format(new Date(booking.ENDTIME), "HH:mm")} น.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100/50 transition-colors hover:from-pink-100 hover:to-pink-200/50">
                <div className="p-2.5 bg-pink-500/10 rounded-lg shadow-inner">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-pink-600/70">ห้องประชุม</p>
                  <p className="font-semibold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                    {booking.CFRNAME}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <p className="text-sm font-medium text-gray-500">รหัสการจอง</p>
                <p className="text-xl font-mono font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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