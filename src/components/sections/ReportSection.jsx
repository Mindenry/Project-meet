import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReportSection = () => {
  const [reportType, setReportType] = useState("daily");

  const generateRandomData = (count) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 100));
  };

  const chartData = {
    daily: {
      labels: [
        "จันทร์",
        "อังคาร",
        "พุธ",
        "พฤหัสบดี",
        "ศุกร์",
        "เสาร์",
        "อาทิตย์",
      ],
      datasets: [
        {
          label: "การจองรายวัน",
          data: generateRandomData(7),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    },
    weekly: {
      labels: ["สัปดาห์ที่ 1", "สัปดาห์ที่ 2", "สัปดาห์ที่ 3", "สัปดาห์ที่ 4"],
      datasets: [
        {
          label: "การจองรายสัปดาห์",
          data: generateRandomData(4),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    },
    monthly: {
      labels: [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ],
      datasets: [
        {
          label: "การจองรายเดือน",
          data: generateRandomData(12),
          backgroundColor: "rgba(255, 159, 64, 0.6)",
        },
      ],
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `รายงานการจอง${
          reportType === "daily"
            ? "รายวัน"
            : reportType === "weekly"
            ? "รายสัปดาห์"
            : "รายเดือน"
        }`,
      },
    },
  };

  const lineChartData = {
    labels: [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ],
    datasets: [
      {
        label: "อัตราการใช้งานห้องประชุม",
        data: generateRandomData(12),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">รายงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกประเภทรายงาน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">รายงานประจำวัน</SelectItem>
              <SelectItem value="weekly">รายงานประจำสัปดาห์</SelectItem>
              <SelectItem value="monthly">รายงานประจำเดือน</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <Bar options={options} data={chartData[reportType]} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "อัตราการใช้งานห้องประชุมรายเดือน",
                  },
                },
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSection;
