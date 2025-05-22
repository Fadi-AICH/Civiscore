"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, X, MessageSquare, Loader2, Volume2, VolumeX } from "lucide-react"
// Add imports for the Input component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Civiscore assistant. How can I help you today?" },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false // Changed to false to avoid long listening periods
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US" // Set language explicitly
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        setTranscript(transcript)

        if (result.isFinal) {
          handleUserMessage(transcript)
          setIsListening(false)
          recognitionRef.current.stop()
        }
      }

      recognitionRef.current.onend = () => {
        // If we were still supposed to be listening but it ended
        // (e.g., due to timeout but not because of an error)
        if (isListening) {
          setIsListening(false)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)

        // Handle specific error types
        if (event.error === "no-speech") {
          // Add a message to inform the user
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I didn't hear anything. Please try speaking again or type your message.",
            },
          ])
        } else if (event.error === "not-allowed") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Microphone access was denied. Please check your browser permissions.",
            },
          ])
        }

        setIsListening(false)
        setTranscript("")
      }
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error("Error stopping speech recognition:", e)
        }
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
    }
  }, [isListening]) // Added isListening as a dependency

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      setTranscript("")
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (error) {
          console.error("Failed to start speech recognition:", error)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Speech recognition failed to start. Please try again or type your message.",
            },
          ])
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Speech recognition is not supported in your browser. Please type your message instead.",
          },
        ])
      }
    }
  }

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setTranscript("")
    setIsLoading(true)

    try {
      // Use AI SDK to generate response
      const { text: responseText } = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are a helpful assistant for Civiscore, a platform for rating public services globally. 
                Respond to this user query: ${text}
                Keep your response concise and focused on public services, governance, and civic engagement.`,
        maxTokens: 500,
      })

      const assistantMessage = { role: "assistant", content: responseText }
      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response if speech synthesis is available
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(responseText)
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        synthRef.current.speak(utterance)
      }
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <>
      {/* Floating button to open assistant */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>

      {/* Assistant dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Civiscore Assistant</h3>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg max-w-[80%] bg-gray-700 text-white rounded-bl-none">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice input area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-white/10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    className={`rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
                    onClick={toggleListening}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-white text-sm">
                    {transcript || (isListening ? "Listening..." : "Tap the mic to speak or type below")}
                  </div>

                  {isSpeaking && (
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={stopSpeaking}>
                      {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  )}
                </div>

                {/* Add text input as fallback */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message here..."
                    className="bg-gray-800 border-gray-700 text-white"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && transcript.trim()) {
                        handleUserMessage(transcript)
                      }
                    }}
                  />
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-blue-500 rounded-full"
                    onClick={() => {
                      if (transcript.trim()) {
                        handleUserMessage(transcript)
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
