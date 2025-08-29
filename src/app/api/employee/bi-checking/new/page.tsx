'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


interface Application {
  id: string
  fullName: string
  loanAmount: number
  loanTerm: number
}

function BiCheckingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')
  
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<string>(applicationId || '')
  const [selectedAppData, setSelectedAppData] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [analyzingAI, setAnalyzingAI] = useState(false)
  
  const [formData, setFormData] = useState({
    applicationId: applicationId || '',
    pdfFile: null as File | null,
    pdfFileName: '',
    pdfFileUrl: '',
    pdfFileSize: 0,

    // AI Analysis Results (auto-generated)
    aiAnalysisResult: null as any,
    creditScore: null as number | null,
    riskLevel: '',
    recommendation: '',
    aiSummary: '',

    // Manual Input
    manualNotes: '',
    manualRating: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (selectedApplication) {
      const app = applications.find(a => a.id === selectedApplication)
      if (app) {
        setSelectedAppData(app)
        setFormData(prev => ({
          ...prev,
          applicationId: app.id
        }))
      }
    }
  }, [selectedApplication, applications])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const result = await response.json()
      
      if (response.ok) {
        setApplications(result.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'BI_CHECKING')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          pdfFile: file,
          pdfFileName: result.filename,
          pdfFileUrl: result.url,
          pdfFileSize: result.size
        }))
        alert(`File ${result.originalName} berhasil diupload!`)
      } else {
        alert('Gagal upload file: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Terjadi kesalahan saat upload file')
    } finally {
      setUploading(false)
    }
  }

  const analyzeWithAI = async () => {
    if (!formData.pdfFileUrl) {
      alert('Silakan upload file PDF terlebih dahulu')
      return
    }

    setAnalyzingAI(true)
    try {
      // Simulate AI Analysis (in real implementation, this would call actual AI service)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate processing time

      // Mock AI Analysis Results
      const mockAIResults = {
        creditScore: Math.floor(Math.random() * 300) + 500, // 500-800 range
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        recommendation: Math.random() > 0.3 ? 'LAYAK' : 'TIDAK_LAYAK',
        aiSummary: generateMockSummary(),
        detailedAnalysis: {
          paymentHistory: Math.random() > 0.7 ? 'GOOD' : 'POOR',
          debtRatio: (Math.random() * 60 + 20).toFixed(1) + '%',
          accountStatus: Math.random() > 0.8 ? 'ACTIVE' : 'CLOSED',
          inquiries: Math.floor(Math.random() * 10),
          totalAccounts: Math.floor(Math.random() * 15) + 1
        }
      }

      setFormData(prev => ({
        ...prev,
        aiAnalysisResult: mockAIResults,
        creditScore: mockAIResults.creditScore,
        riskLevel: mockAIResults.riskLevel,
        recommendation: mockAIResults.recommendation,
        aiSummary: mockAIResults.aiSummary
      }))

      alert('Analisis AI selesai!')
    } catch (error) {
      console.error('Error during AI analysis:', error)
      alert('Gagal melakukan analisis AI')
    } finally {
      setAnalyzingAI(false)
    }
  }

  const generateMockSummary = () => {
    const summaries = [
      "Berdasarkan analisis BI checking, calon debitur menunjukkan riwayat kredit yang baik dengan pembayaran yang konsisten. Tingkat risiko rendah hingga sedang.",
      "Analisis menunjukkan beberapa keterlambatan pembayaran di masa lalu, namun trend terkini menunjukkan perbaikan. Perlu pengawasan ekstra.",
      "Profil kredit menunjukkan stabilitas finansial yang memadai dengan rasio hutang yang terkendali. Rekomendasi untuk disetujui dengan plafon sesuai kemampuan.",
      "Terdapat beberapa red flag dalam riwayat kredit termasuk tunggakan yang belum terselesaikan. Diperlukan analisis lebih mendalam sebelum persetujuan."
    ]
    return summaries[Math.floor(Math.random() * summaries.length)]
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationColor = (rec: string) => {
    return rec === 'LAYAK' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  const handleSubmit = async () => {
    if (!selectedApplication) {
      alert('Silakan pilih pengajuan client terlebih dahulu')
      return
    }

    if (!formData.pdfFileUrl) {
      alert('Silakan upload file BI Checking terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/employee/bi-checking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('BI Checking berhasil disimpan!')
        router.push('/employee/dashboard')
      } else {
        alert('Terjadi kesalahan: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving BI checking:', error)
      alert('Terjadi kesalahan saat menyimpan BI checking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50" />
      {/* Header */}
      <div className="bg-[var(--color-secondary)]/80 backdrop-blur-sm shadow-lg border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-center text-gray-900">BI CHECKING</h1>
              <p className="text-center text-gray-700 font-medium">Analisis AI untuk Kelayakan Kredit</p>
            </div>
            <Button 
              onClick={() => router.push('/employee/dashboard')} 
              variant="outline"
              className="border-[var(--color-border)] text-[var(--color-primary-dark)] hover:bg-[var(--color-secondary)]"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Upload dan Analisis BI Checking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Pilih Pengajuan Client */}
            {!applicationId && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900">Pilih Pengajuan Client</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih pengajuan untuk BI Checking:
                  </label>
                  <select
                    value={selectedApplication}
                    onChange={(e) => setSelectedApplication(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Pengajuan --</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.fullName} - Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)} ({app.loanTerm} bulan)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAppData && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Detail Pengajuan:</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div><strong>Nama:</strong> {selectedAppData.fullName}</div>
                      <div><strong>Jumlah:</strong> Rp {new Intl.NumberFormat('id-ID').format(selectedAppData.loanAmount)}</div>
                      <div><strong>Jangka Waktu:</strong> {selectedAppData.loanTerm} bulan</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload PDF */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Upload File BI Checking (PDF)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload file PDF BI Checking
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Hanya file PDF yang diperbolehkan
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded File Info */}
              {formData.pdfFileName && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">File Berhasil Diupload:</h4>
                      <p className="text-sm text-green-700">{formData.pdfFileName}</p>
                      <p className="text-xs text-green-600">Ukuran: {(formData.pdfFileSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button
                      onClick={analyzeWithAI}
                      disabled={analyzingAI}
                      className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
                    >
                      {analyzingAI ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        '🤖 Analisis dengan AI'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {formData.aiAnalysisResult && (
              <div className="space-y-6 p-6 rounded-lg border" style={{background:'var(--color-secondary)', borderColor:'var(--color-border)'}}>
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🤖</span>
                  Hasil Analisis AI
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-700">Credit Score</h4>
                    <p className="text-2xl font-bold text-blue-600">{formData.creditScore}</p>
                    <p className="text-xs text-gray-500">Range: 300-850</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-700">Risk Level</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(formData.riskLevel)}`}>
                      {formData.riskLevel}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-700">Rekomendasi</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(formData.recommendation)}`}>
                      {formData.recommendation}
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-gray-800 mb-2">Ringkasan AI:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{formData.aiSummary}</p>
                </div>

                {/* Detailed Analysis */}
                {formData.aiAnalysisResult?.detailedAnalysis && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-800 mb-3">Detail Analisis:</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Payment History:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${formData.aiAnalysisResult.detailedAnalysis.paymentHistory === 'GOOD' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {formData.aiAnalysisResult.detailedAnalysis.paymentHistory}
                        </span>
                      </div>
                      <div><span className="font-medium">Debt Ratio:</span> {formData.aiAnalysisResult.detailedAnalysis.debtRatio}</div>
                      <div><span className="font-medium">Account Status:</span> {formData.aiAnalysisResult.detailedAnalysis.accountStatus}</div>
                      <div><span className="font-medium">Recent Inquiries:</span> {formData.aiAnalysisResult.detailedAnalysis.inquiries}</div>
                      <div><span className="font-medium">Total Accounts:</span> {formData.aiAnalysisResult.detailedAnalysis.totalAccounts}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Input Manual</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating Manual (1-10):</label>
                  <select
                    value={formData.manualRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, manualRating: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} - {num <= 3 ? 'Rendah' : num <= 6 ? 'Sedang' : 'Tinggi'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Manual:</label>
                  <textarea
                    value={formData.manualNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, manualNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Catatan tambahan dari analisis manual..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleSubmit}
                disabled={uploading || analyzingAI}
                 className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-3"
              >
                {uploading || analyzingAI ? 'Processing...' : 'Simpan BI Checking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BiCheckingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <BiCheckingForm />
    </Suspense>
  )
}
