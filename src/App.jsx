import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import LoginPopup from './Components/LoginPopup';
import Trial from './Components/Trial';
import { selectShouldShowTrial } from './store/slices/subscriptionSlice';
import { setShouldShowTrial } from './store/slices/subscriptionSlice';
import { selectCurrentPage, setCurrentPage } from './store/slices/navigationSlice';
import ChatAi1 from './Pages/ChatAi1';
import InvestAi1 from './Pages/InvestAi1';
import MarketsAi1 from './Pages/MarketsAi1';


const App = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const showTrial = useSelector(selectShouldShowTrial); // Get from Redux

  const handleSetCurrentPage = (page) => {
    dispatch(setCurrentPage(page));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'ChatAi1':
        return <ChatAi1 />;
      case 'InvestAi1':
        return <InvestAi1 />;
      case 'MarketsAi1':
        return <MarketsAi1 />;
      default:
        return <Home onLoginClick={() => setShowLoginPopup(true)} setCurrentPage={handleSetCurrentPage} />;
    }
  };

  return (
    <div className='min-h-screen relative bg-gradient-to-tr from-[#d3edeb] to-[#fcf6ee]'>
      <Navbar setCurrentPage={handleSetCurrentPage} />
      {/* Page Content Container - Responsive height for mobile (60px navbar) and desktop (70px navbar) */}
      <div className='h-[calc(100vh-70px)] overflow-y-auto absolute w-full top-[70px]'>
        {renderPage()}
      </div>
      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
      <Trial isOpen={showTrial} onClose={() => dispatch(setShouldShowTrial(false))} />
    </div>
  );
};

export default App;