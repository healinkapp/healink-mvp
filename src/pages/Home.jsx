import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import * as React from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll setup
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Skip to content - Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Healink</h1>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-gray-700 hover:text-black transition font-medium"
            >
              How It Works
            </a>
            <a
              href="#science"
              className="text-sm text-gray-700 hover:text-black transition font-medium"
            >
              Science
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-700 hover:text-black transition font-medium"
            >
              Pricing
            </a>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-700 hover:text-black transition font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg font-semibold hover:bg-gray-800 active:scale-95 active:opacity-80 transition"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Fullscreen */}
        <div
          className={`fixed inset-0 backdrop-blur-sm bg-white/95 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header com Close Button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-black">Healink</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-black transition"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>

            {/* Menu Items - Centralized and Large */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-sm text-center px-6 py-3 text-lg text-gray-700 hover:bg-gray-50 active:scale-95 active:opacity-80 rounded-xl transition font-medium"
              >
                How It Works
              </a>
              <a
                href="#science"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-sm text-center px-6 py-3 text-lg text-gray-700 hover:bg-gray-50 active:scale-95 active:opacity-80 rounded-xl transition font-medium"
              >
                Science
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-sm text-center px-6 py-3 text-lg text-gray-700 hover:bg-gray-50 active:scale-95 active:opacity-80 rounded-xl transition font-medium"
              >
                Pricing
              </a>
              
              <div className="w-full max-w-sm border-t border-gray-200 my-4"></div>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full max-w-sm text-center px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 active:scale-95 active:opacity-80 rounded-xl transition font-medium border-2 border-gray-200"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full max-w-sm text-center px-6 py-4 text-lg bg-black text-white rounded-xl font-semibold hover:bg-gray-800 active:scale-95 active:opacity-80 transition"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="max-w-3xl">
          
          {/* Problem Statement (Scientific Hook) */}
          <div className="inline-block px-4 py-2 bg-orange-50 border border-orange-200 rounded-full mb-6">
            <p className="text-sm font-medium text-orange-700">
              30% of tattoos lose color due to improper aftercare in the first 7 days
            </p>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
            Your tattoo is healing.<br/>
            <span className="text-gray-600">Know what's happening.</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Your body goes through 3 distinct healing phases over 30 days. 
            Each phase needs different care. We explain the science behind what's 
            happening to your skin—so you know exactly what to do, and why.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 active:scale-95 active:opacity-80 transition text-base sm:text-lg"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 active:scale-95 active:opacity-80 transition text-base sm:text-lg"
            >
              I'm a Client
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            For tattoo artists. Free for your first 10 clients.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Science-backed aftercare, automated
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your clients get educational emails at the exact moments that matter most—
              based on the actual biology of wound healing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                Add Your Client
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Upload their fresh tattoo photo. We automatically start them at Day 0 
                and create their healing timeline.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                They Get Educated
              </h3>
              <p className="text-gray-600 leading-relaxed">
                10 emails over 30 days. Each one explains what's happening in their skin 
                that day—and what to do about it.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                Better Outcomes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Proper care = better color retention. Better healing = happier clients. 
                Happier clients = better reviews.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Why It Matters (Science Section) */}
      <section id="science" className="py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">
                Why most tattoos don't heal perfectly
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-1">
                    <span className="text-red-600 text-lg">✕</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Days 0-3: Thick scabs form</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      When plasma dries on your skin, it creates thick scabs. These pull out 
                      ink when they fall off—causing patchy color.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-1">
                    <span className="text-red-600 text-lg">✕</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Days 10-14: Picking happens</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Peak itching phase. Most people scratch or pick without realizing—
                      damaging the fresh skin layer underneath.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-1">
                    <span className="text-red-600 text-lg">✕</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Days 21-30: Premature sun exposure</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Surface looks healed, but deep tissue is still rebuilding. UV damage now 
                      causes permanent fading.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-black mb-6">
                We solve this with timing
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Day 1:</strong> First wash technique to prevent thick scabs
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Day 10:</strong> Itching management strategies (right when it peaks)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Day 21:</strong> Sun protection reminder (before they think it's healed)
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  Every email is timed to the actual biology of skin regeneration—
                  not random days on a calendar.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* For Artists Section */}
      <section id="pricing" className="bg-black text-white py-20 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Built for tattoo artists who care
          </h2>
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            You put hours into each piece. Don't let poor aftercare ruin your work. 
            Give your clients the knowledge they need—automatically.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            <div>
              <Clock className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold mb-2">Save Time</h4>
              <p className="text-sm text-gray-400">
                Stop answering the same aftercare questions over DM
              </p>
            </div>
            <div>
              <Shield className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold mb-2">Protect Your Work</h4>
              <p className="text-sm text-gray-400">
                Better healing = your art looks better long-term
              </p>
            </div>
            <div>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold mb-2">Better Reviews</h4>
              <p className="text-sm text-gray-400">
                Happy, educated clients leave 5-star reviews
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 active:scale-95 active:opacity-80 transition text-base sm:text-lg inline-flex items-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required. First 10 clients free.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2026 Healink. Science-backed tattoo aftercare.
          </p>
        </div>
      </footer>
    </div>
  );
}