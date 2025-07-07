// js/chatbot.js (PHIÊN BẢN ĐƠN GIẢN VỚI ICON TRÒN)
document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'vendor') return;

    // --- CÁC BIẾN DOM ĐÃ ĐƯỢC ĐƠN GIẢN HÓA ---
    const chatbotToggler = document.getElementById("chatbot-toggle-btn");
    const chatbot = document.querySelector(".chatbot");
    const closeBtn = document.querySelector(".chatbot .close-btn");
    const chatbox = document.querySelector(".chatbot .chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Nếu không tìm thấy các element cần thiết, thoát để tránh lỗi
    if (!chatbotToggler || !chatbot || !closeBtn) return;

    let userMessage;

    // --- LOGIC ĐIỀU KHIỂN GIAO DIỆN ---
    chatbotToggler.addEventListener("click", () => chatbot.classList.toggle("show"));
    closeBtn.addEventListener("click", () => chatbot.classList.remove("show"));

    // --- LOGIC XỬ LÝ CHAT (GIỮ NGUYÊN) ---
    const createChatLi = (messageData, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = `<p>${messageData.text}</p>`;
        if (messageData.actions && messageData.actions.length > 0) {
            let buttonsHtml = '<div class="chat-actions">';
            messageData.actions.forEach(action => {
                buttonsHtml += `<button class="action-button" data-action-type="${action.type}" data-action-value="${action.value}">${action.label}</button>`;
            });
            buttonsHtml += '</div>';
            chatContent += buttonsHtml;
        }
        chatLi.innerHTML = chatContent;
        return chatLi;
    }

    const generateResponse = async (incomingChatLi) => {
        const messageElement = incomingChatLi.querySelector("p");
        const API_URL = "/.netlify/functions/chat"; // Giữ nguyên API call
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error("Lỗi kết nối đến trợ lý ảo.");
            const data = await response.json();
            incomingChatLi.innerHTML = createChatLi(data.reply, "incoming").innerHTML;
        } catch (error) {
            messageElement.classList.add("error");
            messageElement.textContent = "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.";
        } finally {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    }

    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        chatInput.value = "";
        chatbox.appendChild(createChatLi({ text: userMessage }, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        setTimeout(() => {
            const incomingChatLi = createChatLi({ text: "..." }, "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }

    sendChatBtn.addEventListener("click", handleChat);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); }
    });
    chatbox.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-button')) {
            const type = e.target.dataset.actionType;
            const value = e.target.dataset.actionValue;
            if (type === 'navigate') { window.location.href = value; }
        }
    });
});