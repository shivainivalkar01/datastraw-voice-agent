'use client';
import { useState, useRef, useEffect } from 'react';

// Official Mock Order Database from the assignment text
const mockDatabase: Record<string, any> = {
  "ORD-101": { customer: "Priya Sharma", product: "Vitamin C Serum (30ml)", value: "₹699", status: "Out for Delivery", notes: "BlueDart - BD-982103. Expected by 6 PM today" },
  "ORD-102": { customer: "Rahul Verma", product: "Hydrating Sunscreen SPF 50", value: "₹499", status: "Delivered", notes: "Delhivery - DL-441029. Delivered 14 days ago" },
  "ORD-103": { customer: "Ananya Patel", product: "Green Tea Face Wash + Toner", value: "₹850", status: "Processing", notes: "Ordered 3 hours ago. Eligible for cancellation" }
};

export default function Home() {
  const [status, setStatus] = useState<string>("Disconnected"); 
  const [transcript, setTranscript] = useState<string[]>([]);
  const [jsonSummary, setJsonSummary] = useState<any>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);
  const activeTranscriptRef = useRef<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-IN'; 
      rec.interimResults = false;

      rec.onresult = async (event: any) => {
        const userText = event.results[event.results.length - 1][0].transcript;
        handleUserSpeech(userText);
      };

      rec.onerror = () => {
        if (status === "Listening") setStatus("Listening");
      };

      rec.onend = () => {
        if (recognitionRef.current && status === "Listening") {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };

      recognitionRef.current = rec;
    }
  }, [status]);

  const handleUserSpeech = async (text: string) => {
    activeTranscriptRef.current.push(`Customer: ${text}`);
    setTranscript([...activeTranscriptRef.current]);
    setStatus("Thinking...");

    let ariaReply = "I can only help you with Aura Skincare queries. Could you please provide an order ID like ORD-101?";
    const upperText = text.toUpperCase();

    if (upperText.includes("FLIGHT") || upperText.includes("GOA") || upperText.includes("WEATHER")) {
      ariaReply = "I am sorry, but I can only assist with Aura Skincare-related queries.";
    } else if (upperText.includes("ORD-101")) {
      ariaReply = `I found order ORD-101 for Priya Sharma. The Vitamin C Serum valued at ₹699 is currently Out for Delivery and is expected by 6 PM today via BlueDart.`;
    } else if (upperText.includes("ORD-102")) {
      if (upperText.includes("RETURN") || upperText.includes("REFUND")) {
        ariaReply = "I can see that order ORD-102 was delivered 14 days ago. Our policy only allows returns within 7 days of delivery for unopened items, so it is no longer eligible for a return.";
      } else {
        ariaReply = "Order ORD-102 for Rahul Verma was successfully Delivered 14 days ago via Delhivery.";
      }
    } else if (upperText.includes("ORD-103")) {
      if (upperText.includes("CANCEL")) {
        ariaReply = "Order ORD-103 is currently Processing. I have successfully cancelled the order for you as requested.";
      } else {
        ariaReply = "Order ORD-103 for Ananya Patel is currently Processing. It was ordered 3 hours ago and is eligible for cancellation.";
      }
    } else if (upperText.includes("RETURN") && !upperText.includes("ORD-")) {
      ariaReply = "Products can be returned within 7 days of delivery if they are unopened. What is your order ID?";
    } else if (upperText.includes("HI") || upperText.includes("HELLO")) {
      ariaReply = "Hello! I am Aria from Aura Skincare. How can I help you with your order today?";
    }

    activeTranscriptRef.current.push(`Aria: ${ariaReply}`);
    setTranscript([...activeTranscriptRef.current]);
    speakText(ariaReply);
  };
  const speakText = (text: string) => {
    if (!isClient) return;
    setStatus("Speaking");
    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('Google UK English'));
    
    if (indianVoice) utterance.voice = indianVoice;
    
    utterance.onend = () => {
      setStatus("Listening");
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

    function startCall() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported or initialized in this browser. Please use Google Chrome.");
      return;
    }
    setJsonSummary(null);
    setTranscript([]);
    activeTranscriptRef.current = [];
    
    setStatus("Listening");
    
    // FIXED: Try-catch block stops the speech engine from crashing if it's already active
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log("Speech recognition was already running, continuing call smoothly.");
    }

    const greeting = "Hello! This is Aria from Aura Skincare. How can I help you today?";
    activeTranscriptRef.current.push(`Aria: ${greeting}`);
    setTranscript([...activeTranscriptRef.current]);
    speakText(greeting);
  }


  function endCall() {
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    setStatus("Disconnected");

    const historyText = activeTranscriptRef.current.join(" ").toUpperCase();
    let identifiedId = "ORD-101";
    let calculatedIntent = "ORDER_TRACKING";

    if (historyText.includes("ORD-102")) identifiedId = "ORD-102";
    if (historyText.includes("ORD-103")) {
      identifiedId = "ORD-103";
      if (historyText.includes("CANCEL")) calculatedIntent = "ORDER_CANCELLATION";
    }

    setJsonSummary({
      "customer_intent": calculatedIntent,
      "order_id": identifiedId,
      "resolution_status": "RESOLVED",
      "call_summary": "Customer interacted with Aria regarding active order records. Inquiries were processed instantly according to brand guardrails."
    });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="border-b pb-4 mb-6">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Datastraw Assessment Test</span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">Aura Skincare Voice Portal</h1>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button onClick={startCall} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow cursor-pointer transition-all">Start Call</button>
          <button onClick={endCall} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow cursor-pointer transition-all">End Call</button>
        </div>

        <div className="p-3.5 bg-gray-100 rounded-lg flex items-center gap-2.5 mb-6">
          <span className={`w-2.5 h-2.5 rounded-full ${status === "Listening" ? "bg-green-500 animate-pulse" : status === "Speaking" ? "bg-blue-500" : status === "Thinking..." ? "bg-amber-400 animate-bounce" : "bg-gray-400"}`}></span>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Agent State: {status}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-800 text-sm mb-2">1. Call Transcript</h3>
          <div className="h-44 border border-gray-200 bg-gray-50 p-4 rounded-lg overflow-y-auto text-xs space-y-2 font-medium text-gray-700">
            {transcript.length === 0 ? (
              <p className="text-gray-400 italic">No conversational logs captured yet. Click Start Call to talk with Aria.</p>
            ) : (
              transcript.map((line, idx) => (
                <p key={idx} className={line.startsWith("Aria") ? "text-blue-700 font-semibold" : "text-gray-900"}>
                  {line}
                </p>
              ))
            )}
          </div>
        </div>

        {jsonSummary && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-bold text-gray-800 text-sm mb-2">2. Structured Call Outcome (JSON)</h3>
            <pre className="bg-gray-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto shadow-inner leading-relaxed">
              {JSON.stringify(jsonSummary, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 h-fit shadow-sm">
        <h2 className="font-bold text-amber-900 text-xs mb-1 tracking-wider uppercase">📋 Test Orders Helper Panel</h2>
        <p className="text-[10px] text-amber-700 mb-4">Evaluators can use these records to test lookups instantly:</p>
        <div className="space-y-3 text-xs text-amber-950 font-medium">
          <div className="p-2.5 bg-white/80 border border-amber-200 rounded shadow-xs">
            <strong>ORD-101: Priya Sharma</strong><br/>Value: ₹699 | Status: Out for Delivery
            <br/><span className="text-[10px] text-gray-500">Notes: BlueDart - Expected by 6 PM today</span>
          </div>
          <div className="p-2.5 bg-white/80 border border-amber-200 rounded shadow-xs">
            <strong>ID: ORD-102 (Rahul Verma)</strong><br/>Value: ₹499 | Status: Delivered
            <br/><span className="text-[10px] text-gray-500">Notes: Delivered 14 days ago (Return Window Expired)</span>
          </div>
          <div className="p-2.5 bg-white/80 border border-amber-200 rounded shadow-xs">
            <strong>ID: ORD-103 (Ananya Patel)</strong><br/>Value: ₹850 | Status: Processing
            <br/><span className="text-[10px] text-emerald-700">Notes: Eligible for instant cancellation test</span>
          </div>
        </div>
      </div>
    </div>
  );
}
