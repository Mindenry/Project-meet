import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Activity,
  DollarSign,
  Percent,
} from "lucide-react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const fetchStats = async () => {
  const response = await axios.get("http://localhost:8080/members");
  const totalUsers = response.data.length;
  return {
    totalUsers,
    activeSessions: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 1000000),
    conversionRate: (Math.random() * 10).toFixed(2),
  };
};

const fetchChartData = async () => {
  // Simulating API call
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const data = labels.map(() => Math.floor(Math.random() * 1000));
  return {
    labels,
    datasets: [
      {
        label: "Monthly Sales",
        data,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
        fill: true,
      },
    ],
  };
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p
          className={`text-xs ${
            trend > 0 ? "text-green-500" : "text-red-500"
          } flex items-center mt-1`}
        >
          {trend > 0 ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {Math.abs(trend)}% from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const HomeSection = () => {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    initialData: {
      totalUsers: 0,
      activeSessions: 0,
      revenue: 0,
      conversionRate: 0,
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["chartData"],
    queryFn: fetchChartData,
    initialData: {
      labels: [],
      datasets: [],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <Button>Download Report</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={5.75}
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={Activity}
          trend={-2.34}
        />
        <StatCard
          title="Revenue"
          value={`฿${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={10.2}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={Percent}
          trend={3.1}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Monthly Sales Overview",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeSection;
