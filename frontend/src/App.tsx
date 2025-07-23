import React from "react";
import Chat from "./Chat";

export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-3xl p-6">
        <Chat />
      </div>
    </div>
  );
}
