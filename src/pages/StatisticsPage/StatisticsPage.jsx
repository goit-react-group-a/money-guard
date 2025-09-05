import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/auth/selectors';
import { selectTotalBalance } from '../../redux/transactions/selectors';
import Header from '../../components/Header/Header';
import Navigation from '../../components/Navigation/Navigation';
import Currency from '../../components/Currency/Currency';
import StatisticsDashboard from '../../components/StatisticsDashboard/StatisticsDashboard';
import styles from './StatisticsPage.module.css';
import ellipse14 from '../../assets/Ellipse14.svg';
import ellipse16 from '../../assets/Ellipse16.svg';
import ellipse18 from '../../assets/Ellipse18.svg';
import ellipse19 from '../../assets/Ellipse19.svg';
import ellipse20 from '../../assets/Ellipse20.svg';

const StatisticsPage = () => {
  const _user = useSelector(selectUser);
  const totalBalance = useSelector(selectTotalBalance);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.statisticsPage}>
      <img src={ellipse14} alt="" className={styles.ellipse14} />
      <img src={ellipse16} alt="" className={styles.ellipse16} />
      <img src={ellipse18} alt="" className={styles.ellipse18} />
      <img src={ellipse19} alt="" className={styles.ellipse19} />
      <img src={ellipse20} alt="" className={styles.ellipse20} />
      
      <Header />
      
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <Navigation />
          
          <div className={styles.balanceSection}>
            <h3 className={styles.balanceTitle}>YOUR BALANCE</h3>
            <div className={styles.balanceAmount}>₴ {totalBalance}</div>
          </div>
          
          {/* Currency yalnızca desktop */}
          {isDesktop && <Currency />}
        </aside>
        
        <main className={styles.mainContent}>
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Statistics</h1>
            <StatisticsDashboard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StatisticsPage;
