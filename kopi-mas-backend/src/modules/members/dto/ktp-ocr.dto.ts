import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsNumberString } from 'class-validator';

export class ProcessKtpOcrDto {
  @IsString()
  ktpImageUrl: string;

  @IsString()
  @IsOptional()
  submittedNik?: string;

  @IsString()
  @IsOptional()
  submittedName?: string;

  @IsDateString()
  @IsOptional()
  submittedDob?: string;

  @IsString()
  @IsOptional()
  submittedGender?: string;
}

export class VerifyKtpDto {
  @IsEnum(['match', 'manual_verification', 'low_result'])
  status: 'match' | 'manual_verification' | 'low_result';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class KtpOcrResultDto {
  ocrNik: string;
  ocrName: string;
  ocrDob: string;
  ocrGender: string;
  ocrAddress: string;
  ocrConfidence: number;
  verificationStatus: string;
  isMatch: boolean;
  matchDetails: {
    nikMatch: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
    genderMatch: boolean;
    overallScore: number;
  };
}
