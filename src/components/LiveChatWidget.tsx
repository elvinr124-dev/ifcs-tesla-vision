import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, X, ChevronDown, Send, Paperclip, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender_type: string;
  sender_name: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
}

interface LiveChatWidgetProps {
  /** If true, opens as staff view for a specific conversation */
  conversationId?: string;
  /** Called when staff wants to close the chat overlay */
  onClose?: () => void;
  /** Whether this is a staff-side widget */
  isStaff?: boolean;
}

const LiveChatWidget = ({ conversationId: propConvId, onClose, isStaff = false }: LiveChatWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<string | null>(propConvId ?? null);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If propConvId is provided (staff side), auto-open
  useEffect(() => {
    if (propConvId) {
      setConvId(propConvId);
      setIsOpen(true);
    }
  }, [propConvId]);

  // Scroll to bottom — use container scrollTop to avoid page-level scroll on staff side
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Load messages when conversation exists
  const loadMessages = useCallback(async () => {
    if (!convId) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  }, [convId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!convId) return;

    const channel = supabase
      .channel(`chat-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    // Also listen for conversation status changes
    const convChannel = supabase
      .channel(`conv-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
          filter: `id=eq.${convId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === "active") {
            setWaitingForAgent(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [convId]);

  // Client: listen for staff-initiated conversations
  useEffect(() => {
    if (isStaff || !user || convId) return;
    const clientId = user.username || user.email || "unknown";

    const channel = supabase
      .channel("client-incoming-chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_conversations" },
        (payload) => {
          const conv = payload.new as any;
          if (conv.client_identifier === clientId && conv.status === "active" && conv.staff_identifier) {
            setConvId(conv.id);
            setWaitingForAgent(false);
            setIsOpen(true);
            toast({ title: "IFCS Agent", description: "An agent has started a chat with you." });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isStaff, user, convId, toast]);

  // Client: start a new conversation
  const handleStartChat = async () => {
    if (!user) return;
    const clientId = user.username || user.email || "unknown";
    const displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : clientId;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        client_identifier: clientId,
        client_display_name: displayName,
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) {
      toast({ title: "Error", description: "Could not start chat.", variant: "destructive" });
      return;
    }

    // Set state FIRST, then send the message so the realtime subscription is active
    const newConvId = data.id;
    setConvId(newConvId);
    setWaitingForAgent(true);
    setIsOpen(true);

    // Small delay to ensure subscription is set up before inserting
    await new Promise(r => setTimeout(r, 300));

    // Auto-send connecting message
    const { error: msgErr } = await supabase.from("chat_messages").insert({
      conversation_id: newConvId,
      sender_type: "system",
      sender_name: "IFCS",
      content: "Connecting you to a live agent... For faster responses, you can also reach us at 📞 (914) 693-2840. An agent will be with you shortly.",
    });

    // If the realtime didn't catch it, load messages manually
    if (!msgErr) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", newConvId)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs as ChatMessage[]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || !convId) return;

    const senderType = isStaff ? "staff" : "client";
    const senderName = isStaff
      ? "IFCS Agent"
      : user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.username || "Client";

    // Handle file attachments
    for (const file of attachments) {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        sender_type: senderType,
        sender_name: senderName,
        content: null,
        attachment_name: file.name,
        attachment_url: URL.createObjectURL(file), // In production, upload to storage
      });
    }

    if (input.trim()) {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        sender_type: senderType,
        sender_name: senderName,
        content: input.trim(),
      });
    }

    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleClose = async () => {
    // Mark conversation as closed so it doesn't show in staff incoming requests
    if (convId && !isStaff) {
      await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", convId);
    }
    setIsOpen(false);
    setIsMinimized(false);
    setConvId(null);
    if (onClose) onClose();
  };

  // If staff provides convId via props, render inline (no floating button)
  if (propConvId) {
    return (
      <div className="flex flex-col h-full">
        <ChatBody
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          attachments={attachments}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          setAttachments={setAttachments}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          isStaff={isStaff}
          waitingForAgent={false}
        />
      </div>
    );
  }

  // Floating widget for client side
  return (
    <>
      {/* Contact Agent button — positioned above AI chat */}
      {!isOpen && !isMinimized && (
        <button
          onClick={handleStartChat}
          data-live-chat-trigger
          className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full bg-white text-accent border border-accent/30 shadow-lg hover:bg-accent/5 transition-all hover:scale-105"
          title="Chat with an IFCS agent"
        >
          <Headphones size={20} />
          <span className="text-sm font-medium hidden sm:inline">Contact Agent</span>
        </button>
      )}

      {/* Minimized bar */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full bg-white text-accent border border-accent/30 shadow-lg hover:bg-accent/5 transition-all"
        >
          <Headphones size={20} />
          <span className="text-sm font-medium">Live Chat</span>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 text-white">
            <div className="flex items-center gap-2">
              <Headphones size={18} />
              <div>
                <p className="text-sm font-semibold">IFCS Live Support</p>
                <p className="text-xs opacity-80">
                  {waitingForAgent ? "Waiting for agent..." : "Connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronDown size={16} />
              </button>
              <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <ChatBody
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            attachments={attachments}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            setAttachments={setAttachments}
            messagesEndRef={messagesEndRef}
            messagesContainerRef={messagesContainerRef}
            isStaff={false}
            waitingForAgent={waitingForAgent}
          />
        </div>
      )}
    </>
  );
};

/* ─── Chat body (shared between inline and floating) ─── */
interface ChatBodyProps {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  attachments: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  isStaff: boolean;
  waitingForAgent: boolean;
}

const ChatBody = ({
  messages, input, setInput, onSend, onKeyDown,
  attachments, fileInputRef, onFileSelect, setAttachments,
  messagesEndRef, messagesContainerRef, isStaff, waitingForAgent,
}: ChatBodyProps) => {
  const myType = isStaff ? "staff" : "client";

  return (
    <>
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {waitingForAgent && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Headphones size={24} className="text-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Connecting you with an IFCS agent...</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait, an agent will be with you shortly.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_type === myType;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-accent text-accent-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.sender_name}</p>
                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                {msg.attachment_name && (
                  <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                    <Paperclip size={12} />
                    <span>{msg.attachment_name}</span>
                  </div>
                )}
                <p className="text-[9px] opacity-50 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex gap-2 flex-wrap">
          {attachments.map((f, i) => (
            <div key={i} className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1 text-xs">
              <Paperclip size={10} />
              <span className="max-w-[100px] truncate">{f.name}</span>
              <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3 flex items-center gap-2">
        <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} multiple />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Paperclip size={18} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() && attachments.length === 0}
          className="p-2 text-accent hover:text-accent/80 disabled:opacity-30 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
};

export default LiveChatWidget;
