"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "employee">("client")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(userType, {
        email,
        password,
        redirect: false,
      })

      console.log("SignIn result:", result)

      if (result?.error) {
        setError("Email atau password salah")
      } else if (result?.ok) {
        // Get session to check user role
        const session = await getSession()
        console.log("Session after login:", session)
        
        if (session?.user && 'role' in session.user) {
          if (session.user.role === "employee") {
            router.push("/employee/dashboard")
          } else {
            router.push("/client/dashboard")
          }
        } else {
          // Fallback redirect based on userType
          if (userType === "employee") {
            router.push("/employee/dashboard")
          } else {
            router.push("/client/dashboard")
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan saat login. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            KSU Kirap Entrepreneurship
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistem Survey Digital
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masuk ke Sistem</CardTitle>
            <CardDescription>
              Pilih jenis akun dan masukkan kredensial Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    userType === "client"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("employee")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    userType === "employee"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pegawai KSU
                </button>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Masukkan email Anda"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Masukkan password Anda"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <a
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Daftar di sini
                </a>
              </p>
            </div>

            {/* Debug Info in Development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                <p>Debug Mode:</p>
                <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "Not set"}</p>
                <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}