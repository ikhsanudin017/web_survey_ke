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
    withSubAnalysis: 0,
    withAnalysis: 0,
    withBiChecking: 0,
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
      
      if (response.ok) {
        setApplications(result.applications)
        
        // Hitung statistik yang lebih detail
        const pending = result.applications.filter((app: any) => app.status === 'PENDING').length
        const withSubAnalysis = result.applications.filter((app: any) => app.subFinancingAnalysis).length
        const withAnalysis = result.applications.filter((app: any) => app.financingAnalysis).length
        const withBiChecking = result.applications.filter((app: any) => app.biChecking).length
        const completed = result.applications.filter((app: any) => app.status === 'APPROVED' || app.status === 'REJECTED').length
        
        setStats({ pending, withSubAnalysis, withAnalysis, withBiChecking, completed })
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dashboard Pegawai Enhanced</h1>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pengajuan Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-gray-600">Belum diproses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ada Sub-Analisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.withSubAnalysis}</div>
              <p className="text-xs text-gray-600">Siap untuk analisa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ada Analisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.withAnalysis}</div>
              <p className="text-xs text-gray-600">Sudah dianalisa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ada BI Checking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withBiChecking}</div>
              <p className="text-xs text-gray-600">BI checking selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-600">Proses lengkap</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">📋 Sub Analisa Pembiayaan</CardTitle>
              <CardDescription>
                Form sub analisa detail keuangan client (WAJIB PERTAMA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Pemasukan dan pengeluaran detail</li>
                <li>• Analisa pendapatan bersih</li>
                <li>• Plafon maksimal dan angsuran</li>
                <li>• <strong>HARUS DIISI SEBELUM ANALISA</strong></li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/employee/sub-analysis/new')}
              >
                Buat Sub Analisa
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">🔍 Analisa Pembiayaan Enhanced</CardTitle>
              <CardDescription>
                Form analisa 5C dengan AI dan auto-fill data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Auto-fill data dari client</li>
                <li>• Rating dengan nama penilai</li>
                <li>• AI kesimpulan karakter</li>
                <li>• Checklist dokumen otomatis</li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/employee/analysis/new')}
              >
                Buat Analisa Enhanced
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-orange-600">🤖 BI Checking AI</CardTitle>
              <CardDescription>
                Upload PDF BI checking dengan analisa AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Upload PDF BI checking</li>
                <li>• AI scan dan analisa otomatis</li>
                <li>• Credit score dan risk level</li>
                <li>• Rekomendasi kelayakan kredit</li>
              </ul>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push('/employee/bi-checking/new')}
              >
                Upload & Analisa BI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow Guide */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">📊 Alur Proses Pembiayaan</CardTitle>
            <CardDescription>
              Ikuti urutan proses untuk hasil analisa yang optimal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm font-medium">Client Mengisi Form</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-sm font-medium">Sub-Analisa (WAJIB)</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm font-medium">Analisa Enhanced</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-sm font-medium">BI Checking AI</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span className="text-sm font-medium">Keputusan Final</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Pengajuan Terbaru</CardTitle>
            <CardDescription>
              Daftar pengajuan pembiayaan dengan status terkini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pengajuan pembiayaan
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 8).map((app: { 
                  id: string; 
                  fullName: string; 
                  loanAmount: number; 
                  loanTerm: number; 
                  submittedAt: string; 
                  status: string;
                  documents?: Array<{ id: string; originalName: string; category: string; fileUrl: string }>;
                  subFinancingAnalysis?: any;
                  financingAnalysis?: any;
                  biChecking?: any;
                }) => (
                  <div key={app.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/employee/applications/${app.id}`)}
                        >
                          Detail
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Indicators */}
                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                      <div className={`flex items-center space-x-1 text-xs ${app.subFinancingAnalysis ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full ${app.subFinancingAnalysis ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Sub-Analisa</span>
                      </div>
                      <div className={`flex items-center space-x-1 text-xs ${app.financingAnalysis ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full ${app.financingAnalysis ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Analisa</span>
                      </div>
                      <div className={`flex items-center space-x-1 text-xs ${app.biChecking ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full ${app.biChecking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>BI Check</span>
                      </div>
                    </div>

                    {/* Action Buttons based on Progress */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {!app.subFinancingAnalysis && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                          onClick={() => router.push(`/employee/sub-analysis/new?applicationId=${app.id}`)}
                        >
                          + Sub Analisa
                        </Button>
                      )}
                      {app.subFinancingAnalysis && !app.financingAnalysis && (
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-xs"
                          onClick={() => router.push(`/employee/analysis/new?applicationId=${app.id}`)}
                        >
                          + Analisa Enhanced
                        </Button>
                      )}
                      {app.financingAnalysis && !app.biChecking && (
                        <Button 
                          size="sm" 
                          className="bg-orange-600 hover:bg-orange-700 text-xs"
                          onClick={() => router.push(`/employee/bi-checking/new?applicationId=${app.id}`)}
                        >
                          + BI Checking
                        </Button>
                      )}
                    </div>

                    {/* Display uploaded documents */}
                    {app.documents && app.documents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Dokumen Terupload ({app.documents.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {app.documents.slice(0, 3).map((doc, index) => (
                            <a
                              key={index}
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              📄 {doc.originalName.length > 15 ? doc.originalName.substring(0, 15) + '...' : doc.originalName}
                            </a>
                          ))}
                          {app.documents.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{app.documents.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {applications.length > 8 && (
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