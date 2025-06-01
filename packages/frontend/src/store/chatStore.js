import { create } from "zustand";

const useChatStore = create((set) => ({
  chatHistory: [],
  selectedConversation: null,
  loading: false,

  setChatHistory: (history) => set({ chatHistory: history }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setLoading: (status) => set({ loading: status }),
}));

export default useChatStore;