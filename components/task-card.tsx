interface TaskCardProps {
  title: string
  time: string
  color: string
}

export function TaskCard({ title, time, color }: TaskCardProps) {
  return (
    <div className={`p-3 rounded-lg ${color} text-white shadow-lg`}>
      <h4 className="font-medium text-sm mb-1">{title}</h4>
      <p className="text-xs opacity-90">{time}</p>
    </div>
  )
}
