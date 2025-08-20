'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NewApplicationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    // Data Pribadi
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    education: '',
    occupation: '',
    monthlyIncome: '',
    spouseName: '',
    spouseOccupation: '',
    spouseIncome: '',

    // Data Kontak
    email: '',
    homeAddress: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyPhone: '',

    // Data Usaha
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessDuration: '',
    businessIncome: '',

    // Data Pembiayaan
    loanAmount: '',
    loanPurpose: '',
    loanTerm: '',
    collateral: '',

    // Checklist Dokumen
    checklist: {
      ktpOriginal: false,
      ktpCopy: false,
      kkOriginal: false,
      kkCopy: false,
      slipGaji: false,
      suratKeterjaKerja: false,
      rekKoran: false,
      buktiPenghasilan: false,
      siup: false,
      tdp: false,
      buktiTempatUsaha: false,
      fotoUsaha: false,
      sertifikatTanah: false,
      bpkb: false,
      imb: false,
      suratNikah: false,
      aktaKelahiran: false,
      referensiBank: false
    },

    // Upload Files
    uploadedFiles: [] as Array<{
      category: string
      filename: string
      originalName: string
      url: string
      size: number
    }>
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleChecklistChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: value
      }
    }))
  }

  const handleFileUpload = async (file: File, category: string) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, {
            category: result.category,
            filename: result.filename,
            originalName: result.originalName,
            url: result.url,
            size: result.size
          }]
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

  const removeUploadedFile = (filename: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.filename !== filename)
    }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Pengajuan berhasil dikirim! Terima kasih. ID Pengajuan: ' + result.applicationId)
        router.push('/')
      } else {
        alert('Terjadi kesalahan: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Terjadi kesalahan saat menyimpan data pembiayaan. Silakan coba lagi.')
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Data Pribadi</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap *
          </label>
          <Input
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tempat Lahir *
          </label>
          <Input
            value={formData.birthPlace}
            onChange={(e) => handleInputChange('birthPlace', e.target.value)}
            placeholder="Masukkan tempat lahir"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Lahir *
          </label>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Pernikahan *
          </label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih status pernikahan</option>
            <option value="Belum Menikah">Belum Menikah</option>
            <option value="Menikah">Menikah</option>
            <option value="Cerai">Cerai</option>
            <option value="Janda/Duda">Janda/Duda</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pendidikan Terakhir *
          </label>
          <select
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih pendidikan terakhir</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA/SMK">SMA/SMK</option>
            <option value="Diploma">Diploma</option>
            <option value="Sarjana">Sarjana</option>
            <option value="Pascasarjana">Pascasarjana</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pekerjaan *
          </label>
          <Input
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="Masukkan pekerjaan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penghasilan per Bulan *
          </label>
          <Input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            placeholder="Masukkan penghasilan per bulan"
            required
          />
        </div>
      </div>

      {formData.maritalStatus === 'Menikah' && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pasangan
            </label>
            <Input
              value={formData.spouseName}
              onChange={(e) => handleInputChange('spouseName', e.target.value)}
              placeholder="Masukkan nama pasangan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pekerjaan Pasangan
            </label>
            <Input
              value={formData.spouseOccupation}
              onChange={(e) => handleInputChange('spouseOccupation', e.target.value)}
              placeholder="Masukkan pekerjaan pasangan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penghasilan Pasangan
            </label>
            <Input
              type="number"
              value={formData.spouseIncome}
              onChange={(e) => handleInputChange('spouseIncome', e.target.value)}
              placeholder="Masukkan penghasilan pasangan"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Data Kontak</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Rumah *
          </label>
          <textarea
            value={formData.homeAddress}
            onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            placeholder="Masukkan alamat lengkap"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Masukkan alamat email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Telepon *
          </label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Masukkan nomor telepon"
            required
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kontak Darurat *
            </label>
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Nama kontak darurat"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Telepon Darurat *
          </label>
          <Input
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
            placeholder="Nomor telepon darurat"
            required
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Data Usaha (Opsional)</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Usaha
          </label>
          <Input
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Masukkan nama usaha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Usaha
          </label>
          <Input
            value={formData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            placeholder="Masukkan jenis usaha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lama Usaha (bulan)
          </label>
          <Input
            type="number"
            value={formData.businessDuration}
            onChange={(e) => handleInputChange('businessDuration', e.target.value)}
            placeholder="Masukkan lama usaha dalam bulan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penghasilan Usaha per Bulan
          </label>
          <Input
            type="number"
            value={formData.businessIncome}
            onChange={(e) => handleInputChange('businessIncome', e.target.value)}
            placeholder="Masukkan penghasilan usaha"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alamat Usaha
        </label>
        <textarea
          value={formData.businessAddress}
          onChange={(e) => handleInputChange('businessAddress', e.target.value)}
          placeholder="Masukkan alamat usaha"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Data Pembiayaan</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah Pinjaman *
          </label>
          <Input
            type="number"
            value={formData.loanAmount}
            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
            placeholder="Masukkan jumlah pinjaman"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jangka Waktu (bulan) *
          </label>
          <Input
            type="number"
            value={formData.loanTerm}
            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
            placeholder="Masukkan jangka waktu"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tujuan Pembiayaan *
        </label>
        <textarea
          value={formData.loanPurpose}
          onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
          placeholder="Jelaskan tujuan pembiayaan"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jaminan
        </label>
        <textarea
          value={formData.collateral}
          onChange={(e) => handleInputChange('collateral', e.target.value)}
          placeholder="Jelaskan jaminan yang akan diberikan"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Checklist Data Calon Pembiayaan</h3>
      <p className="text-sm text-gray-600">Centang dokumen yang Anda miliki dan siap untuk diserahkan:</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Dokumen Identitas */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 border-b pb-2">Dokumen Identitas</h4>
          <div className="space-y-2">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.checklist.ktpOriginal}
                  onChange={(e) => handleChecklistChange('ktpOriginal', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">KTP Asli</span>
              </label>
              <div className="ml-6">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'KTP_ASLI')
                  }}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.checklist.ktpCopy}
                  onChange={(e) => handleChecklistChange('ktpCopy', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Fotocopy KTP</span>
              </label>
              <div className="ml-6">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'KTP_COPY')
                  }}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.checklist.kkOriginal}
                  onChange={(e) => handleChecklistChange('kkOriginal', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Kartu Keluarga Asli</span>
              </label>
              <div className="ml-6">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'KK_ASLI')
                  }}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.checklist.kkCopy}
                  onChange={(e) => handleChecklistChange('kkCopy', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Fotocopy Kartu Keluarga</span>
              </label>
              <div className="ml-6">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'KK_COPY')
                  }}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dokumen Penghasilan */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 border-b pb-2">Dokumen Penghasilan</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.slipGaji}
                onChange={(e) => handleChecklistChange('slipGaji', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Slip Gaji</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.suratKeterjaKerja}
                onChange={(e) => handleChecklistChange('suratKeterjaKerja', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Surat Keterangan Kerja</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.rekKoran}
                onChange={(e) => handleChecklistChange('rekKoran', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Rekening Koran</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.buktiPenghasilan}
                onChange={(e) => handleChecklistChange('buktiPenghasilan', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Bukti Penghasilan Lainnya</span>
            </label>
          </div>
        </div>

        {/* Dokumen Usaha */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 border-b pb-2">Dokumen Usaha</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.siup}
                onChange={(e) => handleChecklistChange('siup', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">SIUP</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.tdp}
                onChange={(e) => handleChecklistChange('tdp', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">TDP</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.buktiTempatUsaha}
                onChange={(e) => handleChecklistChange('buktiTempatUsaha', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Bukti Tempat Usaha</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.fotoUsaha}
                onChange={(e) => handleChecklistChange('fotoUsaha', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Foto Usaha</span>
            </label>
          </div>
        </div>

        {/* Dokumen Jaminan */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 border-b pb-2">Dokumen Jaminan</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.sertifikatTanah}
                onChange={(e) => handleChecklistChange('sertifikatTanah', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Sertifikat Tanah</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.bpkb}
                onChange={(e) => handleChecklistChange('bpkb', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">BPKB</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.imb}
                onChange={(e) => handleChecklistChange('imb', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">IMB</span>
            </label>
          </div>
        </div>

        {/* Dokumen Lainnya */}
        <div className="space-y-3 md:col-span-2">
          <h4 className="font-medium text-gray-800 border-b pb-2">Dokumen Lainnya</h4>
          <div className="grid md:grid-cols-3 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.suratNikah}
                onChange={(e) => handleChecklistChange('suratNikah', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Surat Nikah</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.aktaKelahiran}
                onChange={(e) => handleChecklistChange('aktaKelahiran', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Akta Kelahiran</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.checklist.referensiBank}
                onChange={(e) => handleChecklistChange('referensiBank', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Referensi Bank</span>
            </label>
          </div>
        </div>
      </div>

      {/* Uploaded Files Display */}
      {formData.uploadedFiles.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-3">File yang Sudah Diupload:</h4>
          <div className="space-y-2">
            {formData.uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {file.category.replace('_', ' ')} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeUploadedFile(file.filename)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Catatan:</strong> 
          <br />• Centang dokumen yang Anda miliki
          <br />• Upload file dokumen dalam format JPG, PNG, atau PDF (max 5MB)
          <br />• File yang diupload akan disimpan dan dapat dilihat oleh pegawai KSU
        </p>
      </div>

      {uploading && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Sedang mengupload file...</strong> Mohon tunggu sebentar.
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pengajuan Pembiayaan</h1>
              <p className="text-gray-700 mt-1">Langkah <span className="font-semibold text-blue-600">{currentStep}</span> dari 5</p>
            </div>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Data Pribadi</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Data Kontak</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Data Usaha</span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Pembiayaan</span>
            <span className={currentStep >= 5 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Checklist</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Data Pribadi'}
              {currentStep === 2 && 'Data Kontak'}
              {currentStep === 3 && 'Data Usaha'}
              {currentStep === 4 && 'Data Pembiayaan'}
              {currentStep === 5 && 'Checklist Dokumen'}
            </CardTitle>
            <CardDescription>
              Silakan lengkapi informasi berikut dengan benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
              >
                Sebelumnya
              </Button>

              {currentStep < 5 ? (
                <Button onClick={handleNext}>
                  Selanjutnya
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Kirim Pengajuan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
