const fs = require('fs');
const path = './app/assigner-dashboard/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add SWR import and useMemo
if (!content.includes('import useSWR from "swr"')) {
  // If it still says import { useState, useEffect }
  content = content.replace(
    'import { useState, useEffect } from "react"',
    'import { useState, useEffect, useMemo } from "react"\nimport useSWR, { mutate } from "swr"'
  );
  // Just in case it has useMemo too
  content = content.replace(
    'import { useState, useEffect, useMemo } from "react"\nimport { useState, useEffect, useMemo } from "react"',
    'import { useState, useEffect, useMemo } from "react"'
  );
}

// 2. Define the new fetcher and insert SWR before AssignerDashboard
const fetcherCode = `
const fetcher = async () => {
  const token = localStorage.getItem("jwt_token")
  if (!token) throw new Error("Token d'authentification manquant")

  const attributionApi = new AttributionManagementApi(getApiConfig(token))
  const userApi = new UserManagementApi(getApiConfig(token))
  const phoneApi = new PhoneManagementApi(getApiConfig(token))
  const simApi = new SIMCardManagementApi(getApiConfig(token))

  const safeFetch = (promise: Promise<any>) => 
    promise.catch(err => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearAuthCookies();
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("userRole");
        window.location.href = "/";
      }
      return { data: [] };
    });

  const [attributionsRes, usersRes, phonesRes, simsRes] = await Promise.all([
    safeFetch(attributionApi.getAttributions(1, 1000, undefined, undefined, undefined, undefined)),
    safeFetch(userApi.getUsers(1, 1000, undefined, undefined, undefined, undefined)),
    safeFetch(phoneApi.getPhones(1, 1000)),
    safeFetch(simApi.getSimCards(1, 1000))
  ])

  let attributions = []
  let users = []
  let phones = []
  let sims = []

  if (attributionsRes.data && typeof attributionsRes.data === 'object') {
    const attrData = attributionsRes.data
    attributions = attrData.success && attrData.data ? attrData.data.attributions : attrData.attributions || Array.isArray(attrData) ? attrData : []
  }
  if (usersRes.data && typeof usersRes.data === 'object') {
    const userData = usersRes.data
    users = userData.success && userData.data ? userData.data.users : userData.users || Array.isArray(userData) ? userData : []
  }
  if (phonesRes.data && typeof phonesRes.data === 'object') {
    const phoneData = phonesRes.data
    phones = phoneData.success && phoneData.data ? phoneData.data.phones : phoneData.phones || Array.isArray(phoneData) ? phoneData : []
  }
  if (simsRes.data && typeof simsRes.data === 'object') {
    const simData = simsRes.data
    sims = simData.success && simData.data ? simData.data.simcards || simData.data.simCards : simData.simcards || simData.simCards || Array.isArray(simData) ? simData : []
  }

  return { attributions, users, phones, sims }
}

export default function AssignerDashboard() {`;

// Only inject if it's not already there
if (!content.includes('const fetcher = async () => {')) {
  content = content.replace('export default function AssignerDashboard() {', fetcherCode);
}

// 3. Remove the giant state block and fetchDashboardData, replace with SWR and stats
const regexToReplace = /const \[stats, setStats\] = useState<DashboardStats>\(\{[\s\S]*?const fetchDashboardData = async \(\) => \{[\s\S]*?setLoading\(false\)\n    \}\n  \}/;

const swrAndStatsCode = `const { data, error: swrError, isLoading: loading, mutate } = useSWR('assignerDashboardData', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  })

  // Handle errors manually via an effect to trigger toast if needed, or just let error states render
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

if (regexToReplace.test(content)) {
  content = content.replace(regexToReplace, swrAndStatsCode);
}

// 4. Update the useEffect that had the old `fetchDashboardData()` call
const oldUseEffectPattern = /useEffect\(\(\) => \{\s*\/\/\s*Check authentication\s*const userRole[\s\S]*?fetchDashboardData\(\)\s*\}, \[userData, router\]\)/;

const newUseEffect = `useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "assigner") {
      router.push("/")
    }
  }, [router])`;

if (oldUseEffectPattern.test(content)) {
  content = content.replace(oldUseEffectPattern, newUseEffect);
}

// 5. Replace \`const [loading, setLoading] = useState(true)\`
content = content.replace('const [loading, setLoading] = useState(true)', '');

// Fix the onClick={fetchDashboardData} on the Refresh button
content = content.replace(/onClick=\{fetchDashboardData\}/g, "onClick={() => mutate()}");

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored Assigner Dashboard SWR!');
