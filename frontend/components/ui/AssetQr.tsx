"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";
import type { Equipment } from "@/lib/types";

export default function AssetQr({ asset, size = 72 }: { asset: Equipment; size?: number }) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const payload = JSON.stringify({
      id: asset.id, name: asset.name, category: asset.category,
      location: asset.location, warranty: asset.warranty,
      amc: asset.amc, nextService: asset.nextService,
    });
    QRCode.toDataURL(payload, { width: size * 3, margin: 1, errorCorrectionLevel: "M" })
      .then(setQr)
      .catch(() => setQr(""));
  }, [asset, size]);

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size + 14 }}>
      {qr ? (
        <img src={qr} alt={`QR code for ${asset.id}`} width={size} height={size}
          className="rounded border border-slate-200 bg-white p-1" />
      ) : (
        <div className="flex items-center justify-center rounded border border-slate-200 bg-slate-50" style={{ width: size, height: size }}>
          <QrCode size={size * 0.45} className="text-slate-400" />
        </div>
      )}
      <span className="text-[9px] text-slate-400 font-mono text-center leading-tight break-all max-w-full">{asset.id}</span>
    </div>
  );
}
