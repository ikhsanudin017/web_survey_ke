'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Application {
  id: string
  fullName: string
  birthPlace: string
  birthDate: string
  gender: string
  maritalStatus: string
  education: string
  occupation: string
  monthlyIncome: number
  spouseName?: string
  spouseOccupation?: string
  spouseIncome?: number
  homeAddress: string
  phoneNumber: string
  emergencyContact: string
  emergencyPhone: string
  businessName?: string
  businessType?: string
  businessAddress?: string
  businessDuration?: number
  businessIncome?: number
  loanAmount: number
  loanPurpose: string
  loanTerm: number
  collateral?: string
  status: string
  submittedAt: string
  documents?: Array<{
    id: string
    originalName: string
    category: string
    fileUrl: string
  }>
  checklist?: {
    ktpOriginal: boolean
    ktpCopy: boolean
    kkOriginal: boolean
    kkCopy: boolean
    slipGaji: boolean
    suratKeterjaKerja: boolean
    rekKoran: boolean
    buktiPenghasilan: boolean
    siup: boolean
    tdp: boolean
    buktiTempatUsaha: boolean
    fotoUsaha: boolean
    sertifikatTanah: boolean
    bpkb: boolean
    imb: boolean
    suratNikah: boolean
    aktaKelahiran: boolean
    referensiBank: boolean
  }
}

export default function ApplicationDetailPage() {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string

  const fetchApplicationDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`)
      const result = await response.json()
      
      if (response.ok) {
        setApplication(result.application)
      } else {
        console.error('Error fetching application:', result.error)
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchApplicationDetail()
  }, [fetchApplicationDetail])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail pengajuan...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pengajuan tidak ditemukan</p>
          <Button onClick={() => router.push('/employee/dashboard')} className="mt-4">
            Kembali ke Dashboard
          </Button>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Detail Pengajuan Pembiayaan
              </h1>
              <p className="text-gray-700 mt-1">
                Pengajuan dari {application.fullName}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push(`/employee/analysis/new?applicationId=${application.id}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Buat Analisa
              </Button>
              <Button 
                onClick={() => router.push(`/employee/sub-analysis/new?applicationId=${application.id}`)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Buat Sub Analisa
              </Button>
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Pribadi */}
            <Card>
              <CardHeader>
                <CardTitle>Data Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <p className="font-medium">{application.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tempat Lahir</label>
                  <p className="font-medium">{application.birthPlace}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                  <p className="font-medium">{new Date(application.birthDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                  <p className="font-medium">{application.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status Pernikahan</label>
                  <p className="font-medium">{application.maritalStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pendidikan</label>
                  <p className="font-medium">{application.education}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pekerjaan</label>
                  <p className="font-medium">{application.occupation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Penghasilan Bulanan</label>
                  <p className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(application.monthlyIncome)}</p>
                </div>
                {application.spouseName && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nama Pasangan</label>
                      <p className="font-medium">{application.spouseName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pekerjaan Pasangan</label>
                      <p className="font-medium">{application.spouseOccupation}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Data Kontak */}
            <Card>
              <CardHeader>
                <CardTitle>Data Kontak</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Alamat Rumah</label>
                  <p className="font-medium">{application.homeAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nomor Telepon</label>
                  <p className="font-medium">{application.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Kontak Darurat</label>
                  <p className="font-medium">{application.emergencyContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telepon Darurat</label>
                  <p className="font-medium">{application.emergencyPhone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Data Usaha */}
            {application.businessName && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Usaha</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Usaha</label>
                    <p className="font-medium">{application.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jenis Usaha</label>
                    <p className="font-medium">{application.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alamat Usaha</label>
                    <p className="font-medium">{application.businessAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lama Usaha</label>
                    <p className="font-medium">{application.businessDuration} bulan</p>
                  </div>
                  {application.businessIncome && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Penghasilan Usaha</label>
                      <p className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(application.businessIncome)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Data Pembiayaan */}
            <Card>
              <CardHeader>
                <CardTitle>Data Pembiayaan</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Jumlah Pinjaman</label>
                  <p className="font-medium text-green-600 text-lg">Rp {new Intl.NumberFormat('id-ID').format(application.loanAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jangka Waktu</label>
                  <p className="font-medium">{application.loanTerm} bulan</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tujuan Pinjaman</label>
                  <p className="font-medium">{application.loanPurpose}</p>
                </div>
                {application.collateral && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jaminan</label>
                    <p className="font-medium">{application.collateral}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Pengajuan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status === 'PENDING' ? 'Menunggu' :
                     application.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Diajukan: {new Date(application.submittedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dokumen */}
            {application.documents && application.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dokumen Terupload</CardTitle>
                  <CardDescription>
                    {application.documents.length} dokumen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.originalName}</p>
                          <p className="text-xs text-gray-500">{doc.category}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            {application.checklist && (
              <Card>
                <CardHeader>
                  <CardTitle>Checklist Dokumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(application.checklist).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Ada' : 'Tidak Ada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
