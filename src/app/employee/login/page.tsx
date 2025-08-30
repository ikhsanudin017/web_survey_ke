'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signIn, useSession, signOut } from 'next-auth/react'

const employees = [
  { id: 'sayudi', name: 'Sayudi', password: 'sayudi123', role: 'employee' },
  { id: 'upik', name: 'Upik', password: 'upik123', role: 'employee' },
  { id: 'arwan', name: 'Arwan', password: 'arwan123', role: 'employee' },
  { id: 'winarno', name: 'Winarno', password: 'winarno123', role: 'employee' },
  { id: 'toha', name: 'Toha', password: 'toha123', role: 'approver' }
]

export default function EmployeeLoginPage() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession();

  const handleLogin = async () => {
    if (!selectedEmployee || !password) {
      setError('Silakan pilih nama dan masukkan password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signIn('employee', {
        redirect: false,
        employeeId: selectedEmployee,
        password: password,
      });

      console.log('signIn result:', result);

      if (result?.error) {
        setError('Login gagal: ' + result.error);
      } else {
        router.push('/employee/dashboard');
      }
    } catch (e: any) {
      setError('Terjadi kesalahan saat login: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'}}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">Login Pegawai</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Pilih nama dan masukkan password untuk masuk ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'authenticated' && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
              <div className="mb-2">Anda sudah login sebagai <strong>{(session?.user as any)?.name || (session?.user as any)?.id}</strong>.</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/employee/dashboard')}>Ke Dashboard</Button>
                <Button variant="destructive" onClick={async () => { await signOut({ redirect: false }); }}>Ganti Akun</Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Pilih Nama Pegawai:
            </label>
            <div className="space-y-2">
              {employees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="employee"
                    value={employee.id}
                    checked={selectedEmployee === employee.id}
                    onChange={(e) => {
                      setSelectedEmployee(e.target.value)
                      setPassword('')
                      setError('')
                    }}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedEmployee && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password untuk {selectedEmployeeData?.name}:
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Masukkan password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin()
                  }
                }}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!selectedEmployee || !password || loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
