import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSpinner, FaChevronDown, FaChevronRight, FaTrash } from "react-icons/fa";
import { useFetchChatHistory, useSendMessage, useDeleteChat } from "../hooks/useChat";
import { useLogout } from "../hooks/useLogout";
import useChatStore from "../store/chatStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Sidebar } from "./ui/sidebar";
import headerImg from "../assets/header.png";
import ThemeToggle from "./ThemeToggle";

const ReasoningBox = ({ reasoningText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reasoningText) return null;

  return (
    <div className="my-2 border border-gray-600 rounded-md bg-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-750 transition-colors duration-150"
      >
        <span className="text-sm font-medium text-blue-300">
          Model Reasoning
        </span>
        {isExpanded ? (
          <FaChevronDown className="text-blue-300" />
        ) : (
          <FaChevronRight className="text-blue-300" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-600">
          <div className="bg-gray-900 rounded p-3 text-sm text-gray-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reasoningText}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

ReasoningBox.propTypes = {
  reasoningText: PropTypes.string,
};

function Dashboard() {
  const {
    chatHistory,
    setChatHistory,
    selectedConversation,
    setSelectedConversation,
    loading,
  } = useChatStore();
  const chatEndRef = useRef(null);

  const extractBotContent = (text) => {
    const thinkingMatch = text.match(/<think>([\s\S]*?)<\/think>/);
    const reasoning = thinkingMatch ? thinkingMatch[1].trim() : null;
    const cleanResponse = text.replace(/<think>[\s\S]*?<\/think>\n?/g, "").trim();
    
    return {
      reasoning,
      cleanResponse
    };
  };

  const [prompt, setPrompt] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { mutate: sendMessage } = useSendMessage();
  const { data: chatHistoryData } = useFetchChatHistory();
  const { mutate: logout } = useLogout();
  const { mutate: deleteChat } = useDeleteChat();

  useEffect(() => {
    if (chatHistoryData) {
      setChatHistory(chatHistoryData);
    }
  }, [chatHistoryData, setChatHistory]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation, loading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    sendMessage(
      { message: prompt, conversationId: selectedConversation?.id },
      {
        onSuccess: () => {
          setPrompt("");
        },
      }
    );
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setPrompt("");
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    deleteChat(chatId);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar (shadcn/ui) */}
      <Sidebar collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed((prev) => !prev)}>
        {chatHistory?.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 hover:bg-accent cursor-pointer transition-colors duration-150 rounded-md mx-2 my-1 ${
              selectedConversation && selectedConversation.id === chat.id ? "bg-accent" : ""
            }`}
            onClick={() => setSelectedConversation(chat)}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">
                {chat?.messages[0]?.user_message?.slice(0, 20) || "New Chat"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                onClick={(e) => handleDeleteChat(e, chat.id)}
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!sidebarCollapsed && (
          <Button
            onClick={startNewConversation}
            className="m-4 w-[calc(100%-2rem)]"
          >
            New Chat
          </Button>
        )}
      </Sidebar>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col h-screen">
        <header className="bg-card p-4 border-b border-border shadow-md flex justify-between items-center flex-shrink-0">
          <div className="flex-1 flex items-center">
            <div
              className="overflow-hidden flex items-center"
              style={{ height: '64px', maxHeight: '64px', minWidth: '0' }}
            >
              <img
                src={headerImg}
                alt="MindScribe Logo"
                className="object-cover h-16 w-auto bg-transparent"
                style={{ objectPosition: 'center' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={logout}
              className="bg-red-600 px-4 py-2 rounded-md text-white hover:bg-red-700 ml-4"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-4 min-h-0">
          <div className="flex-1 rounded-lg bg-card shadow-lg mb-4 flex flex-col min-h-0 border border-border">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold">Chat</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {selectedConversation ? (
                <>
                  <div className="space-y-6 flex flex-col-reverse">
                    {selectedConversation.messages.map((message, idx) => {
                      const botContent = message.bot_response 
                        ? extractBotContent(message.bot_response)
                        : null;

                      return (
                        <div key={message.id || idx} className="flex flex-col space-y-4 py-2">
                          {message.user_message && (
                            <div className="rounded-lg p-3 bg-indigo-600 ml-auto max-w-[80%] break-words text-white">
                              {message.user_message}
                            </div>
                          )}
                          {message.bot_response && (
                            <div className="max-w-[80%] break-words">
                              <ReasoningBox reasoningText={botContent?.reasoning} />
                              <div className="rounded-lg p-3 bg-gray-100 dark:text-black">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {botContent?.cleanResponse}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  {loading && (
                    <div className="text-gray-400 flex items-center mt-4">
                      <FaSpinner className="animate-spin mr-2" /> Generating
                      response...
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">Select a chat or start a new one</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2 flex-shrink-0">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt"
              disabled={loading}
              className="flex-1 bg-background border border-input text-foreground"
            />
            <Button
              type="submit"
              className="flex items-center bg-primary hover:bg-primary/80 text-primary-foreground dark:bg-primary dark:hover:bg-primary/80 dark:text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;