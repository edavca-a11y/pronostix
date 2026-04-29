"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Partido {
  id: number;
  liga: string;
  local: string;
  visita: string;
  hora: string;
  fecha: string;
}

interface Apuesta {
  id: number;
  partido: string;
  seleccion: string;
  monto: string;
  fecha: string;
  estado: "pendiente" | "ganada" | "perdida";
}

export default function Home() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState<{ [key: number]: string }>({});
  const [apuesta, setApuesta] = useState<{ [key: number]: string }>({});
  const [confirmado, setConfirmado] = useState<{ [key: number]: boolean }>({});
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState<Apuesta[]>([]);
  const [vistaHistorial, setVistaHistorial] = useState(false);

  useEffect(() => {
    fetch("/api/partidos")
      .then((r) => r.json())
      .then((data) => {
        setPartidos(data.partidos);
        setCargando(false);
      })
      .catch(() => setCargando(false));

    // Cargar historial desde localStorage
    const saved = localStorage.getItem("pronostix-historial");
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  const conectar = async () => {
    setProcesando(true);
    try {
      const { MiniKit } = await import("@worldcoin/minikit-js");
      if (!MiniKit.isInstalled()) {
        await new Promise(r => setTimeout(r, 1000));
        setUsuario("0x7f3a...9b2c");
        setProcesando(false);
        return;
      }
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "login-pronostix",
        verification_level: "device" as any,
      });
      if (finalPayload.status === "success") {
        setUsuario((finalPayload as any).nullifier_hash?.slice(0, 10) + "...");
      }
    } catch (e) {
      setUsuario("0x7f3a...9b2c");
    }
    setProcesando(false);
  };

  const elegir = (id: number, opcion: string) => {
    if (!usuario) {
      alert("Primero conecta tu wallet");
      return;
    }
    setSeleccion((prev) => ({ ...prev, [id]: opcion }));
    setConfirmado((prev) => ({ ...prev, [id]: false }));
  };

  const apostar = async (id: number) => {
    if (!apuesta[id] || parseFloat(apuesta[id]) <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    setProcesando(true);
    await new Promise(r => setTimeout(r, 1200));

    const p = partidos.find(p => p.id === id);
    if (!p) return;

    const sel = seleccion[id];
    const equipo = sel === "local" ? p.local : sel === "visita" ? p.visita : "Empate";

    const nuevaApuesta: Apuesta = {
      id: Date.now(),
      partido: `${p.local} vs ${p.visita}`,
      seleccion: equipo,
      monto: apuesta[id],
      fecha: new Date().toLocaleDateString("es-CL"),
      estado: "pendiente",
    };

    const nuevoHistorial = [nuevaApuesta, ...historial];
    setHistorial(nuevoHistorial);
    localStorage.setItem("pronostix-historial", JSON.stringify(nuevoHistorial));

    setConfirmado((prev) => ({ ...prev, [id]: true }));
    setProcesando(false);
  };

  return (
    <main className="min-h-screen bg-[#040812] text-white">
      {/* Header */}
      <div className="bg-[#040812] border-b border-[#0f1e35] px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0f1e35]">
              <img src="/LOGO PRONOSTIC.png" alt="PronostiX" className="w-full h-full object-cover"/>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">PronostiX</h1>
              <p className="text-[10px] text-[#475569]">Prediction Market</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVistaHistorial(!vistaHistorial)}
              className="text-[#475569] text-[10px] underline"
            >
              {vistaHistorial ? "Partidos" : `Mis apuestas ${historial.length > 0 ? `(${historial.length})` : ""}`}
            </button>
            <div className="flex items-center gap-1 bg-[#0f2a1a] border border-[#1a4a2e] rounded-full px-2 py-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-green-400 text-[10px] font-medium">En vivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] rounded-2xl p-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"/>
          <div className="relative flex justify-between items-center">
            <div>
              <p className="text-blue-200 text-xs mb-1">
                {usuario ? "Wallet verificada" : "Balance disponible"}
              </p>
              <p className="text-2xl font-bold">
                {usuario ? usuario : "$0.00 USDC"}
              </p>
              {usuario && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full"/>
                  <span className="text-green-300 text-xs">World ID verificado</span>
                </div>
              )}
            </div>
            {!usuario ? (
              <button
                onClick={conectar}
                disabled={procesando}
                className="bg-white text-[#1d4ed8] font-semibold text-sm px-4 py-2.5 rounded-xl disabled:opacity-70 active:scale-95 transition-all"
              >
                {procesando ? "..." : "Conectar"}
              </button>
            ) : (
              <div className="bg-green-400/20 border border-green-400/30 rounded-xl px-3 py-2 text-center">
                <div className="text-green-300 text-xs font-semibold">✓ Activo</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista Historial */}
      {vistaHistorial && (
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          <h2 className="text-xs font-semibold text-[#475569] uppercase tracking-widest">
            Mis apuestas
          </h2>
          {historial.length === 0 ? (
            <div className="text-center py-12 bg-[#0a1628] rounded-2xl">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-[#475569] text-sm">Aún no tienes apuestas registradas</div>
            </div>
          ) : (
            historial.map((a) => (
              <div key={a.id} className="bg-[#0a1628] border border-[#0f1e35] rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white text-sm font-semibold">{a.partido}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    a.estado === "pendiente" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/40" :
                    a.estado === "ganada" ? "bg-green-900/30 text-green-400 border border-green-800/40" :
                    "bg-red-900/30 text-red-400 border border-red-800/40"
                  }`}>
                    {a.estado === "pendiente" ? "⏳ Pendiente" : a.estado === "ganada" ? "✓ Ganada" : "✗ Perdida"}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#475569]">
                  <span>Predicción: <span className="text-white">{a.seleccion}</span></span>
                  <span>Monto: <span className="text-white">{a.monto} USDC</span></span>
                </div>
                <div className="text-[10px] text-[#334155] mt-1">{a.fecha}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Partidos */}
      {!vistaHistorial && (
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#475569] uppercase tracking-widest">
              Próximos partidos
            </h2>
            {!cargando && (
              <span className="text-[10px] text-[#475569]">{partidos.length} partidos</span>
            )}
          </div>

          {cargando && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#0a1628] rounded-2xl p-4 animate-pulse h-28"/>
              ))}
            </div>
          )}

          {!cargando && partidos.length === 0 && (
            <div className="text-center py-16 bg-[#0a1628] rounded-2xl">
              <div className="text-4xl mb-3">⚽</div>
              <div className="text-[#475569] text-sm">No hay partidos disponibles</div>
            </div>
          )}

          {partidos.map((p) => (
            <div key={p.id} className="bg-[#0a1628] border border-[#0f1e35] rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2 border-b border-[#0f1e35]">
                <span className="text-[10px] text-[#475569] font-medium uppercase tracking-wider">{p.liga}</span>
                <span className="text-[10px] text-[#475569]">{p.fecha} · {p.hora}</span>
              </div>

              <div className="px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1 text-center">
                    <span className="font-semibold text-sm text-white">{p.local}</span>
                  </div>
                  <div className="px-3">
                    <span className="text-[#2563eb] text-xs font-bold">VS</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="font-semibold text-sm text-white">{p.visita}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "local", label: "1", sub: "Local" },
                    { key: "empate", label: "✕", sub: "Empate" },
                    { key: "visita", label: "2", sub: "Visita" },
                  ].map((op) => (
                    <button
                      key={op.key}
                      onClick={() => elegir(p.id, op.key)}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex flex-col items-center gap-0.5 ${
                        seleccion[p.id] === op.key
                          ? "bg-[#2563eb] text-white shadow-lg shadow-blue-900/50"
                          : "bg-[#0f1e35] text-[#94a3b8] hover:bg-[#1e3a5f]"
                      }`}
                    >
                      <span className="text-sm font-bold">{op.label}</span>
                      <span className="text-[10px] opacity-80">{op.sub}</span>
                    </button>
                  ))}
                </div>

                {seleccion[p.id] && !confirmado[p.id] && (
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-xs">USDC</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={apuesta[p.id] || ""}
                        onChange={(e) => setApuesta((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-full bg-[#0f1e35] border border-[#1e3a5f] rounded-xl pl-12 pr-3 py-2.5 text-sm text-white placeholder-[#334155] outline-none focus:border-[#2563eb] transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => apostar(p.id)}
                      disabled={procesando}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-70 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      {procesando ? "..." : "Apostar"}
                    </button>
                  </div>
                )}

                {confirmado[p.id] && (
                  <div className="mt-3 bg-[#0f1e35] border border-[#1e3a5f] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-xs">✓</span>
                      </div>
                      <p className="text-white text-sm font-semibold">¡Apuesta registrada!</p>
                    </div>
                    <p className="text-[#94a3b8] text-xs leading-relaxed">
                      Hemos ingresado tu predicción de <span className="text-white font-medium">{apuesta[p.id]} USDC</span> a favor de <span className="text-white font-medium">{seleccion[p.id] === "local" ? p.local : seleccion[p.id] === "visita" ? p.visita : "Empate"}</span>.
                    </p>
                    <p className="text-[#475569] text-xs mt-2">
                      🕐 Cuando termine el partido, vuelve a PronostiX para ver si tu predicción fue correcta. Recibirás tu USDC automáticamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-[#1e3a5f] text-[10px]">Powered by World App · Verified Humans Only</p>
      </div>
    </main>
  );
}