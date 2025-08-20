'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Data Pemohon
    nama: '',
    alamat: '',
    jenisUsaha: '',
    pengajuan: '',
    jangkaWaktu: '',

    // 1. KARAKTER
    agama: '',
    pengalaman: '',
    hubMasyarakat: '',
    karakterAngsuranLannya: '',
    kelSurveyLannya: '',

    // Rating Karakter (1-5)
    karakter1: '',
    karakter2: '',
    karakter3: '',
    karakter4: '',
    karakter5: '',

    // 2. KESIMPULAN KARAKTER
    kesimpulanKarakter: '',
    kapasitasDanKelancaran: '',

    // 3. ANALISA JAMINAN
    jenisJaminan: '',
    nilaiTaksiran: '',
    kondisiJaminan: '',
    faktorPotonganPembayaran: '',
    nilaiJaminanSetelahPotongan: '',

    // 4. KONDISI
    pekerjaan: '',
    jenisKontrakKerja: '',
    jenisUsaha2: '',
    kesimpulanUmumKondisi: '',

    // 5. CAPITAL
    rumah: '',
    kendaraan: '',
    lainnya: '',

    // 6. CHECKLIST KELENGKAPAN DOKUMEN
    fcKtpPemohon: false,
    fcKtpSuamiIstri: false,
    fcKtpSuamiIstriWaris: false,
    fcSlipGaji: false,
    fcApapun: false,

    // 7. KESIMPULAN AKHIR CATATAN KHUSUS
    kesimpulanAkhir: 'Layak', // Layak atau Tidak Layak

    // Signature fields
    petugasSurvei: '',
    pengurus: '',
    approver: ''
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      // TODO: Implement API call to save analysis
      console.log('Analysis data:', formData)
      alert('Analisa pembiayaan berhasil disimpan!')
      router.push('/employee/dashboard')
    } catch (error) {
      console.error('Error saving analysis:', error)
      alert('Terjadi kesalahan saat menyimpan analisa')
    }
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Form Analisa Pembiayaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Data Pemohon */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama:</label>
                  <Input
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat:</label>
                  <Input
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Usaha:</label>
                  <Input
                    value={formData.jenisUsaha}
                    onChange={(e) => handleInputChange('jenisUsaha', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengajuan:</label>
                  <Input
                    value={formData.pengajuan}
                    onChange={(e) => handleInputChange('pengajuan', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jangka Waktu:</label>
                  <Input
                    value={formData.jangkaWaktu}
                    onChange={(e) => handleInputChange('jangkaWaktu', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
              </div>
            </div>

            {/* 1. KARAKTER */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">1. KARAKTER</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agama:</label>
                  <Input
                    value={formData.agama}
                    onChange={(e) => handleInputChange('agama', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman:</label>
                  <Input
                    value={formData.pengalaman}
                    onChange={(e) => handleInputChange('pengalaman', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hub Masyarakat:</label>
                  <Input
                    value={formData.hubMasyarakat}
                    onChange={(e) => handleInputChange('hubMasyarakat', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Karakter Angsuran Lannya:</label>
                  <Input
                    value={formData.karakterAngsuranLannya}
                    onChange={(e) => handleInputChange('karakterAngsuranLannya', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kel Survey Lannya:</label>
                  <Input
                    value={formData.kelSurveyLannya}
                    onChange={(e) => handleInputChange('kelSurveyLannya', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
              </div>

              {/* Rating Karakter */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-4">Penilaian (1-5):</h4>
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{num}</label>
                      <div className="space-y-2">
                        {['Baik', 'Cukup', 'Kurang'].map((rating) => (
                          <label key={rating} className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="mr-1"
                              onChange={(e) => handleInputChange(`karakter${num}`, e.target.checked ? rating : '')}
                            />
                            <span className="text-xs">{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. KESIMPULAN KARAKTER */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">2. KESIMPULAN KARAKTER</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KAPASITAS DAN KELANCARAN:</label>
                <textarea
                  value={formData.kapasitasDanKelancaran}
                  onChange={(e) => handleInputChange('kapasitasDanKelancaran', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>

            {/* 3. ANALISA JAMINAN */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">3. ANALISA JAMINAN</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Jaminan:</label>
                  <Input
                    value={formData.jenisJaminan}
                    onChange={(e) => handleInputChange('jenisJaminan', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Taksiran:</label>
                  <Input
                    value={formData.nilaiTaksiran}
                    onChange={(e) => handleInputChange('nilaiTaksiran', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Jaminan:</label>
                  <Input
                    value={formData.kondisiJaminan}
                    onChange={(e) => handleInputChange('kondisiJaminan', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faktor Potongan Pembayaran:</label>
                  <Input
                    value={formData.faktorPotonganPembayaran}
                    onChange={(e) => handleInputChange('faktorPotonganPembayaran', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
                    className="mr-2"
                  />
                  <span>Valid</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="validInvalid"
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
                    <input type="checkbox" className="mr-2" />
                    <span>Karyawan</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Wiraswasta</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>PNS/Polri</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Tetap</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Kontrak (Masa berakhir Kontrak)</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Lainnya</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 5. CAPITAL */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">5. CAPITAL</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">- Rumah:</label>
                  <Input
                    value={formData.rumah}
                    onChange={(e) => handleInputChange('rumah', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">- Kendaraan:</label>
                  <Input
                    value={formData.kendaraan}
                    onChange={(e) => handleInputChange('kendaraan', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">- Lainnya:</label>
                  <Input
                    value={formData.lainnya}
                    onChange={(e) => handleInputChange('lainnya', e.target.value)}
                    className="border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0"
                  />
                </div>
              </div>
            </div>

            {/* 6. CHECKLIST KELENGKAPAN DOKUMEN */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">6. CHECKLIST KELENGKAPAN DOKUMEN</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcKtpPemohon}
                      onChange={(e) => handleInputChange('fcKtpPemohon', e.target.checked)}
                      className="mr-2"
                    />
                    <span>FC KTP Pemohon</span>
                    <div className="ml-auto flex space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Ada</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Tidak Ada</span>
                      </label>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcKtpSuamiIstri}
                      onChange={(e) => handleInputChange('fcKtpSuamiIstri', e.target.checked)}
                      className="mr-2"
                    />
                    <span>FC KTP Suami/Istri Waris</span>
                    <div className="ml-auto flex space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Ada</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Tidak Ada</span>
                      </label>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fcSlipGaji}
                      onChange={(e) => handleInputChange('fcSlipGaji', e.target.checked)}
                      className="mr-2"
                    />
                    <span>FC Slip Gaji</span>
                    <div className="ml-auto flex space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Ada</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Tidak Ada</span>
                      </label>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 7. KESIMPULAN AKHIR */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">7. KESIMPULAN AKHIR CATATAN KHUSUS</h3>
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
                  <p className="text-sm">( _________________ )</p>
                </div>
                <div>
                  <p className="mb-4">Pengurus</p>
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm">( _________________ )</p>
                </div>
                <div>
                  <p className="mb-4">Approver</p>
                  <div className="h-16 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm">( _________________ )</p>
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
