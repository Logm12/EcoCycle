// js/chatbot.js (PHIÊN BẢN GỌI API)
document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'vendor') return;

    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".chatbot .close-btn");
    const chatbox = document.querySelector(".chatbot .chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    let userMessage;

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = `<p>${message}</p>`;
        chatLi.innerHTML = chatContent;
        return chatLi;
    }

    const generateResponse = async (incomingChatLi) => {
        const messageElement = incomingChatLi.querySelector("p");
        // Endpoint của hàm serverless trên Netlify
        const API_URL = "/.netlify/functions/chat";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error("Có lỗi xảy ra, không thể kết nối đến trợ lý ảo.");
            }

            const data = await response.json();
            messageElement.textContent = data.reply;

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

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            const incomingChatLi = createChatLi("...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }

    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });
});