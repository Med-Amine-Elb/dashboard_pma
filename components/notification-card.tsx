import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface NotificationCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
}

export function NotificationCard({ icon, title, subtitle, color }: NotificationCardProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
