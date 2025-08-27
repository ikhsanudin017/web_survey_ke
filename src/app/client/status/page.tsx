'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ClientApplication {
  id: string;
  fullName: string;
  loanAmount: number;
  loanTerm: number;
  businessType: string | null;
  status: string;
  submittedAt: string;
  updatedAt: string;
  financingAnalysis: {
    kesimpulan_rekomendasi: string;
    petugasSurvei: string;
    kesimpulan_catatanKhusus: string;
  } | null;
}

export default function ClientStatusPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ClientApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/client/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      toast.error('Gagal memuat status aplikasi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-gray-100"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>;
      case 'ANALYZED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />Sedang Diproses</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Aplikasi Anda sedang menunggu untuk direview oleh tim kami.';
      case 'ANALYZED':
        return 'Aplikasi Anda telah dianalisa dan sedang menunggu persetujuan final.';
      case 'APPROVED':
        return 'Selamat! Aplikasi pembiayaan Anda telah disetujui. Tim kami akan menghubungi Anda segera.';
      case 'REJECTED':
        return 'Mohon maaf, aplikasi pembiayaan Anda tidak dapat disetujui saat ini. Silakan hubungi kami untuk informasi lebih lanjut.';
      default:
        return 'Status tidak diketahui.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Memuat status aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Status Aplikasi Pembiayaan</h1>
            <p className="text-sm text-gray-600">Pantau perkembangan aplikasi pembiayaan Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/client/application/new')} className="bg-blue-600 hover:bg-blue-700">
              Ajukan Pembiayaan Baru
            </Button>
            <Button onClick={() => router.push('/client/dashboard')} variant="outline">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aplikasi</h3>
              <p className="text-gray-500 mb-6">Anda belum mengajukan aplikasi pembiayaan.</p>
              <Button onClick={() => router.push('/client/application/new')} className="bg-blue-600 hover:bg-blue-700">
                Ajukan Pembiayaan Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Aplikasi Pembiayaan #{app.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Diajukan pada: {new Date(app.submittedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Detail Aplikasi</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nama:</span>
                          <span className="font-medium">{app.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah Pinjaman:</span>
                          <span className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jangka Waktu:</span>
                          <span className="font-medium">{app.loanTerm} bulan</span>
                        </div>
                        {app.businessType && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Jenis Usaha:</span>
                            <span className="font-medium">{app.businessType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Status & Informasi</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{getStatusDescription(app.status)}</p>
                        </div>
                        
                        {app.financingAnalysis && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Rekomendasi Analisa:</span>
                              <Badge variant={app.financingAnalysis.kesimpulan_rekomendasi === 'Layak' ? 'default' : 'destructive'}>
                                {app.financingAnalysis.kesimpulan_rekomendasi}
                              </Badge>
                            </div>
                            {app.financingAnalysis.petugasSurvei && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Petugas Survei:</span>
                                <span className="text-sm font-medium">{app.financingAnalysis.petugasSurvei}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Terakhir diperbarui: {new Date(app.updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {app.status === 'APPROVED' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <h5 className="font-medium text-green-900">Aplikasi Disetujui!</h5>
                          <p className="text-sm text-green-700 mt-1">
                            Tim kami akan menghubungi Anda dalam 1-2 hari kerja untuk proses selanjutnya.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {app.status === 'REJECTED' && app.financingAnalysis?.kesimpulan_catatanKhusus && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-900">Informasi Tambahan</h5>
                          <p className="text-sm text-red-700 mt-1">
                            {app.financingAnalysis.kesimpulan_catatanKhusus}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
