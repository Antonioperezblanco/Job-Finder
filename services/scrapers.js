import puppeteer from 'puppeteer';

const puppeteerConfig = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote', 
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-features=VizDisplayCompositor'
    ],
    timeout: 30000,
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const jobScrapers = {
    async scrapeLinkedInJobs(skills) {
        let browser;
        try {
            browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 720 });
            
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const query = skills.slice(0, 2).join(' ');
            const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`;
            
            console.log('🔍 Scraping LinkedIn:', url);
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 20000 
            });
            
            await delay(3000); 
            
            const jobCount = await page.evaluate(() => {
                const selectors = [
                    '.results-context-header__job-count',
                    '.jobs-search-results-list__title',
                    '.results-context-header__query',
                    '.search-results-container'
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const text = element.textContent;
                        const match = text.match(/(\d+,?\d*,?\d*)/);
                        if (match) {
                            const count = parseInt(match[1].replace(/,/g, ''));
                            if (count > 0) return count;
                        }
                    }
                }

                const jobElements = document.querySelectorAll(
                    '.jobs-search__results-list li, .job-search-card, .occludable-update'
                );
                return jobElements.length > 0 ? jobElements.length : 0;
            });
            
            console.log('✅ LinkedIn jobs found:', jobCount);
            return {
                name: 'LinkedIn',
                jobs: jobCount,
                url: url,
                description: 'Red profesional más grande del mundo',
            };
            
        } catch (error) {
            console.error('Error scraping LinkedIn:', error.message);
            return {
                name: 'LinkedIn',
                jobs: 0,
                url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(skills.slice(0, 2).join(' '))}`,
                description: 'Red profesional más grande del mundo',
                error: true
            };
        } finally {
            if (browser) await browser.close();
        }
    },

    async scrapeIndeedJobs(skills) {
        let browser;
        try {
            browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 720 });
            
            // Bloquear recursos
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const query = skills.slice(0, 2).join(' ');
            const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}`;
            
            console.log('🔍 Scraping Indeed:', url);
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000 
            });

            await delay(3000); // Reducido de 5000
            
            const jobCount = await page.evaluate(() => {
                const countSelectors = [
                    '.jobsearch-JobCountAndSortPane-jobCount',
                    '.searchCount',
                    '#searchCountPages'
                ];
                
                for (const selector of countSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const text = element.textContent;
                        const match = text.match(/(\d+,?\d*,?\d*)\s+jobs?/i);
                        if (match) {
                            return parseInt(match[1].replace(/,/g, ''));
                        }
                        const numberMatch = text.match(/(\d+,?\d*,?\d*)/);
                        if (numberMatch) {
                            return parseInt(numberMatch[1].replace(/,/g, ''));
                        }
                    }
                }
                
                const jobCards = document.querySelectorAll(
                    '.jobsearch-SerpJobCard, [data-tn-component="organicJob"], .result'
                );
                return jobCards.length > 0 ? jobCards.length : 0;
            });
            
            console.log('✅ Indeed jobs found:', jobCount);
            return {
                name: 'Indeed',
                jobs: jobCount,
                url: url,
                description: 'Motor de búsqueda de empleo global',
            };
            
        } catch (error) {
            console.error('❌ Error scraping Indeed:', error.message);
            return {
                name: 'Indeed',
                jobs: 0,
                url: `https://www.indeed.com/jobs?q=${encodeURIComponent(skills.slice(0, 2).join(' '))}`,
                description: 'Motor de búsqueda de empleo global',
                error: true
            };
        } finally {
            if (browser) await browser.close();
        }
    },

    async scrapeGlassdoorJobs(skills) {
        let browser;
        try {
            browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 720 });
            
            // Bloquear recursos
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const query = skills.slice(0, 2).join(' ');
            const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(query)}`;
            
            console.log('🔍 Scraping Glassdoor:', url);
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000 
            });

            await delay(3000);
            
            const jobCount = await page.evaluate(() => {
                const countSelectors = [
                    '[data-test="jobs-count"]',
                    '.jobsCount',
                    '.searchResults'
                ];
                
                for (const selector of countSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const text = element.textContent;
                        const match = text.match(/(\d+,?\d*,?\d*)/);
                        if (match) return parseInt(match[1].replace(/,/g, ''));
                    }
                }

                const jobItems = document.querySelectorAll(
                    '.react-job-listing, .jobListItem, [data-test="job-listing"]'
                );
                return jobItems.length > 0 ? jobItems.length : 0;
            });
            
            console.log('✅ Glassdoor jobs found:', jobCount);
            return {
                name: 'Glassdoor',
                jobs: jobCount,
                url: url,
                description: 'Información de empresas y salarios',
            };
            
        } catch (error) {
            console.error('Error scraping Glassdoor:', error.message);
            return {
                name: 'Glassdoor',
                jobs: 0,
                url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(skills.slice(0, 2).join(' '))}`,
                description: 'Información de empresas y salarios',
                error: true
            };
        } finally {
            if (browser) await browser.close();
        }
    },

    async scrapeGetOnBoardJobs(skills) {
        let browser;
        try {
            browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 720 });

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const primarySkill = skills[0]?.toLowerCase() || 'programacion';
            const url = `https://www.getonbrd.com/empleos-${primarySkill}`;
            
            console.log('🔍 Scraping Get on Board:', url);
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000 
            });

            await delay(2000); 
            
            const jobCount = await page.evaluate(() => {
                const countSelectors = [
                    '.gb-results-list-header',
                    '.search-results-count',
                    'h1'
                ];
                
                for (const selector of countSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const text = element.textContent;
                        const match = text.match(/(\d+)\s+resultados?/);
                        if (match) return parseInt(match[1]);
                    }
                }

                const jobElements = document.querySelectorAll(
                    '.gb-results-list > div, .job-item, .job-card'
                );
                return jobElements.length > 0 ? jobElements.length : 0;
            });
            
            console.log('✅ Get on Board jobs found:', jobCount);
            return {
                name: 'Get on Board',
                jobs: jobCount,
                url: url,
                description: 'Tecnología y startups',
            };
            
        } catch (error) {
            console.error('❌ Error scraping Get on Board:', error.message);
            return {
                name: 'Get on Board',
                jobs: 0,
                url: `https://www.getonbrd.com/empleos-${skills[0]?.toLowerCase() || 'programacion'}`,
                description: 'Tecnología y startups',
                error: true
            };
        } finally {
            if (browser) await browser.close();
        }
    },

    async scrapeAllJobs(skills) {
        console.log('🚀 Iniciando scraping para skills:', skills);
        
        const scrapers = [
            this.scrapeLinkedInJobs(skills),
            this.scrapeIndeedJobs(skills)
        ];

        try {
            const results = await Promise.allSettled(scrapers);
            
            const successfulScrapes = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .filter(portal => !portal.error); 

            console.log(`📊 Resultados: ${successfulScrapes.length} exitosos`);
            
            if (successfulScrapes.length === 0) {
                console.log('📋 Usando datos de respaldo');
                return this.getFallbackData(skills);
            }

            return successfulScrapes;
            
        } catch (error) {
            console.error('Error general en scraping:', error);
            return this.getFallbackData(skills);
        }
    },

    getFallbackData(skills) {
        const query = skills.slice(0, 2).join(' ');
        return [
            {
                name: 'LinkedIn',
                jobs: Math.floor(Math.random() * 5000) + 10000,
                url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
                description: 'Red profesional más grande del mundo',
                source: 'estimate'
            },
            {
                name: 'Indeed',
                jobs: Math.floor(Math.random() * 4000) + 8000,
                url: `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}`,
                description: 'Motor de búsqueda de empleo global',
                source: 'estimate'
            }
        ];
    }
};