import { Injectable, BadRequestException } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import { KtpOcrResultDto } from '../dto/ktp-ocr.dto';
import { KtpVerificationStatus } from '../entities/member.entity';

@Injectable()
export class KtpOcrService {
  
  async processKtpImage(
    ktpImageUrl: string,
    submittedNik?: string,
    submittedName?: string,
    submittedDob?: string,
    submittedGender?: string,
  ): Promise<KtpOcrResultDto> {
    // Process with Tesseract OCR
    const ocrResult = await this.performOcr(ktpImageUrl);

    // Compare OCR results with submitted data
    const matchDetails = this.compareWithSubmittedData(
      ocrResult,
      submittedNik,
      submittedName,
      submittedDob,
      submittedGender,
    );

    // Determine verification status based on match score
    let verificationStatus: string;
    if (matchDetails.overallScore >= 90) {
      verificationStatus = KtpVerificationStatus.MATCH;
    } else if (matchDetails.overallScore >= 70) {
      verificationStatus = KtpVerificationStatus.MANUAL_VERIFICATION;
    } else {
      verificationStatus = KtpVerificationStatus.LOW_RESULT;
    }

    return {
      ...ocrResult,
      verificationStatus,
      isMatch: matchDetails.overallScore >= 90,
      matchDetails,
    };
  }

  private async performOcr(imageUrl: string): Promise<{
    ocrNik: string;
    ocrName: string;
    ocrDob: string;
    ocrGender: string;
    ocrAddress: string;
    ocrConfidence: number;
  }> {
    try {
      // Use Tesseract.js for OCR
      const result = await Tesseract.recognize(
        imageUrl,
        'eng+ind', // English and Indonesian
        {
          logger: (m) => console.log(`OCR Progress: ${m.status} - ${Math.round(m.progress * 100)}%`),
        }
      );

      const text = result.data.text;
      const confidence = result.data.confidence;

      // Parse OCR text to extract KTP fields
      const parsedData = this.parseKtpText(text);

      return {
        ...parsedData,
        ocrConfidence: confidence,
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new BadRequestException('Failed to process KTP image. Please try again with a clearer image.');
    }
  }

  private parseKtpText(text: string): {
    ocrNik: string;
    ocrName: string;
    ocrDob: string;
    ocrGender: string;
    ocrAddress: string;
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let ocrNik = '';
    let ocrName = '';
    let ocrDob = '';
    let ocrGender = '';
    let ocrAddress = '';

    // Extract NIK (16 digits)
    const nikMatch = text.match(/\b(\d{16})\b/);
    if (nikMatch) {
      ocrNik = nikMatch[1];
    }

    // Extract Name (usually after "NIK" or "Nama")
    const namePatterns = [
      /Nama\s*[:\-]?\s*([A-Z\s]+)/i,
      /([A-Z]{3,}\s+[A-Z]{3,}\s+[A-Z]{3,})/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        ocrName = match[1].trim().toUpperCase();
        break;
      }
    }

    // Extract DOB (various formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD)
    const dobPatterns = [
      /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
    ];
    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[1].length === 4) {
          // YYYY-MM-DD format
          ocrDob = `${match[1]}-${match[2]}-${match[3]}`;
        } else {
          // DD-MM-YYYY format
          ocrDob = `${match[3]}-${match[2]}-${match[1]}`;
        }
        break;
      }
    }

    // Extract Gender
    const genderMatch = text.match(/\b(LAKI[- ]?LAKI|PEREMPUAN)\b/i);
    if (genderMatch) {
      const gender = genderMatch[1].toLowerCase();
      ocrGender = gender.includes('peremp') ? 'female' : 'male';
    }

    // Extract Address (usually contains common address keywords)
    const addressPatterns = [
      /Alamat\s*[:\-]?\s*(.+?)(?=\n|$)/i,
      /JL[A]?\.?\s*(.+?)(?=\n|$)/i,
      /(?:JL|JALAN)[A-Z]?\s*.+?(?=\n|$)/i,
    ];
    
    const addressLines: string[] = [];
    for (const line of lines) {
      if (line.match(/^(jl|jalan|jl\.|alamat|rt|rw|kel|kelurahan|kec|kecamatan)/i)) {
        addressLines.push(line);
      }
    }
    
    if (addressLines.length > 0) {
      ocrAddress = addressLines.join(', ').toUpperCase();
    }

    // If no structured data found, use remaining text as fallback
    if (!ocrNik || !ocrName) {
      const fallbackText = lines.join(' ').substring(0, 500);
      if (!ocrNik) {
        const fallbackNik = fallbackText.match(/(\d{16})/);
        if (fallbackNik) ocrNik = fallbackNik[1];
      }
      if (!ocrName) {
        const words = fallbackText.split(/\s+/).filter(w => /^[A-Z]{3,}$/.test(w));
        if (words.length > 0) ocrName = words.slice(0, 3).join(' ');
      }
    }

    return {
      ocrNik: ocrNik || '',
      ocrName: ocrName || '',
      ocrDob: ocrDob || '',
      ocrGender: ocrGender || '',
      ocrAddress: ocrAddress || '',
    };
  }

  private compareWithSubmittedData(
    ocrResult: { ocrNik: string; ocrName: string; ocrDob: string; ocrGender: string },
    submittedNik?: string,
    submittedName?: string,
    submittedDob?: string,
    submittedGender?: string,
  ): { nikMatch: boolean; nameMatch: boolean; dobMatch: boolean; genderMatch: boolean; overallScore: number } {
    let matchCount = 0;
    let totalFields = 0;

    // Compare NIK
    const nikMatch = submittedNik ? this.normalizeString(ocrResult.ocrNik) === this.normalizeString(submittedNik) : true;
    if (submittedNik) {
      totalFields++;
      if (nikMatch) matchCount++;
    }

    // Compare Name
    const nameMatch = submittedName ? 
      this.normalizeString(ocrResult.ocrName).includes(this.normalizeString(submittedName)) || 
      this.normalizeString(submittedName).includes(this.normalizeString(ocrResult.ocrName)) : true;
    if (submittedName) {
      totalFields++;
      if (nameMatch) matchCount++;
    }

    // Compare DOB
    const ocrDobDate = ocrResult.ocrDob ? new Date(ocrResult.ocrDob).toISOString().split('T')[0] : null;
    const submittedDobDate = submittedDob ? new Date(submittedDob).toISOString().split('T')[0] : null;
    const dobMatch = submittedDobDate && ocrDobDate ? ocrDobDate === submittedDobDate : true;
    if (submittedDobDate) {
      totalFields++;
      if (dobMatch) matchCount++;
    }

    // Compare Gender
    const genderMatch = submittedGender ? 
      this.normalizeString(ocrResult.ocrGender) === this.normalizeString(submittedGender) : true;
    if (submittedGender) {
      totalFields++;
      if (genderMatch) matchCount++;
    }

    const overallScore = totalFields > 0 ? (matchCount / totalFields) * 100 : 100;

    return {
      nikMatch,
      nameMatch,
      dobMatch,
      genderMatch,
      overallScore: Math.round(overallScore * 100) / 100,
    };
  }

  private normalizeString(str: string): string {
    return str
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .trim();
  }
}
