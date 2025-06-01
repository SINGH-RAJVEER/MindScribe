import { create } from "zustand";

const useChatStore = create((set) => ({
  chatHistory: [],
  selectedConversation: null,
  loading: false,

  setChatHistory: (history) => set((state) => ({ 
    chatHistory: history,
    // Preserve selected conversation if it exists in the new history
    selectedConversation: state.selectedConversation 
      ? history.find(chat => chat.id === state.selectedConversation.id) || state.selectedConversation
      : null
  })),
  
  setSelectedConversation: (conversation) => set((state) => {
    // If setting to null, just update selectedConversation
    if (!conversation) {
      return { selectedConversation: null };
    }
    
    // If conversation exists in history, use that version
    const existingConversation = state.chatHistory.find(chat => chat.id === conversation.id);
    return { 
      selectedConversation: existingConversation || conversation,
      // Update the conversation in chatHistory if it exists
      chatHistory: state.chatHistory.map(chat => 
        chat.id === conversation.id ? (existingConversation || conversation) : chat
      )
    };
  }),
  
  setLoading: (status) => set({ loading: status }),
  
  // Add a new action to safely update a conversation
  updateConversation: (conversationId, updateFn) => set((state) => {
    const updatedHistory = state.chatHistory.map(chat => 
      chat.id === conversationId ? updateFn(chat) : chat
    );
    
    return {
      chatHistory: updatedHistory,
      selectedConversation: state.selectedConversation?.id === conversationId
        ? updateFn(state.selectedConversation)
        : state.selectedConversation
    };
  })
}));

export default useChatStore;