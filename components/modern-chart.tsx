"use client"

import { useEffect, useRef } from "react"

interface ChartData {
  name: string
  value1: number
  value2?: number
  value?: number
}

interface ChartDataset {
  label?: string
  data: number[]
  borderColor?: string
  backgroundColor?: string | string[]
  borderWidth?: number
  tension?: number
}

interface ChartDataConfig {
  labels: string[]
  datasets: ChartDataset[]
}

interface ModernChartProps {
  type: "line" | "bar" | "doughnut"
  data: ChartData[] | ChartDataConfig
  height?: number
  options?: any
}

export function ModernChart({ type, data, height = 300, options }: ModernChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chartContainer = chartRef.current
    chartContainer.innerHTML = ""

    // Handle both old format (ChartData[]) and new format (ChartDataConfig)
    let chartData: ChartData[]
    let labels: string[] = []

    if (Array.isArray(data)) {
      chartData = data
      labels = data.map(item => item.name)
    } else {
      // New format with labels and datasets
      chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.datasets[0]?.data[index] || 0,
        value1: data.datasets[0]?.data[index] || 0
      }))
      labels = data.labels
    }

    if (type === "line") {
      // Create line chart
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", "100%")
      svg.setAttribute("height", height.toString())
      svg.setAttribute("viewBox", `0 0 800 ${height}`)

      // Create gradient definitions
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")

      // Blue gradient
      const blueGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      blueGradient.setAttribute("id", "blueGradient")
      blueGradient.setAttribute("x1", "0%")
      blueGradient.setAttribute("y1", "0%")
      blueGradient.setAttribute("x2", "0%")
      blueGradient.setAttribute("y2", "100%")

      const blueStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
      blueStop1.setAttribute("offset", "0%")
      blueStop1.setAttribute("stop-color", "#3B82F6")
      blueStop1.setAttribute("stop-opacity", "0.3")

      const blueStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
      blueStop2.setAttribute("offset", "100%")
      blueStop2.setAttribute("stop-color", "#3B82F6")
      blueStop2.setAttribute("stop-opacity", "0")

      blueGradient.appendChild(blueStop1)
      blueGradient.appendChild(blueStop2)

      // Yellow gradient
      const yellowGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      yellowGradient.setAttribute("id", "yellowGradient")
      yellowGradient.setAttribute("x1", "0%")
      yellowGradient.setAttribute("y1", "0%")
      yellowGradient.setAttribute("x2", "0%")
      yellowGradient.setAttribute("y2", "100%")

      const yellowStop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
      yellowStop1.setAttribute("offset", "0%")
      yellowStop1.setAttribute("stop-color", "#F59E0B")
      yellowStop1.setAttribute("stop-opacity", "0.3")

      const yellowStop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
      yellowStop2.setAttribute("offset", "100%")
      yellowStop2.setAttribute("stop-color", "#F59E0B")
      yellowStop2.setAttribute("stop-opacity", "0")

      yellowGradient.appendChild(yellowStop1)
      yellowGradient.appendChild(yellowStop2)

      defs.appendChild(blueGradient)
      defs.appendChild(yellowGradient)
      svg.appendChild(defs)

      // Calculate points
      const maxValue = Math.max(...chartData.map((d) => Math.max(d.value1, d.value2 || 0)))
      const padding = 40
      const chartWidth = 800 - padding * 2
      const chartHeight = height - padding * 2

      // Create paths
      const bluePath = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const yellowPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const blueArea = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const yellowArea = document.createElementNS("http://www.w3.org/2000/svg", "path")

      let bluePathData = ""
      let yellowPathData = ""
      let blueAreaData = ""
      let yellowAreaData = ""

      chartData.forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y1 = padding + chartHeight - (point.value1 / maxValue) * chartHeight
        const y2 = padding + chartHeight - ((point.value2 || 0) / maxValue) * chartHeight

        const command = index === 0 ? "M" : "L"
        bluePathData += `${command} ${x} ${y1} `
        yellowPathData += `${command} ${x} ${y2} `

        if (index === 0) {
          blueAreaData += `M ${x} ${padding + chartHeight} L ${x} ${y1} `
          yellowAreaData += `M ${x} ${padding + chartHeight} L ${x} ${y2} `
        } else {
          blueAreaData += `L ${x} ${y1} `
          yellowAreaData += `L ${x} ${y2} `
        }
      })

      // Close area paths
      blueAreaData += `L ${padding + chartWidth} ${padding + chartHeight} Z`
      yellowAreaData += `L ${padding + chartWidth} ${padding + chartHeight} Z`

      // Set path attributes
      blueArea.setAttribute("d", blueAreaData)
      blueArea.setAttribute("fill", "url(#blueGradient)")

      yellowArea.setAttribute("d", yellowAreaData)
      yellowArea.setAttribute("fill", "url(#yellowGradient)")

      bluePath.setAttribute("d", bluePathData)
      bluePath.setAttribute("stroke", "#3B82F6")
      bluePath.setAttribute("stroke-width", "3")
      bluePath.setAttribute("fill", "none")

      yellowPath.setAttribute("d", yellowPathData)
      yellowPath.setAttribute("stroke", "#F59E0B")
      yellowPath.setAttribute("stroke-width", "3")
      yellowPath.setAttribute("fill", "none")

      svg.appendChild(blueArea)
      svg.appendChild(yellowArea)
      svg.appendChild(bluePath)
      svg.appendChild(yellowPath)

      chartContainer.appendChild(svg)
    } else if (type === "bar") {
      // Create bar chart
      const chartDiv = document.createElement("div")
      chartDiv.className = "flex items-end justify-between p-4 bg-gray-50 rounded-lg"
      chartDiv.style.height = `${height}px`

      const maxValue = Math.max(...chartData.map((d) => Math.max(d.value1, d.value2 || 0)))

      chartData.forEach((item) => {
        const barGroup = document.createElement("div")
        barGroup.className = "flex flex-col items-center space-y-2"

        const barsContainer = document.createElement("div")
        barsContainer.className = "flex space-x-1 items-end"

        // First bar
        const bar1 = document.createElement("div")
        bar1.className = "w-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
        bar1.style.height = `${(item.value1 / maxValue) * (height - 80)}px`

        // Second bar (if exists)
        if (item.value2) {
          const bar2 = document.createElement("div")
          bar2.className = "w-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t"
          bar2.style.height = `${(item.value2 / maxValue) * (height - 80)}px`
          barsContainer.appendChild(bar2)
        }

        barsContainer.appendChild(bar1)

        const label = document.createElement("div")
        label.className = "text-xs text-gray-600 text-center font-medium"
        label.textContent = item.name

        barGroup.appendChild(barsContainer)
        barGroup.appendChild(label)
        chartDiv.appendChild(barGroup)
      })

      chartContainer.appendChild(chartDiv)
    } else if (type === "doughnut") {
      // Create doughnut chart
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", height.toString())
      svg.setAttribute("height", height.toString())
      svg.setAttribute("viewBox", `0 0 ${height} ${height}`)

      const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0)
      const centerX = height / 2
      const centerY = height / 2
      const radius = height / 2 - 20
      const innerRadius = radius * 0.6

      let currentAngle = -90

      // Define colors for doughnut chart
      const colors = [
        'rgba(34, 197, 94, 0.8)',   // Green
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(245, 158, 11, 0.8)',  // Orange
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(139, 92, 246, 0.8)',  // Purple
        'rgba(236, 72, 153, 0.8)',  // Pink
      ]

      chartData.forEach((item, index) => {
        const percentage = (item.value || 0) / total
        const angle = percentage * 360

        const startAngle = (currentAngle * Math.PI) / 180
        const endAngle = ((currentAngle + angle) * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(startAngle)
        const y1 = centerY + radius * Math.sin(startAngle)
        const x2 = centerX + radius * Math.cos(endAngle)
        const y2 = centerY + radius * Math.sin(endAngle)

        const x3 = centerX + innerRadius * Math.cos(endAngle)
        const y3 = centerY + innerRadius * Math.sin(endAngle)
        const x4 = centerX + innerRadius * Math.cos(startAngle)
        const y4 = centerY + innerRadius * Math.sin(startAngle)

        const largeArcFlag = angle > 180 ? 1 : 0

        const pathData = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
          "Z",
        ].join(" ")

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("d", pathData)
        path.setAttribute("fill", colors[index % colors.length])

        svg.appendChild(path)
        currentAngle += angle
      })

      chartContainer.appendChild(svg)
    }
  }, [data, type, height])

  return <div ref={chartRef} className="w-full" />
}
