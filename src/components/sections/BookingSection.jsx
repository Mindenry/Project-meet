import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
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

const BookingSection = () => {
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

  const onSubmit = (data) => {
    console.log("Booking submitted:", data);
    toast.success("การจองสำเร็จ!");
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
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-700 font-medium mb-2">
                      <Building className="mr-2" size={18} />
                      ตึก
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกตึก" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">ตึก A</SelectItem>
                        <SelectItem value="B">ตึก B</SelectItem>
                        <SelectItem value="C">ตึก C</SelectItem>
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกชั้น" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            ชั้น {floor}
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="เลือกห้อง" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="101">101</SelectItem>
                        <SelectItem value="102">102</SelectItem>
                        <SelectItem value="103">103</SelectItem>
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
                        className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                      />
                    </FormControl>
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
      </CardContent>
    </Card>
  );
};

export default BookingSection;
