'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Application {
  id: string
  fullName: string
  homeAddress: string
  businessType: string
  loanAmount: number
  loanTerm: number
  loanPurpose: string
  contact1: string
  contact2: string
  contact3: string
  contact4: string
  contact5: string
  documents: Array<{
    category: string
    originalName: string
    fileUrl: string
  }>
  subFinancingAnalysis?: {
    pendapatanBersih: number
  }
}

function AnalysisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')
  
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<string>(applicationId || '')
  const [selectedAppData, setSelectedAppData] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  
  const [formData, setFormData] = useState({
    applicationId: applicationId || '',
    employeeId: 'current-employee-id', // This should come from session

    // Data Pemohon (Auto-filled)
    nama: '',
    alamat: '',
    jenisUsaha: '',
    pengajuan: '',
    jangkaWaktu: '',

    // 5 Kontak Darurat (Auto-filled)
    contact1: '',
    contact2: '',
    contact3: '',
    contact4: '',
    contact5: '',

    // 1. KARAKTER
    agama: '',
    pengalaman: '',
    hubMasyarakat: '',
    karakterAngsuranLannya: '',
    kelSurveyLannya: '',

    // Rating Karakter (1-5) dengan nama penilai
    karakter1: '',
    karakter1Penilai: '',
    karakter1Jelek: false,
    karakter2: '',
    karakter2Penilai: '',
    karakter2Jelek: false,
    karakter3: '',
    karakter3Penilai: '',
    karakter3Jelek: false,
    karakter4: '',
    karakter4Penilai: '',
    karakter4Jelek: false,
    karakter5: '',
    karakter5Penilai: '',
    karakter5Jelek: false,

    // 2. KESIMPULAN KARAKTER (AI Generated)
    kesimpulanKarakter: '',
    kapasitasDanKelancaran: '',

    // 3. ANALISA JAMINAN
    jenisJaminan: '',
    nilaiTaksiran: '',
    kondisiJaminan: '',
    nilaiJaminanSetelahPotongan: '',
    validInvalid: 'Valid',

    // 4. KONDISI
    isKaryawan: false,
    isWiraswasta: false,
    isPNSPolri: false,
    isTetap: false,
    isKontrak: false,
    isLainnya: false,
    masaBerakhirKontrak: '',

    // 5. CAPITAL
    rumah: 'Sendiri', // Dropdown: Sendiri/Sewa
    kendaraanMotor: 0,
    kendaraanMobil: 0,
    lainnya: '',

    // 6. CHECKLIST KELENGKAPAN DOKUMEN (Auto-filled)
    fcKtpPemohon: false,
    fcKtpSuamiIstri: false,
    fcSlipGaji: false,

    // 7. KESIMPULAN AKHIR
    kesimpulanAkhir: 'Layak',

    // Signature fields
    petugasSurvei: '',
    pengurus: '',
    approver: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (selectedApplication) {
      const app = applications.find(a => a.id === selectedApplication)
      if (app) {
        setSelectedAppData(app)
        // Auto-fill form data from application
        setFormData(prev => ({
          ...prev,
          applicationId: app.id,
          nama: app.fullName,
          alamat: app.homeAddress,
          jenisUsaha: app.businessType || '',
          pengajuan: `Rp ${new Intl.NumberFormat('id-ID').format(app.loanAmount)}`,
          jangkaWaktu: `${app.loanTerm} bulan`,
          contact1: app.contact1 || '',
          contact2: app.contact2 || '',
          contact3: app.contact3 || '',
          contact4: app.contact4 || '',
          contact5: app.contact5 || ''
        }))

        // Auto-fill checklist dokumen berdasarkan upload client
        const docs = app.documents || []
        const hasKTP = docs.some(doc => doc.category.includes('KTP'))
        const hasKK = docs.some(doc => doc.category.includes('KK'))
        const hasSlipGaji = docs.some(doc => doc.category.includes('SLIP_GAJI'))

        setFormData(prev => ({
          ...prev,
          fcKtpPemohon: hasKTP,
          fcKtpSuamiIstri: hasKTP,
          fcSlipGaji: hasSlipGaji
        }))
      }
    }
  }, [selectedApplication, applications])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const result = await response.json()
      
      if (response.ok) {
        // Filter applications that have sub-analysis completed
        const appsWithSubAnalysis = result.applications.filter((app: Application) => 
          app.subFinancingAnalysis
        )
        setApplications(appsWithSubAnalysis)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateAIKesimpulan = async () => {
    if (!selectedAppData?.subFinancingAnalysis) {
      alert('Sub-analisa belum tersedia untuk aplikasi ini')
      return
    }

    setIsGeneratingAI(true)
    try {
      // Calculate average rating
      const ratings = [
        parseInt(formData.karakter1) || 0,
        parseInt(formData.karakter2) || 0,
        parseInt(formData.karakter3) || 0,
        parseInt(formData.karakter4) || 0,
        parseInt(formData.karakter5) || 0
      ].filter(r => r > 0)

      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0
      const pendapatanBersih = selectedAppData.subFinancingAnalysis.pendapatanBersih

      // Simple AI logic for demonstration
      let kesimpulan = ''
      let kapasitas = ''

      if (avgRating >= 4 && pendapatanBersih > 2000000) {
        kesimpulan = 'BAIK - Karakter pemohon menunjukkan kredibilitas yang tinggi dengan reputasi baik di masyarakat dan riwayat pembayaran yang lancar.'
        kapasitas = 'LAYAK - Berdasarkan analisa pendapatan bersih dan kapasitas pembayaran, pemohon memiliki kemampuan finansial yang memadai.'
      } else if (avgRating >= 3 && pendapatanBersih > 1000000) {
        kesimpulan = 'CUKUP - Karakter pemohon menunjukkan kredibilitas yang memadai namun perlu pengawasan lebih lanjut.'
        kapasitas = 'PERLU PERTIMBANGAN - Kapasitas pembayaran memadai namun margin keamanan terbatas.'
      } else {
        kesimpulan = 'KURANG - Karakter pemohon menunjukkan beberapa kelemahan yang perlu diperhatikan.'
        kapasitas = 'BERISIKO - Kapasitas pembayaran terbatas, memerlukan analisa lebih mendalam.'
      }

      setFormData(prev => ({
        ...prev,
        kesimpulanKarakter: kesimpulan,
        kapasitasDanKelancaran: kapasitas
      }))

      alert('Kesimpulan AI berhasil digenerate!')
    } catch (error) {
      console.error('Error generating AI conclusion:', error)
      alert('Gagal generate kesimpulan AI')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedApplication) {
      alert('Silakan pilih pengajuan client terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/employee/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Analisa pembiayaan berhasil disimpan!')
        router.push('/employee/dashboard')
      } else {
        alert('Terjadi kesalahan: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
      alert('Terjadi kesalahan saat menyimpan analisa')
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-center text-gray-900">ANALISA PEMBIAYAAN</h1>
              <p className="text-center text-gray-700 font-medium">KOPERASI KIRAP ENTREPRENEURSHIP</p>
            </div>
            <Button 
              onClick={() => router.push('/employee/dashboard')} 
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Form Analisa Pembiayaan Enhanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Pilih Pengajuan Client */}
            {!applicationId && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900">Pilih Pengajuan Client (Yang Sudah Ada Sub-Analisa)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih pengajuan yang akan dianalisa:
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
                      <div><strong>Tujuan:</strong> {selectedAppData.loanPurpose}</div>
                      {selectedAppData.subFinancingAnalysis && (
                        <div><strong>Pendapatan Bersih:</strong> Rp {new Intl.NumberFormat('id-ID').format(selectedAppData.subFinancingAnalysis.pendapatanBersih)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Pemohon (Auto-filled) */}
            <div className="space-y-4 bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">Data Pemohon (Auto-filled dari Database)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama:</label>
                  <Input
                    value={formData.nama}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat:</label>
                  <Input
                    value={formData.alamat}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Usaha:</label>
                  <Input
                    value={formData.jenisUsaha}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengajuan:</label>
                  <Input
                    value={formData.pengajuan}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jangka Waktu:</label>
                  <Input
                    value={formData.jangkaWaktu}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* 5 Kontak Darurat (Auto-filled) */}
            <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">5 Kontak Darurat (Auto-filled dari Form Client)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontak {num}:</label>
                    <Input
                      value={formData[`contact${num}` as keyof typeof formData] as string}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 1. KARAKTER dengan Rating dan Nama Penilai */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">1. KARAKTER</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agama:</label>
                  <Input
                    value={formData.agama}
                    onChange={(e) => handleInputChange('agama', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman:</label>
                  <Input
                    value={formData.pengalaman}
                    onChange={(e) => handleInputChange('pengalaman', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hub Masyarakat:</label>
                  <Input
                    value={formData.hubMasyarakat}
                    onChange={(e) => handleInputChange('hubMasyarakat', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Karakter Angsuran Lannya:</label>
                  <Input
                    value={formData.karakterAngsuranLannya}
                    onChange={(e) => handleInputChange('karakterAngsuranLannya', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kel Survey Lannya:</label>
                  <Input
                    value={formData.kelSurveyLannya}
                    onChange={(e) => handleInputChange('kelSurveyLannya', e.target.value)}
                  />
                </div>
              </div>

              {/* Penilaian (1-5) dengan Nama Penilai dan Checklist Jelek */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-4">Penilaian (1-5) dengan Nama Penilai:</h4>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="grid grid-cols-4 gap-4 items-center p-3 border rounded">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Karakter {num}:</label>
                        <select
                          value={formData[`karakter${num}` as keyof typeof formData] as string}
                          onChange={(e) => handleInputChange(`karakter${num}`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih</option>
                          <option value="1">1 - Sangat Kurang</option>
                          <option value="2">2 - Kurang</option>
                          <option value="3">3 - Cukup</option>
                          <option value="4">4 - Baik</option>
                          <option value="5">5 - Sangat Baik</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penilai:</label>
                        <Input
                          value={formData[`karakter${num}Penilai` as keyof typeof formData] as string}
                          onChange={(e) => handleInputChange(`karakter${num}Penilai`, e.target.value)}
                          placeholder="Nama yang menilai"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData[`karakter${num}Jelek` as keyof typeof formData] as boolean}
                          onChange={(e) => handleInputChange(`karakter${num}Jelek`, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-red-600">Jelek</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating: {formData[`karakter${num}` as keyof typeof formData] || 'Belum dinilai'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. KESIMPULAN KARAKTER dengan AI */}
            <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">2. KESIMPULAN KARAKTER</h3>
                <Button
                  onClick={generateAIKesimpulan}
                  disabled={isGeneratingAI}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingAI ? 'Generating AI...' : '🤖 Generate AI Kesimpulan'}
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kesimpulan Karakter (AI Generated):</label>
                  <textarea
                    value={formData.kesimpulanKarakter}
                    onChange={(e) => handleInputChange('kesimpulanKarakter', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Klik tombol Generate AI untuk membuat kesimpulan otomatis berdasarkan penilaian dan sub-analisa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas dan Kelancaran (AI Generated):</label>
                  <textarea
                    value={formData.kapasitasDanKelancaran}
                    onChange={(e) => handleInputChange('kapasitasDanKelancaran', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="AI akan menganalisa berdasarkan sub-analisa keuangan"
                  />
                </div>
              </div>
            </div>

            {/* 3. ANALISA JAMINAN (Tanpa Faktor Potongan) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">3. ANALISA JAMINAN</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Jaminan:</label>
                  <Input
                    value={formData.jenisJaminan}
                    onChange={(e) => handleInputChange('jenisJaminan', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Taksiran:</label>
                  <Input
                    type="number"
                    value={formData.nilaiTaksiran}
                    onChange={(e) => handleInputChange('nilaiTaksiran', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Jaminan:</label>
                  <Input
                    value={formData.kondisiJaminan}
                    onChange={(e) => handleInputChange('kondisiJaminan', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Jaminan Setelah Potongan:</label>
                  <Input
                    type="number"
                    value={formData.nilaiJaminanSetelahPotongan}
                    onChange={(e) => handleInputChange('nilaiJaminanSetelahPotongan', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
                    value="Valid"
                    checked={formData.validInvalid === 'Valid'}
                    onChange={(e) => handleInputChange('validInvalid', e.target.value)}
                    className="mr-2"
                  />
                  <span>Valid</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
                    value="Invalid"
                    checked={formData.validInvalid === 'Invalid'}
                    onChange={(e) => handleInputChange('validInvalid', e.target.value)}
                    className="mr-2"
                  />
                  <span>Invalid</span>
                </label>
              </div>
            </div>

            {/* 4. KONDISI */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">4. KONDISI</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isKaryawan}
                      onChange={(e) => handleInputChange('isKaryawan', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Karyawan</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isWiraswasta}
                      onChange={(e) => handleInputChange('isWiraswasta', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Wiraswasta</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isPNSPolri}
                      onChange={(e) => handleInputChange('isPNSPolri', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>PNS/Polri</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isTetap}
                      onChange={(e) => handleInputChange('isTetap', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Tetap</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isKontrak}
                      onChange={(e) => handleInputChange('isKontrak', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Kontrak</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isLainnya}
                      onChange={(e) => handleInputChange('isLainnya', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Lainnya</span>
                  </label>
                </div>
              </div>
              {formData.isKontrak && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa Berakhir Kontrak:</label>
                  <Input
                    type="date"
                    value={formData.masaBerakhirKontrak}
                    onChange={(e) => handleInputChange('masaBerakhirKontrak', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 5. CAPITAL (Updated) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">5. CAPITAL</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rumah:</label>
                    <select
                      value={form'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Application {
  id: string
  fullName: string
  homeAddress: string
  businessType: string
  loanAmount: number
  loanTerm: number
  loanPurpose: string
  contact1: string
  contact2: string
  contact3: string
  contact4: string
  contact5: string
  documents: Array<{
    category: string
    originalName: string
    fileUrl: string
  }>
  subFinancingAnalysis?: {
    pendapatanBersih: number
  }
}

function AnalysisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')
  
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<string>(applicationId || '')
  const [selectedAppData, setSelectedAppData] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  
  const [formData, setFormData] = useState({
    applicationId: applicationId || '',
    employeeId: 'current-employee-id', // This should come from session

    // Data Pemohon (Auto-filled)
    nama: '',
    alamat: '',
    jenisUsaha: '',
    pengajuan: '',
    jangkaWaktu: '',

    // 5 Kontak Darurat (Auto-filled)
    contact1: '',
    contact2: '',
    contact3: '',
    contact4: '',
    contact5: '',

    // 1. KARAKTER
    agama: '',
    pengalaman: '',
    hubMasyarakat: '',
    karakterAngsuranLannya: '',
    kelSurveyLannya: '',

    // Rating Karakter (1-5) dengan nama penilai
    karakter1: '',
    karakter1Penilai: '',
    karakter1Jelek: false,
    karakter2: '',
    karakter2Penilai: '',
    karakter2Jelek: false,
    karakter3: '',
    karakter3Penilai: '',
    karakter3Jelek: false,
    karakter4: '',
    karakter4Penilai: '',
    karakter4Jelek: false,
    karakter5: '',
    karakter5Penilai: '',
    karakter5Jelek: false,

    // 2. KESIMPULAN KARAKTER (AI Generated)
    kesimpulanKarakter: '',
    kapasitasDanKelancaran: '',

    // 3. ANALISA JAMINAN
    jenisJaminan: '',
    nilaiTaksiran: '',
    kondisiJaminan: '',
    nilaiJaminanSetelahPotongan: '',
    validInvalid: 'Valid',

    // 4. KONDISI
    isKaryawan: false,
    isWiraswasta: false,
    isPNSPolri: false,
    isTetap: false,
    isKontrak: false,
    isLainnya: false,
    masaBerakhirKontrak: '',

    // 5. CAPITAL
    rumah: 'Sendiri', // Dropdown: Sendiri/Sewa
    kendaraanMotor: 0,
    kendaraanMobil: 0,
    lainnya: '',

    // 6. CHECKLIST KELENGKAPAN DOKUMEN (Auto-filled)
    fcKtpPemohon: false,
    fcKtpSuamiIstri: false,
    fcSlipGaji: false,

    // 7. KESIMPULAN AKHIR
    kesimpulanAkhir: 'Layak',

    // Signature fields
    petugasSurvei: '',
    pengurus: '',
    approver: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    if (selectedApplication) {
      const app = applications.find(a => a.id === selectedApplication)
      if (app) {
        setSelectedAppData(app)
        // Auto-fill form data from application
        setFormData(prev => ({
          ...prev,
          applicationId: app.id,
          nama: app.fullName,
          alamat: app.homeAddress,
          jenisUsaha: app.businessType || '',
          pengajuan: `Rp ${new Intl.NumberFormat('id-ID').format(app.loanAmount)}`,
          jangkaWaktu: `${app.loanTerm} bulan`,
          contact1: app.contact1 || '',
          contact2: app.contact2 || '',
          contact3: app.contact3 || '',
          contact4: app.contact4 || '',
          contact5: app.contact5 || ''
        }))

        // Auto-fill checklist dokumen berdasarkan upload client
        const docs = app.documents || []
        const hasKTP = docs.some(doc => doc.category.includes('KTP'))
        const hasKK = docs.some(doc => doc.category.includes('KK'))
        const hasSlipGaji = docs.some(doc => doc.category.includes('SLIP_GAJI'))

        setFormData(prev => ({
          ...prev,
          fcKtpPemohon: hasKTP,
          fcKtpSuamiIstri: hasKTP,
          fcSlipGaji: hasSlipGaji
        }))
      }
    }
  }, [selectedApplication, applications])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const result = await response.json()
      
      if (response.ok) {
        // Filter applications that have sub-analysis completed
        const appsWithSubAnalysis = result.applications.filter((app: Application) => 
          app.subFinancingAnalysis
        )
        setApplications(appsWithSubAnalysis)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateAIKesimpulan = async () => {
    if (!selectedAppData?.subFinancingAnalysis) {
      alert('Sub-analisa belum tersedia untuk aplikasi ini')
      return
    }

    setIsGeneratingAI(true)
    try {
      // Calculate average rating
      const ratings = [
        parseInt(formData.karakter1) || 0,
        parseInt(formData.karakter2) || 0,
        parseInt(formData.karakter3) || 0,
        parseInt(formData.karakter4) || 0,
        parseInt(formData.karakter5) || 0
      ].filter(r => r > 0)

      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0
      const pendapatanBersih = selectedAppData.subFinancingAnalysis.pendapatanBersih

      // Simple AI logic for demonstration
      let kesimpulan = ''
      let kapasitas = ''

      if (avgRating >= 4 && pendapatanBersih > 2000000) {
        kesimpulan = 'BAIK - Karakter pemohon menunjukkan kredibilitas yang tinggi dengan reputasi baik di masyarakat dan riwayat pembayaran yang lancar.'
        kapasitas = 'LAYAK - Berdasarkan analisa pendapatan bersih dan kapasitas pembayaran, pemohon memiliki kemampuan finansial yang memadai.'
      } else if (avgRating >= 3 && pendapatanBersih > 1000000) {
        kesimpulan = 'CUKUP - Karakter pemohon menunjukkan kredibilitas yang memadai namun perlu pengawasan lebih lanjut.'
        kapasitas = 'PERLU PERTIMBANGAN - Kapasitas pembayaran memadai namun margin keamanan terbatas.'
      } else {
        kesimpulan = 'KURANG - Karakter pemohon menunjukkan beberapa kelemahan yang perlu diperhatikan.'
        kapasitas = 'BERISIKO - Kapasitas pembayaran terbatas, memerlukan analisa lebih mendalam.'
      }

      setFormData(prev => ({
        ...prev,
        kesimpulanKarakter: kesimpulan,
        kapasitasDanKelancaran: kapasitas
      }))

      alert('Kesimpulan AI berhasil digenerate!')
    } catch (error) {
      console.error('Error generating AI conclusion:', error)
      alert('Gagal generate kesimpulan AI')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedApplication) {
      alert('Silakan pilih pengajuan client terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/employee/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Analisa pembiayaan berhasil disimpan!')
        router.push('/employee/dashboard')
      } else {
        alert('Terjadi kesalahan: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving analysis:', error)
      alert('Terjadi kesalahan saat menyimpan analisa')
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-center text-gray-900">ANALISA PEMBIAYAAN</h1>
              <p className="text-center text-gray-700 font-medium">KOPERASI KIRAP ENTREPRENEURSHIP</p>
            </div>
            <Button 
              onClick={() => router.push('/employee/dashboard')} 
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Form Analisa Pembiayaan Enhanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Pilih Pengajuan Client */}
            {!applicationId && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900">Pilih Pengajuan Client (Yang Sudah Ada Sub-Analisa)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih pengajuan yang akan dianalisa:
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
                      <div><strong>Tujuan:</strong> {selectedAppData.loanPurpose}</div>
                      {selectedAppData.subFinancingAnalysis && (
                        <div><strong>Pendapatan Bersih:</strong> Rp {new Intl.NumberFormat('id-ID').format(selectedAppData.subFinancingAnalysis.pendapatanBersih)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Pemohon (Auto-filled) */}
            <div className="space-y-4 bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">Data Pemohon (Auto-filled dari Database)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama:</label>
                  <Input
                    value={formData.nama}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat:</label>
                  <Input
                    value={formData.alamat}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Usaha:</label>
                  <Input
                    value={formData.jenisUsaha}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengajuan:</label>
                  <Input
                    value={formData.pengajuan}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jangka Waktu:</label>
                  <Input
                    value={formData.jangkaWaktu}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* 5 Kontak Darurat (Auto-filled) */}
            <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">5 Kontak Darurat (Auto-filled dari Form Client)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontak {num}:</label>
                    <Input
                      value={formData[`contact${num}` as keyof typeof formData] as string}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 1. KARAKTER dengan Rating dan Nama Penilai */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">1. KARAKTER</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agama:</label>
                  <Input
                    value={formData.agama}
                    onChange={(e) => handleInputChange('agama', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman:</label>
                  <Input
                    value={formData.pengalaman}
                    onChange={(e) => handleInputChange('pengalaman', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hub Masyarakat:</label>
                  <Input
                    value={formData.hubMasyarakat}
                    onChange={(e) => handleInputChange('hubMasyarakat', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Karakter Angsuran Lannya:</label>
                  <Input
                    value={formData.karakterAngsuranLannya}
                    onChange={(e) => handleInputChange('karakterAngsuranLannya', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kel Survey Lannya:</label>
                  <Input
                    value={formData.kelSurveyLannya}
                    onChange={(e) => handleInputChange('kelSurveyLannya', e.target.value)}
                  />
                </div>
              </div>

              {/* Penilaian (1-5) dengan Nama Penilai dan Checklist Jelek */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-4">Penilaian (1-5) dengan Nama Penilai:</h4>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="grid grid-cols-4 gap-4 items-center p-3 border rounded">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Karakter {num}:</label>
                        <select
                          value={formData[`karakter${num}` as keyof typeof formData] as string}
                          onChange={(e) => handleInputChange(`karakter${num}`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih</option>
                          <option value="1">1 - Sangat Kurang</option>
                          <option value="2">2 - Kurang</option>
                          <option value="3">3 - Cukup</option>
                          <option value="4">4 - Baik</option>
                          <option value="5">5 - Sangat Baik</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penilai:</label>
                        <Input
                          value={formData[`karakter${num}Penilai` as keyof typeof formData] as string}
                          onChange={(e) => handleInputChange(`karakter${num}Penilai`, e.target.value)}
                          placeholder="Nama yang menilai"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData[`karakter${num}Jelek` as keyof typeof formData] as boolean}
                          onChange={(e) => handleInputChange(`karakter${num}Jelek`, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-red-600">Jelek</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating: {formData[`karakter${num}` as keyof typeof formData] || 'Belum dinilai'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. KESIMPULAN KARAKTER dengan AI */}
            <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">2. KESIMPULAN KARAKTER</h3>
                <Button
                  onClick={generateAIKesimpulan}
                  disabled={isGeneratingAI}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingAI ? 'Generating AI...' : '🤖 Generate AI Kesimpulan'}
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kesimpulan Karakter (AI Generated):</label>
                  <textarea
                    value={formData.kesimpulanKarakter}
                    onChange={(e) => handleInputChange('kesimpulanKarakter', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Klik tombol Generate AI untuk membuat kesimpulan otomatis berdasarkan penilaian dan sub-analisa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas dan Kelancaran (AI Generated):</label>
                  <textarea
                    value={formData.kapasitasDanKelancaran}
                    onChange={(e) => handleInputChange('kapasitasDanKelancaran', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="AI akan menganalisa berdasarkan sub-analisa keuangan"
                  />
                </div>
              </div>
            </div>

            {/* 3. ANALISA JAMINAN (Tanpa Faktor Potongan) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">3. ANALISA JAMINAN</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Jaminan:</label>
                  <Input
                    value={formData.jenisJaminan}
                    onChange={(e) => handleInputChange('jenisJaminan', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Taksiran:</label>
                  <Input
                    type="number"
                    value={formData.nilaiTaksiran}
                    onChange={(e) => handleInputChange('nilaiTaksiran', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Jaminan:</label>
                  <Input
                    value={formData.kondisiJaminan}
                    onChange={(e) => handleInputChange('kondisiJaminan', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Jaminan Setelah Potongan:</label>
                  <Input
                    type="number"
                    value={formData.nilaiJaminanSetelahPotongan}
                    onChange={(e) => handleInputChange('nilaiJaminanSetelahPotongan', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
                    value="Valid"
                    checked={formData.validInvalid === 'Valid'}
                    onChange={(e) => handleInputChange('validInvalid', e.target.value)}
                    className="mr-2"
                  />
                  <span>Valid</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
                    value="Invalid"
                    checked={formData.validInvalid === 'Invalid'}
                    onChange={(e) => handleInputChange('validInvalid', e.target.value)}
                    className="mr-2"
                  />
                  <span>Invalid</span>
                </label>
              </div>
            </div>

            {/* 4. KONDISI */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">4. KONDISI</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isKaryawan}
                      onChange={(e) => handleInputChange('isKaryawan', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Karyawan</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isWiraswasta}
                      onChange={(e) => handleInputChange('isWiraswasta', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Wiraswasta</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isPNSPolri}
                      onChange={(e) => handleInputChange('isPNSPolri', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>PNS/Polri</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isTetap}
                      onChange={(e) => handleInputChange('isTetap', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Tetap</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isKontrak}
                      onChange={(e) => handleInputChange('isKontrak', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Kontrak</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isLainnya}
                      onChange={(e) => handleInputChange('isLainnya', e.target.checked)}
                      className="mr-2" 
                    />
                    <span>Lainnya</span>
                  </label>
                </div>
              </div>
              {formData.isKontrak && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa Berakhir Kontrak:</label>
                  <Input
                    type="date"
                    value={formData.masaBerakhirKontrak}
                    onChange={(e) => handleInputChange('masaBerakhirKontrak', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 5. CAPITAL (Updated) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">5. CAPITAL</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rumah:</label>
                    <select
                      value={formData.rumah}
                      onChange={(e) => handleInputChange('rumah', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Sendiri">Sendiri</option>
                      <option value="Sewa">Sewa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lainnya:</label>
                    <Input
                      value={formData.lainnya}
                      onChange={(e) => handleInputChange('lainnya', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Kendaraan:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Motor:</span>
                      <Input
                        type="number"
                        min="0"
                        value={formData.kendaraanMotor}
                        onChange={(e) => handleInputChange('kendaraanMotor', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">unit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Mobil:</span>
                      <Input
                        type="number"
                        min="0"
                        value={formData.kendaraanMobil}
                        onChange={(e) => handleInputChange('kendaraanMobil', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">unit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. CHECKLIST KELENGKAPAN DOKUMEN (Auto-filled) */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">6. CHECKLIST KELENGKAPAN DOKUMEN (Auto-filled dari Upload Client)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcKtpPemohon}
                      readOnly
                      className="mr-2"
                    />
                    <span>FC KTP Pemohon</span>
                    <span className={`ml-auto px-2 py-1 text-xs rounded ${formData.fcKtpPemohon ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {formData.fcKtpPemohon ? 'Ada' : 'Tidak Ada'}
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcKtpSuamiIstri}
                      readOnly
                      className="mr-2"
                    />
                    <span>FC KTP Suami/Istri</span>
                    <span className={`ml-auto px-2 py-1 text-xs rounded ${formData.fcKtpSuamiIstri ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {formData.fcKtpSuamiIstri ? 'Ada' : 'Tidak Ada'}
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcSlipGaji}
                      readOnly
                      className="mr-2"
                    />
                    <span>FC Slip Gaji</span>
                    <span className={`ml-auto px-2 py-1 text-xs rounded ${formData.fcSlipGaji ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {formData.fcSlipGaji ? 'Ada' : 'Tidak Ada'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 7. KESIMPULAN AKHIR */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">7. KESIMPULAN AKHIR</h3>
              <div className="flex items-center space-x-8">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="kesimpulan"
                    value="Layak"
                    checked={formData.kesimpulanAkhir === 'Layak'}
                    onChange={(e) => handleInputChange('kesimpulanAkhir', e.target.value)}
                    className="mr-2"
                  />
                  <span>Layak</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="kesimpulan"
                    value="Tidak Layak"
                    checked={formData.kesimpulanAkhir === 'Tidak Layak'}
                    onChange={(e) => handleInputChange('kesimpulanAkhir', e.target.value)}
                    className="mr-2"
                  />
                  <span>Tidak Layak</span>
                </label>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-6 pt-8 border-t">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="mb-4">Petugas Survei</p>
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                  <Input
                    value={formData.petugasSurvei}
                    onChange={(e) => handleInputChange('petugasSurvei', e.target.value)}
                    placeholder="Nama Petugas Survei"
                    className="text-center"
                  />
                </div>
                <div>
                  <p className="mb-4">Pengurus</p>
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                  <Input
                    value={formData.pengurus}
                    onChange={(e) => handleInputChange('pengurus', e.target.value)}
                    placeholder="Nama Pengurus"
                    className="text-center"
                  />
                </div>
                <div>
                  <p className="mb-4">Approver</p>
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                  <Input
                    value={formData.approver}
                    onChange={(e) => handleInputChange('approver', e.target.value)}
                    placeholder="Nama Approver"
                    className="text-center"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
              >
                Simpan Analisa Pembiayaan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <AnalysisForm />
    </Suspense>
  )
}