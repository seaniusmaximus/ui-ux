import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import './App.css'

function App() {
  const appRef = useRef<HTMLDivElement | null>(null)
  const resultRef = useRef<HTMLDivElement | null>(null)

  const [homePrice, setHomePrice] = useState(425000)
  const [monthlyIncome, setMonthlyIncome] = useState(12000)
  const [monthlyExpenses, setMonthlyExpenses] = useState(1500)
  const sliderBounds = {
    homePrice: { min: 100000, max: 1200000 },
    monthlyIncome: { min: 3000, max: 30000 },
    monthlyExpenses: { min: 1000, max: 8000 },
    downPayment: { min: 0, max: 500000 },
  }

  const normalize = (value: number, min: number, max: number) =>
    (value - min) / Math.max(max - min, 1)

  const getRiskColor = (risk: number) => {
    const boundedRisk = Math.min(Math.max(risk, 0), 1)
    const hue = 120 - boundedRisk * 120
    return `hsl(${hue} 85% 45%)`
  }

  const sliderColorStyle = (risk: number): CSSProperties => ({
    accentColor: getRiskColor(risk),
  })

  const [downPayment, setDownPayment] = useState(70000)
  const [interestRate, setInterestRate] = useState(6.1)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTax, setPropertyTax] = useState(4200)
  const [homeInsurance, setHomeInsurance] = useState(1800)

  useEffect(() => {
    if (!appRef.current) {
      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '.calculator-card',
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      )

      gsap.fromTo(
        '.input-group',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          delay: 0.2,
        },
      )
    }, appRef)

    return () => context.revert()
  }, [])

  const loanAmount = useMemo(() => Math.max(homePrice - downPayment, 0), [homePrice, downPayment])

  const paymentBreakdown = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = loanTerm * 12

    const principalAndInterest =
      monthlyRate === 0
        ? loanAmount / Math.max(totalMonths, 1)
        : (loanAmount * monthlyRate * (1 + monthlyRate) ** totalMonths) /
          ((1 + monthlyRate) ** totalMonths - 1)

    const monthlyTax = propertyTax / 12
    const monthlyInsurance = homeInsurance / 12
    const totalMonthlyPayment = principalAndInterest + monthlyTax + monthlyInsurance
    const totalCost = totalMonthlyPayment * totalMonths

    const housingCapByIncome = monthlyIncome * 0.28
    const housingCapByDebtToIncome = Math.max(monthlyIncome * 0.43 - monthlyExpenses, 0)
    const suggestedAffordableCap = Math.min(housingCapByIncome, housingCapByDebtToIncome)
    const debtToIncomeRatio = ((monthlyExpenses + totalMonthlyPayment) / monthlyIncome) * 100

    return {
      principalAndInterest,
      monthlyTax,
      monthlyInsurance,
      totalMonthlyPayment,
      totalCost,
      totalMonths,
      suggestedAffordableCap,
      debtToIncomeRatio,
      isAffordable: totalMonthlyPayment <= suggestedAffordableCap,
    }
  }, [homeInsurance, interestRate, loanAmount, loanTerm, monthlyExpenses, monthlyIncome, propertyTax])

  const homePriceRisk = normalize(homePrice, sliderBounds.homePrice.min, sliderBounds.homePrice.max)
  const monthlyExpensesRisk = normalize(
    monthlyExpenses,
    sliderBounds.monthlyExpenses.min,
    sliderBounds.monthlyExpenses.max,
  )
  const downPaymentRatio = downPayment / Math.max(homePrice, 1)
  const downPaymentRisk = Math.min(Math.abs(downPaymentRatio - 0.2) / 0.2, 1)

  useEffect(() => {
    if (!resultRef.current) {
      return
    }

    gsap.fromTo(
      resultRef.current,
      { scale: 0.98, opacity: 0.82 },
      { scale: 1, opacity: 1, duration: 0.45, ease: 'power2.out' },
    )
  }, [paymentBreakdown.totalMonthlyPayment, paymentBreakdown.isAffordable])

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <main ref={appRef} className="app-shell">
      <section className="calculator-card">
        <header>
          <h1>Mortgage Affordability Calculator</h1>
          <p>
            Adjust the sliders to estimate your payment and check if the home cost fits your
            budget.
          </p>
        </header>

        <div className="input-grid">
          <label className="input-group" htmlFor="homePrice">
            <div className="label-row">
              <span>Home price</span>
              <strong>{formatMoney(homePrice)}</strong>
            </div>
            <input
              id="homePrice"
              type="range"
              min={sliderBounds.homePrice.min}
              max={sliderBounds.homePrice.max}
              step={5000}
              value={homePrice}
              style={sliderColorStyle(homePriceRisk)}
              onChange={(event) => setHomePrice(Number(event.target.value))}
            />
          </label>

          <label className="input-group" htmlFor="monthlyIncome">
            <div className="label-row">
              <span>Monthly income</span>
              <strong>{formatMoney(monthlyIncome)}</strong>
            </div>
            <input
              id="monthlyIncome"
              type="range"
              min={sliderBounds.monthlyIncome.min}
              max={sliderBounds.monthlyIncome.max}
              step={100}
              value={monthlyIncome}
              onChange={(event) => setMonthlyIncome(Number(event.target.value))}
            />
          </label>

          <label className="input-group" htmlFor="monthlyExpenses">
            <div className="label-row">
              <span>Monthly expenses</span>
              <strong>{formatMoney(monthlyExpenses)}</strong>
            </div>
            <input
              id="monthlyExpenses"
              type="range"
              min={sliderBounds.monthlyExpenses.min}
              max={sliderBounds.monthlyExpenses.max}
              step={50}
              value={monthlyExpenses}
              style={sliderColorStyle(monthlyExpensesRisk)}
              onChange={(event) => setMonthlyExpenses(Number(event.target.value))}
            />
          </label>

          <label className="input-group" htmlFor="downPayment">
            <div className="label-row">
              <span className="label-with-tooltip">
                Down payment
                <span className="tooltip-icon" aria-label="Down payment guidance" tabIndex={0}>
                  ?
                  <span className="tooltip-text">
                    suggested down payment is 20% of the home price
                  </span>
                </span>
              </span>
              <strong>{formatMoney(downPayment)}</strong>
            </div>
            <input
              id="downPayment"
              type="range"
              min={sliderBounds.downPayment.min}
              max={sliderBounds.downPayment.max}
              step={1000}
              value={downPayment}
              style={sliderColorStyle(downPaymentRisk)}
              onChange={(event) => setDownPayment(Number(event.target.value))}
            />
          </label>

          <label className="input-group" htmlFor="interestRate">
            <div className="label-row">
              <span>Interest rate</span>
              <strong>{interestRate.toFixed(2)}%</strong>
            </div>
            <input
              id="interestRate"
              type="range"
              min={1}
              max={12}
              step={0.05}
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
            />
          </label>

          <div className="input-group">
            <div className="label-row">
              <span>Loan term</span>
              <strong>{loanTerm} years</strong>
            </div>
            <div className="term-toggle" role="group" aria-label="Loan term options">
              <button
                type="button"
                className={loanTerm === 15 ? 'term-option active' : 'term-option'}
                onClick={() => setLoanTerm(15)}
              >
                15 years
              </button>
              <button
                type="button"
                className={loanTerm === 30 ? 'term-option active' : 'term-option'}
                onClick={() => setLoanTerm(30)}
              >
                30 years
              </button>
            </div>
          </div>

          <label className="input-group" htmlFor="propertyTax">
            <div className="label-row">
              <span>Property tax (annual)</span>
              <strong>{formatMoney(propertyTax)}</strong>
            </div>
            <input
              id="propertyTax"
              type="range"
              min={1200}
              max={18000}
              step={100}
              value={propertyTax}
              onChange={(event) => setPropertyTax(Number(event.target.value))}
            />
          </label>

          <label className="input-group" htmlFor="homeInsurance">
            <div className="label-row">
              <span>Home insurance (annual)</span>
              <strong>{formatMoney(homeInsurance)}</strong>
            </div>
            <input
              id="homeInsurance"
              type="range"
              min={600}
              max={7200}
              step={50}
              value={homeInsurance}
              onChange={(event) => setHomeInsurance(Number(event.target.value))}
            />
          </label>
        </div>

        <div ref={resultRef} className="result-panel">
          <h2>Your estimated payment</h2>
          <p className="total-payment">{formatMoney(paymentBreakdown.totalMonthlyPayment)} / month</p>

          <dl>
            <div>
              <dt>Principal + Interest</dt>
              <dd>{formatMoney(paymentBreakdown.principalAndInterest)}</dd>
            </div>
            <div>
              <dt>Property Tax</dt>
              <dd>{formatMoney(paymentBreakdown.monthlyTax)}</dd>
            </div>
            <div>
              <dt>Home Insurance</dt>
              <dd>{formatMoney(paymentBreakdown.monthlyInsurance)}</dd>
            </div>
            <div>
              <dt>Loan Amount</dt>
              <dd>{formatMoney(loanAmount)}</dd>
            </div>
            <div>
              <dt>Total Over {paymentBreakdown.totalMonths} Months</dt>
              <dd>{formatMoney(paymentBreakdown.totalCost)}</dd>
            </div>
            <div>
              <dt>Total Debt-to-Income</dt>
              <dd>{paymentBreakdown.debtToIncomeRatio.toFixed(1)}%</dd>
            </div>
            <div>
              <dt>Suggested Housing Cap</dt>
              <dd>{formatMoney(paymentBreakdown.suggestedAffordableCap)}</dd>
            </div>
          </dl>

          <p className={paymentBreakdown.isAffordable ? 'guidance good' : 'guidance caution'}>
            {paymentBreakdown.isAffordable
              ? 'This payment appears affordable for your current income and expense profile.'
              : 'This payment may be high for your current income and expenses. Consider lowering the loan amount, increasing down payment, or extending the term.'}
          </p>

          <small>
            Affordability uses the lower of 28% of income and a 43% debt-to-income target after
            existing expenses.
          </small>
        </div>
      </section>
    </main>
  )
}

export default App
