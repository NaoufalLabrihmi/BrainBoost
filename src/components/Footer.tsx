import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 border-t-2 border-cyan-400/30 backdrop-blur-2xl py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-6 mt-12 shadow-cyan-glow">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-['Orbitron',_sans-serif] drop-shadow-cyan-glow">Brain Boost</span>
        <span className="text-cyan-200 text-lg font-semibold">|</span>
        <span className="text-cyan-100 text-base font-medium">Gamify your learning journey</span>
            </div>
      <div className="flex items-center gap-5">
        <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Twitter"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 12 9.482c0 .352.04.695.116 1.022C8.728 10.36 5.7 8.7 3.671 6.149a4.48 4.48 0 0 0-.607 2.256c0 1.557.793 2.933 2.002 3.74a4.48 4.48 0 0 1-2.03-.561v.057a4.48 4.48 0 0 0 3.6 4.393 4.48 4.48 0 0 1-2.025.077 4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.07a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.94 8.94 0 0 1-2.58.708z" fill="currentColor"/></svg></a>
        <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Instagram"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg></a>
        <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Discord"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.2a.112.112 0 0 0-.12.056c-.523.927-1.104 2.13-1.513 3.084a18.36 18.36 0 0 0-5.504 0c-.41-.954-.99-2.157-1.513-3.084a.112.112 0 0 0-.12-.056A19.791 19.791 0 0 0 3.683 4.369a.105.105 0 0 0-.047.043C1.605 7.362.322 10.274.076 13.246a.115.115 0 0 0 .042.09c2.104 1.547 4.144 2.488 6.163 3.11a.112.112 0 0 0 .123-.042c.474-.65.895-1.34 1.255-2.066a.112.112 0 0 0-.062-.155c-.672-.254-1.31-.563-1.917-.927a.112.112 0 0 1-.011-.186c.129-.098.258-.197.382-.297a.112.112 0 0 1 .114-.013c4.016 1.84 8.36 1.84 12.344 0a.112.112 0 0 1 .115.012c.124.1.253.199.382.297a.112.112 0 0 1-.011.186c-.607.364-1.245.673-1.917.927a.112.112 0 0 0-.062.155c.36.726.78 1.416 1.255 2.066a.112.112 0 0 0 .123.042c2.02-.622 4.06-1.563 6.163-3.11a.115.115 0 0 0 .042-.09c-.246-2.972-1.529-5.884-3.56-8.834a.105.105 0 0 0-.047-.043zM8.02 15.331c-1.01 0-1.84-.924-1.84-2.06 0-1.137.818-2.06 1.84-2.06 1.025 0 1.85.93 1.84 2.06 0 1.136-.818 2.06-1.84 2.06zm7.96 0c-1.01 0-1.84-.924-1.84-2.06 0-1.137.818-2.06 1.84-2.06 1.025 0 1.85.93 1.84 2.06 0 1.136-.818 2.06-1.84 2.06z" fill="currentColor"/></svg></a>
      </div>
      <div className="text-cyan-400 text-xs mt-2 md:mt-0">© {currentYear} Brain Boost. All rights reserved.</div>
    </footer>
  );
}
