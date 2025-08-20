'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Employee {
  id: string
  name: string
}

export default function EmployeeDashboard() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cek apakah pegawai sudah login
    const employeeData = localStorage.getItem('currentEmployee')
    if (!employeeData) {
      router.push('/employee/login')
      return
    }

    setCurrentEmployee(JSON.parse(employeeData))
    fetchApplications()
  }, [router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const result = await response.json()
      
      if (result.success) {
        setApplications(result.applications)
        
        // Hitung statistik
        const pending = result.applications.filter((app: any) => app.status === 'PENDING').length
        const inProgress = result.applications.filter((app: any) => app.financingAnalysis).length
        const completed = result.applications.filter((app: any) => app.status === 'APPROVED' || app.status === 'REJECTED').length
        
        setStats({ pending, inProgress, completed })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentEmployee')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dashboard Pegawai</h1>
              <p className="text-gray-700 mt-1">
                Selamat datang, <span className="font-semibold text-emerald-700">{currentEmployee?.name}</span>
              </p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pengajuan Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-gray-600">Menunggu analisa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dalam Proses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
              <p className="text-gray-600">Sedang dianalisa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-gray-600">Analisa selesai</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">Analisa Pembiayaan</CardTitle>
              <CardDescription>
                Buat analisa pembiayaan untuk pengajuan kredit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Analisa 5C (Character, Capacity, Capital, Condition, Collateral)</li>
                <li>• Penilaian kelayakan kredit</li>
                <li>• Rekomendasi persetujuan</li>
              </ul>
              <Button className="w-full">
                Buat Analisa Baru
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">Sub Analisa</CardTitle>
              <CardDescription>
                Buat sub analisa detail untuk setiap kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Scoring per kategori</li>
                <li>• Bobot penilaian</li>
                <li>• Catatan detail</li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Buat Sub Analisa
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pengajuan Terbaru</CardTitle>
            <CardDescription>
              Daftar pengajuan pembiayaan yang perlu dianalisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pengajuan pembiayaan
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{app.fullName}</h4>
                      <p className="text-sm text-gray-600">
                        Pinjaman: Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)} - {app.loanTerm} bulan
                      </p>
                      <p className="text-xs text-gray-500">
                        Diajukan: {new Date(app.submittedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status === 'PENDING' ? 'Menunggu' :
                         app.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </span>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                    </div>
                  </div>
                ))}
                {applications.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      Lihat Semua ({applications.length} pengajuan)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
