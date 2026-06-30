import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Mortgage() {
  const [price, setPrice] = useState(1988000);
  const [down, setDown] = useState(397600);
  const [rate, setRate] = useState(6.223);
  const [tax, setTax] = useState(2071);
  const [insurance, setInsurance] = useState(547);
  const [hoa, setHoa] = useState(0);
  const [mortgageIns, setMortgageIns] = useState(0);
  const [years, setYears] = useState(30);

  const loanAmount = price - down;
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;

  const principalInterest = loanAmount
    ? (loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments))
    : 0;

  const monthlyPayment =
    principalInterest + tax + insurance + hoa + mortgageIns;

  const amortizationData = useMemo(() => {
    let balance = loanAmount;
    const data = [];

    for (let i = 1; i <= numberOfPayments; i++) {
      const interest = balance * monthlyRate;
      const principal = principalInterest - interest;
      balance -= principal;
      data.push({ month: i, balance: Math.max(balance, 0) });
    }

    return data;
  }, [loanAmount, principalInterest, monthlyRate, numberOfPayments]);

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-950 md:p-8">
 
      <h1 className="mx-auto mb-8 max-w-7xl text-4xl font-bold text-slate-950">
        Mortgage Calculator
      </h1>

      <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        
        <aside className="lg:col-span-1 sticky top-8 h-fit space-y-6">

          <section>
            <p className="text-4xl font-bold text-emerald-700">
              ${monthlyPayment.toLocaleString()}/month
            </p>
            <p className="mb-5 text-slate-500">
              {years}-year fixed rate of {rate}%
            </p>
          </section>

          <section className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div style={{ width: `${(principalInterest / monthlyPayment) * 100}%` }} className="bg-emerald-700" />
            <div style={{ width: `${(tax / monthlyPayment) * 100}%` }} className="bg-slate-600" />
            <div style={{ width: `${(insurance / monthlyPayment) * 100}%` }} className="bg-amber-600" />
            <div style={{ width: `${(hoa / monthlyPayment) * 100}%` }} className="bg-slate-400" />
            <div style={{ width: `${(mortgageIns / monthlyPayment) * 100}%` }} className="bg-emerald-400" />
          </section>

          <ul className="mt-4 space-y-2">
            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-700"></span>
                Principal & interest
              </span>
              <b>${principalInterest.toLocaleString()}</b>
            </li>

            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-600"></span>
                Property tax
              </span>
              <b>${tax.toLocaleString()}</b>
            </li>

            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-600"></span>
                Home insurance
              </span>
              <b>${insurance.toLocaleString()}</b>
            </li>

            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                HOA fees
              </span>
              <b>${hoa.toLocaleString()}</b>
            </li>

            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                Mortgage insurance
              </span>
              <b>${mortgageIns.toLocaleString()}</b>
            </li>
          </ul>

          <section className="grid grid-cols-1 gap-13 mt-6">
            {[
              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
            ].map((img, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <img src={img} alt="Apartment" className="w-full h-40 object-cover" />
              </div>
            ))}
          </section>
        </aside>

        <main className="lg:col-span-2 space-y-10">

          <section className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">Home price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
              <input
                type="range"
                min={500000}
                max={3000000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="font-semibold">Down payment</label>
              <input
                type="number"
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
              <input
                type="range"
                min={0}
                max={price}
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="font-semibold">Loan type</label>
              <select
                className="w-full p-3 border rounded-xl mt-1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              >
                <option value={30}>30-year fixed</option>
                <option value={20}>20-year fixed</option>
                <option value={15}>15-year fixed</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">Interest rate</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold">Property tax</label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold">Home insurance</label>
              <input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold">HOA fees</label>
              <input
                type="number"
                value={hoa}
                onChange={(e) => setHoa(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold">Mortgage insurance</label>
              <input
                type="number"
                value={mortgageIns}
                onChange={(e) => setMortgageIns(Number(e.target.value))}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-950">
              Loan Amortization
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={amortizationData}>
                <XAxis dataKey="month" hide />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#0f766e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-950">
              Loan Eligibility
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              <div>
                <label className="font-semibold">Annual Income ($)</label>
                <input
                  type="number"
                  id="annualIncome"
                  placeholder="Enter your annual income"
                  className="w-full mt-1 p-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold">Monthly Debts ($)</label>
                <input
                  type="number"
                  id="monthlyDebts"
                  placeholder="Enter your monthly debts"
                  className="w-full mt-1 p-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold">Credit Score</label>
                <input
                  type="number"
                  id="creditScore"
                  placeholder="Enter your credit score"
                  className="w-full mt-1 p-3 border rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const income = Number(document.getElementById("annualIncome").value);
                const debts = Number(document.getElementById("monthlyDebts").value);
                const credit = Number(document.getElementById("creditScore").value);

                const dti = debts / (income / 12);
                let message = "";

                if (income <= 0 || debts < 0 || credit <= 0) {
                  message = "Please enter valid information.";
                } else if (credit < 580) {
                  message = "Loan not approved — credit score too low.";
                } else if (dti > 0.45) {
                  message = "Loan not approved — DTI ratio too high.";
                } else {
                  message = "Approved! You qualify for this loan based on your profile.";
                }

                alert(message);
              }}
              className="mt-6 rounded-md bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Check Loan Eligibility
            </button>
          </section>

        </main>
      </div>
    </main>
  );
}


