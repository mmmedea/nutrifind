"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status))
      .catch((err) => {
        console.error("Backend connection error:", err);
        setBackendStatus("Failed to connect");
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">NutriFind</h1>
      <p className="text-lg">Find packaged food information with confidence.</p>
      
      <div className="mt-8 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">System Status</h2>
        <p>Backend API Connection: <strong>{backendStatus}</strong></p>
      </div>
    </div>
  );
}
