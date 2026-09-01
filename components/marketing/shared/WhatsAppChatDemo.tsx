'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { MessageCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  disclaimer?: string;
}

const scenarios = [
  {
    id: 'attendance',
    icon: Clock,
    title: 'Attendance',
    messages: [
      { sender: 'user', text: 'I forgot to clock in this morning.' },
      { sender: 'assistant', text: 'No problem! I can fix that for you. What time did you arrive?' },
      { sender: 'user', text: 'Around 8:45 AM.' },
      { sender: 'assistant', text: 'Done! Your clock-in time is now 8:45 AM. Have a great day! ✅' }
    ]
  },
  {
    id: 'payroll',
    icon: MessageCircle,
    title: 'Payroll',
    messages: [
      { sender: 'user', text: 'When is the next payday?' },
      { sender: 'assistant', text: 'The next payday is this Friday, September 29th.' },
      { sender: 'user', text: 'Thanks!' },
      { sender: 'assistant', text: 'You’re welcome! Let me know if you need anything else.' }
    ]
  },
  {
    id: 'secure',
    icon: ShieldCheck,
    title: 'Secure Action',
    messages: [
      { sender: 'user', text: 'I need to update my bank details.' },
      { sender: 'assistant', text: 'For security reasons, please click the link below to verify your identity and update your details securely: \n\nhttps://hr.example.com/verify' }
    ]
  }
];

export function WhatsAppChatDemo({ disclaimer }: Props) {
  const [activeScenario, setActiveScenario] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInView) return;

    const timeoutIds: NodeJS.Timeout[] = [];
    const scenario = scenarios[activeScenario];
    
    // Reset state
    setVisibleMessages(0);
    setIsTyping(false);

    let currentTime = 500; // Initial delay

    scenario.messages.forEach((msg, index) => {
      if (msg.sender === 'user') {
        timeoutIds.push(
          setTimeout(() => {
            setVisibleMessages(index + 1);
            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }, currentTime)
        );
        currentTime += 500; // Small delay after user message
      } else {
        // Show typing indicator
        timeoutIds.push(
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }, currentTime)
        );
        
        currentTime += 1200; // Typing duration
        
        // Show message
        timeoutIds.push(
          setTimeout(() => {
            setIsTyping(false);
            setVisibleMessages(index + 1);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }, currentTime)
        );
        currentTime += 1000; // Delay before next message
      }
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [activeScenario, isInView]);

  return (
    <div className="w-full max-w-4xl mx-auto" ref={containerRef}>
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Phone Mockup */}
        <div className="w-full max-w-[320px] shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-violet-500/30 blur-[60px] -z-10" />
          <div className="bg-[#0B101A] border-[8px] border-[#161B27] rounded-[40px] shadow-2xl shadow-black overflow-hidden flex flex-col h-[600px] relative">
            
            {/* Phone Header (WhatsApp style) */}
            <div className="bg-[#25D366] px-4 py-4 flex items-center gap-3 shrink-0 rounded-t-[32px] pt-10">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[#25D366] font-bold text-lg">AI</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold leading-tight truncate">HumAi Assistant</h3>
                <p className="text-white/80 text-xs truncate">Always online</p>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0A0E1A] custom-scrollbar flex flex-col gap-3 relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
              
              {scenarios[activeScenario].messages.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm relative z-10 ${
                    msg.sender === 'user'
                      ? 'self-end bg-gradient-to-r from-cyan-400/10 to-violet-500/10 border border-cyan-400/10 text-white rounded-tr-sm rtl:self-start rtl:rounded-tr-2xl rtl:rounded-tl-sm'
                      : 'self-start bg-[#1C2333] border border-white/[0.06] text-[#E2E8F0] rounded-tl-sm rtl:self-end rtl:rounded-tl-2xl rtl:rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </motion.div>
              ))}
              
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="self-start bg-[#1C2333] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 relative z-10 rtl:self-end rtl:rounded-tl-2xl rtl:rounded-tr-sm"
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            {/* Input Mock */}
            <div className="bg-[#161B27] p-3 flex items-center gap-2 shrink-0 border-t border-white/[0.06]">
              <div className="flex-1 bg-[#0A0E1A] border border-white/10 rounded-full h-10 flex items-center px-4">
                <div className="w-1/2 h-2 bg-white/10 rounded-full" />
              </div>
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <ChevronRight className="w-5 h-5 text-white ml-0.5 rtl:mr-0.5 rtl:ml-0 rtl:rotate-180" />
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selectors */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            const isActive = activeScenario === index;
            
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(index)}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 text-left border ${
                  isActive
                    ? 'bg-[#161B27] border-cyan-400/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-[#0A0E1A]/50 border-white/[0.06] hover:bg-[#161B27]/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-[#94A3B8]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 transition-colors ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>
                    {scenario.title}
                  </h4>
                  <p className="text-sm text-[#4B5567]">Click to preview this scenario</p>
                </div>
              </button>
            );
          })}
          
          {disclaimer && (
            <p className="text-xs text-[#4B5567] mt-4 ml-2">
              * {disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
