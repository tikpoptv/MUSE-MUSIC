"use client";

import { Button } from "@/components/ui/button";

export default function ShadcnDemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-2">ตัวอย่าง shadcn/ui Components</h1>
      <p className="mb-8 text-gray-200">หน้านี้สาธิตตัวอย่างการใช้งานปุ่ม (Button) จาก shadcn/ui สามารถ copy style หรือแก้ได้อิสระ</p>
      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">Icon</Button>
      </div>
      <div className="mt-12 max-w-xl text-gray-300 text-left">
        <h2 className="text-2xl font-semibold mb-2">วิธีใช้งาน</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>ติดตั้ง <b>shadcn/ui</b> ด้วยคำสั่ง <code className="bg-black px-2 rounded">npx shadcn@latest init -y</code></li>
          <li>เพิ่มปุ่มหรือ component ที่ต้องการ เช่น <code className="bg-black px-2 rounded">npx shadcn@latest add button</code></li>
          <li>import ลงในไฟล์ <code className="bg-black px-2 rounded">import &#123; Button &#125; from &quot;@/components/ui/button&quot;</code></li>
          <li>สามารถเปลี่ยน style ปรับแต่ง className ได้ตามใจ</li>
        </ol>
        <p className="mt-4">สามารถเพิ่ม component เพิ่มเติม (เช่น Dialog, Input ฯลฯ) ด้วย CLI ของ shadcn ได้เลย</p>
      </div>
      <a
        href="/shadcn-demo/chart"
        className="mt-12 inline-block px-6 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition font-semibold shadow border border-cyan-900/30"
        style={{ pointerEvents: 'auto' }}
      >
        ดูตัวอย่างกราฟ Recharts
      </a>
    </div>
  );
}
