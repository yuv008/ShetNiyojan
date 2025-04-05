import { Activity, AlertTriangle, Check, Droplets, Sprout, Thermometer, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

type LogEntry = {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  message: string;
  time: string;
  icon: typeof Activity;
};

// Sample data - in a real app, this would come from a database
const activityLogs: LogEntry[] = [
  {
    id: "log1",
    type: "alert",
    message: "Temperature sensor TH011 reporting signal issue",
    time: "08:02 AM",
    icon: AlertTriangle,
  },
  {
    id: "log2",
    type: "success",
    message: "Irrigation completed in Spinach Garden 08",
    time: "07:45 AM",
    icon: Droplets,
  },
  {
    id: "log3",
    type: "info",
    message: "Soil moisture level optimal at 65%",
    time: "06:30 AM",
    icon: Check,
  },
  {
    id: "log4",
    type: "warning",
    message: "Wind speed increased to 4.5 m/s",
    time: "Yesterday",
    icon: Wind,
  },
  {
    id: "log5",
    type: "info",
    message: "New crop planted: Corn - 20.2 acres",
    time: "Yesterday",
    icon: Sprout,
  },
];

const iconColors = {
  alert: "text-red-500 bg-red-100",
  info: "text-blue-500 bg-blue-100",
  success: "text-green-500 bg-green-100",
  warning: "text-yellow-500 bg-yellow-100",
};

const ActivityLog = () => {
  return (
    <div className="space-y-4">
      {activityLogs.map((log) => (
        <div key={log.id} className="flex items-start gap-3">
          <div className={cn("p-2 rounded-full", iconColors[log.type])}>
            <log.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{log.message}</p>
            <p className="text-xs text-muted-foreground">{log.time}</p>
          </div>
        </div>
      ))}
      <button className="text-sm flex items-center justify-center w-full text-muted-foreground hover:text-green-600 transition-colors mt-2">
        View all activity <ArrowUpRight className="ml-1 h-3 w-3" />
      </button>
    </div>
  );
};

export default ActivityLog;