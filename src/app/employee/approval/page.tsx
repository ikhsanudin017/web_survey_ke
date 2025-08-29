'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { useRouter, useSearchParams } from 'next/navigation'

interface CustomSession extends Session {
  user: Session['user'] & { // Extend the existing user type
    role?: string; // Add the role property
  };
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/PageHeader'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface AnalyzedApplication {
  id: string;
  fullName: string;
  loanAmount: number;
  loanTerm: number;
  businessType: string | null;
  status: string;
  submittedAt: string;
  financingAnalysis: {
    id: string;
    kesimpulan_rekomendasi: string;
    petugasSurvei: string;
    createdAt: string;
  } | null;
}

function ApprovalComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession() as { data: CustomSession | null };
  const [applications, setApplications] = useState<AnalyzedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AnalyzedApplication | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);


  const fetchAnalyzedApplications = async () => {
    try {
      const response = await fetch('/api/employee/approval/analyzed-applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data.applications);

      // Check for applicationId from URL and open modal
      const appIdFromUrl = searchParams.get('applicationId');
      if (appIdFromUrl) {
        const appToApprove = data.applications.find((app: AnalyzedApplication) => app.id === appIdFromUrl);
        if (appToApprove) {
          setSelectedApp(appToApprove);
          // Default to showing the 'Approve' dialog first
          setDecision('APPROVED'); 
          setIsModalOpen(true);
        } else {
          toast.error('Aplikasi yang dimaksud tidak ditemukan atau sudah diproses.');
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data aplikasi yang sudah dianalisa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyzedApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gate access: only approver 'toha'
  useEffect(() => {
    if (session?.user) {
      const id = (session.user as any).id;
      const role = (session.user as any).role;
      if (id !== 'toha' || role !== 'approver') {
        toast.error('Hanya user Toha yang dapat melakukan persetujuan');
        router.push('/employee/dashboard');
      }
    }
  }, [session, router]);

  const openApprovalModal = (app: AnalyzedApplication, dec: 'APPROVED' | 'REJECTED') => {
    setSelectedApp(app);
    setDecision(dec);
    setIsModalOpen(true);
    setApprovalNote(''); // Reset note when opening
  };

  const handleApproval = async () => {
    if (!selectedApp || !decision) return;

    if (!approvalNote.trim()) {
      toast.error(`Catatan ${decision === 'APPROVED' ? 'persetujuan' : 'penolakan'} wajib diisi`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/employee/approval/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          decision,
          note: approvalNote,
        }),
      });

      let result: any = {};
      try {
        result = await response.clone().json();
      } catch (_) {
        try {
          const text = await response.clone().text();
          result = text ? { error: text } : {};
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        const message = (result && (result.error || result.message))
          || response.statusText
          || 'Gagal memproses persetujuan';
        toast.error(message);
        setIsProcessing(false);
        return;
      }

      toast.success(`Aplikasi berhasil ${decision === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
      setIsModalOpen(false);
      setSelectedApp(null);
      setApprovalNote('');
      setDecision(null);
      fetchAnalyzedApplications(); // Refresh the list
    } catch (error) {
      toast.error('Gagal memproses persetujuan');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANALYZED':
        return <Badge variant="secondary">Menunggu Persetujuan</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Persetujuan Pembiayaan" subtitle="Kelola persetujuan aplikasi yang sudah dianalisa" />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-80" />
            </CardHeader>
            <CardContent>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full mb-3" />
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="Persetujuan Pembiayaan"
        subtitle="Kelola persetujuan aplikasi yang sudah dianalisa"
        actions={<Button onClick={() => router.push('/employee/dashboard')} variant="outline">Kembali ke Dashboard</Button>}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Aplikasi Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-2">
                  <path d="M9 12l2 2 4-4" />
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                </svg>
                <div className="text-sm text-muted-foreground">Tidak ada aplikasi yang menunggu persetujuan.</div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => location.reload()}>Muat Ulang</Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pemohon</TableHead>
                    <TableHead>Jumlah Pinjaman</TableHead>
                    <TableHead>Jangka Waktu</TableHead>
                    <TableHead>Jenis Usaha</TableHead>
                    <TableHead>Rekomendasi Analisa</TableHead>
                    <TableHead>Petugas Survei</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)}</TableCell>
                      <TableCell>{app.loanTerm} bulan</TableCell>
                      <TableCell>{app.businessType || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={app.financingAnalysis?.kesimpulan_rekomendasi === 'Layak' ? 'default' : 'destructive'}>
                          {app.financingAnalysis?.kesimpulan_rekomendasi || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.financingAnalysis?.petugasSurvei || '-'}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        {app.status === 'ANALYZED' && session?.user?.role === 'approver' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openApprovalModal(app, 'APPROVED')}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openApprovalModal(app, 'REJECTED')}
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : app.status !== 'ANALYZED' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/employee/applications/${app.id}`)}
                          >
                            Lihat Detail
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">Menunggu...</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Approval Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decision === 'APPROVED' ? 'Setujui Aplikasi' : 'Tolak Aplikasi'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan {decision === 'APPROVED' ? 'menyetujui' : 'menolak'} aplikasi untuk 
              <strong> {selectedApp?.fullName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approvalNote">
              {decision === 'APPROVED' ? 'Catatan Persetujuan' : 'Alasan Penolakan'}
            </Label>
            <Textarea
              id="approvalNote"
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder={`Masukkan ${decision === 'APPROVED' ? 'catatan...' : 'alasan...'}`}
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproval}
              disabled={isProcessing || !approvalNote.trim()}
              className={decision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessing ? 'Memproses...' : (decision === 'APPROVED' ? 'Setujui' : 'Tolak')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Memuat...</p></div>}>
      <ApprovalComponent />
    </Suspense>
  );
}
