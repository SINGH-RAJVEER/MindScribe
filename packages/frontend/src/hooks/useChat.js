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
  const setChatHistory = useChatStore((state) => state.setChatHistory);
  const selectedConversation = useChatStore((state) => state.selectedConversation);

  return useMutation({
    mutationFn: async ({ message, conversationId }) => {
      setLoading(true);
      const response = await sendMessage({ message, conversationId });
      console.log("I am in response",response)
      return response;
    },
    onSuccess: (response) => {
      setLoading(false);
      const newMessage = { id: Date.now(), text: response.response, type: "ai" };
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
      };

      setChatHistory((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedConversation.id ? updatedConversation : chat
        )
      );

      queryClient.invalidateQueries(["chatHistory"]);
    },
    onError: () => setLoading(false),
  });
};