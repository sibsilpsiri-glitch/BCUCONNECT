import { NextResponse } from "next/server";
import OpenAI from "openai";

// ต้องใส่ API Key ในไฟล์ .env ของโปรเจกต์
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. ถอดเสียงด้วย Whisper
    const transcriptResponse = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "th", // ระบุภาษาไทยเพื่อเพิ่มความแม่นยำ
      response_format: "text",
    });

    const transcript = transcriptResponse as unknown as string;

    // 2. สรุปผลด้วย GPT-4o
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "คุณคือเลขานุการมืออาชีพ หน้าที่ของคุณคือการสรุปรายงานการประชุมจากข้อความที่ถอดเสียงมา ให้สรุปเป็นหัวข้อ (Bullet points) ประเด็นสำคัญ และสิ่งที่ต้องทำต่อ (Action Items) ใช้ภาษาไทยที่เป็นทางการและกระชับ",
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.3,
    });

    const summary = summaryResponse.choices[0].message.content;

    return NextResponse.json({ transcript, summary });

  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}