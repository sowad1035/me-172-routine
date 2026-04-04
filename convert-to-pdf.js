import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Convert image file to base64 data URI
function imageToDataUri(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString('base64');

        // Determine MIME type based on file extension
        const ext = path.extname(imagePath).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.svg') mimeType = 'image/svg+xml';
        else if (ext === '.webp') mimeType = 'image/webp';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`Failed to read image: ${imagePath}`, error.message);
        return null;
    }
}

async function convertHtmlToPdf() {
    const publicDir = path.join(__dirname, 'public');
    const htmlFilePath = path.join(publicDir, 'Lab_Report.html');
    const pdfFilePath = path.join(publicDir, 'Lab_Report.pdf');

    try {
        console.log('Starting HTML to PDF conversion...');
        console.log(`Input: ${htmlFilePath}`);
        console.log(`Output: ${pdfFilePath}`);

        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 800
        });

        // Read the HTML file
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

        // Convert all relative image paths to data URIs (base64 embedded)
        htmlContent = htmlContent.replace(/src="\.\/([^"]+)"/g, (match, relativePath) => {
            const absolutePath = path.join(publicDir, relativePath);

            if (fs.existsSync(absolutePath)) {
                const dataUri = imageToDataUri(absolutePath);
                if (dataUri) {
                    console.log(`✓ Embedded image: ${relativePath}`);
                    return `src="${dataUri}"`;
                }
            } else {
                console.warn(`⚠ Image not found: ${absolutePath}`);
            }
            return match;
        });

        // Also handle background images in CSS
        htmlContent = htmlContent.replace(/url\(['"]?\.\/([^'")\]]+)['"]?\)/g, (match, relativePath) => {
            const absolutePath = path.join(publicDir, relativePath);

            if (fs.existsSync(absolutePath)) {
                const dataUri = imageToDataUri(absolutePath);
                if (dataUri) {
                    console.log(`✓ Embedded background image: ${relativePath}`);
                    return `url('${dataUri}')`;
                }
            }
            return match;
        });

        console.log('\nSetting page content...');

        // Set content with optimized wait conditions
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('Rendering page for PDF...');

        // Wait for all images to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generate PDF with optimal settings for reports
        await page.pdf({
            path: pdfFilePath,
            format: 'A4',
            margin: {
                top: '2mm',
                right: '2mm',
                bottom: '2mm',
                left: '2mm'
            },
            printBackground: true,
            preferCSSPageSize: false,
            displayHeaderFooter: true,
            footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        });

        await browser.close();

        console.log(`\n✓ PDF generated successfully at: ${pdfFilePath}`);
        console.log(`✓ File size: ${(fs.statSync(pdfFilePath).size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
        console.error('Error converting HTML to PDF:', error);
        process.exit(1);
    }
}

convertHtmlToPdf();