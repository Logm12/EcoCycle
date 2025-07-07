// functions/chat.js (PHIÊN BẢN DÙNG GOOGLE GEMINI PRO)

exports.handler = async function(event, context) {
    // Chỉ cho phép phương thức POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        // Lấy API key của Google từ biến môi trường của Netlify
        const apiKey = process.env.GOOGLE_API_KEY; 

        if (!apiKey) {
            throw new Error("API Key của Google chưa được thiết lập trên Netlify.");
        }

        // Endpoint của Gemini Pro. Lưu ý key được truyền qua URL.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Cấu trúc nội dung của Gemini khác với OpenAI
                "contents": [
                    {
                        "parts": [
                            // Đây là "system prompt" để định hướng cho AI
                            { "text": "Bạn là Ecocycle Bot, một trợ lý ảo thân thiện và hữu ích của công ty thu mua phế liệu ECOCYCLE. Hãy trả lời các câu hỏi của người dùng một cách ngắn gọn, tập trung vào các dịch vụ của công ty như: thu mua phế liệu, bảng giá, địa điểm, cách đăng tin. Nếu không biết, hãy nói rằng bạn sẽ kết nối họ với nhân viên hỗ trợ." },
                            // Đây là tin nhắn thực tế của người dùng
                            { "text": `Câu hỏi của khách: ${message}` }
                        ]
                    }
                ],
                // Cấu hình an toàn và các tham số khác cho Gemini
                "safetySettings": [
                    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Lỗi từ API Google:", errorData);
            throw new Error("Có lỗi xảy ra khi giao tiếp với AI của Google.");
        }

        const data = await response.json();
        // Cách lấy câu trả lời của Gemini cũng khác
        const botReply = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botReply })
        };

    } catch (error) {
        console.error("Lỗi trong hàm serverless:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};