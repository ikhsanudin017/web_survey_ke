'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financingAnalysisSchema, type FinancingAnalysisData } from '@/lib/validations/financing-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/ui/file-upload';

interface FinancingAnalysisFormProps {
  clientId: string;
  onSubmit: (data: FinancingAnalysisData) => void;
  initialData?: Partial<FinancingAnalysisData>;
}

export function FinancingAnalysisForm({ clientId, onSubmit, initialData }: FinancingAnalysisFormProps) {
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biStatus, setBiStatus] = useState<string | null>(null);

  const form = useForm<FinancingAnalysisData>({
    resolver: zodResolver(financingAnalysisSchema),
    defaultValues: {
      assessments: {
        businessProspects: { score: 3, assessedBy: '' },
        repaymentCapacity: { score: 3, assessedBy: '' },
        collateralValue: { score: 3, assessedBy: '' },
        completeness: { score: 3, assessedBy: '' },
      },
      clientDataChecklist: {
        nameVerified: false,
        addressVerified: false,
        businessTypeVerified: false,
        financingAmountVerified: false,
        termVerified: false,
      },
      additionalInfo: {
        houseStatus: 'sendiri',
        vehicles: [{ type: 'motor', count: 0 }],
      },
      biChecking: {
        pdfUploaded: false,
      },
      documentChecklist: {
        fcKtpPemohon: false,
        fcKk: false,
        fcKtpSuamiIstriAhliWaris: false,
        fcSlipGaji: false,
        fcAgunan: false,
      },
      characterConclusion: {
        summary: '',
        recommendation: 'pertimbangan',
        averageScore: 0,
      },
      characterSurvey: {
        religion: '',
        experience: '',
        communityRelations: '',
        loanCharacter: '',
        surveyNotes: '',
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
      },
      ...initialData,
    },
  });

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        const data = await response.json();
        setClientData(data);
        if (data?.latestApplicationId) {
          setApplicationId(data.latestApplicationId as string);
        }
        
        // Auto-populate form with client data
        form.setValue('clientData', {
          name: data.name,
          address: data.address,
          businessType: data.businessType,
          financingAmount: data.financingAmount,
          term: data.term,
        });
        
        // Auto-check document checklist
        form.setValue('documentChecklist', {
          fcKtpPemohon: !!data.documents?.fcKtpPemohon,
          fcKk: !!data.documents?.fcKk,
          fcKtpSuamiIstriAhliWaris: !!data.documents?.fcKtpSuamiIstriAhliWaris,
          fcSlipGaji: !!data.documents?.fcSlipGaji,
          fcAgunan: !!data.documents?.fcAgunan,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal mengambil data client",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId, form, toast]);

  const handleBIUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/bi-checking/analyze', {
        method: 'POST',
        body: formData,
      });

      const ct = response.headers.get('Content-Type') || '';
      const raw = await response.text();
      let result: any = {};
      try {
        result = ct.includes('application/json') ? JSON.parse(raw) : {};
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result?.error || raw || 'Gagal menganalisis BI Checking');
      }

      form.setValue('biChecking', {
        pdfUploaded: true,
        analysisResult: result.analysis,
        isEligible: result.isEligible,
      });
      setBiStatus(result.status || null);

      toast({
        title: "Success",
        description: "BI Checking berhasil dianalisis",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Gagal menganalisis BI Checking",
        variant: "destructive",
      });
    }
  };

  const calculateAverageScore = () => {
    const assessments = form.getValues('assessments');
    const scores = Object.values(assessments).map(a => a.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    form.setValue('characterConclusion.averageScore', average);
    
    // Generate AI conclusion
    generateAIConclusion(average);
  };

  const generateAIConclusion = async (average: number) => {
    try {
      const response = await fetch('/api/ai/character-conclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageScore: average,
          characterSurvey: form.getValues('characterSurvey'),
          assessments: form.getValues('assessments'),
          applicationId: applicationId || undefined
        }),
      });

      const result = await response.json();
      
      form.setValue('characterConclusion', {
        summary: result.summary,
        recommendation: result.recommendation,
        averageScore: average,
      });
    } catch (error) {
      console.error('Failed to generate AI conclusion:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Data Client Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Client (Auto-populated)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nama</Label>
              <Input value={clientData?.name} disabled />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={form.watch('clientDataChecklist.nameVerified')}
                  onCheckedChange={(checked) => 
                    form.setValue('clientDataChecklist.nameVerified', checked as boolean)
                  }
                />
                <Label className="text-sm">Data sesuai</Label>
              </div>
            </div>
            
            <div>
              <Label>Alamat</Label>
              <Input value={clientData?.address} disabled />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={form.watch('clientDataChecklist.addressVerified')}
                  onCheckedChange={(checked) => 
                    form.setValue('clientDataChecklist.addressVerified', checked as boolean)
                  }
                />
                <Label className="text-sm">Data sesuai</Label>
              </div>
            </div>
            
            <div>
              <Label>Jenis Usaha</Label>
              <Input value={clientData?.businessType} disabled />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={form.watch('clientDataChecklist.businessTypeVerified')}
                  onCheckedChange={(checked) => 
                    form.setValue('clientDataChecklist.businessTypeVerified', checked as boolean)
                  }
                />
                <Label className="text-sm">Data sesuai</Label>
              </div>
            </div>
            
            <div>
              <Label>Pengajuan</Label>
              <Input value={clientData?.financingAmount} disabled />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={form.watch('clientDataChecklist.financingAmountVerified')}
                  onCheckedChange={(checked) => 
                    form.setValue('clientDataChecklist.financingAmountVerified', checked as boolean)
                  }
                />
                <Label className="text-sm">Data sesuai</Label>
              </div>
            </div>
            
            <div>
              <Label>Jangka Waktu</Label>
              <Input value={clientData?.term} disabled />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={form.watch('clientDataChecklist.termVerified')}
                  onCheckedChange={(checked) => 
                    form.setValue('clientDataChecklist.termVerified', checked as boolean)
                  }
                />
                <Label className="text-sm">Data sesuai</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penilaian Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian (1-5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(form.watch('assessments')).map(([key, assessment]) => (
            <div key={key} className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label>{getAssessmentLabel(key)}</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={assessment.score}
                  onChange={(e) => {
                    const assessments = form.getValues('assessments');
                    assessments[key as keyof typeof assessments].score = parseInt(e.target.value) || 1;
                    form.setValue('assessments', assessments);
                  }}
                  onBlur={calculateAverageScore}
                />
              </div>
              <div>
                <Label>Nama Penilai</Label>
                <Input
                  value={assessment.assessedBy}
                  onChange={(e) => {
                    const assessments = form.getValues('assessments');
                    assessments[key as keyof typeof assessments].assessedBy = e.target.value;
                    form.setValue('assessments', assessments);
                  }}
                />
              </div>
              <div className="text-sm text-gray-500">
                Skor: {assessment.score}/5
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Penilaian Karakter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian Karakter dari Survey (5 Orang)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="characterSurvey.religion">1. Agama</Label>
              <RadioGroup name="characterSurvey.religion" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baik" id="religion-baik" />
                  <Label htmlFor="religion-baik">Baik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cukup" id="religion-cukup" />
                  <Label htmlFor="religion-cukup">Cukup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kurang" id="religion-kurang" />
                  <Label htmlFor="religion-kurang">Kurang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jelek" id="religion-jelek" />
                  <Label htmlFor="religion-jelek">Jelek</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="characterSurvey.experience">2. Pengamalan</Label>
              <RadioGroup name="characterSurvey.experience" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baik" id="experience-baik" />
                  <Label htmlFor="experience-baik">Baik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cukup" id="experience-cukup" />
                  <Label htmlFor="experience-cukup">Cukup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kurang" id="experience-kurang" />
                  <Label htmlFor="experience-kurang">Kurang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jelek" id="experience-jelek" />
                  <Label htmlFor="experience-jelek">Jelek</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="characterSurvey.communityRelations">3. Hub Masyarakat</Label>
              <RadioGroup name="characterSurvey.communityRelations" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baik" id="communityRelations-baik" />
                  <Label htmlFor="communityRelations-baik">Baik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cukup" id="communityRelations-cukup" />
                  <Label htmlFor="communityRelations-cukup">Cukup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kurang" id="communityRelations-kurang" />
                  <Label htmlFor="communityRelations-kurang">Kurang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jelek" id="communityRelations-jelek" />
                  <Label htmlFor="communityRelations-jelek">Jelek</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="characterSurvey.loanCharacter">4. Karakter Angsuran Lainnya</Label>
              <RadioGroup name="characterSurvey.loanCharacter" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baik" id="loanCharacter-baik" />
                  <Label htmlFor="loanCharacter-baik">Baik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cukup" id="loanCharacter-cukup" />
                  <Label htmlFor="loanCharacter-cukup">Cukup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kurang" id="loanCharacter-kurang" />
                  <Label htmlFor="loanCharacter-kurang">Kurang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jelek" id="loanCharacter-jelek" />
                  <Label htmlFor="loanCharacter-jelek">Jelek</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="characterSurvey.surveyNotes">5. Ket. Survey Lainnya</Label>
              <RadioGroup name="characterSurvey.surveyNotes" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baik" id="surveyNotes-baik" />
                  <Label htmlFor="surveyNotes-baik">Baik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cukup" id="surveyNotes-cukup" />
                  <Label htmlFor="surveyNotes-cukup">Cukup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kurang" id="surveyNotes-kurang" />
                  <Label htmlFor="surveyNotes-kurang">Kurang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jelek" id="surveyNotes-jelek" />
                  <Label htmlFor="surveyNotes-jelek">Jelek</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label className="font-semibold">5 Nomer yang diinputkan:</Label>
            <Input name="characterSurvey.input1" placeholder="1." />
            <Input name="characterSurvey.input2" placeholder="2." />
            <Input name="characterSurvey.input3" placeholder="3." />
            <Input name="characterSurvey.input4" placeholder="4." />
            <Input name="characterSurvey.input5" placeholder="5." />
          </div>
        </CardContent>
      </Card>

      {/* Informasi Tambahan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Status Rumah</Label>
            <Select
              value={form.watch('additionalInfo.houseStatus')}
              onValueChange={(value) => 
                form.setValue('additionalInfo.houseStatus', value as 'sendiri' | 'sewa')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendiri">Sendiri</SelectItem>
                <SelectItem value="sewa">Sewa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Kendaraan</Label>
            <div className="space-y-2">
              {form.watch('additionalInfo.vehicles').map((vehicle, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={vehicle.type === 'motor'}
                      onCheckedChange={(checked) => {
                        const vehicles = [...form.watch('additionalInfo.vehicles')];
                        vehicles[index].type = checked ? 'motor' : 'mobil';
                        form.setValue('additionalInfo.vehicles', vehicles);
                      }}
                    />
                    <Label>Motor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={vehicle.type === 'mobil'}
                      onCheckedChange={(checked) => {
                        const vehicles = [...form.watch('additionalInfo.vehicles')];
                        vehicles[index].type = checked ? 'mobil' : 'motor';
                        form.setValue('additionalInfo.vehicles', vehicles);
                      }}
                    />
                    <Label>Mobil</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    value={vehicle.count}
                    onChange={(e) => {
                      const vehicles = [...form.watch('additionalInfo.vehicles')];
                      vehicles[index].count = parseInt(e.target.value) || 0;
                      form.setValue('additionalInfo.vehicles', vehicles);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const vehicles = [...form.watch('additionalInfo.vehicles')];
                  vehicles.push({ type: 'motor', count: 0 });
                  form.setValue('additionalInfo.vehicles', vehicles);
                }}
              >
                Tambah Kendaraan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Checklist + BI Checking */}
      <Card>
        <CardHeader>
          <CardTitle>Kelengkapan Dokumen (Auto-populated)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {Object.entries(form.watch('documentChecklist')).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox checked={value} disabled />
                <Label>{getDocumentLabel(key)}</Label>
                {value && <Badge variant="success">Tersedia</Badge>}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="mb-2 font-medium">BI Checking</div>
            <FileUpload
              accept=".pdf"
              onChange={handleBIUpload}
              uploaded={form.watch('biChecking.pdfUploaded')}
              showActions
              onClear={() => form.setValue('biChecking', { pdfUploaded: false, analysisResult: undefined, isEligible: undefined })}
            />
            {form.watch('biChecking.analysisResult') && (
              <Alert className="mt-4">
                <AlertDescription>
                  {form.watch('biChecking.analysisResult')}
                </AlertDescription>
              </Alert>
            )}
            {(biStatus || typeof form.watch('biChecking.isEligible') === 'boolean') && (
              <div className="mt-2">
                <Badge variant={
                  biStatus === 'PERHATIAN'
                    ? 'warning'
                    : (form.watch('biChecking.isEligible') ? 'success' : 'destructive')
                }>
                  {biStatus === 'PERHATIAN' ? 'Perhatian' : (form.watch('biChecking.isEligible') ? 'Layak' : 'Tidak Layak')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kesimpulan Karakter */}
      <Card>
        <CardHeader>
          <CardTitle>Kesimpulan Karakter (AI Generated)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Skor Rata-rata</Label>
              <Input value={form.watch('characterConclusion.averageScore')} disabled />
            </div>
            <div>
              <Label>Kesimpulan</Label>
              <Input value={form.watch('characterConclusion.summary')} disabled />
            </div>
            <div>
              <Label>Rekomendasi</Label>
              <Badge variant={
                form.watch('characterConclusion.recommendation') === 'layak' ? 'success' :
                form.watch('characterConclusion.recommendation') === 'tidak_layak' ? 'destructive' : 'warning'
              }>
                {form.watch('characterConclusion.recommendation')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tanda Tangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <Label className="mb-4">Petugas Survei</Label>
              <Input className="w-full border-b border-gray-300" />
              <span className="text-sm text-gray-500">(..................)</span>
            </div>
            <div className="flex flex-col items-center">
              <Label className="mb-4">Pengurus</Label>
              <Input className="w-full border-b border-gray-300" />
              <span className="text-sm text-gray-500">(..................)</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-8">
            <Label className="mb-4">Approver</Label>
            <Input className="w-full border-b border-gray-300" />
            <span className="text-sm text-gray-500">(..................)</span>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Simpan Analisa
      </Button>
    </form>
  );
}

function getAssessmentLabel(key: string): string {
  const labels: Record<string, string> = {
    businessProspects: 'Prospek Usaha',
    repaymentCapacity: 'Kemampuan Pembayaran',
    collateralValue: 'Nilai Jaminan',
    characterAssessment: 'Penilaian Karakter',
    completeness: 'Kelengkapan Dokumen',
  };
  return labels[key] || key;
}

function getDocumentLabel(key: string): string {
  const labels: Record<string, string> = {
    fcKtpPemohon: 'FC KTP Pemohon',
    fcKk: 'FC KK',
    fcKtpSuamiIstriAhliWaris: 'FC KTP Suami/Istri/Ahli Waris',
    fcSlipGaji: 'FC Slip Gaji',
    fcAgunan: 'FC Agunan',
  };
  return labels[key] || key;
}
