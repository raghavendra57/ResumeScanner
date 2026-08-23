const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF buffer
 * @param {Buffer} dataBuffer - Binary buffer of the uploaded PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
async function extractTextFromPDF(dataBuffer) {
  if (!dataBuffer || !Buffer.isBuffer(dataBuffer)) {
    throw new Error('Invalid PDF data provided.');
  }

  try {
    // Ensure data is an unpooled standalone Uint8Array so pdf.js reads from byte offset 0
    const uint8Array = new Uint8Array(
      dataBuffer.buffer.slice(
        dataBuffer.byteOffset,
        dataBuffer.byteOffset + dataBuffer.byteLength
      )
    );

    const data = await pdfParse(uint8Array);
    const cleanedText = (data.text || '').trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error(
        'Unable to extract text from this PDF. Please upload a text-based resume.'
      );
    }

    return {
      text: cleanedText,
      numPages: data.numpages || 1
    };
  } catch (error) {
    if (error.message && error.message.includes('Unable to extract text')) {
      throw error;
    }
    // Handle corrupted or encrypted PDFs
    throw new Error(
      'Unable to extract text from this PDF. Please upload a text-based resume.'
    );
  }
}

module.exports = {
  extractTextFromPDF
};
