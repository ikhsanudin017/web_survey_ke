'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Helper function to format numbers with dots
const formatNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

function SubAnalysisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  const [formData, setFormData] = useState({
    // PEMASUKAN
    suami: '',
    istri: '',
    lainnya1: '',
    lainnya2: '',
    lainnya3: '',
    subTotalPemasukan: '',

    // PENGELUARAN
    suamiPengeluaran: '',
    istriPengeluaran: '',
    makan: '',
    listrik: '',
    sosial: '',
    tanggunganLain: '',
    subTotalPengeluaran: '',

    // JUMLAH ANAK
    jumlahAnak: '',
    pengeluaranAnak: '',
    sekolah: '',
    uangSaku: '',
    subTotalAnak: '',

    // PENDAPATAN BERSIH
    pendapatanBersih: '',

    // JANGKA PEMBIAYAAN
    jangkaPembiayaan: '',
    plafonMaksimal: '',

    // ANGSURAN MAKSIMAL
    angsuranMaksimal: ''
  })

  // Fetch existing sub-analysis data if applicationId is present
  useEffect(() => {
    if (applicationId) {
      const fetchSubAnalysis = async () => {
        try {
          const response = await fetch(`/api/employee/sub-analysis?applicationId=${applicationId}`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              // Assuming the API returns the data in a format that matches formData
              setFormData(prev => ({
                ...prev,
                ...data, // Merge fetched data into formData
                // Ensure numbers are stored as strings if that's what the form expects
                suami: data.suami?.toString() || '',
                istri: data.istri?.toString() || '',
                lainnya1: data.lainnya1?.toString() || '',
                lainnya2: data.lainnya2?.toString() || '',
                lainnya3: data.lainnya3?.toString() || '',
                suamiPengeluaran: data.suamiPengeluaran?.toString() || '',
                istriPengeluaran: data.istriPengeluaran?.toString() || '',
                makan: data.makan?.toString() || '',
                listrik: data.listrik?.toString() || '',
                sosial: data.sosial?.toString() || '',
                tanggunganLain: data.tanggunganLain?.toString() || '',
                jumlahAnak: data.jumlahAnak?.toString() || '',
                sekolah: data.sekolah?.toString() || '',
                uangSaku: data.uangSaku?.toString() || '',
                jangkaPembiayaan: data.jangkaPembiayaan?.toString() || '',
                // Derived fields might not be sent from backend, or might be sent.
                // If sent, they will be overwritten by local calculations.
                // If not sent, they will remain empty and be calculated.
              }));
            }
          } else {
            console.error('Failed to fetch existing sub-analysis:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching sub-analysis:', error);
        }
      };
      fetchSubAnalysis();
    }
  }, [applicationId]); // Dependency array includes applicationId

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto calculate subtotals
  const calculatePemasukanSubtotal = () => {
    const suami = parseFloat(formData.suami) || 0
    const istri = parseFloat(formData.istri) || 0
    const lainnya1 = parseFloat(formData.lainnya1) || 0
    const lainnya2 = parseFloat(formData.lainnya2) || 0
    const lainnya3 = parseFloat(formData.lainnya3) || 0
    return suami + istri + lainnya1 + lainnya2 + lainnya3
  }

  const calculatePengeluaranSubtotal = () => {
    const suami = parseFloat(formData.suamiPengeluaran) || 0
    const istri = parseFloat(formData.istriPengeluaran) || 0
    const makan = parseFloat(formData.makan) || 0
    const listrik = parseFloat(formData.listrik) || 0
    const sosial = parseFloat(formData.sosial) || 0
    const tanggungan = parseFloat(formData.tanggunganLain) || 0
    return suami + istri + makan + listrik + sosial + tanggungan
  }

  const calculateAnakSubtotal = () => {
    const sekolah = parseFloat(formData.sekolah) || 0
    const uangSaku = parseFloat(formData.uangSaku) || 0
    return sekolah + uangSaku
  }

  const calculatePendapatanBersih = () => {
    const pemasukan = calculatePemasukanSubtotal()
    const pengeluaran = calculatePengeluaranSubtotal()
    const anak = calculateAnakSubtotal()
    return pemasukan - pengeluaran - anak
  }

  const calculateAngsuranMaksimal = (pendapatanBersih: number) => {
    return pendapatanBersih * 0.7; // 70% dari pendapatan bersih
  };

  const calculatePlafonMaksimal = (angsuranMaksimal: number, jangkaPembiayaan: number) => {
    return angsuranMaksimal * jangkaPembiayaan;
  };

  // Auto-calculate derived values
  useEffect(() => {
    const pendapatanBersih = calculatePendapatanBersih();
    const angsuranMaksimal = calculateAngsuranMaksimal(pendapatanBersih);
    const jangkaPembiayaan = parseFloat(formData.jangkaPembiayaan) || 0;
    const plafonMaksimal = calculatePlafonMaksimal(angsuranMaksimal, jangkaPembiayaan);

    setFormData(prev => ({
      ...prev,
      pendapatanBersih: pendapatanBersih.toString(),
      angsuranMaksimal: angsuranMaksimal.toString(),
      plafonMaksimal: plafonMaksimal.toString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.suami, formData.istri, formData.lainnya1, formData.lainnya2, formData.lainnya3, formData.suamiPengeluaran, formData.istriPengeluaran, formData.makan, formData.listrik, formData.sosial, formData.tanggunganLain, formData.sekolah, formData.uangSaku, formData.jangkaPembiayaan]);

  const handleSubmit = async () => {
    try {
      if (!applicationId) {
        alert('Application ID not found in URL');
        return;
      }

      const response = await fetch('/api/employee/sub-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, ...formData }),
      });

      if (response.ok) {
        alert('Sub analisa pembiayaan berhasil disimpan!');
        router.push('/employee/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Terjadi kesalahan: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving sub analysis:', error)
      alert('Terjadi kesalahan saat menyimpan sub analisa')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50" />
      {/* Header */}
      <div className="bg-[var(--color-secondary)]/80 backdrop-blur-sm shadow-lg border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-center text-gray-900">SUB-ANALISA PEMBIAYAAN</h1>
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
            <CardTitle className="text-center">Form Sub Analisa Pembiayaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* PEMASUKAN */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">PEMASUKAN</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">SUAMI</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.suami}
                        onChange={(e) => handleInputChange('suami', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">ISTRI</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.istri}
                        onChange={(e) => handleInputChange('istri', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">LAINNYA</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.lainnya1}
                        onChange={(e) => handleInputChange('lainnya1', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20"></label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.lainnya2}
                        onChange={(e) => handleInputChange('lainnya2', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20"></label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.lainnya3}
                        onChange={(e) => handleInputChange('lainnya3', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <label className="text-sm font-bold text-gray-900 w-20">Sub total</label>
                    <div className="flex-1 mx-4">
                      <div className="text-right font-bold text-gray-900">
                        {formatCurrency(calculatePemasukanSubtotal())}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>
                </div>

                {/* PENGELUARAN */}
                <div className="space-y-4">
                  <h4 className="text-md font-bold text-gray-900">TIAP BULAN</h4>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">SUAMI</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.suamiPengeluaran}
                        onChange={(e) => handleInputChange('suamiPengeluaran', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">ISTRI</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.istriPengeluaran}
                        onChange={(e) => handleInputChange('istriPengeluaran', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">MAKAN</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.makan}
                        onChange={(e) => handleInputChange('makan', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">LISTRIK</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.listrik}
                        onChange={(e) => handleInputChange('listrik', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">SOSIAL</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.sosial}
                        onChange={(e) => handleInputChange('sosial', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 w-20">TANGGUNGAN LAIN</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.tanggunganLain}
                        onChange={(e) => handleInputChange('tanggunganLain', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <label className="text-sm font-bold text-gray-900 w-20">SUB TOTAL</label>
                    <div className="flex-1 mx-4">
                      <div className="text-right font-bold text-gray-900">
                        {formatCurrency(calculatePengeluaranSubtotal())}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* JUMLAH ANAK */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">JUMLAH ANAK</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.jumlahAnak}
                        onChange={(e) => handleInputChange('jumlahAnak', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600">Orang</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-bold text-gray-900 mb-4">PENGELUARAN ANAK</h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 w-20">SEKOLAH</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.sekolah}
                        onChange={(e) => handleInputChange('sekolah', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 w-20">UANG SAKU</label>
                    <div className="flex-1 mx-4">
                      <Input
                        type="number"
                        value={formData.uangSaku}
                        onChange={(e) => handleInputChange('uangSaku', e.target.value)}
                        className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <label className="text-sm font-bold text-gray-900 w-20">Sub total</label>
                    <div className="flex-1 mx-4">
                      <div className="text-right font-bold text-gray-900">
                        {formatCurrency(calculateAnakSubtotal())}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-16">Rp.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PENDAPATAN BERSIH */}
            <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-900">Pendapatan Bersih</label>
                <div className="flex-1 mx-4">
                  <div className="text-right text-xl font-bold text-green-600">
                    {formatCurrency(calculatePendapatanBersih())}
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-16">Rp.</span>
              </div>
            </div>

            {/* JANGKA PEMBIAYAAN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-900">JANGKA PEMBIAYAAN</label>
                <div className="flex-1 mx-4">
                  <Input
                    type="number"
                    value={formData.jangkaPembiayaan}
                    onChange={(e) => handleInputChange('jangkaPembiayaan', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                    placeholder="0"
                  />
                </div>
                <span className="text-sm text-gray-600">Kali</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-900">PLAFON MAKSIMAL</label>
                <div className="flex-1 mx-4">
                  <Input
                    type="text"
                    value={formatNumber(formData.plafonMaksimal)}
                    onChange={(e) => handleInputChange('plafonMaksimal', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-right font-bold"
                    placeholder="0"
                    readOnly
                  />
                </div>
                <span className="text-sm text-gray-600 w-16">Rp.</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-900">Angsuran Maksimal per bulan</label>
                <div className="flex-1 mx-4">
                  <Input
                    type="text"
                    value={formatNumber(formData.angsuranMaksimal)}
                    onChange={(e) => handleInputChange('angsuranMaksimal', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-right font-bold"
                    placeholder="0"
                    readOnly
                  />
                </div>
                <span className="text-sm text-gray-600 w-16">Rp.</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button 
                onClick={handleSubmit}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white px-8 py-3"
              >
                Simpan Sub Analisa Pembiayaan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewSubAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{borderColor:'var(--color-accent)'}}></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <SubAnalysisForm />
    </Suspense>
  )
}
