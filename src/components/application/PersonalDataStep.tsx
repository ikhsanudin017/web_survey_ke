'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Assuming form components are available

export default function PersonalDataStep() {
  const { control } = useFormContext();

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Langkah 1: Data Pribadi</CardTitle>
        <CardDescription>Isi informasi pribadi Anda dengan lengkap dan benar.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="personalData.fullName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nama Lengkap (sesuai KTP)</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama lengkap Anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Panggilan</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama panggilan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Lahir</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status Perkawinan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status perkawinan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                  <SelectItem value="Menikah">Menikah</SelectItem>
                  <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                  <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penghasilan per Bulan</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 5000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.spouseIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penghasilan Pasangan (jika ada)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 3000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 my-4 border-t pt-4">
            <p className="text-sm text-gray-500">Informasi Ahli Waris</p>
        </div>

        <FormField
          control={control}
          name="personalData.heirName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Ahli Waris</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap ahli waris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="personalData.heirRelationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hubungan / Pekerjaan Ahli Waris</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Anak / Karyawan Swasta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}