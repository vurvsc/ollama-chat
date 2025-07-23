import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Cài: npm install react-markdown

const MODEL_LIST = [
  { label: "Gemma 7B", value: "gemma:7b" },
  { label: "Gemma 2B", value: "gemma:2b" },
  { label: "TinyLlama", value: "tinyllama" },
  { label: "Llama3", value: "llama3" },
  // Thêm các model khác nếu cần
];

interface Message {
  sender: "user" | "assistant";
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState(MODEL_LIST[0].value);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        model: model, // gửi model lên backend
      });
      setMessages([
        ...newMessages,
        { sender: "assistant", text: res.data.reply }, // Luôn hiển thị nội dung trả về
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { sender: "assistant", text: "⚠️ Không thể kết nối tới server." }, // Chỉ báo lỗi khi thật sự không kết nối được
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div style={{ marginBottom: 12 }}>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {MODEL_LIST.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="messages-list">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message-row ${m.sender === "user" ? "user" : "assistant"}`}
          >
            {m.sender === "assistant" && (
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=ai"
                alt="AI"
                className="avatar"
              />
            )}
            <div className={`message-bubble ${m.sender}`}>
              {m.sender === "assistant" ? (
                <ReactMarkdown>{m.text}</ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
            {m.sender === "user" && (
              <img
                src="https://api.dicebear.com/7.x/personas/svg?seed=user"
                alt="Bạn"
                className="avatar"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="chat-input"
          placeholder="Nhập tin nhắn..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="send-btn"
          disabled={loading}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
