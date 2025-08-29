'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Plus, Eye, Clock, CheckCircle, XCircle } from 'lucide-react'

interface ClientApplication {
  id: string;
  fullName: string;
  loanAmount: number;
  loanTerm: number;
  status: string;
  submittedAt: string;
}

export default function ClientDashboard() {
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
      setApplications(data.applications || []);
    } catch (error) {
      toast.error('Gagal memuat data aplikasi');
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
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sedang Diproses</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-8 w-8 text-gray-400" />;
      case 'ANALYZED':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-80" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Client</h1>
            <p className="text-sm text-gray-600">Kelola aplikasi pembiayaan Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/client/status')} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Lihat Status
            </Button>
            <Button onClick={() => router.push('/client/application/new')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Ajukan Pembiayaan
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aplikasi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'APPROVED').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Aplikasi Pembiayaan Anda</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Daftar semua aplikasi pembiayaan yang pernah Anda ajukan</p>
              </div>
              <Button onClick={() => router.push('/client/status')} variant="outline">
                Lihat Detail Status
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aplikasi</h3>
                <p className="text-gray-500 mb-6">Anda belum mengajukan aplikasi pembiayaan.</p>
                <Button onClick={() => router.push('/client/application/new')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajukan Pembiayaan Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Aplikasi #{app.id.slice(-8)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)} • {app.loanTerm} bulan
                        </p>
                        <p className="text-xs text-gray-500">
                          Diajukan: {new Date(app.submittedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(app.status)}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push('/client/status')}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
                
                {applications.length > 5 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/client/status')}
                    >
                      Lihat Semua Aplikasi ({applications.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/client/application/new')}>
            <CardContent className="flex items-center p-6">
              <Plus className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Ajukan Pembiayaan Baru</h3>
                <p className="text-sm text-gray-600">Mulai proses pengajuan pembiayaan baru</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/client/status')}>
            <CardContent className="flex items-center p-6">
              <Eye className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Pantau Status Aplikasi</h3>
                <p className="text-sm text-gray-600">Lihat perkembangan aplikasi pembiayaan Anda</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
