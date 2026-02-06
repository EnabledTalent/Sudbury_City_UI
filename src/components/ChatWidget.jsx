import { useState, useRef, useEffect } from "react";

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Career Coach. How can I help you with your job search today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getEmail = () => {
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.basicInfo?.email;
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.email;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const email = getEmail();
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No auth token found");
      }

      const requestBody = {
        message: userMessage,
      };

      // Add email only if available
      if (email) {
        requestBody.email = email;
      }

      const response = await fetch(
        "http://localhost:8083/api/jobseeker/ai/chat",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      const responseText = await response.text();
      let aiResponse = "";

      if (responseText && responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          // Check for answer field first (formatted response)
          if (data.answer) {
            aiResponse = data.answer;
          } else {
            // Fallback to other possible fields
            aiResponse = data.message || data.response || data.content || JSON.stringify(data);
          }
        } catch (parseError) {
          // If response is not JSON, use the text directly
          aiResponse = responseText;
        }
      } else {
        aiResponse = "I received your message. How can I help you further?";
      }

      // Replace \n with actual newlines if they come as string literals
      // Also ensure proper line breaks are preserved
      aiResponse = aiResponse.replace(/\\n/g, '\n');

      // Add AI response to chat
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    widget: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "380px",
      height: "500px",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
      display: "flex",
      flexDirection: "column",
      zIndex: 10000,
      border: "1px solid #e5e7eb",
    },
    header: {
      background: "#16a34a",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px 12px 0 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: "16px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "#ffffff",
      fontSize: "20px",
      cursor: "pointer",
      padding: "0",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      transition: "background 0.2s",
    },
    messagesContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      background: "#f9fafb",
    },
    message: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxWidth: "80%",
    },
    userMessage: {
      alignSelf: "flex-end",
      alignItems: "flex-end",
    },
    assistantMessage: {
      alignSelf: "flex-start",
      alignItems: "flex-start",
    },
    messageBubble: {
      padding: "10px 14px",
      borderRadius: "12px",
      fontSize: "14px",
      lineHeight: "1.5",
      wordWrap: "break-word",
    },
    userBubble: {
      background: "#16a34a",
      color: "#ffffff",
      borderBottomRightRadius: "4px",
    },
    assistantBubble: {
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderBottomLeftRadius: "4px",
      whiteSpace: "pre-wrap", // Preserve line breaks and formatting
    },
    inputContainer: {
      padding: "16px",
      borderTop: "1px solid #e5e7eb",
      background: "#ffffff",
      borderRadius: "0 0 12px 12px",
      display: "flex",
      gap: "8px",
    },
    input: {
      flex: 1,
      padding: "10px 14px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      resize: "none",
      fontFamily: "inherit",
    },
    sendButton: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      transition: "background 0.2s",
      whiteSpace: "nowrap",
    },
    sendButtonDisabled: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "not-allowed",
      fontSize: "14px",
      fontWeight: 500,
      opacity: 0.6,
      whiteSpace: "nowrap",
    },
    loadingIndicator: {
      fontSize: "12px",
      color: "#6b7280",
      fontStyle: "italic",
      padding: "10px 14px",
    },
  };

  return (
    <div style={styles.widget}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span>Q</span>
          <span>AI Career Coach</span>
        </div>
        <button
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
          }}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userMessage : styles.assistantMessage),
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble),
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.loadingIndicator}>AI is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          style={loading ? styles.sendButtonDisabled : styles.sendButton}
          onClick={sendMessage}
          disabled={loading || !inputMessage.trim()}
          onMouseEnter={(e) => {
            if (!loading && inputMessage.trim()) {
              e.target.style.background = "#15803d";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && inputMessage.trim()) {
              e.target.style.background = "#16a34a";
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
