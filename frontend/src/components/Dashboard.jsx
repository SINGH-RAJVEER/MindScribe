import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useFetchChatHistory, useSendMessage } from "../hooks/useChat";
import { useLogout } from "../hooks/useLogout";
import useChatStore from "../store/chatStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Dashboard() {
  const {
    chatHistory,
    setChatHistory,
    selectedConversation,
    setSelectedConversation,
    loading,
  } = useChatStore();
  const chatEndRef = useRef(null);

  const cleanBotResponse = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>\n?/g, "").trim();
  };

  const [prompt, setPrompt] = useState("");

  const { mutate: sendMessage } = useSendMessage();
  const { data: chatHistoryData } = useFetchChatHistory();
  const { mutate: logout } = useLogout();

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
        onSuccess: (response) => {
          if (!selectedConversation) {
            const newConversation = {
              id: response.conversation_id,
              messages: [
                { id: Date.now(), text: prompt, type: "user" },
                { id: Date.now() + 1, text: response.response, type: "ai" },
              ],
            };
            setSelectedConversation(newConversation);
            setChatHistory((prev) => [newConversation, ...prev]);
          } else {
            const updatedConversation = {
              ...selectedConversation,
              messages: [
                ...selectedConversation.messages,
                { id: Date.now(), text: prompt, type: "user" },
                { id: Date.now() + 1, text: response.response, type: "ai" },
              ],
            };
            setSelectedConversation(updatedConversation);
            setChatHistory((prev) =>
              prev.map((chat) =>
                chat.id === selectedConversation.id ? updatedConversation : chat
              )
            );
          }
          setPrompt("");
        },
      }
    );
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setPrompt("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="w-64 bg-gray-900 shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-gray-200">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatHistory?.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150 ${
                selectedConversation &&
                selectedConversation.id === chat.id
                  ? "bg-gray-800"
                  : ""
              }`}
              onClick={() => setSelectedConversation(chat)}
            >
              {chat?.messages[0]?.user_message?.slice(0, 20) || "New Chat"}
            </div>
          ))}
        </div>
        <button
          onClick={startNewConversation}
          className="m-4 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150 flex items-center justify-center"
        >
          New Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <header className="bg-gray-800 p-4 shadow-md flex justify-between">
          <h1 className="text-2xl font-bold text-gray-200">MindScribe</h1>
          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-md text-white hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 flex flex-col p-4">
          {/* Chat Messages - Now positioned above the input */}
          <div className="flex-1 rounded-lg bg-gray-800 p-4 shadow-lg mb-4 flex flex-col">
            <h2 className="mb-4 text-xl font-semibold text-gray-200">Chat</h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {selectedConversation ? (
                <>
                  {selectedConversation.messages.map((message, idx) => (
                    <div key={message.id || idx} className="flex flex-col space-y-2">
                      {/* User Message */}
                      {message.user_message && (
                        <div className="rounded-lg p-3 bg-indigo-600 ml-auto max-w-[80%] break-words">
                          {message.user_message}
                        </div>
                      )}
                      {/* Bot Response */}
                      {message.bot_response && (
                        <div className="rounded-lg p-3 bg-gray-700 max-w-[80%] break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {cleanBotResponse(message.bot_response)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="text-gray-400 flex items-center">
                      <FaSpinner className="animate-spin mr-2" /> Generating
                      response...
                    </div>
                  )}
                  {/* Dummy div for auto-scroll */}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400">Select a chat or start a new one</p>
                </div>
              )}
            </div>
          </div>

          {/* Input form - Now at the bottom */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-md p-2"
              placeholder="Enter your prompt"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-indigo-600 px-4 py-2 rounded-md text-white flex items-center hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;