import { Routes, Route, Navigate } from 'react-router-dom';
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

// Admin Components
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminGallery from './pages/admin/Gallery';
import Posts from './pages/admin/Posts';
import PostEditor from './pages/admin/PostEditor';
import Categories from './pages/admin/Categories';
import ContactMessages from './pages/admin/ContactMessages';
import AdminEvents from './pages/admin/AdminEvents';
import Newsletter from './pages/admin/Newsletter';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Admin Settings & Pages
import SiteSettings from './pages/admin/Settings/SiteSettings';
import CoreValues from './pages/admin/Settings/CoreValues';
import Team from './pages/admin/Settings/Team';
import FAQs from './pages/admin/Settings/FAQs';
import HistoryTimeline from './pages/admin/Settings/HistoryTimeline';
import Sponsors from './pages/admin/Settings/Sponsors';
import LeagueRulesAdmin from './pages/admin/Settings/LeagueRules';
import VenuesAdmin from './pages/admin/Settings/Venues';
import DraftInfoAdmin from './pages/admin/Settings/DraftInfo';
import ManagerInfoAdmin from './pages/admin/Settings/ManagerInfo';
import Pages from './pages/admin/Settings/Pages';

// User Management
import Settings from './pages/admin/Settings/Settings';
import Players from './pages/admin/Players';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes with Navbar/Footer */}
        <Route
          path="/*"
          element={
            <>
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
            </>
          }
        />

        {/* Admin Routes without Navbar/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Content Management */}
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/create" element={<PostEditor />} />
          <Route path="posts/edit/:slug" element={<PostEditor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="messages" element={<ContactMessages />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="newsletter" element={<Newsletter />} />
          
          {/* Pages & Settings */}
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="pages" element={<Pages />} />
          <Route path="core-values" element={<CoreValues />} />
          <Route path="team" element={<Team />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="history" element={<HistoryTimeline />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="league-rules" element={<LeagueRulesAdmin />} />
          <Route path="venues" element={<VenuesAdmin />} />
          <Route path="draft-info" element={<DraftInfoAdmin />} />
          <Route path="manager-info" element={<ManagerInfoAdmin />} />
          
          {/* User Management */}
          <Route path="settings" element={<Settings />} />
          <Route path="players" element={<Players />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;