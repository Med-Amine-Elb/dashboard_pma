import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface UseWebSocketProps {
  onMessage: (message: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
  conversationId?: string | number | null
}

export const useWebSocket = ({
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  conversationId
}: UseWebSocketProps) => {
  const clientRef = useRef<Client | null>(null)
  const subscriptionsRef = useRef<string[]>([])

  const connect = useCallback(() => {
    const token = localStorage.getItem("jwt_token")
    const sock = new SockJS("http://localhost:8080/api/ws")
    
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected")
        
        // Subscribe to general messages topic
        const generalSub = client.subscribe("/topic/messages", (msg) => {
          const body = JSON.parse(msg.body)
          console.log("Received general message:", body)
          onMessage(body)
        })
        subscriptionsRef.current.push(generalSub.id)
        
        // Subscribe to conversation-specific topic if conversation is selected
        if (conversationId) {
          const conversationSub = client.subscribe(`/topic/conversation/${conversationId}`, (msg) => {
            const body = JSON.parse(msg.body)
            console.log("Received conversation-specific message:", body)
            onMessage(body)
          })
          subscriptionsRef.current.push(conversationSub.id)
        }
        
        onConnect?.()
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected")
        onDisconnect?.()
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame)
        onError?.(frame)
      }
    })
    
    client.activate()
    clientRef.current = client
  }, [onMessage, onConnect, onDisconnect, onError, conversationId])

  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      // Unsubscribe from all subscriptions
      subscriptionsRef.current.forEach(subId => {
        clientRef.current?.unsubscribe(subId)
      })
      subscriptionsRef.current = []
      
      clientRef.current.deactivate()
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/message",
        body: JSON.stringify(message),
      })
    } else {
      console.error("WebSocket not connected")
      throw new Error("WebSocket not connected")
    }
  }, [])

  const joinConversation = useCallback((conversationId: string | number) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/join-conversation",
        body: JSON.stringify({ conversationId }),
      })
    }
  }, [])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Reconnect when conversation changes
  useEffect(() => {
    if (clientRef.current?.connected) {
      // Unsubscribe from old conversation
      subscriptionsRef.current.forEach(subId => {
        clientRef.current?.unsubscribe(subId)
      })
      subscriptionsRef.current = []
      
      // Subscribe to new conversation
      if (conversationId) {
        const conversationSub = clientRef.current.subscribe(`/topic/conversation/${conversationId}`, (msg) => {
          const body = JSON.parse(msg.body)
          console.log("Received conversation-specific message:", body)
          onMessage(body)
        })
        subscriptionsRef.current.push(conversationSub.id)
      }
    }
  }, [conversationId, onMessage])

  return {
    client: clientRef.current,
    sendMessage,
    joinConversation,
    isConnected: clientRef.current?.connected || false
  }
} 