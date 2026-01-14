import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const suggestedQuestions = [
  "Find healthcare near me",
  "Jobs for students",
  "Events this weekend",
  "Training programs available",
];

export default function AIAssistant() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search submission
    console.log("Searching for:", searchQuery);
  };

  const handleSuggestedQuestion = (question) => {
    setSearchQuery(question);
  };

  return (
    <>
      <div className="ai-assistant-page">
        <div className="ai-assistant-container">
          {/* Star/Sparkle Icon */}
          <div className="ai-assistant-icon">✨</div>

          {/* Title and Subtitle */}
          <h1 className="ai-assistant-title">Ask about Sudbury</h1>
          <p className="ai-assistant-subtitle">
            Get instant answers about jobs, events, services, and more.
          </p>

          {/* Search Bar */}
          <form className="ai-assistant-search" onSubmit={handleSubmit}>
            <div className="ai-search-input-wrapper">
              <span className="ai-search-icon">🔍</span>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ai-search-input"
              />
            </div>
            <button type="submit" className="ai-search-send-btn">
              ✈️
            </button>
          </form>

          {/* Suggested Questions */}
          <div className="ai-suggested-section">
            <p className="ai-suggested-label">Suggested questions:</p>
            <div className="ai-suggested-questions">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="ai-suggested-btn"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

