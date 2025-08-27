'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
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

export default function ApprovalPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AnalyzedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AnalyzedApplication | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAnalyzedApplications();
  }, []);

  const fetchAnalyzedApplications = async () => {
    try {
      const response = await fetch('/api/employee/approval/analyzed-applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      toast.error('Gagal memuat data aplikasi yang sudah dianalisa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (applicationId: string, decision: 'APPROVED' | 'REJECTED') => {
    if (!approvalNote.trim()) {
      toast.error('Catatan persetujuan wajib diisi');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/employee/approval/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          decision,
          note: approvalNote
        }),
      });

      if (!response.ok) throw new Error('Failed to process approval');

      toast.success(`Aplikasi berhasil ${decision === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
      setSelectedApp(null);
      setApprovalNote('');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Memuat data aplikasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Persetujuan Pembiayaan</h1>
            <p className="text-sm text-gray-600">Kelola persetujuan aplikasi yang sudah dianalisa</p>
          </div>
          <Button onClick={() => router.push('/employee/dashboard')} variant="outline">
            Kembali ke Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Aplikasi Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Tidak ada aplikasi yang menunggu persetujuan
              </p>
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
                        {app.status === 'ANALYZED' && (
                          <div className="flex space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  Setujui
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Setujui Aplikasi Pembiayaan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda akan menyetujui aplikasi pembiayaan untuk <strong>{app.fullName}</strong> 
                                    sebesar Rp {new Intl.NumberFormat('id-ID').format(app.loanAmount)}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Catatan Persetujuan</Label>
                                    <Textarea
                                      value={approvalNote}
                                      onChange={(e) => setApprovalNote(e.target.value)}
                                      placeholder="Masukkan catatan persetujuan..."
                                      required
                                    />
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setApprovalNote('')}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval(app.id, 'APPROVED')}
                                    disabled={isProcessing || !approvalNote.trim()}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isProcessing ? 'Memproses...' : 'Setujui'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  Tolak
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tolak Aplikasi Pembiayaan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda akan menolak aplikasi pembiayaan untuk <strong>{app.fullName}</strong>.
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Alasan Penolakan</Label>
                                    <Textarea
                                      value={approvalNote}
                                      onChange={(e) => setApprovalNote(e.target.value)}
                                      placeholder="Masukkan alasan penolakan..."
                                      required
                                    />
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setApprovalNote('')}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval(app.id, 'REJECTED')}
                                    disabled={isProcessing || !approvalNote.trim()}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isProcessing ? 'Memproses...' : 'Tolak'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {app.status !== 'ANALYZED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/employee/applications/${app.id}`)}
                          >
                            Lihat Detail
                          </Button>
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
    </div>
  );
}
