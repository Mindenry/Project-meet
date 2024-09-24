import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Phone, MessageSquare } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ติดต่อเรา</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8 space-y-2">
          <div className="flex items-center">
            <Mail className="mr-3 text-blue-500" />
            <span>mindenrymmd@gmail.com</span>
          </div>
          <div className="flex items-center">
            <Phone className="mr-3 text-blue-500" />
            <span>+66 9-999-9999</span>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
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
                    <Input {...field} />
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
                    <Textarea {...field} className="h-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <MessageSquare className="mr-2" size={18} />
              ส่งข้อความ
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
