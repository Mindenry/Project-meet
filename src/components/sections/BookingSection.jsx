import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarIcon,
  Clock,
  Building,
  Layers,
  DoorOpen,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "http://localhost:8080";

const BookingSection = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [participants, setParticipants] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      building: "",
      floor: "",
      room: "",
      participants: "",
    },
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchFloors(selectedBuilding);
    }
  }, [selectedBuilding]);

  useEffect(() => {
    if (selectedBuilding && selectedFloor && participants) {
      fetchRooms(selectedBuilding, selectedFloor, participants);
    }
  }, [selectedBuilding, selectedFloor, participants]);

  const fetchBuildings = async () => {
    try {
      const response = await axios.get(`${API_URL}/buildings`);
      setBuildings(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("ไม่สามารถดึงข้อมูลอาคารได้");
    }
  };

  const fetchFloors = async (buildingId) => {
    try {
      const response = await axios.get(
        `${API_URL}/floors?buildingId=${buildingId}`
      );
      setFloors(response.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("ไม่สามารถดึงข้อมูลชั้นได้");
    }
  };

  const fetchRooms = async (buildingId, floorId, participants) => {
    try {
      const response = await axios.get(`${API_URL}/rooms`, {
        params: { buildingId, floorId, participants },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("ไม่สามารถดึงข้อมูลห้องประชุมได้");
    }
  };

  const onSubmit = async (data) => {
    try {
      const bookingDate = new Date(data.date);
      const startDateTime = new Date(bookingDate);
      const [startHours, startMinutes] = data.startTime.split(":");
      startDateTime.setHours(
        parseInt(startHours, 10),
        parseInt(startMinutes, 10)
      );

      const endDateTime = new Date(bookingDate);
      const [endHours, endMinutes] = data.endTime.split(":");
      endDateTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));

      const bookingData = {
        date: format(bookingDate, "yyyy-MM-dd"),
        startTime: format(startDateTime, "HH:mm"),
        endTime: format(endDateTime, "HH:mm"),
        room: data.room,
        essn: user.id,
      };

      const response = await axios.post(`${API_URL}/book-room`, bookingData);

      console.log("Booking submitted:", response.data);
      toast.success("การจองสำเร็จ!");
      setBookingData(response.data);
      form.reset();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
    }
  };

  const QRCodeDisplay = ({ bookingData }) => {
    if (!bookingData) return null;

    const { RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, ESSN } = bookingData;

    const qrContent = `
      การจองห้องประชุม
      รหัสการจอง: ${RESERVERID}
      วันที่: ${format(new Date(BDATE), "dd/MM/yyyy")}
      เวลาเริ่มต้น: ${format(new Date(STARTTIME), "HH:mm")}
      เวลาสิ้นสุด: ${format(new Date(ENDTIME), "HH:mm")}
      ห้องประชุม: ${CFRNUM}
      ผู้จอง: ${ESSN || "ไม่ระบุ"}
    `;

    return (
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold mb-2">QR Code สำหรับการจอง</h3>
        <div className="inline-block p-4 bg-white rounded-lg shadow-md">
          <QRCodeSVG value={qrContent} size={200} />
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden shadow-2xl rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <CardTitle className="text-2xl font-bold">จองห้องประชุม</CardTitle>
      </CardHeader>
      <CardContent className="p-8 bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <CalendarIcon className="mr-2" size={18} />
                      วันที่
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-gray-300 hover:border-blue-500 transition-colors",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Clock className="mr-2" size={18} />
                      เวลาเริ่มต้น
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกเวลาเริ่มต้น" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(24)].map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Clock className="mr-2" size={18} />
                      เวลาสิ้นสุด
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกเวลาสิ้นสุด" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(24)].map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Users className="mr-2" size={18} />
                      จำนวนผู้เข้าร่วม
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setParticipants(e.target.value);
                        }}
                        className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Building className="mr-2" size={18} />
                      ตึก
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedBuilding(value);
                      }}
                      value={field.value}
                      disabled={!participants}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกตึก" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings?.map((building) => (
                          <SelectItem
                            key={building.BDNUMBER}
                            value={building.BDNUMBER.toString()}
                          >
                            {building.BDNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Layers className="mr-2" size={18} />
                      ชั้น
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedFloor(value);
                      }}
                      value={field.value}
                      disabled={!selectedBuilding}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกชั้น" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {floors?.map((floor) => (
                          <SelectItem
                            key={floor.FLNUMBER}
                            value={floor.FLNUMBER.toString()}
                          >
                            {floor.FLNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <DoorOpen className="mr-2" size={18} />
                      ห้อง
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedFloor}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกห้อง" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms?.map((room) => (
                          <SelectItem
                            key={room.CFRNUMBER}
                            value={room.CFRNUMBER.toString()}
                          >
                            {room.CFRNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
            >
              จองห้อง
            </Button>
          </form>
        </Form>
        <QRCodeDisplay bookingData={bookingData} />
      </CardContent>
    </Card>
  );
};

export default BookingSection;
