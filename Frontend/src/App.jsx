
import { useEffect, useState } from "react";
import api from "./api/axios";
import socket from "./socket/socket";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [conversationId, setConversationId] = useState(
    "6af04aa54eff6281381bb6cc"
  );

  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);


  const handleMessageChange = (e) => {
    const value = e.target.value;

    setMessage(value);

    if (!socket.connected || !conversationId.trim()) return;

    socket.emit("typing", conversationId);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      socket.emit("stop_typing", conversationId);
    }, 1500);

    setTypingTimeout(timeout);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data);

      socket.connect();
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Join conversation
  const handleJoinConversation = () => {
    if (!socket.connected) {
      setError("Connect your socket first.");
      return;
    }

    if (!conversationId.trim()) {
      setError("Enter a conversation ID.");
      return;
    }

    setError("");
    socket.emit("join_conversation", conversationId.trim());
  };

  // Send message
  const handleSendMessage = () => {
    if (!socket.connected) {
      setError("Socket is not connected.");
      return;
    }

    if (!message.trim()) return;

    socket.emit("send_message", {
      conversationId: conversationId.trim(),
      content: message.trim(),
    });

    setMessage("");
  };

  const loadMessages = async (id) => {
    try {
      const response = await api.get(
        `/messages/${id}?page=1&limit=20`
      );

      const fetchedMessages = response.data.messages;

      setMessages((prevMessages) => {
        const messageMap = new Map();

        [...prevMessages, ...fetchedMessages].forEach((msg) => {
          messageMap.set(msg._id, msg);
        });

        return Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

    } catch (error) {
      console.error(
        "Failed to load messages:",
        error.response?.data || error.message
      );

      setError("Failed to load message history.");
    }
  };

  useEffect(() => {
    // Socket connected
    const handleConnect = () => {
      setStatus("Connected");
      console.log("Socket connected:", socket.id);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    // Socket disconnected
    const handleDisconnect = (reason) => {
      setStatus("Disconnected");
      console.log("Socket disconnected:", reason);
    };

    // Connection error
    const handleConnectError = (err) => {
      setStatus("Connection failed");
      setError(err.message);

      console.error("Socket connection error:", err.message);
    };

    const handleUserTyping = ({ conversationId: roomId, userId }) => {
      if (roomId !== conversationId) return;

      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleUserStoppedTyping = ({ conversationId: roomId, userId }) => {
      if (roomId !== conversationId) return;

      setTypingUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    // Conversation joined
    const handleConversationJoined = async (data) => {
      console.log("Conversation joined:", data);

      setError("");

      await loadMessages(data.conversationId);
    };

    // Server-side error
    const handleSocketError = (err) => {
      setError(err.message);
      console.error("Socket error:", err.message);
    };

    // Receive new message
    const handleNewMessage = (newMessage) => {
      console.log("New message received:", newMessage._id);

      setMessages((prevMessages) => {
        // Prevent duplicate messages
        const alreadyExists = prevMessages.some(
          (msg) => msg._id === newMessage._id
        );

        if (alreadyExists) {
          return prevMessages;
        }

        return [...prevMessages, newMessage];
      });
    };

    // Register listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("conversation_joined", handleConversationJoined);
    socket.on("socket_error", handleSocketError);
    socket.on("new_message", handleNewMessage);
    socket.on("online_users", handleOnlineUsers);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    // Cleanup all listeners
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("conversation_joined", handleConversationJoined);
      socket.off("socket_error", handleSocketError);
      socket.off("new_message", handleNewMessage);
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);

      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-gray-900 p-8">

        <h1 className="text-2xl font-bold">
          Socket.IO Testing
        </h1>

        {/* Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-gray-800 p-3 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-gray-800 p-3 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login & Connect"}
          </button>
        </form>

        {/* Socket status */}
        <div className="border-t border-gray-700 pt-5 space-y-4">

          <p>
            Socket Status:{" "}
            <span className="font-semibold">
              {status}
            </span>
          </p>

          <div className="rounded-lg bg-gray-800 p-3">
            <h2 className="mb-2 font-semibold">
              Online Users ({onlineUsers.length})
            </h2>

            {onlineUsers.map((userId) => (
              <div key={userId} className="flex items-center gap-2 py-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">{userId}</span>
              </div>
            ))}
          </div>

          {/* Conversation */}
          <input
            type="text"
            placeholder="Enter Conversation ID"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="w-full rounded-lg bg-gray-800 p-3 outline-none"
          />

          <button
            type="button"
            onClick={handleJoinConversation}
            disabled={status !== "Connected"}
            className="w-full rounded-lg bg-green-600 p-3 font-semibold disabled:opacity-50"
          >
            Join Conversation
          </button>

          {/* Messages */}
          <div className="space-y-3 border-t border-gray-700 pt-5">

            <div className="h-64 space-y-2 overflow-y-auto rounded-lg bg-gray-800 p-3">

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-lg bg-gray-700 p-3"
                >
                  <p className="text-xs text-gray-400">
                    {msg.sender?.username}
                  </p>

                  <p>{msg.content}</p>
                </div>
              ))}

            </div>

            {typingUsers.length > 0 && (
              <p className="text-sm text-gray-400 italic">
                Someone is typing...
              </p>
            )}

            {/* Message input */}
            <div className="flex gap-2">

              <input
                value={message}
                onChange={handleMessageChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="min-w-0 flex-1 rounded-lg bg-gray-800 p-3 outline-none"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={status !== "Connected" || !message.trim()}
                className="rounded-lg bg-blue-600 px-5 disabled:opacity-50"
              >
                Send
              </button>

            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
