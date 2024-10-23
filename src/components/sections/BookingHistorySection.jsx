import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
import { format, addMinutes, isBefore } from "date-fns";
import CancelConfirmationModal from "../modals/CancelConfirmationModal";
import QRCodeModal from "../modals/QRCodeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import axios from "axios";

const API_URL = "http://localhost:8080";

const BookingHistorySection = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [availableHistory, setAvailableHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      setAvailableHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (user?.ssn) {
      fetchBookings();
    }
  }, [user?.ssn]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-bookings/${user.ssn}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (selectedBooking) {
      try {
        await axios.post(`${API_URL}/cancel-booking`, {
          reserverId: selectedBooking.RESERVERID,
          essn: user.ssn,
        });
        toast.success("การจองถูกยกเลิกเรียบร้อยแล้ว");
        
        // Refresh both history and bookings
        await Promise.all([fetchHistory(), fetchBookings()]);
        
        setIsCancelModalOpen(false);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("เกิดข้อผิดพลาดในการยกเลิกการจอง");
      }
    }
  };

  const handleShowQRCode = (booking) => {
    setSelectedBooking(booking);
    setIsQRModalOpen(true); // เปิดโมดัล QR Code
  };

  const getStatusBadge = (history) => {
    const now = new Date();
    const bookingStart = new Date(history.STARTTIME);
    const bookingEnd = new Date(history.ENDTIME);
    const qrExpiration = addMinutes(bookingStart, 30);
  
    if (history.STUBOOKING === 3) {
      return <Badge className="bg-red-500">ยกเลิกแล้ว</Badge>;
    } else if (isBefore(bookingEnd, now)) {
      return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
    } else if (isBefore(now, bookingStart)) {
      return <Badge className="bg-blue-500">กำลังจะมาถึง</Badge>;
    } else if (isBefore(now, qrExpiration)) {
      return <Badge className="bg-yellow-500">กำลังใช้งาน</Badge>;
    } else {
      return <Badge className="bg-red-500">ไม่มีการเข้าใช้ห้อง</Badge>;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto overflow-hidden shadow-lg rounded-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">ประวัติการจองห้อง</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {availableHistory.length === 0 ? (
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
                {availableHistory.map((history) => (
                  <TableRow
                    key={history.RESERVERID}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {history.RESERVERID}
                    </TableCell>
                    <TableCell>{history.CFRNUM}</TableCell>
                    <TableCell>
                      {format(new Date(history.BDATE), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(history.STARTTIME), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(history.ENDTIME), "HH:mm")}
                    </TableCell>
                    <TableCell>{getStatusBadge(history)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {history.STUBOOKING === 1 && (
                            <DropdownMenuItem
                              onClick={() => handleCancelBooking(history)}
                              className="text-red-600"
                            >
                              ยกเลิก
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleShowQRCode(history)}
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

export default BookingHistorySection;
