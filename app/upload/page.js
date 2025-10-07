'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const acceptedFormats = '.pdf,.doc,.docx';

const KEYWORDS = {
    Programacion: [
        'javascript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'swift', 'kotlin', 'golang', 'rust',
        'typescript', 'html', 'css', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'redis'
    ],
    frameworks: [
        'react', 'angular', 'vue', 'node.js', 'nodejs', 'node', 'express', 'django', 'flask', 'spring', 'springboot', 'spring boot', 'laravel', 
        'rails', 'asp.net', 'next.js', 'nuxt.js', 'svelte', 'jquery', 'bootstrap', 'tailwind'
    ],
    Herramientas: [
        'git',, 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'webpack', 'vite',
        'figma', 'photoshop', 'illustrator', 'jira', 'trello', 'slack', 'postman', 'swagger'
    ],
    methodologies: [
        'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd', 'pair programming'
    ],
    languages: [
        'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese'
    ],
    softSkills: [
        'leadership', 'teamwork', 'communication', 'problem solving', 'critical thinking', 
        'adaptability', 'creativity', 'time management', 'collaboration'
    ]
};
const SHORT_KEYWORDS = {
    'c': [' c ', ' c,', ' c.', ' c#', ' c++', '(c ', ' c ', ' c/', ' c\\' ],
    'go': [' go ', ' go,', ' go.', ' golang ', '(go ', ' go/', ' go\\' ]
};

export default function UploadCvPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null); 
    };

    const analyzeKeywords = (text) => {
        const lowerText = text.toLowerCase();
        const cleanText = ` ${lowerText.replace(/[^\w\s#+]/g, ' ')} `;
        const foundKeywords = {};
        
        Object.keys(KEYWORDS).forEach(category => {
            foundKeywords[category] = KEYWORDS[category].filter(keyword => {
                const searchPattern = new RegExp(`\\b${keyword.replace(/[.+]/g, '\\$&')}\\b`, 'i');
                return searchPattern.test(cleanText);
            });
        });


        Object.keys(SHORT_KEYWORDS).forEach(shortKeyword => {
            const patterns = SHORT_KEYWORDS[shortKeyword];
            const found = patterns.some(pattern => 
                cleanText.includes(pattern.toLowerCase())
            );
            
            if (found) {
                if (!foundKeywords.Programacion) foundKeywords.Programacion = [];
                if (!foundKeywords.Programacion.includes(shortKeyword)) {
                    foundKeywords.Programacion.push(shortKeyword);
                }
            }
        });

        return foundKeywords;
    };

    const calculateCVScore = (keywords) => {
        let totalKeywords = 0;
        let foundKeywords = 0;

        Object.keys(KEYWORDS).forEach(category => {
            totalKeywords += KEYWORDS[category].length;
            foundKeywords += keywords[category] ? keywords[category].length : 0;
        });

        totalKeywords += Object.keys(SHORT_KEYWORDS).length;

        return {
            totalFound: foundKeywords
        };
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, selecciona un archivo');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('curriculum', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData, 
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fallo en el servidor al analizar el archivo');
            }

            const keywordsFound = analyzeKeywords(data.data.snippet);
            const cvScore = calculateCVScore(keywordsFound);

            const resultData = {
                wordCount: data.data.wordCount,
                snippet: data.data.snippet,
                keywords: keywordsFound,
                score: cvScore.score,
                totalFound: cvScore.totalFound
            };

            router.push(`/result?data=${encodeURIComponent(JSON.stringify(resultData))}`);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
                    Analizador de CV 
                </h1>
                
                <p className="text-gray-600 text-center mb-8">
                    Sube tu CV y analizaremos tus habilidades y tecnologías
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 font-bold text-lg">{KEYWORDS.Programacion.length}</div>
                        <div className="text-xs text-blue-600">Lenguajes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600 font-bold text-lg">{KEYWORDS.frameworks.length}</div>
                        <div className="text-xs text-green-600">Frameworks</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-purple-600 font-bold text-lg">{KEYWORDS.Herramientas.length}</div>
                        <div className="text-xs text-purple-600">Herramientas</div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label 
                            htmlFor="cvUpload" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Selecciona tu CV (PDF, DOCX):
                        </label>
                        
                        <input
                            id="cvUpload"
                            name="curriculum"
                            type="file"
                            accept={acceptedFormats} 
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition duration-150 ease-in-out cursor-pointer border border-gray-300 p-2 rounded-lg"
                        />
                        
                        <p className="mt-2 text-xs text-gray-500">
                            Formatos aceptados: PDF, DOCX. 
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={!file || loading}
                        className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white 
                                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                                    transition duration-200`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"></path>
                                </svg>
                                Analizando CV...
                            </div>
                        ) : 'Analizar Mi CV'}
                    </button>
                </form>

                {error && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        <h3 className="font-bold">Error:</h3>
                        <p className="text-sm mt-2">{error}</p>
                    </div>
                )}

                <div className="mt-8 text-xs text-gray-500">
                    <p><strong>¿Qué analizamos?</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Lenguajes de programación</li>
                        <li>Frameworks y librerías</li>
                        <li>Herramientas de desarrollo</li>
                        <li>Metodologías de trabajo</li>
                        <li>Idiomas y habilidades</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}