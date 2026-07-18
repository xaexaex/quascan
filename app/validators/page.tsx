import { fetchValidators, fetchPeers } from "@/lib/api";
import { ShieldCheck } from "lucide-react";
import BackButton from "@/components/BackButton";
import ValidatorsClient from "./ValidatorsClient";

export default async function ValidatorsPage() {
  const [data, peersData] = await Promise.all([fetchValidators(), fetchPeers()]);

  if (!data) {
    return (
      <div className="page-wrap" style={{ textAlign: "center" }}>
        <h1 className="page-heading" style={{ color: "var(--c-err)" }}>Error loading validators</h1>
        <p className="field-label" style={{ marginTop: 12 }}>Could not connect to the network RPC.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">

      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-heading">Validators</h1>
        </div>
      </div>

      <ValidatorsClient data={data} peersData={peersData} />
    </div>
  );
}
