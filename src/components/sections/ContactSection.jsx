import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Phone, Send, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";

const ContactSection = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("ข้อความถูกส่งเรียบร้อยแล้ว!");
        form.reset();
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองอีกครั้ง");
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">ติดต่อเรา</CardTitle>
        <CardDescription className="text-gray-100">
          เรายินดีรับฟังความคิดเห็นของคุณ โปรดติดต่อเราได้ตามช่องทางด้านล่าง
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                ข้อมูลการติดต่อ
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-gray-700">suportmeeting@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-gray-700">+66 9-999-9999</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl shadow-md text-white">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                เวลาทำการ
              </h3>
              <p>จันทร์ - ศุกร์: 9:00 - 18:00</p>
              <p>เสาร์ - อาทิตย์: 10:00 - 16:00</p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="bg-white rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หัวข้อ</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ข้อความ</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-24 bg-white rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
              >
                <Send className="mr-2" size={18} />
                ส่งข้อความ
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
