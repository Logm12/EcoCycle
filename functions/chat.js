// functions/chat.js (PHIÊN BẢN CẬP NHẬT VỚI GEMINI 2.5 PRO & SDK)

// Yêu cầu: Bạn cần cài đặt thư viện của Google
// Chạy lệnh: npm install @google/genai
const { GoogleGenerativeAI } = require("@google/genai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        // Vẫn sử dụng biến môi trường GOOGLE_API_KEY từ code gốc
        const apiKey = process.env.GOOGLE_API_KEY; 

        if (!apiKey) {
            throw new Error("API Key của Google chưa được thiết lập.");
        }

        // 1. Khởi tạo SDK
        const genAI = new GoogleGenerativeAI(apiKey);

        // 2. Chọn model và cấu hình
        // Lưu ý: Đảm bảo tài khoản của bạn có quyền truy cập model "gemini-2.5-pro".
        // Nếu không, bạn có thể dùng "gemini-1.5-pro-latest" làm phương án thay thế ổn định.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-pro",
            // Mệnh lệnh hệ thống được đưa vào đây để có hiệu quả tốt hơn
            systemInstruction: `Bạn là Ecocycle Bot, một trợ lý ảo của công ty phế liệu ECOCYCLE.
- Nhiệm vụ của bạn là trả lời câu hỏi của người dùng.
- QUAN TRỌNG: Nếu câu trả lời của bạn có liên quan đến một trang cụ thể trên web, bạn BẮT BUỘC phải trả lời bằng một chuỗi JSON hợp lệ.
- Định dạng JSON phải là: {"text": "lời thoại của bạn", "actions": [{"label": "Tên nút", "type": "navigate", "value": "tên-file.html"}]}
- Ví dụ: Nếu người dùng hỏi "giá sắt bao nhiêu", bạn phải trả lời là: {"text": "Bạn có thể xem bảng giá chi tiết của chúng tôi tại đây nhé.", "actions": [{"label": "Xem Bảng Giá", "type": "navigate", "value": "pricelist.html"}]}
- Các trang có sẵn để điều hướng là: pricelist.html (bảng giá), diadiem.html (bản đồ địa điểm), post-ad.html (đăng tin).
- Nếu câu hỏi không liên quan đến việc điều hướng, hãy trả lời bằng văn bản thuần túy.`
        });

        const generationConfig = {
            temperature: 0.3,
            topP: 0.65,
        };

        const safetySettings = [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ];

        // 3. Gọi API để tạo nội dung (phiên bản không stream)
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig,
            safetySettings
        });

        const response = result.response;
        const botReplyContent = response.text();

        // Xử lý để đảm bảo đầu ra luôn là JSON hợp lệ cho front-end (LOGIC QUAN TRỌNG ĐƯỢC GIỮ NGUYÊN)
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
