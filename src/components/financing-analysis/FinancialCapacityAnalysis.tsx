'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface FinancialCapacityAnalysisProps {
  netIncome: number
}

export function FinancialCapacityAnalysis({ netIncome }: FinancialCapacityAnalysisProps) {
  const [loanTerm, setLoanTerm] = useState(12)
  const [maxInstallment, setMaxInstallment] = useState(0)
  const [maxLoan, setMaxLoan] = useState(0)

  useEffect(() => {
    const newMaxInstallment = netIncome * 0.7
    const newMaxLoan = newMaxInstallment * loanTerm

    setMaxInstallment(newMaxInstallment)
    setMaxLoan(newMaxLoan)
  }, [netIncome, loanTerm])

  return (
  <div className="space-y-4 p-6 rounded-lg border" style={{background:'var(--color-secondary)', borderColor:'var(--color-border)'}}>
    <h3 className="text-lg font-bold text-[var(--color-primary-dark)] border-b pb-2" style={{borderColor:'var(--color-border)'}}>ANALISA KAPASITAS KEUANGAN</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="w-48 text-sm font-medium text-gray-700">Jangka Pembiayaan (bulan)</label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(parseInt(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih jangka</option>
            {[6, 12, 18, 24, 30, 36, 42, 48, 54, 60].map(term => (
              <option key={term} value={term}>{term} bulan</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Angsuran Maksimal per Bulan (70% dari pendapatan bersih)</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(maxInstallment)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Perhitungan: 70% × {formatCurrency(netIncome)} = {formatCurrency(maxInstallment)}
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Plafon Maksimal</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(maxLoan)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Perhitungan: {formatCurrency(maxInstallment)} × {loanTerm} bulan = {formatCurrency(maxLoan)}
          </div>
        </div>

        {loanTerm > 0 && (
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Rekomendasi:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Angsuran bulanan tidak boleh melebihi {formatCurrency(maxInstallment)}</li>
              <li>• Plafon pembiayaan maksimal yang dapat diberikan: {formatCurrency(maxLoan)}</li>
              <li>• Pastikan nasabah memiliki sumber pendapatan yang stabil</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
