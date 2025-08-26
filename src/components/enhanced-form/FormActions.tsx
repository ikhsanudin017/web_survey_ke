'use client';

import { useState } from 'react';
import { Save, Send, RotateCcw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface FormActionsProps {
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: (data: any) => void;
  isLoading?: boolean;
  isValid?: boolean;
  hasChanges?: boolean;
  className?: string;
}

export function FormActions({
  onSave,
  onSubmit,
  onReset,
  onExport,
  onImport,
  isLoading = false,
  isValid = true,
  hasChanges = false,
  className
}: FormActionsProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
        toast({
          title: "Draft Tersimpan",
          description: "Perubahan Anda telah berhasil disimpan.",
        });
      } catch (error) {
        toast({
          title: "Gagal Menyimpan",
          description: "Terjadi kesalahan saat menyimpan draft.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (onSubmit && isValid) {
      try {
        await onSubmit();
        toast({
          title: "Berhasil Dikirim",
          description: "Formulir analisis kredit telah berhasil dikirim.",
        });
        setShowSubmitDialog(false);
      } catch (error) {
        toast({
          title: "Gagal Mengirim",
          description: "Terjadi kesalahan saat mengirim formulir.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setShowResetDialog(false);
      toast({
        title: "Formulir Direset",
        description: "Semua data telah dikosongkan.",
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImport(data);
          toast({
            title: "Data Diimpor",
            description: "Data formulir berhasil diimpor dari file.",
          });
        } catch (error) {
          toast({
            title: "Gagal Mengimpor",
            description: "Format file tidak valid.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className={className}>
        <div className="flex flex-wrap gap-3 justify-end">
          {/* Import/Export */}
          <div className="flex gap-2">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            
            {onImport && (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </>
            )}
          </div>

          {/* Main Actions */}
          <div className="flex gap-2">
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            {onSave && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Draft
              </Button>
            )}

            {onSubmit && (
              <Button
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isLoading || !isValid}
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim Analisis
              </Button>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        {hasChanges && (
          <div className="text-sm text-amber-600 mt-2 text-right">
            Ada perubahan yang belum disimpan
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengosongkan semua data formulir? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Ya, Reset Formulir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim formulir analisis kredit? 
              Pastikan semua data telah diisi dengan benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Ya, Kirim Analisis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
