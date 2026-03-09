import { useEffect, useRef, useState } from "react";
import { BUSINESS_BASE_URL } from "../config/api";
import { getToken } from "../services/authService";
import "./ChatWidget.css";

const WELCOME_MESSAGE =
  "Hello! I'm your AI Career Coach. How can I help you with your job search today?";

const getEmailFromStorageOrToken = () => {
  const profileData = localStorage.getItem("profileData");
  if (profileData) {
    try {
      const parsed = JSON.parse(profileData);
      return parsed.basicInfo?.email || null;
    } catch {
      // Ignore parse errors and fall back to token parsing.
    }
  }

  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.email || null;
    } catch {
      // Ignore parse errors and return null.
    }
  }

  return null;
};

export default function ChatWidget({ onClose, initialInput = "" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: WELCOME_MESSAGE,
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setInputMessage(initialInput || "");
    inputRef.current?.focus();
  }, [initialInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const email = getEmailFromStorageOrToken();
      const token = getToken();

      if (!token) {
        throw new Error("No auth token found");
      }

      const requestBody = { message: userMessage };
      if (email) {
        requestBody.email = email;
      }

      const response = await fetch(`${BUSINESS_BASE_URL}/api/jobseeker/ai/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      const responseText = await response.text();
      let aiResponse = "";

      if (responseText && responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          aiResponse =
            data.answer || data.message || data.response || data.content || JSON.stringify(data);
        } catch {
          aiResponse = responseText;
        }
      } else {
        aiResponse = "I received your message. How can I help you further?";
      }

      aiResponse = aiResponse.replace(/\\n/g, "\n");
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <aside className="chat-widget" aria-label="AI Career Coach chat panel">
      <header className="chat-widget__header">
        <h2 className="chat-widget__title">AI Career Coach</h2>
        <button
          type="button"
          className="chat-widget__close-btn"
          onClick={onClose}
          aria-label="Close chat"
        >
          {"\u00D7"}
        </button>
      </header>

      <ul
        className="chat-widget__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Conversation"
      >
        {messages.map((msg, index) => (
          <li
            key={`${msg.role}-${index}`}
            className={`chat-widget__message chat-widget__message--${msg.role}`}
          >
            <p className="chat-widget__bubble">{msg.content}</p>
          </li>
        ))}
        {loading && (
          <li className="chat-widget__loading" role="status">
            AI is typing...
          </li>
        )}
        <li ref={messagesEndRef} className="chat-widget__end-anchor" aria-hidden="true" />
      </ul>

      <form className="chat-widget__form" onSubmit={handleSubmit}>
        <label className="chat-widget__sr-only" htmlFor="chat-widget-input">
          Type your message
        </label>
        <input
          id="chat-widget-input"
          ref={inputRef}
          type="text"
          className="chat-widget__input"
          value={inputMessage}
          onChange={(event) => setInputMessage(event.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-widget__send-btn"
          disabled={loading || !inputMessage.trim()}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
