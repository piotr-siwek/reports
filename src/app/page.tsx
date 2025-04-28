import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4">
      <header className="mb-12 flex flex-col items-center">
        <Image src="/next.svg" alt="Logo" width={80} height={80} className="mb-4 dark:invert" priority />
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight text-center">
          Witaj w aplikacji Raporty
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Prosta aplikacja do zarządzania raportami. Zaloguj się lub załóż konto, aby rozpocząć pracę.
        </p>
      </header>
      <main className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
        <Link href="/login" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          Zaloguj się
        </Link>
        <Link href="/register" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-white hover:bg-gray-100 text-blue-700 font-semibold text-center text-lg border border-blue-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          Zarejestruj się
        </Link>
      </main>
      <footer className="mt-16 text-xs text-gray-400 dark:text-gray-600 text-center">
        &copy; {new Date().getFullYear()} Raporty. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
