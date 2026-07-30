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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Car Loan & EMI Calculator</h3>
          <p className="text-xs text-slate-500 font-medium">Estimate monthly installment with instant bank tie-ups at KM Car Deals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sliders Input */}
        <div className="space-y-5 text-xs">
          {/* Car Price */}
          <div>
            <div className="flex justify-between font-bold mb-1 text-slate-700">
              <span>Vehicle Value</span>
              <span className="text-red-600 font-extrabold">₹ {carPriceLakhs.toFixed(2)} Lakhs</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="0.25"
              value={carPriceLakhs}
              onChange={e => setCarPriceLakhs(parseFloat(e.target.value))}
              className="w-full accent-red-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between font-bold mb-1 text-slate-700">
              <span>Down Payment ({downPaymentPercent}%)</span>
              <span className="text-emerald-700 font-extrabold">₹ {Math.round(downPaymentAmount).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={downPaymentPercent}
              onChange={e => setDownPaymentPercent(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between font-bold mb-1 text-slate-700">
              <span>Interest Rate (p.a.)</span>
              <span className="text-amber-800 font-extrabold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="7.5"
              max="15"
              step="0.25"
              value={interestRate}
              onChange={e => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between font-bold mb-1 text-slate-700">
              <span>Loan Tenure</span>
              <span className="text-blue-700 font-extrabold">{tenureYears} Years ({totalMonths} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={tenureYears}
              onChange={e => setTenureYears(parseInt(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Calculated Monthly EMI</span>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ₹ {Math.round(monthlyEmi).toLocaleString('en-IN')}
              </span>
              <span className="text-slate-500 text-xs font-semibold"> / month</span>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Principal Loan Amount:</span>
                <span className="font-extrabold text-slate-900">₹ {Math.round(loanAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Interest Payable:</span>
                <span className="font-extrabold text-slate-900">₹ {Math.round(totalInterest).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Cost of Vehicle:</span>
                <span className="font-extrabold text-slate-900">₹ {Math.round(totalPayment).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-[11px] font-bold text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Instant loan approval support via HDFC, SBI, ICICI & Axis Bank at KM Car Deals.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
