'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Clock, CheckCircle, XCircle, FileDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

// --- TYPE DEFINITIONS ---
interface Application {
  id: string;
  fullName: string;
  loanAmount: number;
  status: string;
  financingAnalysis: { id: string } | null;
  subFinancingAnalysis: { id: string } | null;
}

interface Stats {
  pending: number;
  analyzed: number;
  approved: number;
  rejected: number;
}

// --- STATS CARD COMPONENT ---
const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <Card className="group relative overflow-hidden border bg-white dark:bg-neutral-900 hover-lift">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center gap-3">
        <div className="rounded-md p-2 text-white shadow ring-1 ring-black/10 bg-gradient-to-br from-emerald-500 to-teal-500">
          <Icon className="h-4 w-4" />
        </div>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </CardContent>
  </Card>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function EmployeeDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, analyzed: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL"|"PENDING"|"ANALYZED"|"APPROVED"|"REJECTED">("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memuat data pengajuan');
      }
      const data = await res.json();
      const apps = data.applications || [];
      setApplications(apps);

      // Calculate stats
      const pending = apps.filter((app: Application) => app.status === 'PENDING').length;
      const analyzed = apps.filter((app: Application) => app.status === 'ANALYZED').length;
      const approved = apps.filter((app: Application) => app.status === 'APPROVED').length;
      const rejected = apps.filter((app: Application) => app.status === 'REJECTED').length;
      setStats({ pending, analyzed, approved, rejected });

    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('currentEmployee');
    router.push('/');
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default as any
      const doc = new jsPDF({ orientation: 'landscape' })

      doc.setFontSize(16)
      doc.text('Daftar Pengajuan Pembiayaan', 14, 18)
      doc.setFontSize(10)
      doc.text(new Date().toLocaleString('id-ID'), 14, 24)

      const body = filteredApps.map((app) => [
        app.fullName,
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(app.loanAmount),
        app.status,
        app.subFinancingAnalysis ? 'Ya' : 'Belum',
        app.financingAnalysis ? 'Ya' : 'Belum',
      ])

      autoTable(doc, {
        head: [["Nama Nasabah","Jumlah Pinjaman","Status","Sub-Analisa","Analisa 5C"]],
        body,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] },
      })

      doc.save(`pengajuan_pegawai_${Date.now()}.pdf`)
    } catch (e) {
      toast.error('Gagal membuat PDF')
    }
  }

  const handleExportApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`)
      if (!res.ok) throw new Error('Gagal mengambil data aplikasi')
      const app = await res.json()

      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default as any
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })

      // Header with logo
      const logo = await loadLogoDataURL()
      if (logo) {
        try { doc.addImage(logo, 'PNG', 40, 28, 28, 28) } catch {}
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16)
      doc.text('Laporan Pengajuan Pembiayaan', 76, 45)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10)
      doc.text(`Tanggal: ${new Date().toLocaleString('id-ID')}`, 76, 62)
      doc.text(`Nama: ${app.fullName || '-'}`, 76, 76)
      doc.text(`ID: ${app.id}`, 76, 90)

      // Data Pengajuan
      autoTable(doc, {
        startY: 110,
        head: [["Data Pengajuan", "Nilai"]],
        body: [
          ['Jumlah Pinjaman', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(app.loanAmount || 0)],
          ['Tujuan Pinjaman', app.loanPurpose || '-'],
          ['Jangka Waktu (bulan)', String(app.loanTerm || '-')],
          ['Jaminan', app.collateral || '-'],
          ['Status', app.status || '-'],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0,112,74] },
      })

      // Sub-Analisa (klien/pegawai tersimpan pada record yang sama)
      if (app.subFinancingAnalysis) {
        const s = app.subFinancingAnalysis
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 16,
          head: [["Sub-Analisa Pembiayaan", "Nilai"]],
          body: [
            ['Pendapatan Bersih', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(s.pendapatanBersih || 0)],
            ['Angsuran Maksimal', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(s.angsuranMaksimal || 0)],
            ['Plafon Maksimal', new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(s.plafonMaksimal || 0)],
            ['Jangka Pembiayaan (bulan)', String(s.jangkaPembiayaan || 0)],
          ],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [8,145,178] },
        })
      }

      // Analisa Pembiayaan (5C) Petugas
      if (app.financingAnalysis) {
        const f = app.financingAnalysis
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 16,
          head: [["Analisa Pembiayaan (Ringkas)", "Nilai"]],
          body: [
            ['Rekomendasi', String(f.kesimpulan_rekomendasi || '-')],
            ['Catatan Khusus', String(f.kesimpulan_catatanKhusus || '-')],
            ['Petugas Survei', String(f.petugasSurvei || '-')],
            ['Plafon Pokok', String(f.jaminan_plafonPokok ?? '-')],
            ['Nilai Taksiran Jaminan', String(f.jaminan_nilaiTaksiran ?? '-')],
          ],
          styles: { fontSize: 9 },
          headStyles: { fillColor: [24,160,133] },
        })
      }

      doc.save(`laporan-aplikasi-${id}.pdf`)
      toast.success('PDF berhasil dibuat')
    } catch (e) {
      toast.error('Gagal export PDF aplikasi')
    }
  }

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default as any
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const logo = await loadLogoDataURL()

      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i]
        const res = await fetch(`/api/applications/${id}`)
        if (!res.ok) throw new Error('Gagal memuat data aplikasi')
        const app = await res.json()

        if (i > 0) doc.addPage()
        if (logo) { try { doc.addImage(logo, 'PNG', 40, 28, 28, 28) } catch {} }
        doc.setFont('helvetica','bold'); doc.setFontSize(16)
        doc.text('Laporan Pengajuan Pembiayaan', 76, 45)
        doc.setFont('helvetica','normal'); doc.setFontSize(10)
        doc.text(`Tanggal: ${new Date().toLocaleString('id-ID')}`, 76, 62)
        doc.text(`Nama: ${app.fullName || '-'}`, 76, 76)
        doc.text(`ID: ${app.id}`, 76, 90)

        // 1) Data Pribadi & Kontak
        autoTable(doc, {
          startY: 110,
          head: [["Data Pribadi", "Nilai"]],
          body: [
            ['Nama Lengkap', app.fullName || '-'],
            ['Tempat Lahir', app.birthPlace || '-'],
            ['Tanggal Lahir', new Date(app.birthDate).toLocaleDateString('id-ID')],
            ['Jenis Kelamin', app.gender || '-'],
            ['Status Pernikahan', app.maritalStatus || '-'],
            ['Pendidikan', app.education || '-'],
            ['Pekerjaan', app.occupation || '-'],
            ['Penghasilan Bulanan', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(app.monthlyIncome||0))],
            ['Nama Pasangan', app.spouseName || '-'],
            ['Pekerjaan Pasangan', app.spouseOccupation || '-'],
            ['Penghasilan Pasangan', app.spouseIncome!=null? new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(app.spouseIncome)): '-'],
            ['Alamat Rumah', app.homeAddress || '-'],
            ['No. HP', app.phoneNumber || '-'],
            ['Kontak Darurat', [app.contact1,app.contact2,app.contact3,app.contact4,app.contact5].filter(Boolean).join(', ') || '-'],
          ],
          styles: { fontSize: 9 }, headStyles: { fillColor: [0,112,74] },
        })

        // 2) Data Usaha
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 12,
          head: [["Data Usaha", "Nilai"]],
          body: [
            ['Nama Usaha', app.businessName || '-'],
            ['Jenis Usaha', app.businessType || '-'],
            ['Alamat Usaha', app.businessAddress || '-'],
            ['Lama Usaha (bln)', String(app.businessDuration ?? '-')],
            ['Penghasilan Usaha', app.businessIncome!=null? new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(app.businessIncome)): '-'],
          ],
          styles: { fontSize: 9 }, headStyles: { fillColor: [0,112,74] },
        })

        // 3) Data Pembiayaan
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 12,
          head: [["Data Pembiayaan", "Nilai"]],
          body: [
            ['Jumlah Pinjaman', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(app.loanAmount||0))],
            ['Tujuan', app.loanPurpose || '-'],
            ['Jangka Waktu (bulan)', String(app.loanTerm || '-')],
            ['Jaminan', app.collateral || '-'],
            ['Status', app.status || '-'],
          ],
          styles: { fontSize: 9 }, headStyles: { fillColor: [0,112,74] },
        })

        // 4) Sub-Analisa (Input Klien) — rincian pemasukan/pengeluaran
        if (app.subFinancingAnalysis) {
          const s = app.subFinancingAnalysis
          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 12,
            head: [["Sub‑Analisa (Klien)", "Nilai"]],
            body: [
              ['Pemasukan Suami', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pemasukanSuami||0))],
              ['Pemasukan Istri', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pemasukanIstri||0))],
              ['Pemasukan Lainnya 1', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pemasukanLainnya1||0))],
              ['Pemasukan Lainnya 2', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pemasukanLainnya2||0))],
              ['Pengeluaran Suami', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pengeluaranSuami||0))],
              ['Pengeluaran Istri', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pengeluaranIstri||0))],
              ['Makan', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.makan||0))],
              ['Listrik', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.listrik||0))],
              ['Sosial', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.sosial||0))],
              ['Tanggungan Lain', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.tanggunganLain||0))],
              ['Jumlah Anak', String(s.jumlahAnak||0)],
              ['Pengeluaran Sekolah', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pengeluaranSekolah||0))],
              ['Uang Saku', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.uangSaku||0))],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [8,145,178] },
          })

          // 5) Sub-Analisa (Pegawai) — hasil perhitungan
          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Sub‑Analisa (Pegawai)", "Nilai"]],
            body: [
              ['Pendapatan Bersih', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.pendapatanBersih||0))],
              ['Angsuran Maksimal', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.angsuranMaksimal||0))],
              ['Plafon Maksimal', new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(s.plafonMaksimal||0))],
              ['Jangka Pembiayaan', String(s.jangkaPembiayaan||0) + ' bulan'],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [8,145,178] },
          })
        }

        // 6) Analisa Pembiayaan (Pegawai)
        if (app.financingAnalysis) {
          const f = app.financingAnalysis
          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 12,
            head: [["Karakter", "Nilai"]],
            body: [
              ['Agama', String(f.karakter_agama||'-')],
              ['Pengalaman', String(f.karakter_pengalaman||'-')],
              ['Hub. Masyarakat', String(f.karakter_hubMasyarakat||'-')],
              ['Angsuran Lainnya', String(f.karakter_angsuranLainnya||'-')],
              ['Kesimpulan Karakter', String(f.karakter_kesimpulan||'-')],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [24,160,133] },
          })

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Kapasitas & Keuangan", "Nilai"]],
            body: [
              ['Plafon Maksimal', String(f.kapasitas_plafonMaksimal ?? '-')],
              ['Angsuran Maksimal', String(f.kapasitas_angsuranMaksimal ?? '-')],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [24,160,133] },
          })

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Jaminan", "Nilai"]],
            body: [
              ['Jenis', String(f.jaminan_jenis||'-')],
              ['Nilai Taksiran', String(f.jaminan_nilaiTaksiran ?? '-')],
              ['Kondisi', String(f.jaminan_kondisi||'-')],
              ['Plafon Pokok', String(f.jaminan_plafonPokok ?? '-')],
              ['Keabsahan', String(f.jaminan_keabsahan||'-')],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [24,160,133] },
          })

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Ceklist Dokumen", "Ada"]],
            body: [
              ['FC KTP Pemohon', f.ceklist_fcKtpPemohon ? 'Ya' : 'Tidak'],
              ['FC KK', f.ceklist_fcKk ? 'Ya' : 'Tidak'],
              ['FC KTP Suami/Istri', f.ceklist_fcKtpSuamiIstri ? 'Ya' : 'Tidak'],
              ['FC Slip Gaji', f.ceklist_fcSlipGaji ? 'Ya' : 'Tidak'],
              ['FC Agunan', f.ceklist_fcAgunan ? 'Ya' : 'Tidak'],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [24,160,133] },
          })

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Kesimpulan", "Nilai"]],
            body: [
              ['Rekomendasi', String(f.kesimpulan_rekomendasi||'-')],
              ['Catatan Khusus', String(f.kesimpulan_catatanKhusus||'-')],
              ['Petugas Survei', String(f.petugasSurvei||'-')],
              ['Pengurus', String(f.pengurus||'-')],
              ['Approver', String(f.approver||'-')],
            ],
            styles: { fontSize: 9 }, headStyles: { fillColor: [24,160,133] },
          })
        }
      }

      doc.save(`export-pengajuan-terpilih-${Date.now()}.pdf`)
      toast.success('Export PDF terpilih berhasil')
    } catch (e) {
      toast.error('Gagal export PDF terpilih')
    }
  }

  async function loadLogoDataURL(): Promise<string | null> {
    try {
      const res = await fetch('/logo ksu ke.png')
      const blob = await res.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch { return null }
  }

  const filteredApps = useMemo(() => {
    let list = applications
    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.fullName.toLowerCase().includes(q))
    }
    return list
  }, [applications, search, statusFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
        <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-10 w-72 bg-white/20 rounded" />
          </div>
        </section>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700">
        <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="hero-title text-3xl sm:text-4xl font-extrabold leading-tight">Dashboard Pegawai</h1>
              <p className="hero-subtitle mt-1 text-sm sm:text-base">Pantau pengajuan, analisa, dan persetujuan dengan cepat.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/employee/approval')} className="bg-white text-emerald-700 hover:bg-white/90 ring-1 ring-white/50 rounded-full px-4">Persetujuan Pembiayaan</Button>
              <Button onClick={handleLogout} variant="secondary" className="bg-emerald-700/30 hover:bg-emerald-700/40 text-white ring-1 ring-white/30 rounded-full px-4">Logout</Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
          <StatCard title="Pengajuan Baru" value={stats.pending} icon={FileText} />
          <StatCard title="Sudah Dianalisa" value={stats.analyzed} icon={Clock} />
          <StatCard title="Disetujui" value={stats.approved} icon={CheckCircle} />
          <StatCard title="Ditolak" value={stats.rejected} icon={XCircle} />
        </div>

        {/* Controls */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-md">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama nasabah..." aria-label="Cari" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {(["ALL","PENDING","ANALYZED","APPROVED","REJECTED"] as const).map((s) => (
                  <Button key={s} size="sm" variant={statusFilter===s?"default":"outline"} onClick={() => setStatusFilter(s)} aria-pressed={statusFilter===s} className={statusFilter===s?"shadow-sm":""}>
                    {s === "ALL" ? "Semua" : s}
                  </Button>
                ))}
                <Button size="sm" variant="outline" onClick={() => { setSearch(""); setStatusFilter("ALL") }}>Reset</Button>
                  <Button size="sm" onClick={handleExportSelected} disabled={selectedIds.length===0} className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 flex items-center gap-1">
                    <FileDown className="h-4 w-4" /> Export PDF ({selectedIds.length})
                  </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Daftar Pengajuan Pembiayaan</CardTitle>
            <CardDescription>Berikut adalah daftar pengajuan dari nasabah untuk dianalisa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table className="table-auto min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length>0 && selectedIds.length===filteredApps.length}
                      onCheckedChange={(v) => {
                        if (v) setSelectedIds(filteredApps.map(a=>a.id)); else setSelectedIds([])
                      }}
                      aria-label="Pilih semua"
                    />
                  </TableHead>
                    <TableHead className="w-[240px]">Nama Nasabah</TableHead>
                    <TableHead className="text-right w-[160px]">Jumlah Pinjaman</TableHead>
                    <TableHead className="w-[140px]">Status Pengajuan</TableHead>
                    <TableHead className="w-[180px]">Status Analisa</TableHead>
                    <TableHead className="w-[140px]">Keputusan</TableHead>
                    <TableHead className="text-right w-[460px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(app.id)}
                          onCheckedChange={(v)=>{
                            setSelectedIds((prev)=>{
                              if (v) return Array.from(new Set([...prev, app.id]))
                              return prev.filter(id=>id!==app.id)
                            })
                          }}
                          aria-label={`Pilih ${app.fullName}`}
                        />
                      </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{app.fullName}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(app.loanAmount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === 'APPROVED' ? 'success' :
                            app.status === 'REJECTED' ? 'destructive' :
                            app.status === 'PENDING' ? 'warning' : 'secondary'
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 items-center">
                            <Badge variant={app.subFinancingAnalysis ? 'success' : 'secondary'}>Sub-Analisa</Badge>
                            <Badge variant={app.financingAnalysis ? 'success' : 'secondary'}>Analisa 5C</Badge>
                          </div>
                        </TableCell>
                      <TableCell>
                        {app.status === 'APPROVED' && (
                          <Badge variant="default" className="bg-green-600">Disetujui</Badge>
                        )}
                        {app.status === 'REJECTED' && (
                          <Badge variant="destructive">Ditolak</Badge>
                        )}
                        {app.status === 'ANALYZED' && (
                          <Badge variant="warning">Perlu Persetujuan</Badge>
                        )}
                        {app.status === 'PENDING' && (
                          <Badge variant="secondary">Menunggu</Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1 flex-wrap">
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => router.push(`/employee/applications/${app.id}`)}>Detail</Button>
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => router.push(`/employee/applications/${app.id}/edit`)}>Edit</Button>
                            {/* Per-row export dihapus agar rapi; gunakan export di atas dengan ceklist */}
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => router.push(`/employee/sub-analysis/new?applicationId=${app.id}`)}>Sub Analisa</Button>
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" disabled={!app.subFinancingAnalysis} onClick={() => router.push(`/employee/analysis/new?applicationId=${app.id}`)}>Analisa 5C</Button>
                            <Button variant="destructive" size="sm" className="h-8 px-2 text-xs" onClick={async () => {
                            if (confirm('Are you sure you want to delete this application?')) {
                              try {
                                const res = await fetch(`/api/applications/${app.id}`, {
                                  method: 'DELETE',
                                });
                                if (!res.ok) {
                                  const errorData = await res.json();
                                  throw new Error(errorData.error || 'Failed to delete application');
                                }
                                toast.success('Application deleted successfully!');
                                // Refresh the list of applications after deletion
                                fetchData();
                              } catch (err) {
                                toast.error((err as Error).message);
                              }
                              }
                            }}>Hapus</Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24">
                      <div className="flex flex-col items-center justify-center text-center py-8">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-2">
                          <path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" />
                        </svg>
                        <div className="text-sm text-muted-foreground">Tidak ada data sesuai filter.</div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" onClick={() => { setSearch(""); setStatusFilter("ALL") }}>Reset Filter</Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
