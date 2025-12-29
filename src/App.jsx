import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Products from './components/Products';
import Calendar from './components/Calendar';
import Footer from './components/Footer';
import StarBackground from './components/StarBackground';
// Importing images for global state
import light1 from './assets/product_images/light.png';
import light2 from './assets/product_images/light2.png';
import light3 from './assets/product_images/light3.png';
import light4 from './assets/product_images/light4.png';
import light5 from './assets/product_images/light5.png';
import light6 from './assets/product_images/light6.png';
import light7 from './assets/product_images/light7.png';
import light8 from './assets/product_images/light8.png';
import light9 from './assets/product_images/light9.png';
import light10 from './assets/product_images/light10.png';

function App() {
  /* 
  // Initial Mock Data (Commented out as we are now using Firebase)
  const [orders, setOrders] = useState([...]);
  const [products, setProducts] = useState([...]);
  */

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Firebase Realtime Listeners
  useEffect(() => {
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    }, (error) => {
      console.error("Error fetching orders:", error);
    });

    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    }, (error) => {
      console.error("Error fetching products:", error);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <div className={isDarkMode ? 'dark-mode' : ''} style={{ ...styles.appContainer, backgroundColor: 'transparent', color: 'var(--text-main)', position: 'relative' }}>
        <StarBackground />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
          <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard orders={orders} />} />
              <Route path="/customers" element={<Customers orders={orders} />} />
              <Route path="/orders" element={<Orders orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} />} />
              <Route path="/products" element={<Products products={products} setProducts={setProducts} />} />
              <Route path="/calendar" element={<Calendar orders={orders} />} />
              {/* Add other routes as needed */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
};

export default App;
