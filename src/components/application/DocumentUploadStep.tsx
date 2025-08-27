'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const documentTypes = [
  { value: 'ktp', label: 'KTP' },
  { value: 'kk', label: 'Kartu Keluarga (KK)' },
  { value: 'slip_gaji', label: 'Slip Gaji' },
  { value: 'surat_keterangan_kerja', label: 'Surat Keterangan Kerja' },
  { value: 'rekening_koran', label: 'Rekening Koran (3 bln terakhir)' },
  { value: 'sku', label: 'Surat Keterangan Usaha (SKU)' },
  { value: 'foto_usaha', label: 'Foto Usaha' },
  { value: 'jaminan_bpkb', label: 'Jaminan (BPKB)' },
  { value: 'jaminan_sertifikat', label: 'Jaminan (Sertifikat)' },
  { value: 'lainnya', label: 'Dokumen Lainnya' },
];

export default function DocumentUploadStep() {
  const { control, watch, setValue } = useFormContext();
  const uploadedFiles = watch('documentUpload.documents') || [];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) {
      toast.error('Mohon pilih kategori dan file terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', selectedCategory);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal mengupload file. Silakan coba lagi.');
      }

      const result = await response.json();
      
      const newFileList = [...uploadedFiles, result];
      setValue('documentUpload.documents', newFileList, { shouldValidate: true });

      toast.success(`File ${result.originalName} berhasil diupload.`);
      setSelectedFile(null);
      setSelectedCategory('');
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Langkah 5: Upload Dokumen</CardTitle>
        <CardDescription>Upload dokumen pendukung yang diperlukan. Dokumen wajib: KTP, KK, dan Slip Gaji/SKU.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6 p-4 border rounded-lg">
          <div className="space-y-2">
            <label htmlFor="category-select" className="text-sm font-medium">Kategori Dokumen</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(doc => (
                  <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="file-input" className="text-sm font-medium">Pilih File</label>
            <Input id="file-input" type="file" onChange={handleFileChange} />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Mengupload...' : 'Upload File'}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Dokumen Terupload</h3>
          {uploadedFiles.length > 0 ? (
            <ul className="space-y-3">
              {uploadedFiles.map((file: any, index: number) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div>
                    <p className="font-semibold text-sm">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {documentTypes.find(d => d.value === file.category)?.label || file.category} - {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Lihat
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 py-4">Belum ada dokumen yang diupload.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}