export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#00E599] rounded-full flex items-center justify-center">
                <span className="text-black font-bold">Q</span>
              </div>
              <span className="text-xl font-bold text-black">QuantaScan</span>
            </div>
            <p className="text-gray-500 text-sm">
              Quantum-resistant blockchain explorer for the Quanta Network.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Explorer</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Home</a></li>
              <li><a href="/blocks" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Blocks</a></li>
              <li><a href="/mempool" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Mempool</a></li>
              <li><a href="/peers" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Peers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Network</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/xaexaex/quanta" target="_blank" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">GitHub</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Discord</a></li>
              <li><a href="#" className="text-gray-500 hover:text-[#00E599] text-sm transition-colors">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          © 2025 QuantaScan. Built for the post-quantum era.
        </div>
      </div>
    </footer>
  );
}
