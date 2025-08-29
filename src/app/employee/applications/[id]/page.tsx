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
  financingAnalysis?: {
    // 1. KARAKTER
    karakter_agama?: string | null;
    karakter_pengalaman?: string | null;
    karakter_hubMasyarakat?: string | null;
    karakter_angsuranLainnya?: string | null;
    karakter_surveyLainnya?: string | null;
    karakter_surveyRating1?: string | null;
    karakter_surveyRating2?: string | null;
    karakter_surveyRating3?: string | null;
    karakter_surveyRating4?: string | null;
    karakter_surveyRating5?: string | null;
    karakter_input1?: string | null;
    karakter_input2?: string | null;
    karakter_input3?: string | null;
    karakter_input4?: string | null;
    karakter_input5?: string | null;
    karakter_kesimpulan?: string | null;

    // 2. KAPASITAS
    kapasitas_plafonMaksimal?: number | null;
    kapasitas_angsuranMaksimal?: number | null;

    // 3. JAMINAN
    jaminan_jenis?: string | null;
    jaminan_nilaiTaksiran?: number | null;
    jaminan_kondisi?: string | null;
    jaminan_plafonPokok?: number | null;
    jaminan_keabsahan?: string | null;

    // 4. KONDISI
    kondisi_pekerjaan?: string | null;
    kondisi_pekerjaanLainnya?: string | null;
    kondisi_jenisKontrak?: string | null;
    kondisi_masaBerakhirKontrak?: string | null;
    kondisi_kesimpulanUmum?: string | null;

    // 5. CAPITAL
    capital_rumah?: string | null;
    capital_kendaraan?: string | null;
    capital_hartaLainnya?: string | null;
  } | null;
  biChecking?: {
    pdfFileName: string;
    pdfFileUrl: string;
    pdfFileSize: number;
    aiAnalysisResult?: any;
    creditScore?: number | null;
    riskLevel?: string | null;
    recommendation?: string | null;
    aiSummary?: string | null;
    manualNotes?: string | null;
    manualRating?: number | null;
  } | null;
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

const toNumber = (v: any): number => {
  if (v == null) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return isFinite(n) ? n : 0;
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
          {/* Ringkasan Cepat */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Ringkasan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p><strong>Jumlah Pinjaman:</strong> {formatCurrency(toNumber(application.loanAmount))}</p>
              <p><strong>Jangka Waktu:</strong> {application.loanTerm} Bulan</p>
              <p><strong>Status:</strong> {application.status}</p>
              <p>
                <strong>Estimasi Angsuran/bln:</strong> {
                  (() => {
                    const ang = application.loanTerm > 0 ? toNumber(application.loanAmount) / toNumber(application.loanTerm) : 0;
                    return formatCurrency(Math.round(ang));
                  })()
                }
              </p>
              <p><strong>Pendapatan Bersih (Sub-Analisa):</strong> {application.subFinancingAnalysis ? formatCurrency(toNumber(application.subFinancingAnalysis.pendapatanBersih)) : 'Belum ada'}</p>
              <p>
                <strong>Rasio Angsuran/Net:</strong> {
                  (() => {
                    const ang = application.loanTerm > 0 ? toNumber(application.loanAmount) / toNumber(application.loanTerm) : 0;
                    const net = toNumber(application.subFinancingAnalysis?.pendapatanBersih);
                    if (!net) return 'N/A';
                    const r = (ang / net) * 100;
                    return r.toFixed(1) + '%';
                  })()
                }
              </p>
              {application.biChecking && (
                <p className="md:col-span-3">
                  <strong>BI Checking:</strong> {application.biChecking.recommendation || '—'}
                  {application.biChecking.pdfFileUrl && (
                    <a className="text-blue-600 hover:underline ml-2" href={application.biChecking.pdfFileUrl} target="_blank" rel="noopener noreferrer">lihat PDF</a>
                  )}
                </p>
              )}
            </div>
          </div>
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
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Data Usaha</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Nama Usaha:</strong> {application.businessName || '-'}</p>
              <p><strong>Jenis Usaha:</strong> {application.businessType || '-'}</p>
              <p><strong>Alamat Usaha:</strong> {application.businessAddress || '-'}</p>
              <p><strong>Lama Usaha:</strong> {application.businessDuration ? `${application.businessDuration / 12} Tahun` : '-'}</p>
              <p><strong>Penghasilan Usaha:</strong> {application.businessIncome != null ? formatCurrency(toNumber(application.businessIncome)) : '-'}</p>
            </div>
          </div>

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
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">Data Sub-Analisa Pembiayaan</h2>
            {application.subFinancingAnalysis ? (
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Pemasukan Suami:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.suami))}</p>
                <p><strong>Pemasukan Istri:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.istri))}</p>
                <p><strong>Pemasukan Lainnya 1:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.lainnya1))}</p>
                <p><strong>Pemasukan Lainnya 2:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.lainnya2))}</p>
                <p><strong>Pemasukan Lainnya 3:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.lainnya3))}</p>
                <p><strong>Pengeluaran Suami:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.suamiPengeluaran))}</p>
                <p><strong>Pengeluaran Istri:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.istriPengeluaran))}</p>
                <p><strong>Pengeluaran Makan:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.makan))}</p>
                <p><strong>Pengeluaran Listrik:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.listrik))}</p>
                <p><strong>Pengeluaran Sosial:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.sosial))}</p>
                <p><strong>Pengeluaran Tanggungan Lain:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.tanggunganLain))}</p>
                <p><strong>Jumlah Anak:</strong> {application.subFinancingAnalysis.jumlahAnak}</p>
                <p><strong>Pengeluaran Sekolah:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.sekolah))}</p>
                <p><strong>Pengeluaran Uang Saku:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.uangSaku))}</p>
                <p><strong>Pendapatan Bersih:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.pendapatanBersih))}</p>
                <p><strong>Jangka Pembiayaan (Bulan):</strong> {application.subFinancingAnalysis.jangkaPembiayaan}</p>
                <p><strong>Angsuran Maksimal:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.angsuranMaksimal))}</p>
                <p><strong>Plafon Maksimal:</strong> {formatCurrency(toNumber(application.subFinancingAnalysis.plafonMaksimal))}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Belum ada sub-analisa. <a className="text-blue-600 hover:underline" href={`/employee/sub-analysis/new?applicationId=${application.id}`}>Buat sekarang</a></p>
            )}
          </div>

          {/* BI Checking */}
          {application.biChecking && (
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">BI Checking</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>File:</strong> {application.biChecking.pdfFileName} (<a className="text-blue-600 hover:underline" href={application.biChecking.pdfFileUrl} target="_blank" rel="noopener noreferrer">unduh</a>)</p>
                <p><strong>Ukuran:</strong> {(application.biChecking.pdfFileSize / 1024).toFixed(1)} KB</p>
                {application.biChecking.creditScore !== null && application.biChecking.creditScore !== undefined && (
                  <p><strong>Credit Score:</strong> {application.biChecking.creditScore}</p>
                )}
                {application.biChecking.riskLevel && (
                  <p><strong>Tingkat Risiko:</strong> {application.biChecking.riskLevel}</p>
                )}
                {application.biChecking.recommendation && (
                  <p><strong>Rekomendasi AI:</strong> {application.biChecking.recommendation}</p>
                )}
                {application.biChecking.manualRating !== null && application.biChecking.manualRating !== undefined && (
                  <p><strong>Rating Manual:</strong> {application.biChecking.manualRating}/10</p>
                )}
              </div>
              {application.biChecking.aiSummary && (
                <div className="mt-3">
                  <p className="font-medium">Ringkasan AI:</p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-2 rounded">{application.biChecking.aiSummary}</pre>
                </div>
              )}
              {application.biChecking.manualNotes && (
                <div className="mt-3">
                  <p className="font-medium">Catatan Manual:</p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-2 rounded">{application.biChecking.manualNotes}</pre>
                </div>
              )}
              {application.biChecking.aiAnalysisResult && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600">Lihat detail hasil AI (JSON)</summary>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded border mt-2">{JSON.stringify(application.biChecking.aiAnalysisResult, null, 2)}</pre>
                </details>
              )}
            </div>
          )}

          {/* Documents */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Dokumen Terunggah</h2>
            {application.documents && application.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map(doc => (
                  <Card key={doc.id} className="p-3">
                    <p className="font-medium">{doc.originalName}</p>
                    <p className="text-sm text-gray-600">Kategori: {doc.category}</p>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Lihat Dokumen</a>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Belum ada dokumen yang diunggah.</p>
            )}
          </div>

          {/* Financing Analysis (5C) */}
          {application.financingAnalysis && (
            <div className="mt-6 border-t pt-4">
              <h2 className="text-xl font-semibold mb-3">Analisa 5C</h2>

              {/* 1. KARAKTER */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">1. Karakter</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Agama:</strong> {application.financingAnalysis.karakter_agama || '-'}</p>
                  <p><strong>Pengalaman:</strong> {application.financingAnalysis.karakter_pengalaman || '-'}</p>
                  <p><strong>Hub. Masyarakat:</strong> {application.financingAnalysis.karakter_hubMasyarakat || '-'}</p>
                  <p><strong>Karakter Angsuran Lainnya:</strong> {application.financingAnalysis.karakter_angsuranLainnya || '-'}</p>
                  <p className="col-span-2"><strong>Keterangan Survey Lainnya:</strong> {application.financingAnalysis.karakter_surveyLainnya || '-'}</p>
                  <p><strong>Survey 1:</strong> {application.financingAnalysis.karakter_surveyRating1 || '-'}</p>
                  <p><strong>Survey 2:</strong> {application.financingAnalysis.karakter_surveyRating2 || '-'}</p>
                  <p><strong>Survey 3:</strong> {application.financingAnalysis.karakter_surveyRating3 || '-'}</p>
                  <p><strong>Survey 4:</strong> {application.financingAnalysis.karakter_surveyRating4 || '-'}</p>
                  <p><strong>Survey 5:</strong> {application.financingAnalysis.karakter_surveyRating5 || '-'}</p>
                  <p><strong>Input 1:</strong> {application.financingAnalysis.karakter_input1 || '-'}</p>
                  <p><strong>Input 2:</strong> {application.financingAnalysis.karakter_input2 || '-'}</p>
                  <p><strong>Input 3:</strong> {application.financingAnalysis.karakter_input3 || '-'}</p>
                  <p><strong>Input 4:</strong> {application.financingAnalysis.karakter_input4 || '-'}</p>
                  <p><strong>Input 5:</strong> {application.financingAnalysis.karakter_input5 || '-'}</p>
                  {application.financingAnalysis.karakter_kesimpulan && (
                    <p className="col-span-2"><strong>Kesimpulan Karakter:</strong> {application.financingAnalysis.karakter_kesimpulan}</p>
                  )}
                </div>
              </div>

              {/* 2. KAPASITAS */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">2. Kapasitas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Plafon Maksimal:</strong> {application.financingAnalysis.kapasitas_plafonMaksimal != null ? formatCurrency(Number(application.financingAnalysis.kapasitas_plafonMaksimal)) : '-'}</p>
                  <p><strong>Angsuran Maksimal:</strong> {application.financingAnalysis.kapasitas_angsuranMaksimal != null ? formatCurrency(Number(application.financingAnalysis.kapasitas_angsuranMaksimal)) : '-'}</p>
                </div>
              </div>

              {/* 3. JAMINAN */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">3. Jaminan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Jenis:</strong> {application.financingAnalysis.jaminan_jenis || '-'}</p>
                  <p><strong>Nilai Taksiran:</strong> {application.financingAnalysis.jaminan_nilaiTaksiran != null ? formatCurrency(Number(application.financingAnalysis.jaminan_nilaiTaksiran)) : '-'}</p>
                  <p><strong>Kondisi:</strong> {application.financingAnalysis.jaminan_kondisi || '-'}</p>
                  <p><strong>Plafon Pokok:</strong> {application.financingAnalysis.jaminan_plafonPokok != null ? formatCurrency(Number(application.financingAnalysis.jaminan_plafonPokok)) : '-'}</p>
                  <p><strong>Keabsahan:</strong> {application.financingAnalysis.jaminan_keabsahan || '-'}</p>
                </div>
              </div>

              {/* 4. KONDISI */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">4. Kondisi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Pekerjaan:</strong> {application.financingAnalysis.kondisi_pekerjaan || '-'}</p>
                  <p><strong>Pekerjaan Lainnya:</strong> {application.financingAnalysis.kondisi_pekerjaanLainnya || '-'}</p>
                  <p><strong>Jenis Kontrak:</strong> {application.financingAnalysis.kondisi_jenisKontrak || '-'}</p>
                  <p><strong>Masa Berakhir Kontrak:</strong> {application.financingAnalysis.kondisi_masaBerakhirKontrak || '-'}</p>
                  <p className="col-span-2"><strong>Kesimpulan Umum:</strong> {application.financingAnalysis.kondisi_kesimpulanUmum || '-'}</p>
                </div>
              </div>

              {/* 5. CAPITAL */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">5. Capital</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Rumah:</strong> {application.financingAnalysis.capital_rumah || '-'}</p>
                  <p><strong>Kendaraan:</strong> {application.financingAnalysis.capital_kendaraan || '-'}</p>
                  <p className="col-span-2"><strong>Harta Lainnya:</strong> {application.financingAnalysis.capital_hartaLainnya || '-'}</p>
                </div>
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
