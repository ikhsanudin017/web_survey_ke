'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      
      // Save the analysis
      const response = await fetch('/api/employee/analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok) {
        console.error('API Error:', result);
        throw new Error(result.error || `HTTP ${response.status}: Gagal menyimpan analisa.`);
      }
      
      // Update application status to ANALYZED
      const statusResponse = await fetch(`/api/applications/${formData.applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'ANALYZED',
          note: `Analisa selesai dengan rekomendasi: ${formData.kesimpulan_rekomendasi}`
        }),
      });

      if (!statusResponse.ok) {
        console.warn('Failed to update application status, but analysis was saved');
      }

      toast.success('Analisa berhasil disimpan dan status aplikasi diperbarui!');
      router.push('/employee/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIKesimpulanKarakter = useCallback(() => {
    setIsGeneratingAI(true);
    let summary = "";

    // Get survey ratings
    const ratings = [
      formData.karakter_surveyRating1,
      formData.karakter_surveyRating2,
      formData.karakter_surveyRating3,
      formData.karakter_surveyRating4,
      formData.karakter_surveyRating5,
    ].filter(r => r !== '');

    // Get financial capacity (pendapatanBersih)
    const pendapatanBersih = applicationDetails?.subFinancingAnalysis?.pendapatanBersih || 0;

    // Simple AI logic based on ratings and income
    const baikCount = ratings.filter(r => r === 'Baik').length;
    const cukupCount = ratings.filter(r => r === 'Cukup').length;
    const kurangCount = ratings.filter(r => r === 'Kurang').length;
    const jelekCount = ratings.filter(r => r === 'Jelek').length;

    if (baikCount >= 3 && pendapatanBersih > 5000000) {
      summary = "Karakter pemohon sangat baik dan didukung oleh kapasitas keuangan yang kuat. Sangat direkomendasikan.";
    } else if (baikCount >= 2 && cukupCount >= 1 && pendapatanBersih > 2000000) {
      summary = "Karakter pemohon cukup baik dengan kapasitas keuangan yang memadai. Perlu sedikit pengawasan.";
    } else if (kurangCount >= 1 || jelekCount >= 1 || pendapatanBersih <= 1000000) {
      summary = "Karakter pemohon perlu perhatian serius atau kapasitas keuangan sangat terbatas. Tidak direkomendasikan.";
    } else {
      summary = "Kesimpulan karakter belum dapat dibuat secara otomatis. Mohon lengkapi data survey dan sub-analisa.";
    }

    setFormData(prev => ({ ...prev, karakter_kesimpulan: summary }));
    setIsGeneratingAI(false);
  }, [formData, applicationDetails]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Memuat data pengajuan...</p></div>;
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
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Analisa'}
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

        {/* Signature */}
         <FormSection title="Tanda Tangan">
            <div><Label>Petugas Survei</Label><Input value={formData.petugasSurvei} onChange={e => handleInputChange('petugasSurvei', e.target.value)} /></div>
            <div><Label>Pengurus</Label><Input value={formData.pengurus} onChange={e => handleInputChange('pengurus', e.target.value)} /></div>
            <div><Label>Approver</Label><Input value={formData.approver} onChange={e => handleInputChange('approver', e.target.value)} /></div>
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
