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
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import CancelConfirmationModal from "./CancelConfirmationModal";

const UserCancelSection = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = () => {
      // In a real application, this would be an API call
      const mockBookings = [
        {
          id: 1,
          roomName: "ห้องประชุมใหญ่",
          date: "2024-03-15",
          time: "10:00 - 12:00",
          status: "upcoming",
          capacity: 20,
          location: "ชั้น 2, อาคาร A",
        },
        {
          id: 2,
          roomName: "ห้องประชุมเล็ก",
          date: "2024-03-20",
          time: "14:00 - 16:00",
          status: "completed",
          capacity: 8,
          location: "ชั้น 1, อาคาร B",
        },
        {
          id: 3,
          roomName: "ห้องสัมมนา",
          date: "2024-04-05",
          time: "09:00 - 17:00",
          status: "upcoming",
          capacity: 50,
          location: "ชั้น 3, อาคาร C",
        },
      ];
      setBookings(mockBookings);
    };

    fetchBookings();
  }, [user.username]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
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
      setIsModalOpen(false);
    }
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
    <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg rounded-lg">
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
                  <TableHead>ห้อง</TableHead>
                  <TableHead>วันที่และเวลา</TableHead>
                  <TableHead>สถานที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {booking.roomName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {format(new Date(booking.date), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{booking.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ความจุ: {booking.capacity} คน
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      {booking.status === "upcoming" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
                        >
                          ยกเลิกการจอง
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CancelConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCancelBooking}
        booking={selectedBooking}
      />
    </Card>
  );
};

export default UserCancelSection;
