function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Overline */}
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-8 font-medium">
            Stop answering the same questions
          </p>
          
          {/* Logo */}
          <h1 className="text-7xl md:text-8xl font-extrabold text-black mb-6 tracking-tight">
            HEALINK
          </h1>
          
          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-gray-700 font-semibold mb-6">
            Your clients heal. You save time.
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            30 days. 7 emails. Zero repetition.
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-12">
            Automatic aftercare that actually educates.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </a>
            <a
              href="#how"
              className="w-full sm:w-auto px-10 py-4 border-2 border-black text-black rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Links */}
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#about" className="hover:text-black transition-colors">
                About
              </a>
              <a href="#contact" className="hover:text-black transition-colors">
                Contact
              </a>
              <a href="#privacy" className="hover:text-black transition-colors">
                Privacy
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © 2024 Healink. Built for tattoo artists.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
