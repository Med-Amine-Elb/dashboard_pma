const fs = require('fs');
const path = './app/assigner-dashboard/page.tsx';

let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('const [stats, setStats] = useState<DashboardStats>({');
const endIdx = content.indexOf('const handleLogout = () => {');

if (startIdx !== -1 && endIdx !== -1) {
  const swrAndStatsCode = `const { data, error: swrError, isLoading: loading, mutate } = useSWR('assignerDashboardData', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  })

  // Handle errors manually via an effect
  useEffect(() => {
    if (swrError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      })
    }
  }, [swrError, toast])

  const stats = useMemo(() => {
    if (!data) return {
      activeAttributions: 0,
      pendingAttributions: 0,
      totalUsers: 0,
      satisfactionRate: 100,
      totalPhones: 0,
      totalSims: 0,
      assignedPhones: 0,
      assignedSims: 0,
      monthlyAttributions: [0, 0, 0, 0, 0, 0],
      monthlyReturns: [0, 0, 0, 0, 0, 0],
      deviceDistribution: [],
      recentActivity: []
    }

    const { attributions, users, phones, sims } = data

    const activeAttributions = attributions.filter(attr => attr.status === "ACTIVE").length
    const pendingAttributions = attributions.filter(attr => attr.status === "PENDING").length
    const totalUsers = users.length
    const totalPhones = phones.length
    const totalSims = sims.length
    const assignedPhones = phones.filter(phone => phone.status === "ASSIGNED" || phone.assignedToId).length
    const assignedSims = sims.filter(sim => sim.status === "ASSIGNED" || sim.assignedToId).length

    const returnedAttributions = attributions.filter(attr => attr.status === "RETURNED").length
    const totalAttributions = activeAttributions + returnedAttributions
    const satisfactionRate = totalAttributions > 0 ? Math.round((activeAttributions / totalAttributions) * 100) : 100

    const deviceCounts = {}
    phones.forEach(phone => {
      const brand = phone.brand || 'Autres'
      deviceCounts[brand] = (deviceCounts[brand] || 0) + 1
    })
    const deviceDistribution = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

    const recentActivity = [...attributions]
      .sort((a, b) => new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime())
      .slice(0, 4)
      .map(attr => ({
        user: attr.userName || 'Utilisateur inconnu',
        action: attr.status === "ACTIVE" ? "Attribution créée" : 
                attr.status === "RETURNED" ? "Attribution retournée" : "Demande traitée",
        item: attr.phoneModel || attr.simCardNumber || 'Élément inconnu',
        time: new Date(attr.assignmentDate).toLocaleDateString("fr-FR"),
        avatar: (attr.userName || '').split(' ').map(n => n[0]).join('').toUpperCase()
      }))

    return {
      activeAttributions,
      pendingAttributions,
      totalUsers,
      satisfactionRate,
      totalPhones,
      totalSims,
      assignedPhones,
      assignedSims,
      monthlyAttributions: [0, 0, 0, 0, 0, 0],
      monthlyReturns: [0, 0, 0, 0, 0, 0],
      deviceDistribution,
      recentActivity
    }
  }, [data])`;

  const newContent = content.substring(0, startIdx) + swrAndStatsCode + '\n\n  ' + content.substring(endIdx);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully replaced the block!");
} else {
  console.log("Could not find start or end indices.");
}
