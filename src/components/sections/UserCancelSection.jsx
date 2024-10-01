import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertCircle, QrCode, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import CancelConfirmationModal from "./CancelConfirmationModal";
import QRCodeModal from "../modals/QRCodeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const UserCancelSection = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = () => {
      // In a real application, this would be an API call
      const mockBookings = [
        {
          id: "BK001",
          roomCode: "RM101",
          date: "2024-03-15",
          startTime: "10:00",
          endTime: "12:00",
          status: "upcoming",
          accessCode: "AC123456",
        },
        {
          id: "BK002",
          roomCode: "RM102",
          date: "2024-03-20",
          startTime: "14:00",
          endTime: "16:00",
          status: "completed",
          accessCode: "AC234567",
        },
        {
          id: "BK003",
          roomCode: "RM103",
          date: "2024-04-05",
          startTime: "09:00",
          endTime: "17:00",
          status: "upcoming",
          accessCode: "AC345678",
        },
      ];
      setBookings(mockBookings);
    };

    fetchBookings();
  }, [user.username]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancelBooking = () => {
    if (selectedBooking) {
      const updatedBookings = bookings.map((booking) =>
        booking.id === selectedBooking.id
          ? { ...booking, status: "cancelled" }
          : booking
      );
      setBookings(updatedBookings);
      toast.success("การจองถูกยกเลิกเรียบร้อยแล้ว");
      setIsCancelModalOpen(false);
    }
  };

  const handleShowQRCode = (booking) => {
    setSelectedBooking(booking);
    setIsQRModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500">กำลังจะมาถึง</Badge>;
      case "completed":
        return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">ยกเลิกแล้ว</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto overflow-hidden shadow-lg rounded-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">ประวัติการจองห้อง</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg font-semibold text-gray-900">
              ไม่พบประวัติการจอง
            </p>
            <p className="mt-1 text-sm text-gray-500">
              คุณยังไม่มีการจองห้องใดๆ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสการจอง</TableHead>
                  <TableHead>รหัสห้อง</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เวลาเริ่มต้น</TableHead>
                  <TableHead>เวลาสิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.roomCode}</TableCell>
                    <TableCell>
                      {format(new Date(booking.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{booking.startTime}</TableCell>
                    <TableCell>{booking.endTime}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status === "upcoming" && (
                            <DropdownMenuItem
                              onClick={() => handleCancelBooking(booking)}
                              className="text-red-600"
                            >
                              ยกเลิก
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleShowQRCode(booking)}
                          >
                            <QrCode className="mr-2 h-4 w-4" /> QR Code
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelBooking}
        booking={selectedBooking}
      />
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        booking={selectedBooking}
      />
    </Card>
  );
};

export default UserCancelSection;
