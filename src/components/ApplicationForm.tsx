'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
  ApplicationFormData,
  applicationSchema,
} from '@/lib/validations/application';
import { PersonalDataStep } from './application/PersonalDataStep';
import { ContactDataStep } from './application/ContactDataStep';
import { BusinessDataStep } from './application/BusinessDataStep';
import { FinancingDataStep } from './application/FinancingDataStep';
import { DocumentUploadStep } from './application/DocumentUploadStep';
import { FormProgress } from './application/FormProgress';
import { FormActions } from './application/FormActions';

const steps = [
  { id: 1, name: 'Data Pribadi', description: 'Informasi pribadi Anda' },
  { id: 2, name: 'Kontak', description: 'Informasi kontak dan darurat' },
  { id: 3, name: 'Usaha', description: 'Informasi usaha (opsional)' },
  { id: 4, name: 'Pembiayaan', description: 'Detail pinjaman' },
  { id: 5, name: 'Dokumen', description: 'Unggah dokumen pendukung' },
];

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useState<Partial<ApplicationFormData>>({});

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      personalData: {
        maritalStatus: 'Belum Menikah',
      },
      contactData: {
        contactNumbers: [],
        emergencyContacts: [],
      },
      businessData: {},
      financingData: {},
      documentUpload: {
        documents: [],
      },
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = methods.watch((value) => {
      localStorage.setItem('applicationForm', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('applicationForm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        methods.reset(parsed);
        setSavedData(parsed);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [methods]);

  const handleNext = async () => {
    const currentStepKey = getStepKey(currentStep);
    const isValid = await methods.trigger(currentStepKey);
    
    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Mohon periksa kembali data yang Anda masukkan');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit application');

      toast.success('Aplikasi berhasil dikirim!');
      localStorage.removeItem('applicationForm');
      router.push('/client/dashboard');
    } catch (error) {
      toast.error('Gagal mengirim aplikasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepKey = (step: number): keyof ApplicationFormData => {
    const stepKeys: Record<number, keyof ApplicationFormData> = {
      1: 'personalData',
      2: 'contactData',
      3: 'businessData',
      4: 'financingData',
      5: 'documentUpload',
    };
    return stepKeys[step];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDataStep />;
      case 2:
        return <ContactDataStep />;
      case 3:
        return <BusinessDataStep />;
      case 4:
        return <FinancingDataStep />;
      case 5:
        return <DocumentUploadStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Formulir Aplikasi Pinjaman
            </h1>
            <p className="text-gray-600">
              Lengkapi semua informasi dengan benar untuk mempercepat proses verifikasi
            </p>
          </div>

          <FormProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <FormActions
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
      </div>
