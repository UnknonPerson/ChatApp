
import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket/socket";

function SocketTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data);

      // Connect only after successful login.
      socket.connect();
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  useEffect(() => {
    const handleConnect = () => {
      setStatus("Connected");
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setStatus("Disconnected");
      console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (err) => {
      setStatus("Connection failed");
      setError(err.message);
      console.error("Socket error:", err.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-xl bg-gray-900 p-8"
      >
        <h1 className="text-2xl font-bold">
          Socket.IO Testing
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-gray-800 p-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-gray-800 p-3"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold"
        >
          Login & Connect
        </button>

        <p>
          Status: <span className="font-semibold">{status}</span>
        </p>

        {error && (
          <p className="text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}

export default SocketTest;
