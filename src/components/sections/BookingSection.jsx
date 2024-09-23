import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Calendar, Clock, Users, DoorOpen } from "lucide-react";
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

const BookingSection = () => {
  const form = useForm({
    defaultValues: {
      date: "",
      time: "",
      room: "",
      participants: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Booking submitted:", data);
    toast.success("การจองสำเร็จ!");
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>จองห้องประชุม</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Calendar className="inline-block mr-2" size={18} />
                    วันที่
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Clock className="inline-block mr-2" size={18} />
                    เวลา
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <DoorOpen className="inline-block mr-2" size={18} />
                    ห้อง
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกห้อง" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A101">A101</SelectItem>
                      <SelectItem value="B202">B202</SelectItem>
                      <SelectItem value="C303">C303</SelectItem>
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
                  <FormLabel>
                    <Users className="inline-block mr-2" size={18} />
                    จำนวนผู้เข้าร่วม
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">จองห้อง</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingSection;
