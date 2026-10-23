import React, { useState } from 'react';
import { Calculator, IndianRupee, Percent, Calendar, ShieldCheck } from 'lucide-react';

interface EmiCalculatorProps {
  initialCarPriceLakhs?: number;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({ initialCarPriceLakhs = 10 }) => {
  const [carPriceLakhs, setCarPriceLakhs] = useState<number>(initialCarPriceLakhs);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  const priceInRupees = carPriceLakhs * 100000;
  const downPaymentAmount = priceInRupees * (downPaymentPercent / 100);
  const loanAmount = Math.max(0, priceInRupees - downPaymentAmount);

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const monthlyEmi =
    monthlyRate > 0 && loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  const totalPayment = monthlyEmi * totalMonths + downPaymentAmount;
  const totalInterest = Math.max(0, totalPayment - priceInRupees);

  return (
    <div className="executive-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-amber-950 shadow-md">
          <Calculator className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Car Loan &amp; EMI Calculator</h3>
          <p className="text-xs text-slate-500">Estimate monthly installment with instant bank tie-ups at KM Car Deals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* Sliders Input */}
        <div className="space-y-6 text-xs">
          {/* Car Price */}
          <div>
            <div className="flex justify-between mb-2 text-slate-600">
              <span className="font-medium">Vehicle Value</span>
              <span className="text-slate-900 font-bold">₹ {carPriceLakhs.toFixed(2)} Lakhs</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="0.25"
              value={carPriceLakhs}
              onChange={e => setCarPriceLakhs(parseFloat(e.target.value))}
              className="w-full accent-slate-900 bg-slate-200 rounded-full cursor-pointer h-2"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between mb-2 text-slate-600">
              <span className="font-medium">Down Payment ({downPaymentPercent}%)</span>
              <span className="text-slate-900 font-bold">₹ {Math.round(downPaymentAmount).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={downPaymentPercent}
              onChange={e => setDownPaymentPercent(parseFloat(e.target.value))}
              className="w-full accent-slate-900 bg-slate-200 rounded-full cursor-pointer h-2"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2 text-slate-600">
              <span className="font-medium">Interest Rate (p.a.)</span>
              <span className="text-slate-900 font-bold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="7.5"
              max="15"
              step="0.25"
              value={interestRate}
              onChange={e => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 rounded-full cursor-pointer h-2"
            />
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between mb-2 text-slate-600">
              <span className="font-medium">Loan Tenure</span>
              <span className="text-slate-900 font-bold">{tenureYears} Years ({totalMonths} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={tenureYears}
              onChange={e => setTenureYears(parseInt(e.target.value))}
              className="w-full accent-slate-900 bg-slate-200 rounded-full cursor-pointer h-2"
            />
          </div>
        </div>

        {/* Breakdown Card — bold, substantial output figures */}
        <div className="bg-gradient-obsidian p-6 sm:p-7 rounded-2xl flex flex-col justify-between text-white shadow-premium">
          <div className="space-y-4">
            <span className="section-eyebrow-light !text-[11px] block">Calculated Monthly EMI</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-amber">
                ₹{Math.round(monthlyEmi).toLocaleString('en-IN')}
              </span>
              <span className="text-slate-400 text-xs">/month</span>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Principal Loan Amount</span>
                <span className="font-bold text-white">₹ {Math.round(loanAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Interest Payable</span>
                <span className="font-bold text-white">₹ {Math.round(totalInterest).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Cost of Vehicle</span>
                <span className="font-bold text-white">₹ {Math.round(totalPayment).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-200 bg-white/5 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" strokeWidth={1.75} />
            <span>Instant loan approval support via HDFC, SBI, ICICI &amp; Axis Bank at KM Car Deals.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
