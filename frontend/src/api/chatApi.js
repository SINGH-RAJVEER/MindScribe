import axiosInstance from "./axiosInstance";

export const fetchChatHistory = async () => {
  const response = await axiosInstance.get("/chat/history");
  return response.data.history;
};

export const sendMessage = async ({ message, conversationId }) => {
  const response = await axiosInstance.post("/chat/", {
    user_message: message,
    conversation_id: conversationId,
  });
  console.log(response.data)
  return response.data;
};