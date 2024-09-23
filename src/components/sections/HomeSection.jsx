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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Activity,
  DollarSign,
  Percent,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

const fetchRecentActivities = async () => {
  // Simulating API call
  return [
    { id: 1, user: "John Doe", action: "Logged in", time: "2 minutes ago" },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated profile",
      time: "5 minutes ago",
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "Made a purchase",
      time: "10 minutes ago",
    },
    {
      id: 4,
      user: "Alice Brown",
      action: "Sent a message",
      time: "15 minutes ago",
    },
    {
      id: 5,
      user: "Charlie Wilson",
      action: "Viewed a product",
      time: "20 minutes ago",
    },
  ];
};

const fetchTopPerformers = async () => {
  // Simulating API call
  return [
    { id: 1, name: "Emma Thompson", sales: 15000, target: 20000 },
    { id: 2, name: "Michael Chen", sales: 12000, target: 15000 },
    { id: 3, name: "Sophia Rodriguez", sales: 10000, target: 12000 },
    { id: 4, name: "Liam O'Connor", sales: 9000, target: 10000 },
    { id: 5, name: "Olivia Kim", sales: 8000, target: 10000 },
  ];
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
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

const RecentActivities = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activities</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px] pr-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4 mb-4">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${activity.user}`}
              />
              <AvatarFallback>
                {activity.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{activity.user}</p>
              <p className="text-xs text-gray-500">{activity.action}</p>
            </div>
            <span className="text-xs text-gray-400 ml-auto">
              {activity.time}
            </span>
          </div>
        ))}
      </ScrollArea>
    </CardContent>
  </Card>
);

const TopPerformers = ({ performers }) => (
  <Card>
    <CardHeader>
      <CardTitle>Top Performers</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {performers.map((performer) => (
          <div key={performer.id} className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${performer.name}`}
              />
              <AvatarFallback>
                {performer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{performer.name}</p>
              <Progress
                value={(performer.sales / performer.target) * 100}
                className="h-2 mt-2"
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                ฿{performer.sales.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                / ฿{performer.target.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
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

  const { data: activities } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: fetchRecentActivities,
    initialData: [],
  });

  const { data: performers } = useQuery({
    queryKey: ["topPerformers"],
    queryFn: fetchTopPerformers,
    initialData: [],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 md:grid-cols-2">
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
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
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
          </CardContent>
        </Card>
        <RecentActivities activities={activities} />
      </div>
      <TopPerformers performers={performers} />
    </div>
  );
};

export default HomeSection;
