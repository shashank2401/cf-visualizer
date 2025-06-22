import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import Footer from './components/ui/Footer';
import Navbar from './components/ui/Navbar';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <BrowserRouter>
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </BrowserRouter>
      <Analytics />
    </div>
  );
}

export default App;