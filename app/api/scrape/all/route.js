import { jobScrapers } from '../../../../services/scrapers';

export async function POST(request) {
    try {
        const { skills } = await request.json();
        
        if (!skills || !Array.isArray(skills)) {
            return Response.json(
                { error: 'Skills array is required' },
                { status: 400 }
            );
        }

        const results = await jobScrapers.scrapeAllJobs(skills);
        
        return Response.json(results);
        
    } catch (error) {
        console.error('Scraping error:', error);
        return Response.json(
            { error: error.message || 'Error en el scraping' },
            { status: 500 }
        );
    }
}