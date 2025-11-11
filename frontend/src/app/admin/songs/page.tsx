import AdminMenu from "@/components/AdminMenu";
import { Pencil, SquareDashedMousePointer } from "lucide-react";

const songs = [
    { id: 1, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
    { id: 2, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
    { id: 3, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
    { id: 4, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
    { id: 5, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
    { id: 6, code: "CN", engName: "Pretty Please", songName: "하츠투하츠", language: "Korean", status: "Not Approve", checked: true, highlight: true },
    { id: 7, code: "CN", engName: "Name", songName: "Table cell", language: "Table cell", status: "Table cell", checked: false },
];

export default function Page() {
    return (
        <AdminMenu>
            <div>
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <path d="M13.5 27V7.5L31.5 4.5V24" stroke="#7B61FF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 31.5C11.4853 31.5 13.5 29.4853 13.5 27C13.5 24.5147 11.4853 22.5 9 22.5C6.51472 22.5 4.5 24.5147 4.5 27C4.5 29.4853 6.51472 31.5 9 31.5Z" stroke="#7B61FF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M27 28.5C29.4853 28.5 31.5 26.4853 31.5 24C31.5 21.5147 29.4853 19.5 27 19.5C24.5147 19.5 22.5 21.5147 22.5 24C22.5 26.4853 24.5147 28.5 27 28.5Z" stroke="#7B61FF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p
                        className="text-[20px] font-semibold"
                        style={{
                        color: "#7B61FF",
                        textAlign: "left",
                        fontFamily: "Inter",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        }}>
                            Song Approved
                    </p>
                </div>
                <div className="mt-6 flex w-[420px] items-center gap-8 rounded-2xl border border-[#E3E6EF] bg-white px-8 py-4 shadow-[0px_20px_40px_rgba(114,116,141,0.08)]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F0FF] text-[#7B61FF]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M8 11L10 13L14 9" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21.0002L16.7 16.7002" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span 
                            style={{
                                color: "#A2A2A2",
                                fontFamily: "Inter",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: "400",
                                lineHeight: "normal"
                            }}
                        >
                            Have to approve
                        </span>
                        <span
                            style={{
                                color: "#000",
                                fontFamily: "Inter",
                                fontSize: "24px",
                                fontStyle: "normal",
                                fontWeight: 600,
                                lineHeight: "normal",
                            }}
                        >
                            12
                        </span>
                        <span 
                            style={{
                                    color: "#A2A2A2",
                                    fontFamily: "Inter",
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: "400",
                                    lineHeight: "normal"
                                }}
                        >songs</span>
                    </div>
                </div>
                <div className="mt-6 rounded-[32px] border border-[#E3E6EF] bg-white p-8">
                    <div className="flex items-center justify-between">
                        <span
                            style={{
                                color: "#0F172A",
                                fontFamily: "Inter",
                                fontSize: "28px",
                                fontStyle: "normal",
                                fontWeight: 600,
                                lineHeight: "normal",
                            }}
                        >
                            Songs
                        </span>
                        <div className="flex items-center gap-4">
                            <span
                                style={{
                                    color: "#000",
                                    fontFamily: "Inter",
                                    fontSize: "16px",
                                    fontStyle: "normal",
                                    fontWeight: 500,
                                    lineHeight: "normal",
                                }}
                            >
                                Status:
                            </span>
                            <span
                                style={{
                                    display: "flex",
                                    width: "122px",
                                    height: "38px",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderRadius: "50px",
                                    background: "#FD7D2E",
                                    padding: "0 16px",
                                    color: "#FFF",
                                    fontFamily: "Inter",
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "normal",
                                }}
                            >
                                Not Approve
                            </span>
                            <span
                                style={{
                                    display: "flex",
                                    width: "88px",
                                    height: "38px",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "50px",
                                    background: "#CFF6D4",
                                    padding: "0 16px",
                                    color: "#1E5A2D",
                                    fontFamily: "Inter",
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    lineHeight: "normal",
                                }}
                            >
                                Done
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 overflow-hidden rounded-3xl border border-[#E7E7E7]">
                        <table className="min-w-full border-collapse text-left">
                        <thead className="bg-[#F9FAF8] text-xs font-semibold uppercase tracking-wide text-[#475467]">
                            <tr>
                                <th className="w-12 px-6 py-4">
                                    <input type="checkbox" className="h-4 w-4 rounded border-[#CBD2E0]" />
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#0F172A]">
                                    Song Name (ENG) <span className="text-[#94A3B8]">↕</span>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#0F172A]">
                                    Song Name <span className="text-[#94A3B8]">↕</span>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#0F172A]">Language</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#0F172A]">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.map((song) => (
                                <tr
                                    key={song.id}
                                    className={`border-b border-[#F2F2F2] ${
                                        song.highlight ? "bg-[#ECECEC]" : "bg-white"
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={song.checked}
                                                readOnly
                                                className="h-4 w-4 rounded border-[#CBD2E0] focus:ring-0"
                                                style={{ accentColor: song.highlight ? "#000" : "#E2E8F0" }}
                                            />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF0F5] text-sm font-semibold text-[#111827]">
                                                {song.code}
                                            </div>
                                            <div className="text-sm font-semibold text-[#111827]">{song.engName}</div>
                                        </div>
                                    </td>
                                    <td
                                        className={`px-6 py-4 text-sm ${
                                            song.highlight ? "text-[#1D4ED8] underline" : "text-[#475467]"
                                        }`}
                                    >
                                        {song.songName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#475467]">{song.language}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-sm font-medium text-[#111827]">
                                                {song.highlight ? "Not Approve" : song.status}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 text-sm font-semibold text-[#111827]"
                                                >
                                                    <Pencil size={16} strokeWidth={1.5} /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded-lg border border-dashed border-[#CBD2E0] p-2 text-[#94A3B8]"
                                                    aria-label="Open song detail"
                                                >
                                                    <SquareDashedMousePointer size={16} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </AdminMenu>
    );
}
