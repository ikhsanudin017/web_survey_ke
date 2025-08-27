'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

// --- TYPE DEFINITIONS ---
interface Application {
  id: string;
  fullName: string;
  loanAmount: number;
  status: string;
  financingAnalysis: { id: string } | null;
  subFinancingAnalysis: { id: string } | null;
}

interface Stats {
  pending: number;
  analyzed: number;
  approved: number;
  rejected: number;
}

// --- STATS CARD COMPONENT ---
const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function EmployeeDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, analyzed: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memuat data pengajuan');
      }
      const data = await res.json();
      const apps = data.applications || [];
      setApplications(apps);

      // Calculate stats
      const pending = apps.filter((app: Application) => app.status === 'PENDING').length;
      const analyzed = apps.filter((app: Application) => app.status === 'ANALYZED').length;
      const approved = apps.filter((app: Application) => app.status === 'APPROVED').length;
      const rejected = apps.filter((app: Application) => app.status === 'REJECTED').length;
      setStats({ pending, analyzed, approved, rejected });

    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('currentEmployee');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Pegawai</h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/employee/approval')} className="bg-blue-600 hover:bg-blue-700">
              Persetujuan Pembiayaan
            </Button>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Pengajuan Baru" value={stats.pending} icon={FileText} />
          <StatCard title="Sudah Dianalisa" value={stats.analyzed} icon={Clock} />
          <StatCard title="Disetujui" value={stats.approved} icon={CheckCircle} />
          <StatCard title="Ditolak" value={stats.rejected} icon={XCircle} />
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengajuan Pembiayaan</CardTitle>
            <CardDescription>Berikut adalah daftar pengajuan dari nasabah untuk dianalisa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Nasabah</TableHead>
                  <TableHead>Jumlah Pinjaman</TableHead>
                  <TableHead>Status Pengajuan</TableHead>
                  <TableHead>Status Analisa</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(app.loanAmount)}</TableCell>
                      <TableCell><Badge>{app.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1 items-start">
                          <Badge variant={app.subFinancingAnalysis ? 'success' : 'secondary'}>Sub-Analisa</Badge>
                          <Badge variant={app.financingAnalysis ? 'success' : 'secondary'}>Analisa 5C</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/employee/applications/${app.id}`)}>Detail</Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/employee/applications/${app.id}/edit`)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={async () => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            try {
                              const res = await fetch(`/api/applications/${app.id}`, {
                                method: 'DELETE',
                              });
                              if (!res.ok) {
                                const errorData = await res.json();
                                throw new Error(errorData.error || 'Failed to delete application');
                              }
                              toast.success('Application deleted successfully!');
                              // Refresh the list of applications after deletion
                              fetchData();
                            } catch (err) {
                              toast.error((err as Error).message);
                            }
                          }
                        }}>Hapus</Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/employee/sub-analysis/new?applicationId=${app.id}`)}>Sub Analisa</Button>
                        <Button variant="outline" size="sm" disabled={!app.subFinancingAnalysis} onClick={() => router.push(`/employee/analysis/new?applicationId=${app.id}`)}>Analisa 5C</Button>
                        {app.status === 'ANALYZED' && (
                          <Button variant="outline" size="sm" className="bg-yellow-50 border-yellow-200 text-yellow-800" onClick={() => router.push('/employee/approval')}>
                            Perlu Persetujuan
                          </Button>
                        )}
                        {app.status === 'APPROVED' && (
                          <Badge variant="default" className="bg-green-600">Disetujui</Badge>
                        )}
                        {app.status === 'REJECTED' && (
                          <Badge variant="destructive">Ditolak</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Tidak ada data pengajuan.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}