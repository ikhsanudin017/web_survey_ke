'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ApplicationDetail {
  id: string;
  fullName: string;
  loanAmount: number;
  status: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  monthlyIncome: number;
  spouseName?: string;
  spouseOccupation?: string;
  spouseIncome?: number;
  homeAddress: string;
  phoneNumber: string;
  contact1?: string;
  contact2?: string;
  contact3?: string;
  contact4?: string;
  contact5?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  businessDuration?: number; // in months
  businessIncome?: number;
  loanPurpose: string;
  loanTerm: number;
  collateral?: string;
  submittedAt: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  documents: Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    category: string;
  }>;
  subFinancingAnalysis?: {
    suami: number;
    istri: number;
    lainnya1: number;
    lainnya2: number;
    lainnya3: number;
    suamiPengeluaran: number;
    istriPengeluaran: number;
    makan: number;
    listrik: number;
    sosial: number;
    tanggunganLain: number;
    jumlahAnak: number;
    sekolah: number;
    uangSaku: number;
    pendapatanBersih: number;
    jangkaPembiayaan: number;
    angsuranMaksimal: number;
    plafonMaksimal: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          const res = await fetch(`/api/applications/${id}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch application details');
          }
          const data = await res.json();
          setApplication(data);
        } catch (err) {
          setError((err as Error).message);
          toast.error((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchApplication();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Memuat detail aplikasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-red-700">Error</CardTitle>
          <CardDescription className="mt-2">{error}</CardDescription>
          <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle>Aplikasi Tidak Ditemukan</CardTitle>
          <CardDescription className="mt-2">Detail aplikasi tidak dapat dimuat.</CardDescription>
          <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detail Aplikasi Pembiayaan</h1>
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{application.fullName}</CardTitle>
          <CardDescription>ID Aplikasi: {application.id}</CardDescription>
          <Badge className="mt-2 w-fit">{application.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Data */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Data Pribadi</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Email Klien:</strong> {application.client.email}</p>
              <p><strong>Telepon Klien:</strong> {application.client.phone}</p>
              <p><strong>Tempat Lahir:</strong> {application.birthPlace}</p>
              <p><strong>Tanggal Lahir:</strong> {formatDate(application.birthDate)}</p>
              <p><strong>Jenis Kelamin:</strong> {application.gender}</p>
              <p><strong>Status Pernikahan:</strong> {application.maritalStatus}</p>
              <p><strong>Pendidikan Terakhir:</strong> {application.education}</p>
              <p><strong>Pekerjaan:</strong> {application.occupation}</p>
              <p><strong>Penghasilan Bulanan:</strong> {formatCurrency(application.monthlyIncome)}</p>
              <p><strong>Alamat Rumah:</strong> {application.homeAddress}</p>
              {application.spouseName && <p><strong>Nama Pasangan:</strong> {application.spouseName}</p>}
              {application.spouseOccupation && <p><strong>Pekerjaan Pasangan:</strong> {application.spouseOccupation}</p>}
              {application.spouseIncome && <p><strong>Penghasilan Pasangan:</strong> {formatCurrency(application.spouseIncome)}</p>}
            </div>
          </div>

          {/* Business Data */}
          {application.businessName && (
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">Data Usaha</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Nama Usaha:</strong> {application.businessName}</p>
                <p><strong>Jenis Usaha:</strong> {application.businessType}</p>
                <p><strong>Alamat Usaha:</strong> {application.businessAddress}</p>
                <p><strong>Lama Usaha:</strong> {application.businessDuration ? `${application.businessDuration / 12} Tahun` : 'N/A'}</p>
                <p><strong>Penghasilan Usaha:</strong> {application.businessIncome ? formatCurrency(application.businessIncome) : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Financing Data */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Data Pembiayaan</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Jumlah Pinjaman:</strong> {formatCurrency(application.loanAmount)}</p>
              <p><strong>Tujuan Pinjaman:</strong> {application.loanPurpose}</p>
              <p><strong>Jangka Waktu Pinjaman:</strong> {application.loanTerm} Bulan</p>
              <p><strong>Jaminan:</strong> {application.collateral || 'Tidak Ada'}</p>
            </div>
          </div>

          {/* Sub-Financing Analysis Data */}
          {application.subFinancingAnalysis && (
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">Data Sub-Analisa Pembiayaan</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Pemasukan Suami:</strong> {formatCurrency(application.subFinancingAnalysis.suami)}</p>
                <p><strong>Pemasukan Istri:</strong> {formatCurrency(application.subFinancingAnalysis.istri)}</p>
                <p><strong>Pemasukan Lainnya 1:</strong> {formatCurrency(application.subFinancingAnalysis.lainnya1)}</p>
                <p><strong>Pemasukan Lainnya 2:</strong> {formatCurrency(application.subFinancingAnalysis.lainnya2)}</p>
                <p><strong>Pemasukan Lainnya 3:</strong> {formatCurrency(application.subFinancingAnalysis.lainnya3)}</p>
                <p><strong>Pengeluaran Suami:</strong> {formatCurrency(application.subFinancingAnalysis.suamiPengeluaran)}</p>
                <p><strong>Pengeluaran Istri:</strong> {formatCurrency(application.subFinancingAnalysis.istriPengeluaran)}</p>
                <p><strong>Pengeluaran Makan:</strong> {formatCurrency(application.subFinancingAnalysis.makan)}</p>
                <p><strong>Pengeluaran Listrik:</strong> {formatCurrency(application.subFinancingAnalysis.listrik)}</p>
                <p><strong>Pengeluaran Sosial:</strong> {formatCurrency(application.subFinancingAnalysis.sosial)}</p>
                <p><strong>Pengeluaran Tanggungan Lain:</strong> {formatCurrency(application.subFinancingAnalysis.tanggunganLain)}</p>
                <p><strong>Jumlah Anak:</strong> {application.subFinancingAnalysis.jumlahAnak}</p>
                <p><strong>Pengeluaran Sekolah:</strong> {formatCurrency(application.subFinancingAnalysis.sekolah)}</p>
                <p><strong>Pengeluaran Uang Saku:</strong> {formatCurrency(application.subFinancingAnalysis.uangSaku)}</p>
                <p><strong>Pendapatan Bersih:</strong> {formatCurrency(application.subFinancingAnalysis.pendapatanBersih)}</p>
                <p><strong>Jangka Pembiayaan (Bulan):</strong> {application.subFinancingAnalysis.jangkaPembiayaan}</p>
                <p><strong>Angsuran Maksimal:</strong> {formatCurrency(application.subFinancingAnalysis.angsuranMaksimal)}</p>
                <p><strong>Plafon Maksimal:</strong> {formatCurrency(application.subFinancingAnalysis.plafonMaksimal)}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Dokumen Terunggah</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map(doc => (
                  <Card key={doc.id} className="p-3">
                    <p className="font-medium">{doc.originalName}</p>
                    <p className="text-sm text-gray-600">Kategori: {doc.category}</p>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Lihat Dokumen</a>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button onClick={() => router.push(`/employee/applications/${id}/edit`)}>Edit Aplikasi</Button>
            <Button variant="destructive" onClick={async () => {
              if (confirm('Are you sure you want to delete this application?')) {
                try {
                  const res = await fetch(`/api/applications/${application.id}`, {
                    method: 'DELETE',
                  });
                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to delete application');
                  }
                  toast.success('Application deleted successfully!');
                  router.push('/employee/dashboard'); // Redirect to dashboard after successful deletion
                } catch (err) {
                  toast.error((err as Error).message);
                }
              }
            }}>Hapus Aplikasi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}