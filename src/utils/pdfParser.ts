import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker via unpkg to avoid local pathing issues in Capacitor/Vite builds
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n` + pageText;
    }

    return fullText;
  } catch (error) {
    console.error('Failed to parse PDF:', error);
    throw new Error('Could not extract text from the provided PDF.');
  }
};
