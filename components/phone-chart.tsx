"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  name: string
  value: number
}

interface PhoneChartProps {
  title: string
  type: "pie" | "line" | "bar"
  data: ChartData[]
}

export function PhoneChart({ title, type, data }: PhoneChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Simulation d'un graphique avec du CSS et HTML
    const chartContainer = chartRef.current
    chartContainer.innerHTML = ""

    if (type === "pie") {
      // Graphique en secteurs simplifié
      const total = data.reduce((sum, item) => sum + item.value, 0)
      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#64748B"]

      const pieContainer = document.createElement("div")
      pieContainer.className = "flex items-center justify-center h-64"

      const pieChart = document.createElement("div")
      pieChart.className = "relative w-48 h-48 rounded-full overflow-hidden"
      pieChart.style.background = `conic-gradient(${data
        .map((item, index) => {
          const percentage = (item.value / total) * 100
          const color = colors[index % colors.length]
          return `${color} 0deg ${percentage * 3.6}deg`
        })
        .join(", ")})`

      const legend = document.createElement("div")
      legend.className = "ml-8 space-y-2"
      data.forEach((item, index) => {
        const legendItem = document.createElement("div")
        legendItem.className = "flex items-center space-x-2"
        legendItem.innerHTML = `
          <div class="w-4 h-4 rounded" style="background-color: ${colors[index % colors.length]}"></div>
          <span class="text-sm">${item.name}: ${item.value}</span>
        `
        legend.appendChild(legendItem)
      })

      pieContainer.appendChild(pieChart)
      pieContainer.appendChild(legend)
      chartContainer.appendChild(pieContainer)
    } else if (type === "line" || type === "bar") {
      // Graphique linéaire ou en barres simplifié
      const maxValue = Math.max(...data.map((item) => item.value))
      const chartDiv = document.createElement("div")
      chartDiv.className = "h-64 flex items-end justify-between p-4 bg-gray-50 rounded-lg"

      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * 200
        const bar = document.createElement("div")
        bar.className = `${type === "bar" ? "w-8" : "w-2"} bg-blue-500 rounded-t flex flex-col items-center justify-end`
        bar.style.height = `${barHeight}px`

        const label = document.createElement("div")
        label.className = "text-xs text-gray-600 mt-2 text-center"
        label.textContent = item.name

        const value = document.createElement("div")
        value.className = "text-xs text-white mb-1"
        value.textContent = item.value.toString()

        bar.appendChild(value)

        const container = document.createElement("div")
        container.className = "flex flex-col items-center"
        container.appendChild(bar)
        container.appendChild(label)

        chartDiv.appendChild(container)
      })

      chartContainer.appendChild(chartDiv)
    }
  }, [data, type])

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full" />
      </CardContent>
    </Card>
  )
}
