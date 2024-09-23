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

const UserCancelSection = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = () => {
      const mockBookings = [
        {
          id: 1,
          roomName: "Room A",
          date: "2024-03-15",
          time: "10:00 - 12:00",
        },
        {
          id: 2,
          roomName: "Room B",
          date: "2024-03-20",
          time: "14:00 - 16:00",
        },
      ];
      setBookings(mockBookings);
    };

    fetchBookings();
  }, [user.username]);

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = bookings.filter(
      (booking) => booking.id !== bookingId
    );
    setBookings(updatedBookings);
    toast.success("การจองถูกยกเลิกเรียบร้อยแล้ว");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ยกเลิกการจอง</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p>คุณไม่มีการจองที่สามารถยกเลิกได้</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.roomName}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      ยกเลิก
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCancelSection;
