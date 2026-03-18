import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { word } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは「存在しない言葉辞典」のAIです。
入力された言葉「${word}」について判断してください。

ルール：
- 日本語として実在する言葉 →「reject」
- 存在しない造語・新語 →「accept」して辞書的定義を創作

acceptの場合：
{"status":"accept","word":"${word}","reading":"よみがな","meaning":"意味（2〜3文）","usage":"品詞と使い方","example":"例文1文"}

rejectの場合：
{"status":"reject","word":"${word}"}

JSONのみで返答してください。`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data));
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("text:", text);
  
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return NextResponse.json(parsed);
}