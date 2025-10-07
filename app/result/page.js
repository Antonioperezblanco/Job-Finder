'use client'

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResultPage() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error: No hay datos de análisis</h1>
                    <Link href="/upload-cv" className="text-blue-600 mt-4 inline-block">
                        Volver a subir CV
                    </Link>
                </div>
            </div>
        );
    }

    const resultData = JSON.parse(decodeURIComponent(dataParam));

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Resultados del Análisis</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow border">
                        <h3 className="font-semibold text-gray-700 mb-2">Palabras totales</h3>
                        <p className="text-3xl font-bold text-indigo-600">{resultData.wordCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border">
                        <h3 className="font-semibold text-gray-700 mb-2">Habilidades encontradas</h3>
                        <p className="text-3xl font-bold text-green-600">{resultData.totalFound}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {Object.keys(resultData.keywords).map(category => (
                        resultData.keywords[category].length > 0 && (
                            <div key={category} className="bg-white p-6 rounded-xl shadow border">
                                <h3 className="font-semibold text-gray-800 mb-4 capitalize">
                                    {category.replace(/([A-Z])/g, ' $1')} 
                                    <span className="ml-2 text-gray-600 px-2 py-1 rounded">
                                        {resultData.keywords[category].length}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {resultData.keywords[category].map((keyword, index) => (
                                        <span 
                                            key={index}
                                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>

                <div className="flex justify-center space-x-4">
                    <Link 
                        href="/upload"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition duration-200">
                        Analizar Otro CV
                    </Link>
                    <Link 
                        href={{
                            pathname: "/portal",
                            query: { data: encodeURIComponent(JSON.stringify(resultData)) }
                        }}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition duration-200 border">
                        Ver plataformas de empleo
                    </Link>
                </div>
            </div>
        </div>
    );
}