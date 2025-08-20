'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NewApplicationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
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
    collateral: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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

      if (result.success) {
        alert('Pengajuan berhasil dikirim! Terima kasih. ID Pengajuan: ' + result.applicationId)
        router.push('/')
      } else {
        alert('Terjadi kesalahan: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pengajuan Pembiayaan</h1>
              <p className="text-gray-700 mt-1">Langkah <span className="font-semibold text-blue-600">{currentStep}</span> dari 4</p>
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
            {[1, 2, 3, 4].map((step) => (
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

            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
              >
                Sebelumnya
              </Button>

              {currentStep < 4 ? (
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
