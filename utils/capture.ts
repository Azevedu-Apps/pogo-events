
import { toPng } from 'html-to-image';

interface CaptureOptions {
    nodeId: string;
    fileName: string;
    scale?: number;
    onStart?: () => void;
    onEnd?: () => void;
}

export const captureAndDownload = async ({ nodeId, fileName, scale = 2, onStart, onEnd }: CaptureOptions) => {
    if (onStart) onStart();
    const node = document.getElementById(nodeId);
    
    if (!node) {
        console.error(`Node not found: ${nodeId}`);
        if (onEnd) onEnd();
        return;
    }

    try {
        // 1. Fetch External CSS to embed manually (Fixes CORS issues with <link> tags in some browsers)
        // We manually fetch them as text and provide them to the library to avoid security exceptions 
        // when html-to-image tries to read .cssRules from document.styleSheets.
        const faUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap';
        const appCssUrl = window.location.origin + '/index.css';

        const [faRes, fontRes, appCssRes] = await Promise.all([
            fetch(faUrl).catch(() => null),
            fetch(fontUrl).catch(() => null),
            fetch(appCssUrl).catch(() => null)
        ]);

        let cssCombined = '';
        if (fontRes?.ok) {
            const text = await fontRes.text();
            cssCombined += text + '\n';
        }
        if (faRes?.ok) {
            let faCss = await faRes.text();
            // Fix relative paths for font awesome webfonts
            faCss = faCss.replace(/\.\.\/webfonts\//g, 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/');
            cssCombined += faCss + '\n';
        }
        if (appCssRes?.ok) {
            const appCss = await appCssRes.text();
            cssCombined += appCss + '\n';
        }

        // 2. Pre-load images inside the node to ensure they are ready for capture
        const imgs = node.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => { 
                img.onload = resolve; 
                img.onerror = resolve; 
                if(!img.crossOrigin) img.crossOrigin = 'anonymous'; 
            });
        }));

        const options = { 
            quality: 0.95, 
            pixelRatio: scale,
            cacheBust: true,
            // Pass manually fetched CSS to avoid html-to-image triggering CORS errors 
            // when trying to read document.styleSheets rules.
            fontEmbedCSS: cssCombined,
            filter: (domNode: HTMLElement) => {
                // Exclude link tags to avoid html-to-image trying to read cssRules from cross-origin sources
                // This is the core fix for "Failed to read the 'cssRules' property" errors.
                const tagName = domNode.tagName ? domNode.tagName.toUpperCase() : '';
                return tagName !== 'LINK' && tagName !== 'SCRIPT';
            }
        };

        // 3. Capture
        // First pass to warm up layout engine (fixes glitches in some browsers)
        try { await toPng(node, options); } catch(e) {}
        
        const dataUrl = await toPng(node, options);
        
        // 4. Download
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (err) {
        console.error('Failed to export image', err);
        alert('Erro ao gerar imagem. Verifique se os assets estão acessíveis.');
    } finally {
        if (onEnd) onEnd();
    }
};
