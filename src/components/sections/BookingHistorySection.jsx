import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, QrCode, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CancelConfirmationModal from "../modals/CancelConfirmationModal";
import QRCodeModal from "../modals/QRCodeModal";
import axios from "axios";

const API_URL = "http://localhost:8080";

const BookingHistorySection = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      // Sort bookings by RESERVERID numerically
      const sortedBookings = response.data.sort((a, b) => a.RESERVERID - b.RESERVERID);
      setBookings(sortedBookings);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (selectedBooking) {
      try {
        const response = await axios.post(
          `${API_URL}/cancel/${selectedBooking.RESERVERID}/${selectedBooking.CFRNUM}`
        );
        
        if (response.data.success) {
          setBookings(prevBookings => 
            prevBookings.map(b => 
              b.RESERVERID === selectedBooking.RESERVERID 
                ? { ...b, STUBOOKING: 5 } 
                : b
            )
          );
          
          toast.success("การจองถูกยกเลิกเรียบร้อยแล้ว");
          await fetchHistory();
        } else {
          toast.error(response.data.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
        }
        setIsCancelModalOpen(false);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
      }
    }
  };

  const handleShowQRCode = (booking) => {
    setSelectedBooking(booking);
    setIsQRModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      1: { label: "จอง", color: "bg-blue-500" },
      2: { label: "ไม่มีการเข้าใช้ห้อง", color: "bg-red-500" },
      3: { label: "เข้าใช้งานแล้ว", color: "bg-green-500" },
      4: { label: "รออนุมัติ", color: "bg-yellow-500" },
      5: { label: "ยกเลิกการจอง", color: "bg-gray-500" }
    };

    const status_info = statusMap[status] || { label: "ไม่ทราบสถานะ", color: "bg-gray-500" };
    return <Badge className={status_info.color}>{status_info.label}</Badge>;
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
              ยังไม่มีการจองห้องใดๆ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสการจอง</TableHead>
                  <TableHead>ชื่อห้อง</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เวลาเริ่มต้น</TableHead>
                  <TableHead>เวลาสิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.RESERVERID} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {booking.RESERVERID}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{booking.CFRNAME}</span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.BDATE), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.STARTTIME), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.ENDTIME), "HH:mm")}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.STUBOOKING)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.STUBOOKING === 1 && (
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

export default BookingHistorySection;