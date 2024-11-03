"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getCallLogs, CallLog, getCampaign } from "../utils/db";
import {
  ArrowLeft,
  PhoneCall,
  Clock,
  Target,
  PhoneOff,
  X,
  PieChart as PieChartIcon,
} from "lucide-react";

const useCampaignData = (id: string | undefined) => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const [logs, campaign] = await Promise.all([
            getCallLogs(parseInt(id, 10)),
            getCampaign(parseInt(id, 10)),
          ]);
          setCallLogs(logs);
          setCampaignTitle(campaign?.title || "Campaign");
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load campaign data. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  return { callLogs, campaignTitle, loading, error };
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

const ChartCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
    <div className="flex items-center space-x-2 mb-4">
      {icon}
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="h-[400px]">{children}</div>
  </div>
);

const CallLogTable: React.FC<{
  callLogs: CallLog[];
  onRowClick: (log: CallLog) => void;
}> = ({ callLogs, onRowClick }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Call Logs</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Phone Number",
              "First Name",
              "Call ID",
              "Disconnection Reason",
              "Duration",
              "Sentiment",
            ].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {callLogs.map((log, index) => (
            <tr
              key={log.id || index}
              onClick={() => onRowClick(log)}
              className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {log.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.firstName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.callId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.disconnection_reason || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.call_duration?.toFixed(2)} sec
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {log.user_sentiment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CallDetailsModal: React.FC<{
  callLog: CallLog | null;
  onClose: () => void;
}> = ({ callLog, onClose }) => {
  if (!callLog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Call Details</h2>
        {[
          { label: "Phone Number", value: callLog.phoneNumber },
          { label: "First Name", value: callLog.firstName },
          { label: "Call ID", value: callLog.callId },
          {
            label: "Disconnection Reason",
            value: callLog.disconnection_reason || "N/A",
          },
          { label: "Start Time", value: callLog.start_time || "N/A" },
          {
            label: "Call Duration",
            value: `${callLog.call_duration.toFixed(2)} sec`,
          },
          { label: "User Sentiment", value: callLog.user_sentiment },
        ].map(({ label, value }) => (
          <p key={label} className="mb-2">
            <span className="font-semibold text-gray-700">{label}:</span>{" "}
            {value}
          </p>
        ))}
        <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          Call Summary
        </h3>
        <p className="text-gray-600 mb-4">
          {callLog.call_summary || "No summary available"}
        </p>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Call Transcript
        </h3>
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg text-gray-800 text-sm mb-4">
          {callLog.call_transcript || "No transcript available"}
        </pre>
        {callLog.call_recording && (
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Call Recording
            </h3>
            <audio controls src={callLog.call_recording} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

const CustomPieChart: React.FC<{
  data: { name: string; value: number }[];
  innerRadius?: number;
}> = ({ data, innerRadius = 0 }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
        label={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend layout="vertical" align="right" verticalAlign="middle" />
    </PieChart>
  </ResponsiveContainer>
);

export default function Component() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { callLogs, campaignTitle, loading, error } = useCampaignData(id);
  const [selectedCallLog, setSelectedCallLog] = useState<CallLog | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-red-500 font-semibold text-xl">{error}</p>
        </div>
      </div>
    );
  }

  const totalCalls = callLogs.length;
  const hitCalls = callLogs.filter((log) =>
    ["agent_hangup", "user_hangup", "call_transfer"].includes(
      log.disconnection_reason,
    ),
  ).length;
  const hitRate = (hitCalls / totalCalls) * 100;
  const unansweredCalls = totalCalls - hitCalls;
  const averageCallDuration =
    callLogs.reduce((sum, log) => sum + log.call_duration, 0) / totalCalls;

  const disconnectionReasonData = callLogs.reduce(
    (acc, log) => {
      const reason = log.disconnection_reason || "Unknown";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const disconnectionReasonChartData = Object.entries(
    disconnectionReasonData,
  ).map(([name, value]) => ({ name, value }));

  const sentimentData = callLogs.reduce(
    (acc, log) => {
      acc[log.user_sentiment] = (acc[log.user_sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sentimentChartData = Object.entries(sentimentData).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            {campaignTitle} Analytics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<PhoneCall size={24} className="text-white" />}
            value={totalCalls}
            label="Total Calls"
            color="bg-blue-500"
          />
          <StatCard
            icon={<Target size={24} className="text-white" />}
            value={`${hitRate.toFixed(2)}%`}
            label="Hit Rate"
            color="bg-green-500"
          />
          <StatCard
            icon={<PhoneOff size={24} className="text-white" />}
            value={unansweredCalls}
            label="Unanswered Calls"
            color="bg-red-500"
          />
          <StatCard
            icon={<Clock size={24} className="text-white" />}
            value={`${averageCallDuration.toFixed(2)} sec`}
            label="Avg. Call Duration"
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title="Disconnection Reasons"
            icon={<PieChartIcon size={24} className="text-blue-500" />}
          >
            <CustomPieChart data={disconnectionReasonChartData} />
          </ChartCard>
          <ChartCard
            title="User Sentiment"
            icon={<PieChartIcon size={24} className="text-green-500" />}
          >
            <CustomPieChart data={sentimentChartData} innerRadius={60} />
          </ChartCard>
        </div>

        <CallLogTable callLogs={callLogs} onRowClick={setSelectedCallLog} />
      </div>

      <CallDetailsModal
        callLog={selectedCallLog}
        onClose={() => setSelectedCallLog(null)}
      />
    </div>
  );
}
