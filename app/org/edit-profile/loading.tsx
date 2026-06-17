export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#111111] md:bg-black">
      <img src="/logo.png" alt="Loading" className="w-16 h-16 object-contain animate-spin-slow brightness-125" />
    </main>
  );
}
