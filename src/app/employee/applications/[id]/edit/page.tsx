'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApplicationEditData {
  fullName: string;
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
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  collateral?: string;
  // Client data (for display/potential update)
  clientEmail: string;
  clientPhone: string;
}

export default function ApplicationEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<ApplicationEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          const res = await fetch(`/api/applications/${id}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch application details for editing');
          }
          const data = await res.json();
          setFormData({
            fullName: data.fullName,
            birthPlace: data.birthPlace,
            birthDate: data.birthDate.split('T')[0], // Format date for input type="date"
            gender: data.gender,
            maritalStatus: data.maritalStatus,
            education: data.education,
            occupation: data.occupation,
            monthlyIncome: data.monthlyIncome,
            spouseName: data.spouseName,
            spouseOccupation: data.spouseOccupation,
            spouseIncome: data.spouseIncome,
            homeAddress: data.homeAddress,
            phoneNumber: data.phoneNumber,
            contact1: data.contact1,
            contact2: data.contact2,
            contact3: data.contact3,
            contact4: data.contact4,
            contact5: data.contact5,
            businessName: data.businessName,
            businessType: data.businessType,
            businessAddress: data.businessAddress,
            businessDuration: data.businessDuration ? data.businessDuration / 12 : undefined, // Convert months to years for input
            businessIncome: data.businessIncome,
            loanAmount: data.loanAmount,
            loanPurpose: data.loanPurpose,
            loanTerm: data.loanTerm,
            collateral: data.collateral,
            clientEmail: data.client.email,
            clientPhone: data.client.phone,
          });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: parseFloat(value) || 0,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Convert businessDuration back to months if it was years
          businessDuration: formData.businessDuration ? formData.businessDuration * 12 : undefined,
          // Ensure birthDate is sent as a proper date string if needed by backend
          birthDate: new Date(formData.birthDate).toISOString(),
          // Include client data if the backend PUT handler expects it for update
          client: {
            email: formData.clientEmail,
            phone: formData.clientPhone,
            // Add other client fields if necessary
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update application');
      }

      toast.success('Application updated successfully!');
      router.push(`/employee/applications/${id}`); // Redirect to detail page
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Memuat data aplikasi untuk diedit...</p>
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

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle>Data Aplikasi Tidak Ditemukan</CardTitle>
          <CardDescription className="mt-2">Tidak dapat memuat data untuk diedit.</CardDescription>
          <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Aplikasi Pembiayaan</h1>
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Data Aplikasi</CardTitle>
          <CardDescription>Perbarui informasi aplikasi pembiayaan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Data */}
            <div className="space-y-4 border-b pb-4">
              <h2 className="text-xl font-semibold">Data Pribadi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="birthPlace">Tempat Lahir</Label>
                  <Input id="birthPlace" name="birthPlace" value={formData.birthPlace} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="birthDate">Tanggal Lahir</Label>
                  <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select name="gender" value={formData.gender} onValueChange={(value) => setFormData(prev => prev ? { ...prev, gender: value } : null)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Status Pernikahan</Label>
                  <Select name="maritalStatus" value={formData.maritalStatus} onValueChange={(value) => setFormData(prev => prev ? { ...prev, maritalStatus: value } : null)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status Pernikahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                      <SelectItem value="Menikah">Menikah</SelectItem>
                      <SelectItem value="Cerai">Cerai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="education">Pendidikan Terakhir</Label>
                  <Input id="education" name="education" value={formData.education} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="occupation">Pekerjaan</Label>
                  <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="monthlyIncome">Penghasilan Bulanan</Label>
                  <Input id="monthlyIncome" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleNumberChange} />
                </div>
                <div>
                  <Label htmlFor="homeAddress">Alamat Rumah</Label>
                  <Input id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </div>
                {/* Spouse Data */}
                {formData.maritalStatus === 'Menikah' && (
                  <>
                    <div>
                      <Label htmlFor="spouseName">Nama Pasangan</Label>
                      <Input id="spouseName" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="spouseOccupation">Pekerjaan Pasangan</Label>
                      <Input id="spouseOccupation" name="spouseOccupation" value={formData.spouseOccupation || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="spouseIncome">Penghasilan Pasangan</Label>
                      <Input id="spouseIncome" name="spouseIncome" type="number" value={formData.spouseIncome || ''} onChange={handleNumberChange} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Data (simplified) */}
            <div className="space-y-4 border-b pb-4">
              <h2 className="text-xl font-semibold">Data Kontak Darurat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact1">Kontak Darurat 1</Label>
                  <Input id="contact1" name="contact1" value={formData.contact1 || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="contact2">Kontak Darurat 2</Label>
                  <Input id="contact2" name="contact2" value={formData.contact2 || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="contact3">Kontak Darurat 3</Label>
                  <Input id="contact3" name="contact3" value={formData.contact3 || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="contact4">Kontak Darurat 4</Label>
                  <Input id="contact4" name="contact4" value={formData.contact4 || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="contact5">Kontak Darurat 5</Label>
                  <Input id="contact5" name="contact5" value={formData.contact5 || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Business Data */}
            <div className="space-y-4 border-b pb-4">
              <h2 className="text-xl font-semibold">Data Usaha (Opsional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nama Usaha</Label>
                  <Input id="businessName" name="businessName" value={formData.businessName || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="businessType">Jenis Usaha</Label>
                  <Input id="businessType" name="businessType" value={formData.businessType || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="businessAddress">Alamat Usaha</Label>
                  <Input id="businessAddress" name="businessAddress" value={formData.businessAddress || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="businessDuration">Lama Usaha (Tahun)</Label>
                  <Input id="businessDuration" name="businessDuration" type="number" value={formData.businessDuration || ''} onChange={handleNumberChange} />
                </div>
                <div>
                  <Label htmlFor="businessIncome">Penghasilan Usaha</Label>
                  <Input id="businessIncome" name="businessIncome" type="number" value={formData.businessIncome || ''} onChange={handleNumberChange} />
                </div>
              </div>
            </div>

            {/* Financing Data */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Data Pembiayaan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanAmount">Jumlah Pinjaman</Label>
                  <Input id="loanAmount" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleNumberChange} required />
                </div>
                <div>
                  <Label htmlFor="loanPurpose">Tujuan Pinjaman</Label>
                  <Input id="loanPurpose" name="loanPurpose" value={formData.loanPurpose} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Jangka Waktu Pinjaman (Bulan)</Label>
                  <Input id="loanTerm" name="loanTerm" type="number" value={formData.loanTerm} onChange={handleNumberChange} required />
                </div>
                <div>
                  <Label htmlFor="collateral">Jaminan</Label>
                  <Input id="collateral" name="collateral" value={formData.collateral || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}