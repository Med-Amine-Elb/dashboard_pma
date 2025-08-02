"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Phone, Eye, EyeOff, Shield, UserCheck, User } from "lucide-react"
import { AuthenticationApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

interface LoginCredentials {
  email: string
  password: string
  role: "admin" | "assigner" | "user"
}

const demoAccounts: LoginCredentials[] = [
  { email: "admin@company.com", password: "admin123", role: "admin" },
  { email: "assigner@company.com", password: "assigner123", role: "assigner" },
  { email: "john@company.com", password: "user123", role: "user" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const authApi = new AuthenticationApi(getApiConfig(null))

      const loginResponse = await authApi.login({
        email: email,
        password: password,
      })

      if (loginResponse.data.success && loginResponse.data.data) {
        const { token, user } = loginResponse.data.data
        
        // Store authentication data
        localStorage.setItem("jwt_token", token || "")
        localStorage.setItem("userRole", user?.role?.toLowerCase() || "")
        localStorage.setItem("userEmail", user?.email || "")
        localStorage.setItem("userId", user?.id?.toString() || "")
        localStorage.setItem("userName", user?.name || "")
        localStorage.setItem("userDepartment", user?.department || "")
        localStorage.setItem("userAvatar", user?.avatar || "")
      localStorage.setItem("isAuthenticated", "true")

        // Redirect to appropriate dashboard based on role
        const role = user?.role?.toLowerCase()
        if (role === "admin") {
          window.location.href = "/admin-dashboard"
        } else if (role === "assigner") {
          window.location.href = "/assigner-dashboard"
        } else if (role === "user") {
          window.location.href = "/user-dashboard"
        } else {
          setError("Rôle utilisateur non reconnu")
        }
    } else {
        setError("Échec de l'authentification")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Email ou mot de passe incorrect"
      )
    } finally {
    setIsLoading(false)
    }
  }

  const handleDemoLogin = async (account: LoginCredentials) => {
    setEmail(account.email)
    setPassword(account.password)
    
    // Auto-login after setting credentials
    setIsLoading(true)
    setError("")

    try {
      const authApi = new AuthenticationApi(getApiConfig(null))
      
      const loginResponse = await authApi.login({
        email: account.email,
        password: account.password,
      })

      if (loginResponse.data.success && loginResponse.data.data) {
        const { token, user } = loginResponse.data.data
        
        // Store authentication data
        localStorage.setItem("jwt_token", token || "")
        localStorage.setItem("userRole", user?.role?.toLowerCase() || "")
        localStorage.setItem("userEmail", user?.email || "")
        localStorage.setItem("userId", user?.id?.toString() || "")
        localStorage.setItem("userName", user?.name || "")
        localStorage.setItem("userDepartment", user?.department || "")
        localStorage.setItem("userAvatar", user?.avatar || "")
        localStorage.setItem("isAuthenticated", "true")

        // Redirect to appropriate dashboard based on role
        const role = user?.role?.toLowerCase()
        if (role === "admin") {
          window.location.href = "/admin-dashboard"
        } else if (role === "assigner") {
          window.location.href = "/assigner-dashboard"
        } else if (role === "user") {
          window.location.href = "/user-dashboard"
        } else {
          setError("Rôle utilisateur non reconnu")
        }
      } else {
        setError("Échec de l'authentification")
      }
    } catch (err: any) {
      console.error("Demo login error:", err)
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Échec de la connexion avec le compte de démonstration"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">TéléphoneManager</h1>
                <p className="text-gray-600">Système de Gestion d'Entreprise</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sécurisé & Fiable</h3>
                  <p className="text-sm text-gray-600">Protection avancée de vos données</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestion Complète du Parc</h3>
                  <p className="text-sm text-gray-600">Inventaire et suivi de tous vos téléphones</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Support Intégré</h3>
                  <p className="text-sm text-gray-600">Assistance technique et maintenance centralisée</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
              <h3 className="font-semibold mb-2">Statistiques en Temps Réel</h3>
              <p className="text-sm text-blue-100">
                Suivez l'attribution et l'utilisation de vos téléphones d'entreprise avec des analyses détaillées.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl w-fit">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Connexion</CardTitle>
              <CardDescription className="text-gray-600">
                Accédez à votre espace de gestion des téléphones
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">Comptes de démonstration :</p>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.role}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between h-10 bg-white/50 hover:bg-white/80"
                      onClick={() => handleDemoLogin(account)}
                      disabled={isLoading}
                    >
                      <span className="flex items-center space-x-2">
                        {account.role === "admin" && <Shield className="h-4 w-4 text-blue-600" />}
                        {account.role === "assigner" && <UserCheck className="h-4 w-4 text-emerald-600" />}
                        {account.role === "user" && <User className="h-4 w-4 text-orange-600" />}
                        <span className="capitalize">{account.role}</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          account.role === "admin"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : account.role === "assigner"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                        }
                      >
                        {account.email}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  En vous connectant, vous acceptez nos{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    conditions d'utilisation
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
