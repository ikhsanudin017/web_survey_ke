"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    position: ""
  })
  const [userType, setUserType] = useState<"client" | "employee">("client")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    try {
      const endpoint = userType === "client" 
        ? "/api/auth/register/client" 
        : "/api/auth/register/employee"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registrasi berhasil! Silakan login.")
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setError(data.error || "Terjadi kesalahan saat registrasi")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat registrasi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            KSU Kirap Entrepreneurship
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Daftar Akun Baru
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buat Akun Baru</CardTitle>
            <CardDescription>
              Pilih jenis akun dan lengkapi data Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    userType === "client"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("employee")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    userType === "employee"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pegawai KSU
                </button>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Masukkan email"
                />
              </div>

              {userType === "client" && (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Nomor Telepon
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Alamat
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="Masukkan alamat"
                    />
                  </div>
                </>
              )}

              {userType === "employee" && (
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Jabatan
                  </label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Masukkan jabatan"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Masukkan password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Konfirmasi password"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Memproses..." : "Daftar"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <a
                  href="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Masuk di sini
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
