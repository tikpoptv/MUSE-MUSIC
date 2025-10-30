"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const dataBarLine = [
  { name: "ม.ค.", uv: 4000, pv: 2400, amt: 2400 },
  { name: "ก.พ.", uv: 3000, pv: 1398, amt: 2210 },
  { name: "มี.ค.", uv: 2000, pv: 9800, amt: 2290 },
  { name: "เม.ย.", uv: 2780, pv: 3908, amt: 2000 },
  { name: "พ.ค.", uv: 1890, pv: 4800, amt: 2181 },
  { name: "มิ.ย.", uv: 2390, pv: 3800, amt: 2500 },
  { name: "ก.ค.", uv: 3490, pv: 4300, amt: 2100 },
];

const dataPie = [
  { name: "Pop", value: 400 },
  { name: "Rock", value: 300 },
  { name: "Hip-Hop", value: 300 },
  { name: "Indie", value: 200 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ShadcnChartDemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center pt-12 pb-20 bg-gradient-to-br from-slate-900 via-black to-slate-800 px-4">
      <h1 className="text-4xl font-bold text-white mb-2">ตัวอย่างกราฟด้วย Recharts</h1>
      <p className="mb-8 text-gray-200 max-w-xl text-center">
        สาธิตการแสดงผลกราฟ <b>Bar, Line, Pie</b> ด้วย <b>recharts</b> สำหรับ React/Next.js ใช้งานง่าย ปรับแต่งได้ตามใจ ทดลองแก้ไขข้อมูล/โค้ดได้เลย!
      </p>
      <div className="w-full max-w-2xl flex flex-col gap-12 mb-8">
        <div>
          <h2 className="text-2xl text-white mb-2">กราฟแท่ง (Bar Chart)</h2>
          <div className="bg-white/10 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataBarLine} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" name="ยอดวิว (pv)"/>
                <Bar dataKey="uv" fill="#90EE90" name="ยอดผู้ใช้ (uv)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="text-2xl text-white mb-2">กราฟเส้น (Line Chart)</h2>
          <div className="bg-white/10 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dataBarLine} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uv" stroke="#8884d8" activeDot={{ r: 8 }} name="ยอดผู้ใช้ (uv)" />
                <Line type="monotone" dataKey="pv" stroke="#82ca9d" name="ยอดวิว (pv)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="text-2xl text-white mb-2">กราฟวงกลม (Pie Chart)</h2>
          <div className="bg-white/10 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dataPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {dataPie.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Link
        href="/shadcn-demo"
        className="mt-8 inline-block px-6 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg transition font-semibold"
      >
        ← กลับหน้ารวมตัวอย่าง shadcn/ui
      </Link>
    </div>
  );
}
