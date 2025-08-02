"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Search, Bell, Globe, Send, Paperclip, MoreVertical, Phone, Video, Star } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface Message {
  id: string
  sender: string
  senderName?: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  type: "received" | "sent"
  conversationId?: number
  sentAt?: string
}

interface Conversation {
  id: string
  title?: string
  participant: string
  participantAvatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  participantNames?: string[]
  lastMessageContent?: string
  lastMessageAt?: string
  type?: string
}

export default function AssignerMessagesPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
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

    if (!isAuthenticated || userRole !== "assigner") {
      window.location.href = "/"
      return
    }

    loadConversations()
    setupWebSocket()
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessagesForConversation(selectedConversation)
    }
  }, [selectedConversation])

  const setupWebSocket = () => {
    const token = localStorage.getItem("jwt_token")
    const sock = new SockJS("http://localhost:8080/api/ws")
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected")
        
        // Subscribe to general messages topic
        client.subscribe("/topic/messages", (msg) => {
          const body = JSON.parse(msg.body)
          console.log("Received general message:", body)
          
          // Only add message if it belongs to the selected conversation
          if (body.conversationId?.toString() === selectedConversation) {
            setMessages((prev) => [...prev, body])
          }
          
          // Update conversation last message
          if (body.conversationId) {
            setConversations(prev => prev.map(conv => 
              conv.id === body.conversationId.toString() 
                ? { ...conv, lastMessage: body.content, timestamp: body.sentAt || new Date().toLocaleTimeString() }
                : conv
            ))
          }
        })
        
        // Subscribe to conversation-specific topic if conversation is selected
        if (selectedConversation) {
          client.subscribe(`/topic/conversation/${selectedConversation}`, (msg) => {
            const body = JSON.parse(msg.body)
            console.log("Received conversation-specific message:", body)
            setMessages((prev) => [...prev, body])
          })
        }
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
      const response = await fetch("http://localhost:8080/api/conversations", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Conversations from API:", data)
        
        // Map backend data to frontend interface
        const mappedConversations: Conversation[] = data.content?.map((conv: any) => ({
          id: conv.id.toString(),
          title: conv.title,
          participant: conv.participantNames?.[0] || conv.title || "Unknown User",
          lastMessage: conv.lastMessageContent || "No messages yet",
          timestamp: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString() : "Never",
          unreadCount: conv.unreadCount || 0,
          isOnline: Math.random() > 0.5, // Mock online status for now
          participantNames: conv.participantNames,
          lastMessageContent: conv.lastMessageContent,
          lastMessageAt: conv.lastMessageAt,
          type: conv.type
        })) || []
        
        console.log("Mapped conversations:", mappedConversations)
        setConversations(mappedConversations)
        
        if (mappedConversations.length > 0) {
          setSelectedConversation(mappedConversations[0].id)
        }
      } else {
        console.error("Failed to load conversations:", response.status)
        // Fallback to mock data if API fails
        loadMockConversations()
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      // Fallback to mock data if API fails
      loadMockConversations()
    }
  }

  const loadMockConversations = () => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        participant: "Jean Dupont",
        lastMessage: "Merci pour l'attribution du nouveau téléphone !",
        timestamp: "10:30",
        unreadCount: 0,
        isOnline: true,
      },
      {
        id: "2",
        participant: "Marie Martin",
        lastMessage: "J'ai un problème avec ma carte SIM...",
        timestamp: "09:45",
        unreadCount: 2,
        isOnline: false,
      },
      {
        id: "3",
        participant: "Pierre Durand",
        lastMessage: "Quand puis-je récupérer mon téléphone ?",
        timestamp: "Hier",
        unreadCount: 1,
        isOnline: true,
      },
      {
        id: "4",
        participant: "Sophie Dubois",
        lastMessage: "Attribution validée, merci !",
        timestamp: "Hier",
        unreadCount: 0,
        isOnline: false,
      },
      {
        id: "5",
        participant: "Admin Système",
        lastMessage: "Rapport mensuel des attributions disponible",
        timestamp: "Lundi",
        unreadCount: 0,
        isOnline: true,
      },
    ]
    setConversations(mockConversations)
    setSelectedConversation("1")
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
          isRead: true, // For now, assume all messages are read
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
    console.log("Send message clicked")
    console.log("stompClient:", stompClient.current)
    console.log("newMessage:", newMessage)
    console.log("selectedConversation:", selectedConversation)
    
    if (!stompClient.current) {
      console.error("WebSocket client not connected")
      alert("WebSocket not connected. Please refresh the page.")
      return
    }
    
    if (!newMessage.trim()) {
      console.log("Message is empty")
      return
    }
    
    if (!selectedConversation) {
      console.log("No conversation selected")
      alert("Please select a conversation first.")
      return
    }
    
    try {
      const messageData = {
        content: newMessage,
        conversationId: parseInt(selectedConversation),
        senderName: user.name,
        isAdmin: false,
        sentAt: new Date().toISOString(),
        type: "sent"
      }
      
      console.log("Sending message:", messageData)
      
      stompClient.current.publish({
        destination: "/app/message",
        body: JSON.stringify(messageData),
      })
      
      setNewMessage("")
      console.log("Message sent successfully")
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

  // Filter messages for the selected conversation
  const filteredMessages = messages.filter(
    (msg) => msg.conversationId?.toString() === selectedConversation || !msg.conversationId
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="messages" onLogout={handleLogout} />

        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Communication avec les utilisateurs et l'équipe</p>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="bg-white/50">
                  <Globe className="h-4 w-4 mr-2" />
                  FR
                </Button>

                <Button variant="outline" size="sm" className="bg-white/50 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>

                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une conversation..."
                      className="pl-10 bg-white/50 border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-blue-50 border-l-blue-500"
                            : "border-l-transparent"
                        }`}
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participantAvatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                                {conversation.participant
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">{conversation.participant}</p>
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">{conversation.unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl h-full flex flex-col">
                  {selectedConv ? (
                    <>
                      {/* Chat Header */}
                      <CardHeader className="border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedConv.participantAvatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                  {selectedConv.participant
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {selectedConv.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedConv.participant}</h3>
                              <p className="text-sm text-gray-500">
                                {selectedConv.isOnline ? "En ligne" : "Hors ligne"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Messages */}
                      <CardContent className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                          {filteredMessages.map((message, index) => (
                            <div
                              key={message.id || index}
                              className={`flex ${message.type === "sent" || message.senderName === user.name ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.type === "sent" || message.senderName === user.name 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-xs ${message.type === "sent" || message.senderName === user.name ? "opacity-70" : "text-gray-500"}`}>
                                    {message.sentAt ? new Date(message.sentAt).toLocaleTimeString() : message.timestamp}
                                  </span>
                                  {message.isStarred && <Star className="h-3 w-3 fill-current" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      {/* Message Input */}
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex items-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Tapez votre message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="min-h-[40px] max-h-32 resize-none"
                              rows={1}
                            />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une conversation</h3>
                        <p className="text-gray-600">Choisissez une conversation pour commencer à discuter</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
