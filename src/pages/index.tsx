'use client';
import { useState, useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Head from 'next/head';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [message, setMessage] = useState('');
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

  const sendMessage = async () => {
    if (!message.trim() || !address) return;

    const userMessage = message;
    setMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, prompt: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const botMessage = data.choices[0].message.content;
        setChatHistory((prev) => [...prev, { sender: 'bot', text: botMessage }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: 'bot', text: 'Error: No valid response from AI' }]);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatHistory((prev) => [...prev, { sender: 'bot', text: 'Error: Unable to process request' }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6 relative">
      <Head>
        <title>chETH</title>
        <meta name="description" content="Interact with ChatGPT securely via ETH Wallet authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar with Glassmorphism */}
      <nav className="z-50 relative w-full max-w-3xl flex items-center justify-between bg-white/20 backdrop-blur-lg shadow-md p-4 rounded-3xl border border-white/30">
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


      {/* Chat UI with Glassmorphism */}
      <div ref={chatContainerRef} className="z-30 w-full max-w-3xl h-[70vh] overflow-y-auto p-4 m-4 bg-white/20 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`p-3 my-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500/70 text-white self-end ml-auto' : 'bg-white/30 text-gray-900 mr-auto backdrop-blur-md border border-white/40'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input Box with Glassmorphism */}
      <div className="z-30 w-full max-w-3xl flex items-center p-4 bg-white/20 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30">
        <textarea
          className="flex-1 p-3 text-gray-900 bg-transparent rounded-2xl outline-none resize-none overflow-hidden placeholder-white"
          placeholder="chETH에게 물어보세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
        />
        <button onClick={sendMessage} className="ml-3 px-4 py-2 bg-blue-500/80 text-white font-medium rounded-2xl hover:bg-blue-600 transition-all shadow-md">Send</button>
      </div>

      {/* Gradient Animation Styling */}
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
