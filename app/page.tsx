import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import RecentBlocks from "@/components/RecentBlocks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            Quanta Network
            <br />
            <span className="text-[#00E599]">Explorer</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12">
            Real-time blockchain explorer for the quantum-resistant Quanta network.
            <br className="hidden md:block" />
            View blocks, transactions, and network statistics.
          </p>
        </div>
      </section>

      {/* Network Stats */}
      <div className="container mx-auto">
        <StatsBar />
      </div>

      {/* Recent Blocks */}
      <div className="container mx-auto">
        <RecentBlocks />
      </div>

      <Footer />
    </main>
  );
}
