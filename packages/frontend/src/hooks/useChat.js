import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChatHistory, sendMessage } from "../api/chatApi";
import useChatStore from "../store/chatStore";

export const useFetchChatHistory = () => {
  const setChatHistory = useChatStore((state) => state.setChatHistory);

  return useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      const data = await fetchChatHistory();
      setChatHistory(data);
      return data;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const setLoading = useChatStore((state) => state.setLoading);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const selectedConversation = useChatStore((state) => state.selectedConversation);
  const setSelectedConversation = useChatStore((state) => state.setSelectedConversation);

  return useMutation({
    mutationFn: async ({ message, conversationId }) => {
      setLoading(true);
      const response = await sendMessage({ message, conversationId });
      return response;
    },
    onSuccess: (response) => {
      setLoading(false);
      
      // Create new message objects
      const userMessage = { 
        id: Date.now(), 
        user_message: response.user_message || response.message, 
        type: "user" 
      };
      const botMessage = { 
        id: Date.now() + 1, 
        bot_response: response.response, 
        type: "ai" 
      };

      if (!selectedConversation) {
        // Create new conversation
        const newConversation = {
          id: response.conversation_id,
          messages: [userMessage, botMessage],
        };
        setSelectedConversation(newConversation);
      } else {
        // Update existing conversation
        updateConversation(selectedConversation.id, (conversation) => ({
          ...conversation,
          messages: [...conversation.messages, userMessage, botMessage],
        }));
      }

      // Invalidate chat history query to ensure data consistency
      queryClient.invalidateQueries(["chatHistory"]);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setLoading(false);
    },
  });
};