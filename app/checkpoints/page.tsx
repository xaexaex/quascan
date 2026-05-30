import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "BFT Checkpoints | Process Sync | Quascan",
  description: "View BFT consensus checkpoints committed on the Quanta network.",
};

export default function CheckpointsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16 pt-24 transition-colors duration-300">
      
      {/* Page Header - Just the BFT Consensus Checkpoints Title */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary font-sans uppercase">
            BFT Consensus Checkpoints
          </h1>
        </div>
      </div>

    </div>
  );
}
