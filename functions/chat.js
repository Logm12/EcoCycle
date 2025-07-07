// functions/chat.js (PHIÊN BẢN GOOGLE GEMINI VỚI NÚT HÀNH ĐỘNG)

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GOOGLE_API_KEY; 

        if (!apiKey) {
            throw new Error("API Key của Google chưa được thiết lập.");
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            // --- MỆNH LỆNH HỆ THỐNG ĐÃ ĐƯỢC NÂNG CẤP CHO GEMINI ---
                            { "text": `Bạn là Ecocycle Bot, một trợ lý ảo của công ty phế liệu ECOCYCLE.
                            - Nhiệm vụ của bạn là trả lời câu hỏi của người dùng.
                            - QUAN TRỌNG: Nếu câu trả lời của bạn có liên quan đến một trang cụ thể trên web, bạn BẮT BUỘC phải trả lời bằng một chuỗi JSON hợp lệ.
                            - Định dạng JSON phải là: {"text": "lời thoại của bạn", "actions": [{"label": "Tên nút", "type": "navigate", "value": "tên-file.html"}]}
                            - Ví dụ: Nếu người dùng hỏi "giá sắt bao nhiêu", bạn phải trả lời là: {"text": "Bạn có thể xem bảng giá chi tiết của chúng tôi tại đây nhé.", "actions": [{"label": "Xem Bảng Giá", "type": "navigate", "value": "pricelist.html"}]}
                            - Các trang có sẵn để điều hướng là: pricelist.html (bảng giá), diadiem.html (bản đồ địa điểm), post-ad.html (đăng tin).
                            - Nếu câu hỏi không liên quan đến việc điều hướng, hãy trả lời bằng văn bản thuần túy.` 
                            },
                            // Đây là tin nhắn thực tế của người dùng
                            { "text": `Câu hỏi của khách: ${message}` }
                        ]
                    }
                ],
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
            throw new Error("Có lỗi xảy ra khi giao tiếp với AI của Google.");
        }

        const data = await response.json();
        const botReplyContent = data.candidates[0].content.parts[0].text;

        // Xử lý để đảm bảo đầu ra luôn là JSON hợp lệ cho front-end
        let finalReply;
        try {
            // Thử phân tích chuỗi JSON từ AI
            finalReply = JSON.parse(botReplyContent);
        } catch (e) {
            // Nếu AI trả về văn bản thuần, bọc nó trong cấu trúc JSON mặc định
            finalReply = { text: botReplyContent, actions: [] };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: finalReply })
        };

    } catch (error) {
        console.error("Lỗi trong hàm serverless:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};