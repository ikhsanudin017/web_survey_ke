'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Skeleton } from '@/components/ui/skeleton'

// Define the structure for the fetched application data
interface ApplicationData {
  id: string;
  fullName: string;
  homeAddress: string;
  businessType: string | null;
  loanAmount: number;
  loanTerm: number;
  collateral: string | null;
  documents: Array<{ category: string }>;
  contact1: string | null;
  contact2: string | null;
  contact3: string | null;
  contact4: string | null;
  contact5: string | null;
  subFinancingAnalysis: { 
    pendapatanBersih: number;
    plafonMaksimal: number;
    angsuranMaksimal: number;
  } | null;
}

// A reusable form section component
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {children}
    </div>
  </div>
);

const initialFormData = {
  applicationId: '',
  nama: '',
  alamat: '',
  jenisUsaha: '',
  pengajuan: '',
  jangkaWaktu: '',
  karakter_agama: '',
  karakter_pengalaman: '',
  karakter_hubMasyarakat: '',
  karakter_angsuranLainnya: '',
  karakter_surveyLainnya: '',
  karakter_surveyRating1: '',
  karakter_surveyRating2: '',
  karakter_surveyRating3: '',
  karakter_surveyRating4: '',
  karakter_surveyRating5: '',
  karakter_kesimpulan: '',
  kapasitas_plafonMaksimal: 0,
  kapasitas_angsuranMaksimal: 0,
  jaminan_jenis: '',
  jaminan_nilaiTaksiran: 0,
  jaminan_kondisi: '',
  jaminan_plafonPokok: 0,
  jaminan_keabsahan: 'Valid',
  kondisi_pekerjaan: '',
  kondisi_pekerjaanLainnya: '',
  kondisi_jenisKontrak: '',
  kondisi_masaBerakhirKontrak: '',
  kondisi_kesimpulanUmum: '',
  capital_rumah: '',
  capital_kendaraan: '',
  capital_hartaLainnya: '',
  ceklist_fcKtpPemohon: false,
  ceklist_fcKk: false,
  ceklist_fcKtpSuamiIstri: false,
  ceklist_fcSlipGaji: false,
  ceklist_fcAgunan: false,
  kesimpulan_catatanKhusus: '',
  kesimpulan_rekomendasi: 'Layak',
  petugasSurvei: '',
  pengurus: '',
  approver: ''
};

function AnalysisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [clientContacts, setClientContacts] = useState<string[]>([]);
  const [applicationDetails, setApplicationDetails] = useState<ApplicationData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [biState, setBiState] = useState<{ pdfUploaded: boolean; analysis: string; isEligible: boolean | null; status?: string | null }>({
    pdfUploaded: false,
    analysis: '',
    isEligible: null,
    status: null,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBIUpload = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/bi-checking/analyze', { method: 'POST', body: fd });
      const ct = res.headers.get('Content-Type') || '';
      const raw = await res.text();
      let data: any = {};
      try {
        data = ct.includes('application/json') ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(data?.error || raw || 'Gagal menganalisis BI Checking');
      }
      setBiState({ pdfUploaded: true, analysis: data.analysis, isEligible: Boolean(data.isEligible), status: data.status || null });
      toast.success('BI Checking berhasil dianalisis');
    } catch (e) {
      toast.error((e as Error).message || 'Gagal menganalisis BI Checking');
    }
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const heading = 'Laporan Analisa Pembiayaan';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(heading, 40, 40);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 40, 60);
      doc.text(`ID Aplikasi: ${formData.applicationId}`, 40, 74);
      doc.text(`Nama: ${formData.nama}`, 40, 88);
      doc.text(`Alamat: ${formData.alamat}`, 40, 102);

      // Section: Ringkasan Pembiayaan
      autoTable(doc, {
        startY: 120,
        head: [[
          'Parameter', 'Nilai'
        ]],
        body: [
          ['Jenis Usaha', String(formData.jenisUsaha || '-')],
          ['Pengajuan', String(formData.pengajuan || '-')],
          ['Jangka Waktu', String(formData.jangkaWaktu || '-')],
          ['Plafon Maksimal', String(formData.kapasitas_plafonMaksimal || 0)],
          ['Angsuran Maksimal', String(formData.kapasitas_angsuranMaksimal || 0)],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 112, 74] },
      });

      // Section: Karakter
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Karakter', 'Nilai']],
        body: [
          ['Agama', String(formData.karakter_agama || '-')],
          ['Pengalaman', String(formData.karakter_pengalaman || '-')],
          ['Hub. Masyarakat', String(formData.karakter_hubMasyarakat || '-')],
          ['Angsuran Lainnya', String(formData.karakter_angsuranLainnya || '-')],
          ['Kesimpulan Karakter', String(formData.karakter_kesimpulan || '-')],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [24, 160, 133] },
      });

      // Section: Jaminan
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Jaminan', 'Nilai']],
        body: [
          ['Jenis', String(formData.jaminan_jenis || '-')],
          ['Nilai Taksiran', String(formData.jaminan_nilaiTaksiran || 0)],
          ['Kondisi', String(formData.jaminan_kondisi || '-')],
          ['Plafon Pokok', String(formData.jaminan_plafonPokok || 0)],
          ['Keabsahan', String(formData.jaminan_keabsahan || '-')],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [8, 145, 178] },
      });

      // Section: Ceklist Dokumen
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Dokumen', 'Ada']],
        body: [
          ['FC KTP Pemohon', formData.ceklist_fcKtpPemohon ? 'Ya' : 'Tidak'],
          ['FC KK', formData.ceklist_fcKk ? 'Ya' : 'Tidak'],
          ['FC KTP Suami/Istri', formData.ceklist_fcKtpSuamiIstri ? 'Ya' : 'Tidak'],
          ['FC Slip Gaji', formData.ceklist_fcSlipGaji ? 'Ya' : 'Tidak'],
          ['FC Agunan', formData.ceklist_fcAgunan ? 'Ya' : 'Tidak'],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [217, 119, 6] },
      });

      // Section: Kesimpulan
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Kesimpulan', 'Nilai']],
        body: [
          ['Rekomendasi', String(formData.kesimpulan_rekomendasi || '-')],
          ['Catatan Khusus', String(formData.kesimpulan_catatanKhusus || '-')],
          ['Petugas Survei', String(formData.petugasSurvei || '-')],
          ['Pengurus', String(formData.pengurus || '-')],
          ['Approver', String(formData.approver || '-')],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 112, 74] },
      });

      doc.save(`analisa-${formData.applicationId || 'draft'}.pdf`);
      toast.success('Export PDF berhasil dibuat');
    } catch (e) {
      toast.error('Gagal membuat PDF');
    } finally {
      setExporting(false);
    }
  }

  const fetchApplicationData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${id}`);
      if (!res.ok) throw new Error('Gagal memuat data pengajuan.');
      const app: ApplicationData = await res.json();
      setApplicationDetails(app); // Store full application details

      // Enhanced auto-fill with more comprehensive data mapping
      setFormData(prev => ({
        ...prev,
        applicationId: app.id,
        nama: app.fullName,
        alamat: app.homeAddress,
        jenisUsaha: app.businessType || '',
        pengajuan: `Rp ${new Intl.NumberFormat('id-ID').format(app.loanAmount)}`,
        jangkaWaktu: `${app.loanTerm} bulan`,
        
        // Auto-fill capacity calculations from sub-financing analysis
        kapasitas_plafonMaksimal: app.subFinancingAnalysis?.plafonMaksimal || 0,
        kapasitas_angsuranMaksimal: app.subFinancingAnalysis?.angsuranMaksimal || 0,
        
        // Auto-fill document checklist based on uploaded documents
        ceklist_fcKtpPemohon: app.documents.some(doc => doc.category.toLowerCase().includes('ktp')),
        ceklist_fcKk: app.documents.some(doc => doc.category.toLowerCase().includes('kk')),
        ceklist_fcKtpSuamiIstri: app.documents.some(doc => doc.category.toLowerCase().includes('ktp_pasangan')),
        ceklist_fcSlipGaji: app.documents.some(doc => doc.category.toLowerCase().includes('slip_gaji')),
        ceklist_fcAgunan: app.documents.some(doc => doc.category.toLowerCase().includes('jaminan') || doc.category.toLowerCase().includes('agunan')),
        
        // Auto-fill collateral information if available
        jaminan_jenis: app.collateral || '',
        
        // Auto-fill condition information
        kondisi_kesimpulanUmum: `Pendapatan Bersih: Rp ${new Intl.NumberFormat('id-ID').format(app.subFinancingAnalysis?.pendapatanBersih || 0)}`,
      }));

      // Set client contacts
      setClientContacts([
        app.contact1 || '',
        app.contact2 || '',
        app.contact3 || '',
        app.contact4 || '',
        app.contact5 || '',
      ].filter(contact => contact !== ''));

      // Show success message for auto-fill
      toast.success('Data pengajuan berhasil dimuat dan form telah diisi otomatis');

    } catch (error) {
      toast.error((error as Error).message);
      router.push('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationData(applicationId);
    } else {
      toast.error('ID Pengajuan tidak valid.');
      router.push('/employee/dashboard');
    }
  }, [applicationId, fetchApplicationData, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Client-side validation for required fields
    if (!formData.kesimpulan_rekomendasi) {
      toast.error('Rekomendasi wajib diisi.');
      return;
    }
    if (!formData.petugasSurvei) {
      toast.error('Nama Petugas Survei wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting analysis data:', formData);

      // Save the analysis (create or update)
      let response = await fetch('/api/employee/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      console.log('API Response (Analysis Save):', result);
      console.log('Response OK (Analysis Save):', response.ok, 'Status:', response.status, 'CT:', response.headers.get('Content-Type'));

      // If analysis already exists, try update (PUT)
      if (!response.ok && response.status === 409) {
        console.warn('Analysis exists, attempting update (PUT).');
        response = await fetch('/api/employee/analysis', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
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
        console.log('API Response (Analysis Update):', result, 'Status:', response.status, 'CT:', response.headers.get('Content-Type'));
      }

      if (!response.ok) {
        console.error('API Error (Analysis Save/Update):', result, 'Status:', response.status, 'Headers:', Object.fromEntries(response.headers.entries()))
        const message = (result && (result.error || result.message))
          || response.statusText
          || `HTTP ${response.status}: Gagal menyimpan analisa.`
        toast.error(message)
        setIsSubmitting(false);
        return;
      }

      // At this point analysis is saved/updated successfully
      toast.success('Analisa berhasil disimpan.');

      // Update application status to ANALYZED
      const statusResponse = await fetch(`/api/applications/${formData.applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ANALYZED',
          note: `Analisa selesai dengan rekomendasi: ${formData.kesimpulan_rekomendasi}`
        }),
      });

      const statusResult = await statusResponse.json();
      console.log('API Response (Status Update):', statusResult);
      console.log('Response OK (Status Update):', statusResponse.ok);

      if (!statusResponse.ok) {
        console.error('API Error (Status Update):', statusResult);
        // Inform user analysis is saved but status failed to update
        toast.error((statusResult.error ? `${statusResult.error}. ` : '') + 'Analisa tersimpan, tetapi gagal memperbarui status aplikasi.');
        // Keep user on the page to retry or adjust
      } else {
        toast.success('Analisa berhasil disimpan dan status aplikasi diperbarui!');
        router.push(`/employee/approval?applicationId=${formData.applicationId}`);
      }

    } catch (error) {
      console.error('Submit error (Caught Exception):', error);
      toast.error((error as Error).message || 'Terjadi kesalahan tak terduga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIKesimpulanKarakter = useCallback(async () => {
    try {
      setIsGeneratingAI(true);

      // Collect 5-person survey ratings and compute average score
      const ratings = [
        formData.karakter_surveyRating1,
        formData.karakter_surveyRating2,
        formData.karakter_surveyRating3,
        formData.karakter_surveyRating4,
        formData.karakter_surveyRating5,
      ].filter(r => !!r);
      const scoreMap: Record<string, number> = { Baik: 4, Cukup: 3, Kurang: 2, Jelek: 1 };
      const numeric = ratings.map(r => scoreMap[r as keyof typeof scoreMap] || 0).filter(n => n > 0);
      const averageScore = numeric.length ? (numeric.reduce((a, b) => a + b, 0) / numeric.length) : 0;

      // Build character survey payload in the format expected by the AI endpoint
      const characterSurvey = {
        religion: formData.karakter_agama,
        experience: formData.karakter_pengalaman,
        communityRelations: formData.karakter_hubMasyarakat,
        loanCharacter: formData.karakter_angsuranLainnya,
        surveyNotes: formData.karakter_surveyLainnya,
        input1: formData.karakter_surveyRating1 ? `Orang 1: ${formData.karakter_surveyRating1}` : undefined,
        input2: formData.karakter_surveyRating2 ? `Orang 2: ${formData.karakter_surveyRating2}` : undefined,
        input3: formData.karakter_surveyRating3 ? `Orang 3: ${formData.karakter_surveyRating3}` : undefined,
        input4: formData.karakter_surveyRating4 ? `Orang 4: ${formData.karakter_surveyRating4}` : undefined,
        input5: formData.karakter_surveyRating5 ? `Orang 5: ${formData.karakter_surveyRating5}` : undefined,
      };

      const res = await fetch('/api/ai/character-conclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageScore,
          characterSurvey,
          // send applicationId so server can enrich with sub-analysis
          applicationId: formData.applicationId || applicationId || undefined,
          surveyRatings: ratings,
          // Provide sub-analysis if already loaded so server has full context even if DB not populated yet
          subAnalysis: applicationDetails?.subFinancingAnalysis ? {
            pendapatanBersih: applicationDetails.subFinancingAnalysis.pendapatanBersih,
            angsuranMaksimal: applicationDetails.subFinancingAnalysis.angsuranMaksimal,
            plafonMaksimal: applicationDetails.subFinancingAnalysis.plafonMaksimal,
            jangkaPembiayaan: (applicationDetails as any).subFinancingAnalysis?.jangkaPembiayaan,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menghasilkan kesimpulan karakter');

      setFormData(prev => ({ ...prev, karakter_kesimpulan: data.summary || '' }));
    } catch (e) {
      console.error('Generate AI error:', e);
      toast.error((e as Error).message || 'Gagal menghasilkan kesimpulan karakter');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [formData, applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-white shadow-sm">
              <Skeleton className="h-6 w-56 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  const surveyRatings = ['karakter_surveyRating1', 'karakter_surveyRating2', 'karakter_surveyRating3', 'karakter_surveyRating4', 'karakter_surveyRating5'];
  const ratingOptions = ['Baik', 'Cukup', 'Kurang', 'Jelek'];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Analisa Pembiayaan</h1>
            <p className="text-sm text-gray-600">Nasabah: {formData.nama}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push('/employee/dashboard')} variant="outline" disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleExportPDF} variant="secondary" isLoading={exporting} loadingText="Membuat PDF...">Export PDF</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting} loadingText="Menyimpan...">
              Simpan Analisa
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Auto-filled data */}
        <FormSection title="Data Pengajuan (Auto-filled dari Aplikasi Client)">
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Nama <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                    <Input value={formData.nama} readOnly className="bg-green-50 border-green-200" />
                </div>
                <div>
                    <Label>Alamat <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                    <Input value={formData.alamat} readOnly className="bg-green-50 border-green-200" />
                </div>
                <div>
                    <Label>Jenis Usaha <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                    <Input value={formData.jenisUsaha} readOnly className="bg-green-50 border-green-200" />
                </div>
                <div>
                    <Label>Pengajuan <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                    <Input value={formData.pengajuan} readOnly className="bg-green-50 border-green-200" />
                </div>
                <div>
                    <Label>Jangka Waktu <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                    <Input value={formData.jangkaWaktu} readOnly className="bg-green-50 border-green-200" />
                </div>
            </div>
        </FormSection>

        {/* 1. KARAKTER */}
        <FormSection title="1. Karakter">
            <div><Label>Agama</Label><Input value={formData.karakter_agama} onChange={e => handleInputChange('karakter_agama', e.target.value)} /></div>
            <div><Label>Pengalaman</Label><Input value={formData.karakter_pengalaman} onChange={e => handleInputChange('karakter_pengalaman', e.target.value)} /></div>
            <div><Label>Hub. Masyarakat</Label><Input value={formData.karakter_hubMasyarakat} onChange={e => handleInputChange('karakter_hubMasyarakat', e.target.value)} /></div>
            <div><Label>Karakter Angsuran Lainnya</Label><Input value={formData.karakter_angsuranLainnya} onChange={e => handleInputChange('karakter_angsuranLainnya', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Ket. Survey Lainnya</Label><Textarea value={formData.karakter_surveyLainnya} onChange={e => handleInputChange('karakter_surveyLainnya', e.target.value)} /></div>
            
            {/* 5 Survey Checklists */}
            <div className="md:col-span-2 space-y-4">
                <h4 className="font-medium text-gray-700">Penilaian Karakter dari Survey (5 Orang):</h4>
                {surveyRatings.map((field, index) => (
                    <div key={field} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <Label className="w-16">Orang {index + 1}:</Label>
                        <RadioGroup 
                            value={formData[field as keyof typeof formData] as string}
                            onValueChange={v => handleInputChange(field, v)}
                            className="flex space-x-4"
                        >
                            {ratingOptions.map(option => (
                                <div key={option} className="flex items-center space-x-1">
                                    <RadioGroupItem value={option} id={`${field}-${option}`} />
                                    <Label htmlFor={`${field}-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
            </div>

            

            {/* Client Contact Numbers */}
            {clientContacts.length > 0 && (
                <div className="md:col-span-2 space-y-2">
                    <h4 className="font-medium text-gray-700">Nomor Kontak Client:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        {clientContacts.map((contact, index) => (
                            <li key={index}>{contact}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="md:col-span-2 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Kesimpulan Karakter</Label>
                    <Button 
                        onClick={generateAIKesimpulanKarakter} 
                        disabled={isGeneratingAI} 
                        size="sm"
                        type="button" // Prevent form submission
                    >
                        {isGeneratingAI ? 'Membuat...' : 'Generate AI'}
                    </Button>
                </div>
                <Textarea value={formData.karakter_kesimpulan} onChange={e => handleInputChange('karakter_kesimpulan', e.target.value)} />
            </div>
        </FormSection>

        {/* 2. KAPASITAS DAN KEUANGAN */}
        <FormSection title="2. Kapasitas dan Keuangan">
            <div>
                <Label>Plafon Maksimal <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                <Input 
                    type="number" 
                    value={formData.kapasitas_plafonMaksimal} 
                    onChange={e => handleInputChange('kapasitas_plafonMaksimal', parseFloat(e.target.value) || 0)}
                    className="bg-green-50 border-green-200"
                />
            </div>
            <div>
                <Label>Angsuran Maksimal <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                <Input 
                    type="number" 
                    value={formData.kapasitas_angsuranMaksimal} 
                    onChange={e => handleInputChange('kapasitas_angsuranMaksimal', parseFloat(e.target.value) || 0)}
                    className="bg-green-50 border-green-200"
                />
            </div>
        </FormSection>

        {/* 3. ANALISA JAMINAN */}
        <FormSection title="3. Analisa Jaminan">
            <div>
                <Label>Jenis Jaminan <span className="text-green-600 text-xs">(Auto-filled)</span></Label>
                <Input 
                    value={formData.jaminan_jenis} 
                    onChange={e => handleInputChange('jaminan_jenis', e.target.value)}
                    className="bg-green-50 border-green-200"
                />
            </div>
            <div><Label>Nilai Taksiran</Label><Input type="number" value={formData.jaminan_nilaiTaksiran} onChange={e => handleInputChange('jaminan_nilaiTaksiran', e.target.value)} /></div>
            <div><Label>Kondisi Jaminan</Label><Input value={formData.jaminan_kondisi} onChange={e => handleInputChange('jaminan_kondisi', e.target.value)} /></div>
            <div><Label>Plafon Pokok Pembiayaan</Label><Input type="number" value={formData.jaminan_plafonPokok} onChange={e => handleInputChange('jaminan_plafonPokok', e.target.value)} /></div>
        </FormSection>

        {/* 4. KONDISI */}
        <FormSection title="4. Kondisi">
            <div><Label>Pekerjaan/Profesi</Label><Input value={formData.kondisi_pekerjaan} onChange={e => handleInputChange('kondisi_pekerjaan', e.target.value)} /></div>
            <div><Label>Jenis Kontrak Kerja</Label><Input value={formData.kondisi_jenisKontrak} onChange={e => handleInputChange('kondisi_jenisKontrak', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Kesimpulan Umum Kondisi</Label><Textarea value={formData.kondisi_kesimpulanUmum} onChange={e => handleInputChange('kondisi_kesimpulanUmum', e.target.value)} /></div>
        </FormSection>

        {/* 5. CAPITAL */}
        <FormSection title="5. Capital">
            <div><Label>Rumah</Label><Input value={formData.capital_rumah} onChange={e => handleInputChange('capital_rumah', e.target.value)} /></div>
            <div><Label>Kendaraan</Label><Input value={formData.capital_kendaraan} onChange={e => handleInputChange('capital_kendaraan', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Harta Lainnya</Label><Textarea value={formData.capital_hartaLainnya} onChange={e => handleInputChange('capital_hartaLainnya', e.target.value)} /></div>
        </FormSection>

        {/* 6. CEKLIST */}
        <FormSection title="6. Ceklist Kelengkapan Dokumen (Auto-checked berdasarkan upload client)">
            <div className="flex items-center space-x-2">
                <Checkbox checked={formData.ceklist_fcKtpPemohon} onCheckedChange={c => handleInputChange('ceklist_fcKtpPemohon', c)} />
                <Label>FC KTP Pemohon {formData.ceklist_fcKtpPemohon && <span className="text-green-600 text-xs">(✓ Auto-checked)</span>}</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox checked={formData.ceklist_fcKk} onCheckedChange={c => handleInputChange('ceklist_fcKk', c)} />
                <Label>FC KK {formData.ceklist_fcKk && <span className="text-green-600 text-xs">(✓ Auto-checked)</span>}</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox checked={formData.ceklist_fcKtpSuamiIstri} onCheckedChange={c => handleInputChange('ceklist_fcKtpSuamiIstri', c)} />
                <Label>FC KTP Suami/Istri/Ahli Waris {formData.ceklist_fcKtpSuamiIstri && <span className="text-green-600 text-xs">(✓ Auto-checked)</span>}</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox checked={formData.ceklist_fcSlipGaji} onCheckedChange={c => handleInputChange('ceklist_fcSlipGaji', c)} />
                <Label>FC Slip Gaji {formData.ceklist_fcSlipGaji && <span className="text-green-600 text-xs">(✓ Auto-checked)</span>}</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox checked={formData.ceklist_fcAgunan} onCheckedChange={c => handleInputChange('ceklist_fcAgunan', c)} />
                <Label>FC Agunan {formData.ceklist_fcAgunan && <span className="text-green-600 text-xs">(✓ Auto-checked)</span>}</Label>
            </div>

            {/* BI Checking Upload & AI Result */}
            <div className="md:col-span-2 mt-4 pt-4 border-t">
              <Label className="block mb-2">BI Checking</Label>
              <FileUpload 
                accept=".pdf" 
                onChange={handleBIUpload} 
                uploaded={biState.pdfUploaded}
                showActions
                onClear={() => setBiState({ pdfUploaded: false, analysis: '', isEligible: null })}
              />
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>Status:</span>
                {biState.isEligible === null && !biState.status ? (
                  <Badge variant="secondary">Belum dianalisis</Badge>
                ) : (
                  <Badge variant={
                    biState.status === 'PERHATIAN' ? 'warning' : biState.isEligible ? 'success' : 'destructive'
                  }>
                    {biState.status === 'PERHATIAN' ? 'Perhatian' : (biState.isEligible ? 'Layak' : 'Tidak Layak')}
                  </Badge>
                )}
              </div>
              {biState.analysis && (
                <Alert className="mt-3">
                  <AlertDescription>{biState.analysis}</AlertDescription>
                </Alert>
              )}
              {!biState.pdfUploaded && (
                <p className="mt-1 text-xs text-gray-500">Unggah PDF BI Checking untuk analisis otomatis.</p>
              )}
            </div>
        </FormSection>

         {/* 7. KESIMPULAN */}
        <FormSection title="7. Kesimpulan Akhir & Catatan Khusus">
            <div className="md:col-span-2"><Label>Catatan Khusus</Label><Textarea value={formData.kesimpulan_catatanKhusus} onChange={e => handleInputChange('kesimpulan_catatanKhusus', e.target.value)} /></div>
            <div className="md:col-span-2">
                <Label>Rekomendasi</Label>
                <RadioGroup value={formData.kesimpulan_rekomendasi} onValueChange={v => handleInputChange('kesimpulan_rekomendasi', v)} className="flex space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Layak" id="r1" /><Label htmlFor="r1">Layak</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Tidak Layak" id="r2" /><Label htmlFor="r2">Tidak Layak</Label></div>
                </RadioGroup>
            </div>
        </FormSection>

        {/* Signature & Required Names */}
        <FormSection title="Tanda Tangan dan Identitas"> 
            {/* Petugas Survei - required for saving */}
            <div className="flex flex-col">
                <Label className="mb-2">Petugas Survei <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Nama petugas survei"
                  value={formData.petugasSurvei}
                  onChange={(e) => handleInputChange('petugasSurvei', e.target.value)}
                />
                <span className="mt-2 text-xs text-gray-500">Tanda tangan di lembar cetak.</span>
            </div>
            {/* Pengurus */}
            <div className="flex flex-col">
                <Label className="mb-2">Pengurus</Label>
                <Input
                  placeholder="Nama pengurus"
                  value={formData.pengurus}
                  onChange={(e) => handleInputChange('pengurus', e.target.value)}
                />
                <span className="mt-2 text-xs text-gray-500">Opsional, dapat diisi saat finalisasi.</span>
            </div>
            {/* Approver - span 2 columns on md+ */}
            <div className="flex flex-col md:col-span-2">
                <Label className="mb-2">Approver</Label>
                <Input
                  placeholder="Nama approver"
                  value={formData.approver}
                  onChange={(e) => handleInputChange('approver', e.target.value)}
                />
                <span className="mt-2 text-xs text-gray-500">Opsional, untuk tahap persetujuan akhir.</span>
            </div>
        </FormSection>

      </main>
    </div>
  );
}

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Memuat...</p></div>}>
      <AnalysisForm />
    </Suspense>
  );
}
