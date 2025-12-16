
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
        const faUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap';

        const [faRes, fontRes] = await Promise.all([
            fetch(faUrl).catch(() => null),
            fetch(fontUrl).catch(() => null)
        ]);

        let cssCombined = '';
        if (fontRes?.ok) cssCombined += await fontRes.text() + '\n';
        if (faRes?.ok) {
            let faCss = await faRes.text();
            faCss = faCss.replace(/\.\.\/webfonts\//g, 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/');
            cssCombined += faCss;
        }

        // 2. Insert Style Tag into Node temporarily
        const style = document.createElement('style');
        style.innerHTML = cssCombined;
        node.appendChild(style);

        // 3. Pre-load images inside the node
        const imgs = node.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => { 
                img.onload = resolve; 
                img.onerror = resolve; 
                // Set crossOrigin to anonymous to attempt to bypass taint
                if(!img.crossOrigin) img.crossOrigin = 'anonymous'; 
            });
        }));

        const options = { 
            quality: 0.95, 
            pixelRatio: scale,
            cacheBust: true,
            filter: (domNode: HTMLElement) => {
                // Exclude external link tags to avoid CORS errors during capture
                return domNode.tagName !== 'LINK';
            }
        };

        // 4. Capture
        // First pass to warm up layout engine (fixes glitches)
        try { await toPng(node, options); } catch(e) {}
        
        const dataUrl = await toPng(node, options);
        
        // 5. Download
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();

        // Cleanup
        if (node.contains(style)) node.removeChild(style);

    } catch (err) {
        console.error('Failed to export image', err);
        alert('Erro ao gerar imagem. Verifique se os assets (imagens) estão acessíveis.');
    } finally {
        if (onEnd) onEnd();
    }
};
