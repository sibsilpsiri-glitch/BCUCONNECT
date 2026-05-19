"use client";

import { useState } from "react";
import { UploadCloud, FileAudio, CheckCircle2, Loader2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ transcript: string; summary: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    
    // โค้ดส่วนนี้จะส่งไฟล์ไปยัง API ของเรา
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">BCU<span className="text-zinc-400">CONNECT</span></h1>
        <p className="mt-2 text-zinc-500">แพลตฟอร์มถอดเทปและสรุปการประชุมอัจฉริยะ</p>
      </header>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 transition-all">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-12 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
          <UploadCloud className="w-10 h-10 text-zinc-400 mb-4"/>
          <p className="text-sm text-zinc-600 mb-4">อัปโหลดไฟล์เสียงการประชุมของคุณ (MP3, WAV, M4A)</p>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange} 
            className="hidden" 
            id="audio-upload"
          />
          <label 
            htmlFor="audio-upload" 
            className="cursor-pointer bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition"
          >
            เลือกไฟล์เสียง
          </label>
          {file && (
            <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
              <FileAudio className="w-4 h-4"/>
              <span>{file.name}</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3.5 rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle2 className="w-5 h-5"/>}
          {isLoading ? "กำลังประมวลผลด้วย AI..." : "เริ่มถอดเทปและสรุปผล"}
        </button>
      </section>

      {result && (
        <section className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 border-b pb-4">สรุปการประชุม (Executive Summary)</h2>
            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 border-b pb-4">เนื้อหาที่ถอดความทั้งหมด (Full Transcript)</h2>
            <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap text-sm">
              {result.transcript}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}