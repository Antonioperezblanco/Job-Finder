import { NextResponse } from 'next/server';
import path from 'path';
import { Buffer } from 'buffer';

async function parsePDFWithPDFJS(buffer) {
    let pdf = null;
    
    try {
        // Importar la versión legacy de pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        // Configuración para entorno serverless sin worker
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            useWorker: false,
            isEvalSupported: false,
            useSystemFonts: true,
            disableFontFace: true,
            verbosity: 0
        });
        
        pdf = await loadingTask.promise;
        let fullText = '';
        
        console.log(`Procesando PDF con ${pdf.numPages} páginas`);
        
        // Extraer texto de todas las páginas
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                fullText += pageText + '\n';
                
                console.log(`Página ${pageNum} procesada: ${pageText.length} caracteres`);
                
            } catch (pageError) {
                console.warn(`Error en página ${pageNum}:`, pageError.message);
                continue;
            }
        }
        
        return fullText.trim() || 'No se pudo extraer texto del PDF';
        
    } catch (error) {
        console.error('Error procesando PDF:', error);
        throw new Error(`Error al procesar PDF: ${error.message}`);
    } finally {
        // Limpiar recursos
        if (pdf) {
            try {
                await pdf.destroy();
            } catch (e) {
                console.warn('Error al destruir PDF:', e.message);
            }
        }
    }
}

async function parseCV(fileBuffer, fileName) {
    const extension = path.extname(fileName).toLowerCase();
    let extractedText = '';

    try {
        if (extension === '.pdf') {
            extractedText = await parsePDFWithPDFJS(fileBuffer);
        } else if (extension === '.docx') {
            const mammothModule = await import('mammoth');
            const result = await mammothModule.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;  
        } else {
            throw new Error(`Formato no soportado: ${extension}. Use .pdf o .docx.`);
        }

        const cleanedText = extractedText.replace(/\s+/g, ' ').trim();
        const wordCount = cleanedText ? cleanedText.split(/\s+/).filter(word => word.length > 0).length : 0;
        
        return { 
            success: true, 
            wordCount: wordCount,
            snippet: cleanedText.substring(0, 2000) + (cleanedText.length > 2000 ? '...' : '')
        };
        
    } catch (error) {
        console.error("Error al parsear el archivo:", error);
        throw new Error(`Error en el procesamiento interno: ${error.message}`); 
    }
}

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get('curriculum'); 
        
        if (!file || typeof file === 'string') {
            return NextResponse.json({ 
                error: 'No se encontró el archivo de currículum.' 
            }, { status: 400 });
        }

        const fileExtension = path.extname(file.name).toLowerCase();
        if (!['.pdf', '.docx'].includes(fileExtension)) {
            return NextResponse.json({ 
                error: 'Formato no soportado. Use archivos pdf o docx.' 
            }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ 
                error: 'El archivo es demasiado grande.' 
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log(`Procesando archivo: ${file.name}, tamaño: ${buffer.length} bytes`);
        
        const analysisResult = await parseCV(buffer, file.name);

        return NextResponse.json({ 
            message: 'Currículum analizado con éxito', 
            data: analysisResult 
        });

    } catch (error) {
        console.error("Error en la API Route:", error);
        return NextResponse.json({ 
            error: error.message || 'Error interno del servidor.' 
        }, { status: 500 });
    }
}