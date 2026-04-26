"use client";

import { useState } from "react";

const partidos = [
  { id: 1, liga: "🇨🇱 Primera División", local: "Colo-Colo", visita: "U. de Chile", hora: "20:00" },
  { id: 2, liga: "🇦🇷 Liga Profesional", local: "Boca Juniors", visita: "River Plate", hora: "21:30" },
  { id: 3, liga: "🇪🇸 La Liga", local: "Real Madrid", visita: "Barcelona", hora: "16:00" },
  { id: 4, liga: "🇧🇷 Brasileirao", local: "Flamengo", visita: "Palmeiras", hora: "19:00" },
];

export default function Home() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<{ [key: number]: string }>({});
  const [apuesta, setApuesta] = useState<{ [key: number]: string }>({});

  const conectar = () => {
    alert("Conecta tu wallet desde World App");
    setUsuario("0x1234...abcd");
  };

  const elegir = (id: number, opcion: string) => {
    if (!usuario) {
      alert("Primero conecta tu wallet");
      return;
    }
    setSeleccion((prev) => ({ ...prev, [id]: opcion }));
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">⚽ PronostiX</h1>
            <p className="text-xs text-gray-400">Mercado de predicciones</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
            <span className="text-green-400 text-xs font-medium">● En vivo</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-blue-200 text-xs mb-1">{usuario ? "Wallet conectada" : "Tu balance"}</p>
            <p className="text-lg font-bold">{usuario ? usuario : "$0.00 USDC"}</p>
          </div>
          {!usuario ? (
            <button onClick={conectar} className="bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl">
              Conectar
            </button>
          ) : (
            <div className="bg-green-400/20 border border-green-400/40 rounded-full px-3 py-1">
              <span className="text-green-300 text-xs">✓ Verificado</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Partidos de hoy</h2>

        {partidos.map((p) => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-400">{p.liga}</span>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{p.hora} hs</span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-sm text-center w-28">{p.local}</span>
              <span className="text-gray-500 text-xs">VS</span>
              <span className="font-semibold text-sm text-center w-28">{p.visita}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {["local", "empate", "visita"].map((op) => (
                <button
                  key={op}
                  onClick={() => elegir(p.id, op)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    seleccion[p.id] === op ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {op === "local" ? "1 Local" : op === "empate" ? "X Empate" : "2 Visita"}
                </button>
              ))}
            </div>

            {seleccion[p.id] && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Monto USDC"
                  value={apuesta[p.id] || ""}
                  onChange={(e) => setApuesta((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                  Apostar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}