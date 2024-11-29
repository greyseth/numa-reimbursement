import { createContext, useState } from "react";

export const MessageContext = createContext();

function MessageProvider({ children }) {
  const [message, setMessage] = useState("");

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

export default MessageProvider;
