import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';

const JOTFORM_AGENT_URL = 'https://www.jotform.com/agent/01a071b407b870008793b987935780935a76';

const JotFormAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasLoaded) setHasLoaded(true);
  };

  return (
    <>
      {/* Floating Button - Left Side */}
      <button
        onClick={handleOpen}
        className="fixed bottom-4 left-4 z-50 bg-[#002147] text-white p-3 rounded-full shadow-lg hover:bg-[#001a3a] transition-all flex items-center justify-center w-14 h-14 group"
        aria-label="Chat with Admission Agent"
        title="Chat with Admission Agent"
      >
        <MessageSquare size={26} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-start sm:justify-start p-0 sm:p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Agent Panel */}
          <div className="relative w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-white rounded-none sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#002147] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFBF00] flex items-center justify-center">
                  <MessageSquare size={18} className="text-[#002147]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Admission Agent</h3>
                  <p className="text-[11px] text-blue-200">Ask us anything about UNS</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Iframe */}
            {hasLoaded && (
              <iframe
                ref={iframeRef}
                src={JOTFORM_AGENT_URL}
                title="Admission Agent - Yusuf"
                className="flex-1 w-full border-0"
                allow="geolocation; microphone; camera; fullscreen"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default JotFormAgent;
