import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDEwYWU5NGJjZWRjYjdiMjE1YzkzMiIsImlhdCI6MTc1ODYwNjExOSwiZXhwIjoxNzU4NjkyNTE5fQ.mD-TiwlgDugeaTlZk-2Oev0yW6gv_uo3OnJcePpT8JY"; // use a real token from your auth system

const socket = io("http://localhost:5000", {
  auth: { token },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("Connected to server. Socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
