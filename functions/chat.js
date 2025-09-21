// functions/chat.js
import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Key của Google (GEMINI_API_KEY) chưa được thiết lập.");
    }

    // Tạo client Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Cấu hình sinh text
    const config = {
      temperature: 0.3,
      topP: 0.25,
      thinkingConfig: { thinkingBudget: -1 },
    };

    const model = "gemini-2.5-pro";

    // Prompt: giữ quy tắc JSON + điều hướng
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Bạn là Ecocycle Bot, trợ lý ảo của công ty phế liệu ECOCYCLE.
- Nếu câu trả lời có liên quan đến điều hướng, bạn BẮT BUỘC trả về JSON hợp lệ:
{"text": "...", "actions":[{"label":"Tên nút","type":"navigate","value":"file.html"}]}
- Các trang có sẵn: pricelist.html (bảng giá), diadiem.html (địa điểm), post-ad.html (đăng tin).
- Nếu không liên quan điều hướng thì chỉ trả về text thuần.
Câu hỏi của khách: ${message}`
          }
        ],
      },
    ];

    // Gọi API Gemini 2.5
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    // Lấy text trả lời từ AI
    const botReplyContent = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let finalReply;
    try {
      // Nếu AI trả về JSON
      finalReply = JSON.parse(botReplyContent);
    } catch {
      // Nếu AI trả về text thuần
      finalReply = { text: botReplyContent, actions: [] };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: finalReply }),
    };

  } catch (error) {
    console.error("Lỗi trong chat.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
