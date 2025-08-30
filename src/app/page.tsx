'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)]/80 surface-3d shadow-3d">
            <Image src="/logo ksu ke.png" alt="KSU Kirap Entrepreneurship" width={20} height={20} className="rounded" />
            <span className="text-xs font-semibold tracking-wide text-[var(--color-neutral-700)] dark:text-gray-200">KSU Kirap Entrepreneurship</span>
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight text-gradient-brand-sheen">
            Sistem Survey Digital
          </h1>
          <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)]" />
          <p className="mt-4 text-lg md:text-xl text-[var(--color-neutral-600)] max-w-3xl mx-auto leading-relaxed">
            Platform profesional untuk pengajuan pembiayaan dan analisa kredit koperasi syariah. Modern, efisien, dan terpercaya.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="cta" className="px-6 py-6 rounded-xl text-base btn-3d" onClick={() => router.push('/client/application/new')}>Mulai Pengajuan</Button>
            <Button variant="outline" className="px-6 py-6 rounded-xl text-base btn-3d-outline" onClick={() => router.push('/employee/login')}>Login Pegawai</Button>
          </div>
        </div>

        {/* Portals */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="border border-[var(--color-border)]/60 bg-white/85 dark:bg-[#1a1713]/85 shadow-xl hover-lift">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'}}>
                <svg className="w-6 h-6 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-[var(--color-primary-dark)]">Portal Nasabah</CardTitle>
              <CardDescription className="text-[var(--color-neutral-600)]">Untuk calon peminjam yang ingin mengajukan pembiayaan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-[var(--color-neutral-700)]">
                {['Pengajuan pembiayaan online','Upload dokumen pendukung','Checklist kelengkapan data','Proses cepat dan mudah'].map((t)=> (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{background:'var(--color-primary)'}} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Button variant="cta" className="w-full rounded-xl py-3" onClick={() => router.push('/client/application/new')}>Mulai Pengajuan Pembiayaan</Button>
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border)]/60 bg-white/85 dark:bg-[#1a1713]/85 shadow-xl hover-lift">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-[var(--color-primary-dark)]">Portal Pegawai</CardTitle>
              <CardDescription className="text-[var(--color-neutral-600)]">Untuk staff KSU yang melakukan analisa pembiayaan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-[var(--color-neutral-700)]">
                {['Analisa pembiayaan 5C','Sub analisa kredit detail','Manajemen dokumen','Dashboard monitoring'].map((t)=> (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{background:'var(--color-accent)'}} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-xl py-3" onClick={() => router.push('/employee/login')}>Login Pegawai</Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-[var(--color-primary-dark)] mb-8">Keunggulan Sistem</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {title:'Ramah Lingkungan', desc:'Mengurangi penggunaan kertas dengan sistem digital', grad:'linear-gradient(135deg,#22c55e,#16a34a)'},
              {title:'Proses Cepat', desc:'Pengajuan dan analisa lebih efisien', grad:'linear-gradient(135deg,#60a5fa,#4f46e5)'},
              {title:'Aman & Terpercaya', desc:'Data tersimpan dengan aman dan terstruktur', grad:'linear-gradient(135deg,#f43f5e,#ec4899)'},
            ].map((f)=> (
              <div key={f.title} className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background:f.grad}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-[var(--color-neutral-900)] mb-2">{f.title}</h4>
                <p className="text-[var(--color-neutral-600)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
