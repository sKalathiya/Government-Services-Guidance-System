import { Controller } from '@nestjs/common';
import { JurisdictionService } from './jurisdiction.service';

@Controller('jurisdiction')
export class JurisdictionController {
  constructor(private readonly jurisdictionService: JurisdictionService) {}
}
