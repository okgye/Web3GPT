'use client';
import { useState, useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Head from 'next/head';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [message, setMessage] = useState('');
  const [animatePress, setAnimatePress] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!mounted) return null;

  type ChatMessage = {
    sender: "user" | "bot";
    text: string;
  };

  const sendMessage = () => {
    if (!message.trim() || !address) return;
  
    // Add the user's message to the chat history.
    const userMessage = message;
    setChatHistory((prev: ChatMessage[]) => [...prev, { sender: 'user', text: userMessage }]);
    setMessage('');
  
    // Build the URL with query parameters (EventSource only supports GET)
    const url = new URL('/api/chat', window.location.origin);
    url.searchParams.append('address', address);
    url.searchParams.append('prompt', userMessage);
  
    // Use a ref to track if the stream ended normally.
    const streamFinished = { current: false };
  
    // Create an EventSource connection to your API endpoint.
    const eventSource = new EventSource(url.toString());
  
    eventSource.onmessage = (event) => {
      // Check for a termination signal (you can define "[DONE]" or any other indicator).
      if (event.data === "[DONE]") {
        streamFinished.current = true;
        console.log("Stream finished normally.");
        eventSource.close();
        return;
      }
      // If the last message is from the bot, append new content; otherwise, add a new bot message.
      setChatHistory((prev: ChatMessage[]) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "bot") {
          return [
            ...prev.slice(0, -1),
            { sender: "bot", text: last.text + event.data }
          ];
        } else {
          return [
            ...prev,
            { sender: "bot", text: event.data }
          ];
        }
      });
    };
  
    eventSource.onerror = (error) => {
      // Only display an error if the stream did not finish normally.
      if (streamFinished.current || eventSource.readyState === EventSource.CLOSED) {
        console.log("EventSource connection closed normally.");
      } else {
        console.error("EventSource error:", error);
        setChatHistory((prev: ChatMessage[]) => [
          ...prev,
        ]);
      }
      eventSource.close();
    };
  
    eventSource.onopen = () => {
      console.log("EventSource connection opened.");
    };
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setAnimatePress(true);
      sendMessage();
      setTimeout(() => {
        setAnimatePress(false);
      }, 200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-2 relative text-lg">
      <Head>
        <title>chETH</title>
        <meta name="description" content="Interact with ChatGPT securely via ETH Wallet authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="w-full max-w-3xl z-50 flex items-center justify-between p-4 bg-white/20 backdrop-blur-lg shadow-lg border border-white/30 md:relative md:top-auto md:left-auto md:rounded-3xl md:max-w-3xl fixed top-0 left-0 w-full rounded-none border-t">
        <h1 className="text-xl font-bold text-white">chETH</h1>
        <ConnectButton />
      </nav>

      <div className="absolute z-30 inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 animate-gradient"></div>
      
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center z-70">
          <div className="absolute z-40 inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 animate-gradient"></div>
          <div className="relative z-50 max-w-md p-8 bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">환영합니다!</h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              chETH는 <span className="font-semibold text-white">이더리움 월렛 인증</span>을 통해  
              <br />ChatGPT API를 제공하는 채팅 서비스입니다.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <p className="text-sm text-gray-500 mt-4">* 회원가입 문의: Telegram @okgye</p>
          </div>
        </div>
      )}

      <div ref={chatContainerRef} className="z-30 w-full max-w-3xl max-h-[80vh] overflow-y-auto m-1 bg-transparent">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`p-4 my-2 rounded-3xl max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500/60 text-white self-end ml-auto' : 'bg-white/20 text-gray-900 mr-auto backdrop-blur-md border border-white/30'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl z-50 flex items-center p-4 bg-white/20 backdrop-blur-lg shadow-lg border border-white/30 md:relative md:bottom-auto md:left-auto md:rounded-3xl md:max-w-3xl fixed bottom-0 left-0 w-full rounded-none border-t">
        <textarea
          className="flex-1 p-3 text-white bg-transparent rounded-2xl outline-none resize-none overflow-hidden placeholder-white"
          placeholder="chETH에게 물어보세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnterKey}
          rows={1}
        />
        
        <button
          onClick={sendMessage}
          className={`ml-3 px-4 py-2 bg-blue-500/80 text-white font-medium rounded-2xl shadow-md transition-transform duration-150 cursor-pointer hover:scale-105 ${animatePress ? 'scale-105' : ''}`}
        >
          Send
        </button>
      </div>

      <style jsx>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientAnimation 6s ease infinite;
        }
      `}</style>
    </div>
  );
}
