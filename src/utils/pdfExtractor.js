/**
 * PDF Text Extraction Utility
 * Uses pdfjs-dist with CDN fallback to extract text page-by-page
 */

export async function extractTextFromPDF(file, onProgress) {
  if (!file) {
    throw new Error('No PDF file provided');
  }

  // Validate type
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Invalid file format. Please upload a valid PDF document (.pdf).');
  }

  // Validate size: 15MB limit
  const MAX_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 15MB. Please upload a smaller study document.');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically load pdfjsLib from npm or fallback to CDN
    let pdfjs = window.pdfjsLib;

    if (!pdfjs) {
      try {
        const imported = await import('pdfjs-dist');
        pdfjs = imported.default || imported;
      } catch (err) {
        console.warn('Local pdfjs-dist import fallback, loading from CDN:', err);
      }
    }

    if (!pdfjs) {
      // Load CDN script dynamically if not available
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          pdfjs = window.pdfjsLib;
          if (pdfjs && pdfjs.GlobalWorkerOptions) {
            pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load PDF extraction library.'));
        document.head.appendChild(script);
      });
    }

    if (pdfjs && pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let fullText = '';
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pageTexts.push(`--- Page ${pageNum} ---\n${pageStr}`);
      fullText += pageStr + '\n\n';

      if (onProgress) {
        onProgress({
          currentPage: pageNum,
          totalPages: numPages,
          progress: Math.round((pageNum / numPages) * 100)
        });
      }
    }

    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error('This PDF appears to be empty or contains scanned images without selectable text. Try another document or copy/paste notes directly.');
    }

    return {
      text: trimmedText,
      pageTexts,
      pageCount: numPages,
      charCount: trimmedText.length,
      estimatedWordCount: trimmedText.split(/\s+/).length
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(error.message || 'Failed to extract text from the PDF file.');
  }
}
