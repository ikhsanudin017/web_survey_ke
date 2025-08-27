'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormWizard } from './FormWizard';
import { FormSummary } from './FormSummary';
import { FormActions } from './FormActions';
import { useToast } from '@/hooks/use-toast';
import { validateStep } from '@/lib/validation-enhanced';
import {
  UserIcon,
  BuildingIcon,
  FileTextIcon,
  ShieldIcon,
  TrendingUpIcon,
  CheckCircleIcon
} from 'lucide-react';

interface EnhancedFormContainerProps {
  initialData?: any;
  onComplete?: (data: any) => void;
}

export function EnhancedFormContainer({ initialData = {}, onComplete }: EnhancedFormContainerProps) {
  const [formData, setFormData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const steps = [
    {
      id: 'personal',
      title: 'Informasi Pribadi',
      description: 'Data diri dan informasi pemohon',
      icon: <UserIcon className="h-5 w-5" />,
      fields: [
        { key: 'personal.fullName', label: 'Nama Lengkap', required: true },
        { key: 'personal.email', label: 'Email', required: true },
        { key: 'personal.phone', label: 'Nomor Telepon', required: true },
        { key: 'personal.address', label: 'Alamat', required: true },
        { key: 'personal.ktp', label: 'Nomor KTP', required: true },
        { key: 'personal.npwp', label: 'Nomor NPWP', required: false },
      ]
    },
    {
      id: 'business',
      title: 'Informasi Bisnis',
      description: 'Detail usaha dan kegiatan bisnis',
      icon: <BuildingIcon className="h-5 w-5" />,
      fields: [
        { key: 'business.name', label: 'Nama Usaha', required: true },
        { key: 'business.type', label: 'Jenis Usaha', required: true },
        { key: 'business.address', label: 'Alamat Usaha', required: true },
        { key: 'business.established', label: 'Tahun Berdiri', type: 'date', required: true },
        { key: 'business.employees', label: 'Jumlah Karyawan', type: 'number', required: true },
        { key: 'business.revenue', label: 'Omset Bulanan', type: 'currency', required: true },
      ]
    },
    {
      id: 'documents',
      title: 'Dokumen Pendukung',
      description: 'Upload dokumen yang diperlukan',
      icon: <FileTextIcon className="h-5 w-5" />,
      fields: [
        { key: 'documents.ktp', label: 'Foto KTP', required: true },
        { key: 'documents.npwp', label: 'Foto NPWP', required: false },
        { key: 'documents.siup', label: 'SIUP/TDP', required: true },
        { key: 'documents.financial', label: 'Laporan Keuangan', required: true },
        { key: 'documents.bank', label: 'Rekening Koran', required: true },
      ]
    },
    {
      id: 'collateral',
      title: 'Jaminan',
      description: 'Informasi agunan atau jaminan',
      icon: <ShieldIcon className="h-5 w-5" />,
      fields: [
        { key: 'collateral.type', label: 'Jenis Jaminan', required: true },
        { key: 'collateral.value', label: 'Nilai Jaminan', type: 'currency', required: true },
        { key: 'collateral.location', label: 'Lokasi Jaminan', required: true },
        { key: 'collateral.ownership', label: 'Kepemilikan', required: true },
      ]
    },
    {
      id: 'analysis',
      title: 'Analisis Kredit',
      description: 'Parameter analisis dan perhitungan',
      icon: <TrendingUpIcon className="h-5 w-5" />,
      fields: [
        { key: 'analysis.amount', label: 'Jumlah Pinjaman', type: 'currency', required: true },
        { key: 'analysis.tenor', label: 'Jangka Waktu (bulan)', type: 'number', required: true },
        { key: 'analysis.purpose', label: 'Tujuan Pinjaman', required: true },
        { key: 'analysis.repayment', label: 'Sumber Pembayaran', required: true },
      ]
    },
    {
      id: 'summary',
      title: 'Ringkasan',
      description: 'Review dan konfirmasi data',
      icon: <CheckCircleIcon className="h-5 w-5" />,
      fields: []
    }
  ];

  const handleSaveDraft = async () => { // Perubahan: Hapus parameter 'data'
    try {
      const response = await fetch('/api/enhanced-analysis/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Perubahan: Gunakan formData dari state
      });

      if (!response.ok) throw new Error('Failed to save draft');

      setHasChanges(false);
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => { // Perubahan: Hapus parameter 'data'
    setIsLoading(true);
    try {
      const response = await fetch('/api/enhanced-analysis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Perubahan: Gunakan formData dari state
      });

      if (!response.ok) throw new Error('Failed to submit');

      const result = await response.json();

      if (onComplete) {
        onComplete(result);
      } else {
        router.push(`/enhanced-analysis/result/${result.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim formulir. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis-kredit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: any) => {
    setFormData(data);
    setHasChanges(true);
    toast({
      title: "Data Diimpor",
      description: "Data formulir berhasil diimpor.",
    });
  };

  const handleReset = () => {
    setFormData({});
    setCurrentStep(0);
    setHasChanges(false);
  };

  const handleEditStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  const getStepContent = (stepIndex: number) => {
    const step = steps[stepIndex];

    if (step.id === 'summary') {
      return (
        <div className="space-y-6">
          <FormSummary
            data={formData}
            steps={steps.filter(s => s.id !== 'summary')}
            onEditStep={handleEditStep}
          />

          <FormActions
            onSave={handleSaveDraft}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onExport={handleExport}
            onImport={handleImport}
            isLoading={isLoading}
            isValid={true}
            hasChanges={hasChanges}
            className="mt-6"
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Form fields for current step */}
        <div className="grid gap-4">
          {step.fields.map(field => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={getFieldValue(field.key) || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Masukkan ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <FormActions
          onSave={handleSaveDraft}
          onReset={handleReset}
          isLoading={isLoading}
          isValid={validateStep(formData, step.id)}
          hasChanges={hasChanges}
        />
      </div>
    );
  };

  const getFieldValue = (key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], formData);
  };

  const updateField = (key: string, value: any) => {
    const keys = key.split('.');
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newData);
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <FormWizard
          steps={steps.map((step, index) => ({
            ...step,
            content: getStepContent(index),
            validation: () => validateStep(formData, step.id),
          }))}
          onComplete={handleSubmit}
          onSaveDraft={handleSaveDraft}
          initialData={formData}
        />
      </div>
    </div>
  );
}