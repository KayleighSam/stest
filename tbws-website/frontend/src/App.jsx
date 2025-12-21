import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import History from './pages/History';
import Blog from './pages/Blog';
import PostDetailPage from './pages/PostDetailPage';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import LeagueRules from './pages/LeagueRules';
import Venues from './pages/Venues';
import DraftInfo from './pages/DraftInfo';
import ManagerInfo from './pages/ManagerInfo';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<History />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<PostDetailPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/league-rules" element={<LeagueRules />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/draft-info" element={<DraftInfo />} />
          <Route path="/managers" element={<ManagerInfo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;