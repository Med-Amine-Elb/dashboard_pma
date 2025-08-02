"use client"

import { useEffect, useRef, useState } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Search, Bell, Globe, Send, MessageSquare } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function MessagesPage() {
  const [user, setUser] = useState({ name: "Randy Riley", email: "randy.riley@company.com", avatar: "" })
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const stompClient = useRef<Client | null>(null)

  // Debounced search term
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Fetch users for autocomplete
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    setSearchLoading(true)
    setSearchError("")
    const token = localStorage.getItem("jwt_token")
    
    // Try different API endpoints
    const endpoints = [
      `http://localhost:8080/api/users?name=${encodeURIComponent(debouncedSearch)}`,
      `http://localhost:8080/api/users?search=${encodeURIComponent(debouncedSearch)}&page=0&size=10`,
      `http://localhost:8080/api/users/search?query=${encodeURIComponent(debouncedSearch)}`
    ]
    
    const tryEndpoint = async (endpoint: string) => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log("Search results:", data)
          
          // Ensure we have an array of results
          let results = []
          if (Array.isArray(data)) {
            results = data
          } else if (data && Array.isArray(data.content)) {
            results = data.content
          } else if (data && Array.isArray(data.users)) {
            results = data.users
          } else if (data && data.data && Array.isArray(data.data.users)) {
            results = data.data.users
          } else {
            results = []
          }
          
          // Filter results based on search term for better precision
          const searchLower = debouncedSearch.toLowerCase()
          const filteredResults = results.filter(user => 
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
          )
          
          setSearchResults(filteredResults)
          setShowDropdown(true)
          return true
        }
        return false
      } catch (error) {
        console.error("Search error:", error)
        return false
      }
    }
    
    // Try each endpoint until one works
    const attemptSearch = async () => {
      let foundResults = false
      
      for (const endpoint of endpoints) {
        console.log("Trying endpoint:", endpoint)
        const success = await tryEndpoint(endpoint)
        if (success) {
          foundResults = true
          break
        }
      }
      
      if (!foundResults) {
        setSearchError("Aucun utilisateur trouvé")
        setShowDropdown(false)
      }
      setSearchLoading(false)
    }
    
    attemptSearch()
  }, [debouncedSearch])

  // Fetch conversations from backend on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")
    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }
    fetchConversations()
  }, [])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    } else {
      setMessages([])
    }
  }, [selectedConversation])

  // WebSocket setup
  useEffect(() => {
    const sock = new SockJS("http://localhost:8080/api/ws")
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {}, // Remove JWT token from WebSocket headers
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected successfully")
        
        // Subscribe to general messages topic
        client.subscribe("/topic/messages", (msg) => {
          const body = JSON.parse(msg.body)
          console.log("Received general message:", body)
          
          // Only add message if it belongs to the selected conversation
          if (body.conversationId === selectedConversation) {
            setMessages((prev) => [...prev, body])
          }
          
          // Update conversation list with new message
          if (body.conversationId) {
            setConversations(prev => prev.map(conv => 
              conv.id === body.conversationId 
                ? { ...conv, lastMessage: body.content, time: new Date(body.sentAt).toLocaleTimeString() }
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
  }, [selectedConversation])

  const fetchConversations = async () => {
    setLoadingConversations(true)
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
        setConversations(data.content || [])
        // Auto-select first conversation if available
        if (data.content && data.content.length > 0) {
          setSelectedConversation(data.content[0].id)
        }
      } else {
        setConversations([])
      }
    } catch (error) {
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    setLoadingMessages(true)
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
        setMessages(data.content || [])
      } else {
        setMessages([])
      }
    } catch (error) {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      normal: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleSendMessage = () => {
    if (!stompClient.current?.connected) {
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
        conversationId: selectedConversation,
        senderName: user.name,
        isAdmin: true,
        sentAt: new Date().toISOString()
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

  // Start/select conversation with user
  const handleUserSelect = async (userResult: any) => {
    console.log("Selected user:", userResult)
    setShowDropdown(false)
    setSearchTerm("")
    setSearchResults([])
    
    // Check if conversation already exists
    const existing = conversations.find(
      (conv) => conv.userId === userResult.id || 
                conv.user === userResult.name || 
                conv.user === `${userResult.firstName} ${userResult.lastName}` ||
                conv.title === `${userResult.firstName} ${userResult.lastName}`
    )
    
    if (existing) {
      console.log("Existing conversation found:", existing)
      setSelectedConversation(existing.id)
      return
    }
    
    // Create new conversation
    try {
      const token = localStorage.getItem("jwt_token")
      console.log("Creating conversation with user:", userResult.id)
      
      // First, try to get the current user's ID
      const currentUserResponse = await fetch("http://localhost:8080/api/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      let currentUserId = null
      if (currentUserResponse.ok) {
        const currentUser = await currentUserResponse.json()
        currentUserId = currentUser.id
        console.log("Current user ID:", currentUserId)
      }
      
      const conversationData = {
        userId: userResult.id,
        title: `${userResult.firstName} ${userResult.lastName}`,
        type: "DIRECT",
        createdBy: currentUserId
      }
      
      console.log("Sending conversation data:", conversationData)
      
      const response = await fetch("http://localhost:8080/api/conversations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(conversationData)
      })
      
      console.log("Conversation creation response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Created conversation:", data)
        
        // Add new conversation to list and select it
        const newConversation = {
          id: data.id,
          user: `${userResult.firstName} ${userResult.lastName}`,
          title: `${userResult.firstName} ${userResult.lastName}`,
          lastMessage: "",
          time: new Date().toLocaleTimeString(),
          unread: 0,
          status: "normal"
        }
        
        setConversations((prev) => [newConversation, ...prev])
        setSelectedConversation(data.id)
        
        // Send a welcome message
        setTimeout(() => {
          if (stompClient.current?.connected) {
            const welcomeMessage = {
              content: `Bonjour ${userResult.firstName}, comment puis-je vous aider aujourd'hui ?`,
              conversationId: data.id,
              senderName: user.name,
              isAdmin: true,
              sentAt: new Date().toISOString()
            }
            stompClient.current.publish({
              destination: "/app/message",
              body: JSON.stringify(welcomeMessage),
            })
          }
        }, 1000)
        
      } else {
        const errorText = await response.text()
        console.error("Failed to create conversation:", response.status, errorText)
        
        // Try alternative conversation creation method
        console.log("Trying alternative conversation creation...")
        const altResponse = await fetch("http://localhost:8080/api/conversations/direct", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            participantId: userResult.id
          })
        })
        
        if (altResponse.ok) {
          const altData = await altResponse.json()
          console.log("Created conversation via alternative method:", altData)
          
          const newConversation = {
            id: altData.id,
            user: `${userResult.firstName} ${userResult.lastName}`,
            title: `${userResult.firstName} ${userResult.lastName}`,
            lastMessage: "",
            time: new Date().toLocaleTimeString(),
            unread: 0,
            status: "normal"
          }
          
          setConversations((prev) => [newConversation, ...prev])
          setSelectedConversation(altData.id)
        } else {
          const altErrorText = await altResponse.text()
          console.error("Alternative method also failed:", altResponse.status, altErrorText)
          alert(`Impossible de démarrer la conversation. Erreur: ${response.status} - ${errorText}`)
        }
      }
    } catch (e) {
      console.error("Error creating conversation:", e)
      alert(`Erreur lors de la création de la conversation: ${e.message}`)
    }
  }

  // Filter messages for the selected conversation (should already be filtered by backend)
  const filteredMessages = messages

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        <Sidebar activeItem="message" onLogout={handleLogout} />
        <div className="flex-1 ml-64 min-h-screen overflow-hidden">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support & Messages</h1>
                <p className="text-gray-600">Communication avec les utilisateurs</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
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
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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
          {/* Content */}
          <div className="flex h-[calc(100vh-80px)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 bg-white/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>
                
                {/* Search Bar for Users */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Rechercher un utilisateur pour démarrer une conversation..."
                      className="pl-10 w-full bg-white/50 border-gray-200 focus:border-blue-500"
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value)
                        setShowDropdown(!!e.target.value)
                      }}
                      onFocus={() => setShowDropdown(!!searchResults.length)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showDropdown && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-2 text-gray-500 text-center">Recherche...</div>
                        ) : searchError ? (
                          <div className="p-2 text-red-500 text-center">{searchError}</div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-2 text-gray-500 text-center">Aucun utilisateur trouvé</div>
                        ) : (
                          searchResults.map((u) => (
                            <div
                              key={u.id}
                              className="flex items-center p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                              onMouseDown={() => handleUserSelect(u)}
                            >
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {u.role}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Existing Conversations */}
                {loadingConversations ? (
                  <div className="text-gray-500 text-center">Chargement...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-gray-500 text-center">Aucune conversation</div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-blue-100 border-blue-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                                {conversation.user
                                  ? conversation.user.split(" ").map((n: string) => n[0]).join("")
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{conversation.user || conversation.title || "Utilisateur inconnu"}</p>
                              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage || ""}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-xs text-gray-500">{conversation.time || ""}</span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">{conversation.unread}</Badge>
                            )}
                            <Badge className={getStatusColor(conversation.status)} variant="outline">
                              {conversation.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                          {conversations
                            .find((c) => c.id === selectedConversation)
                            ?.user?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {conversations.find((c) => c.id === selectedConversation)?.user || "Utilisateur inconnu"}
                        </h3>
                        <p className="text-sm text-gray-600">En ligne</p>
                      </div>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="text-gray-500 text-center">Chargement...</div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="text-gray-500 text-center">Aucun message</div>
                    ) : (
                      filteredMessages.map((message, i) => (
                        <div key={i} className={`flex ${message.isAdmin || message.senderName === user.name ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isAdmin || message.senderName === user.name ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isAdmin || message.senderName === user.name ? "text-blue-100" : "text-gray-500"}`}>
                              {message.sentAt ? new Date(message.sentAt).toLocaleTimeString() : message.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white/50">
                    <div className="flex space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 min-h-[40px] max-h-32 resize-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une conversation</h3>
                    <p className="text-gray-600">Choisissez une conversation pour commencer à discuter</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
