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
  Download,
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
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const data = labels.map(() => Math.floor(Math.random() * 1000));
  return {
    labels,
    datasets: [
      {
        label: "Monthly Sales",
        data,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card className="transition-all duration-200 hover:shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Your business analytics and performance metrics
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={5.75}
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions.toLocaleString()}
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

      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Sales Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      boxWidth: 10,
                      usePointStyle: true,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "white",
                    titleColor: "black",
                    bodyColor: "black",
                    borderColor: "rgb(229, 231, 235)",
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                      label: (context) => `฿${context.parsed.y.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      callback: (value) => `฿${value.toLocaleString()}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeSection;