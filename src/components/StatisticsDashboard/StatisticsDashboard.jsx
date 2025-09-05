import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectTransactions,
  selectTransactionCategories,
} from "../../redux/transactions/selectors";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./StatisticsDashboard.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatisticsDashboard = () => {
  const transactions = useSelector(selectTransactions);
  const categories = useSelector(selectTransactionCategories);

  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const months = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    []
  );

  const years = useMemo(() => ["2020", "2021", "2022", "2023", "2024", "2025"], []);

  const getCategoryName = (categoryId) => {
    if (!categories || !categoryId) return "Unknown";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const monthIndex = months.indexOf(selectedMonth);
    const year = parseInt(selectedYear);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      return transactionDate.getMonth() === monthIndex &&
             transactionDate.getFullYear() === year;
    });
  }, [transactions, selectedMonth, selectedYear, months]);

  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter(tx => tx.type === "EXPENSE");
  }, [filteredTransactions]);

  const statistics = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryExpenses: {},
        chartData: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 2, hoverOffset: 4 }] }
      };
    }

    const categoryMap = {};
    categories?.forEach(cat => categoryMap[cat.id] = cat.name);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenses = {};

    filteredTransactions.forEach(tx => {
      if (tx.type === "INCOME") totalIncome += Math.abs(tx.amount);
      else if (tx.type === "EXPENSE") {
        totalExpense += Math.abs(tx.amount);
        const categoryName = categoryMap[tx.categoryId] || "Other expenses";
        categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + Math.abs(tx.amount);
      }
    });

    const balance = totalIncome - totalExpense;
    const labels = Object.keys(categoryExpenses);
    const data = Object.values(categoryExpenses);
    const colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#FF6384","#C9CBCF"];
    const chartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(c => c + "80"),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };

    return { totalIncome, totalExpense, balance, categoryExpenses, chartData };
  }, [filteredTransactions, categories]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a,b)=>a+b,0);
            const percentage = ((value/total)*100).toFixed(1);
            return `${label}: ₹${value.toLocaleString("en-IN")} (${percentage}%)`;
          }
        }
      }
    },
    cutout: "60%",
  };

  return (
    <div className={styles.statisticsDashboard}>
      <div className={styles.dashboardContent}>
        <div className={styles.chartSection}>
          <div className={styles.chartContainer}>
            <Doughnut data={statistics.chartData} options={chartOptions} />
            <div className={styles.chartCenter}>
              <div className={styles.balanceText}>
                ₴ {statistics.balance}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.expenseDetailsSection}>
          <div className={styles.dashboardHeader}>
            <div className={styles.filters}>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={styles.monthFilter}>
                {months.map(month => <option key={month} value={month}>{month}</option>)}
              </select>

              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={styles.yearFilter}>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>

          {expenseTransactions.length > 0 ? (
            <div className={styles.transactionsTable}>
              <div className={styles.tableHeader}>
                <span>Category</span>
                {!isMobile && <span>Comment</span>}
                <span>{isMobile ? "SUM" : "Amount"}</span>
              </div>

              {expenseTransactions.map(tx => {
                const categoryName = getCategoryName(tx.categoryId);
                const categoryIndex = Object.keys(statistics.categoryExpenses).indexOf(categoryName);
                const categoryColor = statistics.chartData.datasets[0].backgroundColor[categoryIndex] || "#C9CBCF";

                return (
                  <div key={tx.id} className={styles.tableRow}>
                    <span className={styles.category}>
                      <div className={styles.categoryColorBox} style={{ backgroundColor: categoryColor }} />
                      {categoryName}
                    </span>
                    {!isMobile && <span className={styles.comment}>{tx.comment}</span>}
                    <span className={`${styles.amount} ${styles.expense}`}>
                      ₴ {Math.abs(tx.amount).toLocaleString("en-IN",{ minimumFractionDigits:0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noTransactions}>
              <p>No expenses found for {selectedMonth} {selectedYear}</p>
            </div>
          )}

          <div className={styles.summaryTotals}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Expenses:</span>
              <span className={styles.summaryValue}>₴ {statistics.totalExpense.toLocaleString("en-IN",{ minimumFractionDigits:0 })}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Income:</span>
              <span className={`${styles.summaryValue} ${styles.income}`}>₴ {statistics.totalIncome.toLocaleString("en-IN",{ minimumFractionDigits:0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
