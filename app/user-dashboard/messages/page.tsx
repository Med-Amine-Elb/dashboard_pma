"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Search, User, LogOut } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

interface Message {
  id: string
  sender: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  type: "sent" | "received"
  conversationId?: number
  sentAt?: string
}

interface Conversation {
  id: string
  participant: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  type?: string
}

export default function UserMessagesPage() {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const stompClient = useRef<Client | null>(null)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "user") {
      window.location.href = "/"
      return
    }

    loadUserData()
    loadConversations()
    setupWebSocket()
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessagesForConversation(selectedConversation)
    }
  }, [selectedConversation])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch("http://localhost:8080/api/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser({
          name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
          email: userData.email || "",
          avatar: userData.profilePicture || ""
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const setupWebSocket = () => {
    const token = localStorage.getItem("jwt_token")
    const sock = new SockJS("http://localhost:8080/api/ws")
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected")
        // Subscribe to user-specific messages
        client.subscribe("/user/queue/messages", (msg) => {
          const body = JSON.parse(msg.body)
          console.log("Received message:", body)
          setMessages((prev) => [...prev, body])
          
          // Update conversation last message
          if (body.conversationId) {
            setConversations(prev => prev.map(conv => 
              conv.id === body.conversationId.toString() 
                ? { ...conv, lastMessage: body.content, timestamp: body.sentAt || new Date().toLocaleTimeString() }
                : conv
            ))
          }
        })
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected")
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame)
      }
    })
    
    client.activate()
    stompClient.current = client
    
    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch("http://localhost:8080/api/conversations/participant/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Conversations:", data)
        
        const mappedConversations: Conversation[] = data.content?.map((conv: any) => ({
          id: conv.id.toString(),
          participant: conv.title || "Support Team",
          lastMessage: conv.lastMessage?.content || "",
          timestamp: conv.lastMessage?.sentAt ? new Date(conv.lastMessage.sentAt).toLocaleTimeString() : "",
          unreadCount: conv.unreadCount || 0,
          type: conv.type || "DIRECT"
        })) || []
        
        setConversations(mappedConversations)
      } else {
        console.error("Failed to load conversations:", response.status)
        // Load mock data for testing
        loadMockConversations()
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      loadMockConversations()
    }
  }

  const loadMockConversations = () => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        participant: "Admin Support",
        lastMessage: "How can I help you today?",
        timestamp: "10:30 AM",
        unreadCount: 0,
        type: "DIRECT"
      },
      {
        id: "2",
        participant: "Technical Support",
        lastMessage: "Your request has been processed",
        timestamp: "Yesterday",
        unreadCount: 1,
        type: "DIRECT"
      }
    ]
    setConversations(mockConversations)
  }

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch(`http://localhost:8080/api/messages/conversation/${conversationId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Messages for conversation:", data)
        
        // Map backend messages to frontend interface
        const mappedMessages: Message[] = data.content?.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.senderName || "Unknown",
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : "Unknown",
          isRead: true,
          isStarred: msg.isStarred || false,
          type: msg.senderName === user.name ? "sent" : "received",
          conversationId: msg.conversationId,
          sentAt: msg.sentAt
        })) || []
        
        setMessages(mappedMessages)
      } else {
        console.error("Failed to load messages:", response.status)
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId)
    loadMessagesForConversation(conversationId)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const handleSendMessage = () => {
    if (!stompClient.current) {
      console.error("WebSocket client not connected")
      alert("WebSocket not connected. Please refresh the page.")
      return
    }
    
    if (!newMessage.trim()) {
      return
    }
    
    if (!selectedConversation) {
      alert("Please select a conversation first.")
      return
    }
    
    try {
      const messageData = {
        content: newMessage,
        conversationId: parseInt(selectedConversation),
        senderName: user.name,
        sentAt: new Date().toISOString(),
        type: "sent"
      }
      
      console.log("Sending message:", messageData)
      
      stompClient.current.publish({
        destination: "/app/message",
        body: JSON.stringify(messageData),
      })
      
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="messages" onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col ml-16 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Chat with support team</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Conversations List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.participant}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-400">
                          {conversation.timestamp}
                        </span>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConv?.participant}
                      </h3>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === "sent"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === "sent" ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 