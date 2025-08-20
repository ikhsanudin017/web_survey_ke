"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FinancingApplication {
  id: string
  fullName: string
  loanAmount: number
  loanPurpose: string
  status: string
  submittedAt: string
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<FinancingApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    const sessionWithRole = session as { user: { name: string; email: string; role: string } } | null
    if (!sessionWithRole || !sessionWithRole.user || sessionWithRole.user.role !== "client") {
      router.push("/auth/signin")
      return
    }

    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/client/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100"
      case "APPROVED":
        return "text-green-600 bg-green-100"
      case "REJECTED":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Menunggu"
      case "APPROVED":
        return "Disetujui"
      case "REJECTED":
        return "Ditolak"
      default:
        return status
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Client
              </h1>
              <p className="text-gray-600">
                Selamat datang, {session?.user?.name}
              </p>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              variant="outline"
            >
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Kelola pengajuan pembiayaan Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => router.push("/client/application/new")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ajukan Pembiayaan Baru
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pengajuan</CardTitle>
              <CardDescription>
                Daftar semua pengajuan pembiayaan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Belum ada pengajuan pembiayaan.
                  </p>
                  <Button
                    onClick={() => router.push("/client/application/new")}
                    className="mt-4"
                  >
                    Buat Pengajuan Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.fullName}
                          </h3>
                          <p className="text-gray-600">
                            Tujuan: {application.loanPurpose}
                          </p>
                          <p className="text-gray-600">
                            Jumlah: Rp {application.loanAmount.toLocaleString("id-ID")}
                          </p>
                          <p className="text-sm text-gray-500">
                            Diajukan: {new Date(application.submittedAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
