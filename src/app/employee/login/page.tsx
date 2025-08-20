'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const employees = [
  { id: 'sayudi', name: 'Sayudi', password: 'sayudi123' },
  { id: 'upik', name: 'Upik', password: 'upik123' },
  { id: 'arwan', name: 'Arwan', password: 'arwan123' },
  { id: 'winarno', name: 'Winarno', password: 'winarno123' }
]

export default function EmployeeLoginPage() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    if (!selectedEmployee || !password) {
      setError('Silakan pilih nama dan masukkan password')
      return
    }

    setLoading(true)
    setError('')

    // Cari pegawai yang dipilih
    const employee = employees.find(emp => emp.id === selectedEmployee)
    
    if (employee && employee.password === password) {
      // Login berhasil
      localStorage.setItem('currentEmployee', JSON.stringify({
        id: employee.id,
        name: employee.name
      }))
      router.push('/employee/dashboard')
    } else {
      setError('Password salah!')
      setLoading(false)
    }
  }

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Login Pegawai</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Pilih nama dan masukkan password untuk masuk ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
