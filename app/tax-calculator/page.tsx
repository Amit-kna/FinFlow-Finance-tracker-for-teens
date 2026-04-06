'use client'

import { useState } from 'react'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProGate from '@/components/ProGate'
import { formatCurrency } from '@/lib/utils'
import { useCurrency } from '@/components/CurrencyProvider'

function TaxCalculatorContent() {
  const router = useRouter()
  const { currency, convert } = useCurrency()
  const [country, setCountry] = useState('US')
  const [incomeType, setIncomeType] = useState('part-time')
  const [annualIncome, setAnnualIncome] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const income = parseFloat(annualIncome)
    if (isNaN(income) || income <= 0) return

    if (country === 'US') {
      const standardDeduction = 14600
      const taxableIncome = Math.max(0, income - standardDeduction)
      let incomeTax = 0

      if (taxableIncome > 0) {
        if (taxableIncome <= 11600) incomeTax = taxableIncome * 0.10
        else if (taxableIncome <= 47150) incomeTax = 1160 + (taxableIncome - 11600) * 0.12
        else if (taxableIncome <= 100525) incomeTax = 5426 + (taxableIncome - 47150) * 0.22
        else incomeTax = 17168.50 + (taxableIncome - 100525) * 0.24
      }

      let selfEmploymentTax = 0
      if (incomeType === 'freelance' || incomeType === 'reselling' || incomeType === 'content' || incomeType === 'mixed') {
        if (income > 400) selfEmploymentTax = income * 0.1413
      }

      const totalTax = incomeTax + selfEmploymentTax

      setResult({
        standardDeduction,
        taxableIncome,
        incomeTax,
        selfEmploymentTax,
        totalTax,
        owesIncomeTax: taxableIncome > 0,
        owesSET: selfEmploymentTax > 0
      })
    } else if (country === 'UK') {
      const personalAllowance = 12570
      const taxableIncome = Math.max(0, income - personalAllowance)
      let incomeTax = 0

      if (taxableIncome > 0) {
        if (taxableIncome <= 37700) incomeTax = taxableIncome * 0.20
        else if (taxableIncome <= 125140) incomeTax = 7540 + (taxableIncome - 37700) * 0.40
        else incomeTax = 7540 + 34976 + (taxableIncome - 125140) * 0.45
      }

      setResult({
        personalAllowance,
        taxableIncome,
        incomeTax,
        totalTax: incomeTax,
        owesTax: taxableIncome > 0,
        note: 'National Insurance contributions may also apply. Check gov.uk for details.'
      })
    } else {
      setResult({ country, note: country === 'Israel'
        ? 'Tax thresholds in Israel vary. As a minor, you may be exempt. Consult a licensed accountant or use the Israeli Tax Authority website (mof.gov.il).'
        : `We don't have specific tax data for your country. Search '[your country] income tax calculator' for accurate local information.`
      })
    }
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white">Tax Calculator</h1>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-400 font-medium mb-2 block">Country</label>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setResult(null) }}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C896] transition-colors"
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Israel">Israel</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {(country === 'US' || country === 'UK') && (
          <div>
            <label className="text-sm text-gray-400 font-medium mb-2 block">Income Type</label>
            <select
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C896] transition-colors"
            >
              <option value="part-time">Part-time employment</option>
              <option value="freelance">Freelance / self-employed</option>
              <option value="reselling">Reselling</option>
              <option value="content">Content creation</option>
              <option value="mixed">Mixed income</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400 font-medium mb-2 block">
            Annual Income ({country === 'US' ? '$' : country === 'UK' ? '£' : currency})
          </label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => { setAnnualIncome(e.target.value); setResult(null) }}
            placeholder="Enter your annual income"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C896] transition-colors placeholder:text-white/30"
          />
        </div>

        <button
          onClick={calculate}
          disabled={!annualIncome}
          className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl hover:bg-[#00b085] transition-colors disabled:opacity-50"
        >
          Calculate
        </button>
      </div>

      {result && (country === 'US' || country === 'UK') && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">Estimated Tax Breakdown</h3>

          {country === 'US' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Standard Deduction 2025</span>
                <span className="text-white font-bold">${result.standardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxable Income</span>
                <span className="text-white font-bold">${result.taxableIncome.toLocaleString()}</span>
              </div>

              {!result.owesIncomeTax && (
                <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-xl p-3">
                  <p className="text-[#00C896] text-sm font-medium">You owe $0 income tax 🎉 Your earnings are below the standard deduction.</p>
                </div>
              )}

              {result.owesIncomeTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Income Tax</span>
                  <span className="text-red-400 font-bold">${result.incomeTax.toFixed(2)}</span>
                </div>
              )}

              {result.owesSET && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Self-Employment Tax</span>
                  <span className="text-red-400 font-bold">${result.selfEmploymentTax.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold">Total Estimated Tax</span>
                <span className="text-red-400 font-black text-lg">${result.totalTax.toFixed(2)}</span>
              </div>
            </>
          )}

          {country === 'UK' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Personal Allowance 2025/26</span>
                <span className="text-white font-bold">£{result.personalAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxable Income</span>
                <span className="text-white font-bold">£{result.taxableIncome.toLocaleString()}</span>
              </div>

              {!result.owesTax && (
                <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-xl p-3">
                  <p className="text-[#00C896] text-sm font-medium">You owe £0 income tax 🎉 Your earnings are below the personal allowance.</p>
                </div>
              )}

              {result.owesTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Income Tax</span>
                  <span className="text-red-400 font-bold">£{result.incomeTax.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold">Total Estimated Tax</span>
                <span className="text-red-400 font-black text-lg">£{result.totalTax.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">{result.note}</p>
            </>
          )}

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-xs">
              This is an estimate only. Tax laws change and vary by state. Always consult a tax professional or use official IRS/HMRC resources for accurate filing. FinFlow is not a licensed tax advisor.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-white text-sm font-medium">Tips:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Keep records of all freelance income</li>
              <li>• If you earn over the self-employment threshold, consider setting aside 15-20% of each payment</li>
              <li>• Ask a parent or guardian to help you file if needed</li>
            </ul>
          </div>
        </div>
      )}

      {result && (country === 'Israel' || country === 'Other') && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-white text-sm">{result.note}</p>
        </div>
      )}
    </div>
  )
}

export default function TaxCalculatorPage() {
  return (
    <ProGate>
      <TaxCalculatorContent />
    </ProGate>
  )
}
