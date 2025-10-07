'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function JobPortalsPage() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get('data');
    const [jobData, setJobData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [scrapingProgress, setScrapingProgress] = useState(0);

    useEffect(() => {
        let analysisData = dataParam || localStorage.getItem('cvAnalysisData');
        
        if (!analysisData) {
            setLoading(false);
            setError('No hay datos de análisis disponibles');
            return;
        }

        try {
            const parsedData = JSON.parse(decodeURIComponent(analysisData));
            setResultData(parsedData);
            scrapeJobPortals(parsedData);
        } catch (err) {
            console.error('Error processing data:', err);
            setError('Error al procesar los datos del CV');
            setLoading(false);
        }
    }, [dataParam]);

    const scrapeJobPortals = async (analysisData) => {
        try {
            setLoading(true);
            setError(null);
            setScrapingProgress(0);
            
            const allSkills = Object.values(analysisData.keywords).flat();

            const progressInterval = setInterval(() => {
                setScrapingProgress(prev => Math.min(prev + 17, 99));
            }, 500);

            const response = await fetch('/api/scrape/all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ skills: allSkills })
            });
            
            clearInterval(progressInterval);
            setScrapingProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el scraping');
            }
            
            const portals = await response.json();
            setJobData(portals);
            
        } catch (err) {
            console.error('Error scraping job portals:', err);
            setError(`Error al obtener datos: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-indigo-600 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Escaneando Portales de Empleo</h2>
                    <p className="text-gray-600 mb-4">Obteniendo datos en tiempo real...</p>
                    <div className="w-80 bg-gray-200 rounded-full h-3 mx-auto mb-2">
                        <div 
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${scrapingProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">{scrapingProgress}% completado</p>
                </div>
            </div>
        );
    }

    if (error || !resultData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😞</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-6">{error || 'No hay datos de análisis disponibles'}</p>
                    <div className="space-y-3">
                        <Link 
                            href="/upload" 
                            className="block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                        >
                            Analizar CV
                        </Link>
                        <button 
                            onClick={() => resultData && scrapeJobPortals(resultData)}
                            className="block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 w-full"
                        >
                            Reintentar Scraping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const skills = Object.values(resultData.keywords).flat();
    const totalJobs = jobData.reduce((sum, portal) => sum + (portal.jobs || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Empleos en Tiempo Real
                    </h1>
                    <p className="text-gray-600 text-lg mb-6">
                        Datos actualizados de portales de empleo
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {skills.slice(0, 8).map((skill, index) => (
                            <span 
                                key={index}
                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    {jobData.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 inline-block">
                            <div className="flex items-center justify-center space-x-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-700">{totalJobs.toLocaleString()}</p>
                                    <p className="text-green-600 font-semibold">Empleos Encontrados</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-700">{jobData.length}</p>
                                    <p className="text-blue-600 font-semibold">Portales Escaneados</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {jobData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {jobData.map((portal, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-xl">{portal.name}</h3>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-6 min-h-12">{portal.description}</p>
                                
                                <div className="text-center mb-6">
                                    <p className="text-4xl font-bold text-indigo-600">{portal.jobs?.toLocaleString() || 0}</p>
                                    <p className="text-sm text-gray-500 mt-1">Empleos Disponibles</p>
                                </div>
                                
                                <a 
                                    href={portal.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-full bg-indigo-600 text-white text-center px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition duration-200 text-lg">
                                    Ver Empleos ›
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">😴</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">No se encontraron datos</h2>
                        <p className="text-gray-600 mb-6">El escaneo no devolvió resultados</p>
                        <button 
                            onClick={() => scrapeJobPortals(resultData)}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 text-lg"
                        >
                            Reintentar Scraping
                        </button>
                    </div>
                )}

                <div className="flex justify-center space-x-6">
                    <Link 
                        href={`/result?data=${encodeURIComponent(JSON.stringify(resultData))}`}
                        className="bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
                    >
                        ← Volver a Resultados
                    </Link>
                    <Link 
                        href="/upload"
                        className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                    >
                        Analizar Otro CV
                    </Link>
                </div>
            </div>
        </div>
    );
}