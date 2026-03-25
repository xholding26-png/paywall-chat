export default function Home() {
  const profiles = [
    { name: "CryptoViper", handle: "@cryptoviper", price: "2.5 SOL", avatar: "🐍", replies: "94%", avgTime: "12min" },
    { name: "DeFi Sarah", handle: "@defisarah", price: "0.8 SOL", avatar: "💎", replies: "87%", avgTime: "25min" },
    { name: "NFT Chad", handle: "@nftchad", price: "5.0 SOL", avatar: "🦧", replies: "71%", avgTime: "2h" },
    { name: "Alpha Leaks", handle: "@alphaleaks", price: "10 SOL", avatar: "🔮", replies: "99%", avgTime: "5min" },
    { name: "Sol Maxi", handle: "@solmaxi", price: "1.2 SOL", avatar: "☀️", replies: "82%", avgTime: "45min" },
    { name: "Whale Watch", handle: "@whalewatch", price: "3.0 SOL", avatar: "🐋", replies: "90%", avgTime: "18min" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-emerald-500/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Paywall.chat
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://x.com" target="_blank" className="text-gray-400 hover:text-white transition">𝕏</a>
            <button className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-medium transition">
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm mb-6">
            💰 Your attention has value
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Your DMs Have{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              a Price
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Set a price to receive DMs. Get paid for your attention. Ignore spam, reward conversations that matter. Built on Solana.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-semibold text-lg transition shadow-lg shadow-emerald-600/25">
              Set Your Price
            </button>
            <button className="border border-gray-700 hover:border-gray-500 px-8 py-3.5 rounded-xl font-semibold text-lg transition text-gray-300">
              Browse Profiles
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How It <span className="text-emerald-400">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "🏷️", title: "Set Your Price", desc: "Choose how much it costs to DM you. Start at 0.1 SOL or go higher." },
              { step: "02", icon: "📩", title: "Receive DMs", desc: "People pay your price to message you. No more spam." },
              { step: "03", icon: "💬", title: "Reply = Split", desc: "You reply → they get 50% back. You keep 50%. Fair game." },
              { step: "04", icon: "🚫", title: "Ignore = Refund", desc: "You ignore → they get 100% back. No risk for them." },
            ].map((item) => (
              <div key={item.step} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/30 transition group">
                <div className="text-emerald-500/40 font-mono text-sm mb-3">{item.step}</div>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-300 transition">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Top <span className="text-emerald-400">Profiles</span>
          </h2>
          <p className="text-gray-500 text-center mb-12">The most in-demand people on Paywall.chat</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.handle} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-emerald-500/30 transition cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl w-12 h-12 bg-white/[0.05] rounded-full flex items-center justify-center">
                    {p.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold group-hover:text-emerald-300 transition">{p.name}</h3>
                    <p className="text-gray-500 text-sm">{p.handle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-semibold">{p.price} / DM</span>
                  <span className="text-gray-500">{p.replies} reply rate</span>
                </div>
                <div className="mt-3 text-xs text-gray-600">Avg reply: {p.avgTime}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "12,450+", label: "Messages Sent" },
            { value: "890 SOL", label: "Earned by Users" },
            { value: "2,100+", label: "Active Profiles" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-b from-emerald-900/30 to-transparent border border-emerald-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Your Time is Money. Literally.</h2>
            <p className="text-gray-400 mb-8">Stop giving away your attention for free.</p>
            <button className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-semibold text-lg transition shadow-lg shadow-emerald-600/25">
              Create Your Profile
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>💬</span>
            <span className="text-gray-500">Paywall.chat © 2026</span>
          </div>
          <div className="flex gap-6 text-gray-500">
            <a href="https://x.com" className="hover:text-white transition">𝕏</a>
            <a href="#" className="hover:text-white transition">Docs</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
