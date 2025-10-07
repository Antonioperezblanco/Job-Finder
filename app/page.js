export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-4">
        Job Finder Portfolio
      </h1>
      <p className="text-xl text-gray-600">
        Se mostrarán el número de empleos de los portales de trabajo basados en tus conocimientos
      </p>
      <a
        href="/upload"
        className="mt-8 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition duration-300">
        Adelante
      </a>
    </div>
  );
}