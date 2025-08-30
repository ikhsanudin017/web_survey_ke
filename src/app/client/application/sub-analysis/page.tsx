'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function SubAnalysisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  const [formData, setFormData] = useState({
    // PEMASUKAN
    pemasukanSuami: '',
    pemasukanIstri: '',
    pemasukanLainnya1: '',
    pemasukanLainnya2: '',
    
    // PENGELUARAN
    pengeluaranSuami: '',
    pengeluaranIstri: '',
    makan: '',
    listrik: '',
    sosial: '',
    tanggunganLain: '',

    // JUMLAH ANAK
    jumlahAnak: '',
    pengeluaranSekolah: '',
    uangSaku: '',

    // ANALISA KAPASITAS
    jangkaPembiayaan: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pemasukanSubtotal, setPemasukanSubtotal] = useState(0);
  const [pengeluaranSubtotal, setPengeluaranSubtotal] = useState(0);
  const [anakSubtotal, setAnakSubtotal] = useState(0);
  const [pendapatanBersih, setPendapatanBersih] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    const calculateSubtotal = (fields: (keyof typeof formData)[]) => {
      return fields.reduce((acc, field) => acc + (parseFloat(formData[field]) || 0), 0);
    };

    const newPemasukanSubtotal = calculateSubtotal(['pemasukanSuami', 'pemasukanIstri', 'pemasukanLainnya1', 'pemasukanLainnya2']);
    const newPengeluaranSubtotal = calculateSubtotal(['pengeluaranSuami', 'pengeluaranIstri', 'makan', 'listrik', 'sosial', 'tanggunganLain']);
    const newAnakSubtotal = calculateSubtotal(['pengeluaranSekolah', 'uangSaku']);
    const newPendapatanBersih = newPemasukanSubtotal - newPengeluaranSubtotal - newAnakSubtotal;

    setPemasukanSubtotal(newPemasukanSubtotal);
    setPengeluaranSubtotal(newPengeluaranSubtotal);
    setAnakSubtotal(newAnakSubtotal);
    setPendapatanBersih(newPendapatanBersih);
  }, [formData]);

  const handleSubmit = async () => {
    if (!applicationId) {
      alert('Application ID tidak ditemukan!')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/client/application/sub-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          pemasukanSuami: parseFloat(formData.pemasukanSuami) || 0,
          pemasukanIstri: parseFloat(formData.pemasukanIstri) || 0,
          pemasukanLainnya1: parseFloat(formData.pemasukanLainnya1) || 0,
          pemasukanLainnya2: parseFloat(formData.pemasukanLainnya2) || 0,
          pengeluaranSuami: parseFloat(formData.pengeluaranSuami) || 0,
          pengeluaranIstri: parseFloat(formData.pengeluaranIstri) || 0,
          makan: parseFloat(formData.makan) || 0,
          listrik: parseFloat(formData.listrik) || 0,
          sosial: parseFloat(formData.sosial) || 0,
          tanggunganLain: parseFloat(formData.tanggunganLain) || 0,
          jumlahAnak: parseInt(formData.jumlahAnak) || 0,
          pengeluaranSekolah: parseFloat(formData.pengeluaranSekolah) || 0,
          uangSaku: parseFloat(formData.uangSaku) || 0,
          jangkaPembiayaan: parseInt(formData.jangkaPembiayaan) || 0,
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message || 'Sub-Analisa berhasil disimpan!')
        router.push('/')
      } else {
        console.error("Error from server:", result);
        alert('Terjadi kesalahan: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving sub-analysis:', error);
      alert('Terjadi kesalahan saat menyimpan data: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Redirect if no applicationId
  useEffect(() => {
    if (!applicationId) {
      alert('Application ID tidak ditemukan. Silakan mulai dari pengajuan baru.')
      router.push('/client/application/new')
    }
  }, [applicationId, router])

  if (!applicationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Application ID tidak ditemukan.</p>
          <Button onClick={() => router.push('/client/application/new')}>
            Buat Pengajuan Baru
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">SUB-ANALISA PEMBIAYAAN</CardTitle>
            <CardDescription className="text-center">
              Lengkapi data pemasukan dan pengeluaran bulanan Anda.
              <br />
              <strong>ID Pengajuan: {applicationId}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* PEMASUKAN */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">PEMASUKAN TIAP BULAN</h3>
                <div className="flex items-center">
                  <label className="w-24">Suami</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pemasukanSuami} onChange={(e) => handleInputChange('pemasukanSuami', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-24">Istri</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pemasukanIstri} onChange={(e) => handleInputChange('pemasukanIstri', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-24">Lainnya 1</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pemasukanLainnya1} onChange={(e) => handleInputChange('pemasukanLainnya1', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-24">Lainnya 2</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pemasukanLainnya2} onChange={(e) => handleInputChange('pemasukanLainnya2', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center font-bold border-t pt-2 mt-2">
                  <label className="w-24">Sub total</label>
                  <span className="mr-2">Rp.</span>
                  <span className="flex-1 text-right pr-2">{formatCurrency(pemasukanSubtotal)}</span>
                </div>
              </div>

              {/* PENGELUARAN */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">PENGELUARAN TIAP BULAN</h3>
                <div className="flex items-center">
                  <label className="w-32">Suami</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pengeluaranSuami} onChange={(e) => handleInputChange('pengeluaranSuami', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-32">Istri</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.pengeluaranIstri} onChange={(e) => handleInputChange('pengeluaranIstri', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-32">Makan</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.makan} onChange={(e) => handleInputChange('makan', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center">
                  <label className="w-32">Listrik</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.listrik} onChange={(e) => handleInputChange('listrik', e.target.value)} placeholder="0" />
                </div>
                 <div className="flex items-center">
                  <label className="w-32">Sosial</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.sosial} onChange={(e) => handleInputChange('sosial', e.target.value)} placeholder="0" />
                </div>
                 <div className="flex items-center">
                  <label className="w-32">Tanggungan Lain</label>
                  <span className="mr-2">Rp.</span>
                  <Input type="number" value={formData.tanggunganLain} onChange={(e) => handleInputChange('tanggunganLain', e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center font-bold border-t pt-2 mt-2">
                  <label className="w-32">Sub total</label>
                  <span className="mr-2">Rp.</span>
                  <span className="flex-1 text-right pr-2">{formatCurrency(pengeluaranSubtotal)}</span>
                </div>
              </div>
            </div>

            {/* PENGELUARAN ANAK */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">PENGELUARAN ANAK</h3>
              <div className="flex items-center">
                <label className="w-32">Jumlah Anak</label>
                <Input type="number" value={formData.jumlahAnak} onChange={(e) => handleInputChange('jumlahAnak', e.target.value)} placeholder="0" className="w-20 mr-2"/>
                <span>Orang</span>
              </div>
              <div className="flex items-center">
                <label className="w-32">Sekolah</label>
                <span className="mr-2">Rp.</span>
                <Input type="number" value={formData.pengeluaranSekolah} onChange={(e) => handleInputChange('pengeluaranSekolah', e.target.value)} placeholder="0" />
              </div>
              <div className="flex items-center">
                <label className="w-32">Uang Saku</label>
                <span className="mr-2">Rp.</span>
                <Input type="number" value={formData.uangSaku} onChange={(e) => handleInputChange('uangSaku', e.target.value)} placeholder="0" />
              </div>
              <div className="flex items-center font-bold border-t pt-2 mt-2">
                <label className="w-32">Sub total</label>
                <span className="mr-2">Rp.</span>
                <span className="flex-1 text-right pr-2">{formatCurrency(anakSubtotal)}</span>
              </div>
            </div>

            {/* PENDAPATAN BERSIH */}
            <div className="space-y-4 bg-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-xl font-bold text-gray-900">Pendapatan Bersih</label>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(pendapatanBersih)}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-3"
              >
                {isSubmitting ? 'Menyimpan...' : 'Selesai dan Kirim'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SubAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <SubAnalysisForm />
    </Suspense>
  )
}
