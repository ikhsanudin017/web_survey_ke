'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_DIM = 1200; // px

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_SIZE) {
        toast.error('Ukuran file terlalu besar (maks 10MB).');
        return;
      }
      // Validate minimal dimension for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          if (img.width < MIN_DIM && img.height < MIN_DIM) {
            toast.error('Resolusi foto terlalu rendah. Gunakan min. sisi terpanjang 1200px.');
            URL.revokeObjectURL(url);
            return;
          }
          setSelectedFile(file);
          setPreviewUrl(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          setSelectedFile(file); // non-blocking; maybe not image
        };
        img.src = url;
      } else {
        setSelectedFile(file);
        setPreviewUrl(null);
      }
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
        {/* Tips kualitas foto */}
        <Alert className="mb-4">
          <AlertDescription>
            Perhatian! Pastikan semua foto dan dokumen yang diunggah harus jelas, terang, tidak buram, dan seluruh objek terlihat utuh (tidak terpotong). Gunakan alas rata dan ambil foto tegak lurus (90°).
          </AlertDescription>
        </Alert>

        {/* (Contoh foto dihilangkan sesuai permintaan) */}
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
            <Input id="file-input" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
            <p className="text-xs text-gray-500">Direkomendasikan: JPG/PNG/PDF, resolusi minimal 1200px sisi terpanjang, pencahayaan baik dan tidak miring.</p>
            {selectedFile && (
              <div className="text-xs text-gray-600">Terpilih: {selectedFile.name} ({(selectedFile.size/1024).toFixed(0)} KB)</div>
            )}
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="mt-2 h-32 w-auto rounded border object-contain bg-white" />
            )}
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
