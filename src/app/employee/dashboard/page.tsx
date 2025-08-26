'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Employee {
  id: string
  name: string
}

export default function EmployeeDashboard() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [applications, setApplications] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [subAnalyses, setSubAnalyses] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const employeeData = localStorage.getItem('currentEmployee')
    if (!employeeData) {
      router.push('/employee/login')
      return
    }

    setCurrentEmployee(JSON.parse(employeeData))
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [applicationsRes, subAnalysesRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/employee/sub-analysis'),
      ])

      const applicationsResult = await applicationsRes.json()
      const subAnalysesResult = await subAnalysesRes.json()

      if (applicationsRes.ok) {
        setApplications(applicationsResult.applications)
        const pending = applicationsResult.applications.filter((app: { status: string }) => app.status === 'PENDING').length
        const inProgress = applicationsResult.applications.filter((app: { financingAnalysis: unknown }) => app.financingAnalysis).length
        const completed = applicationsResult.applications.filter((app: { status: string }) => app.status === 'APPROVED' || app.status === 'REJECTED').length
        setStats({ pending, inProgress, completed })

        const analysesPromises = applicationsResult.applications.map((app: { id: string }) =>
          fetch(`/api/employee/analysis?applicationId=${app.id}`)
        )
        const analysesResults = await Promise.all(analysesPromises)
        const analysesJson = await Promise.all(analysesResults.map(res => res.json()))
        setAnalyses(analysesJson.flatMap(res => res.analyses))
      }

      if (subAnalysesRes.ok) {
        setSubAnalyses(subAnalysesResult.subAnalyses)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentEmployee')
    router.push('/')
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Pengajuan berhasil dihapus!')
        fetchData() // Refresh the list
      } else {
        alert('Gagal menghapus pengajuan!')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Terjadi kesalahan saat menghapus pengajuan!')
    }
  }

  const handleExportPdf = () => {
    const doc = new jsPDF()
    doc.text('Laporan Pengajuan Pembiayaan', 14, 16)

    // Applications Table
    doc.text('Pengajuan Pembiayaan', 14, 30)
    const applicationData = applications.map((app: any) => [
      app.fullName,
      app.loanAmount,
      app.loanTerm,
      app.status,
      new Date(app.submittedAt).toLocaleDateString('id-ID'),
    ])
    autoTable(doc, {
      startY: 35,
      head: [['Nama', 'Jumlah Pinjaman', 'Jangka Waktu', 'Status', 'Tanggal Pengajuan']],
      body: applicationData,
    })

    // Sub-Analyses Table
    doc.addPage()
    doc.text('Sub Analisis Pembiayaan', 14, 16)
    const subAnalysisData = subAnalyses.map((sub: any) => [
      sub?.application?.fullName || '',
      sub.pendapatanBersih,
      sub.angsuranMaksimal,
      sub.plafonMaksimal,
    ])
    autoTable(doc, {
      startY: 25,
      head: [['Nama', 'Pendapatan Bersih', 'Angsuran Maksimal', 'Plafon Maksimal']],
      body: subAnalysisData,
    })

    // Analyses Table
    doc.addPage()
    doc.text('Analisis Pembiayaan', 14, 16)
    const analysisData = analyses.map((analysis: any) => [
      analysis?.applicationId || '',
      analysis.riskLevel,
      analysis.riskScore,
      analysis.approvalLikelihood,
      analysis?.employee?.name || '',
    ])
    autoTable(doc, {
      startY: 25,
      head: [['ID Aplikasi', 'Tingkat Risiko', 'Skor Risiko', 'Kemungkinan Disetujui', 'Analis']],
      body: analysisData,
    })

    doc.save(`laporan-pembiayaan-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    // Applications Sheet
    const ws1 = XLSX.utils.json_to_sheet(applications)
    XLSX.utils.book_append_sheet(wb, ws1, 'Pengajuan Pembiayaan')

    // Sub-Analyses Sheet
    const ws2 = XLSX.utils.json_to_sheet(subAnalyses)
    XLSX.utils.book_append_sheet(wb, ws2, 'Sub Analisis')

    // Analyses Sheet
    const ws3 = XLSX.utils.json_to_sheet(analyses)
    XLSX.utils.book_append_sheet(wb, ws3, 'Analisis Pembiayaan')

    XLSX.writeFile(wb, `laporan-pembiayaan-${new Date().toISOString().split('T')[0]}.xlsx`)
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
              <img src="/logo ksu ke.png" alt="KSU KE Logo" className="h-10" />
              <p className="text-gray-700 mt-1">
                Selamat datang, <span className="font-semibold text-emerald-700">{currentEmployee?.name}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleExportPdf}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                📄 Export PDF
              </Button>
              <Button 
                onClick={handleExportExcel}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                📊 Export Excel
              </Button>
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enhanced Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pengajuan Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-gray-600">
                {applications.length > 0 ? `${((stats.pending / applications.length) * 100).toFixed(1)}%` : '0%'} dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dalam Proses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
              <p className="text-gray-600">
                {applications.length > 0 ? `${((stats.inProgress / applications.length) * 100).toFixed(1)}%` : '0%'} dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disetujui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {applications.filter((app: any) => app.status === 'APPROVED').length}
              </div>
              <p className="text-gray-600">
                {applications.length > 0 ? `${((applications.filter((app: any) => app.status === 'APPROVED').length / applications.length) * 100).toFixed(1)}%` : '0%'} dari total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ditolak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {applications.filter((app: any) => app.status === 'REJECTED').length}
              </div>
              <p className="text-gray-600">
                {applications.length > 0 ? `${((applications.filter((app: any) => app.status === 'REJECTED').length / applications.length) * 100).toFixed(1)}%` : '0%'} dari total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">Analisa Pembiayaan</CardTitle>
              <CardDescription>
                Form analisa pembiayaan sesuai standar KSU
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Analisa Karakter, Kapasitas, Modal, Kondisi, Jaminan</li>
                <li>• Checklist kelengkapan dokumen</li>
                <li>• Kesimpulan dan rekomendasi</li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => router.push('/employee/analysis/new')}
              >
                Buat Analisa Pembiayaan
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">Sub Analisa Pembiayaan</CardTitle>
              <CardDescription>
                Form sub analisa detail per kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li>• Pemasukan dan pengeluaran detail</li>
                <li>• Analisa pendapatan bersih</li>
                <li>• Plafon maksimal dan angsuran</li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/employee/sub-analysis/new')}
              >
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
                {applications.slice(0, 5).map((app: { 
                  id: string; 
                  fullName: string; 
                  loanAmount: number; 
                  loanTerm: number; 
                  submittedAt: string; 
                  status: string;
                  documents?: Array<{ id: string; originalName: string; category: string; fileUrl: string }>;
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
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/employee/applications/${app.id}`)}
                            className="text-xs"
                          >
                            Detail
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/employee/applications/${app.id}/edit`)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteApplication(app.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
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
