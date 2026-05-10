import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PaginationLimitPipe implements PipeTransform<number, number> {
  constructor(
    private readonly defaultValue: number = 20,
    private readonly maxValue: number = 100,
  ) {}

  transform(value: number): number {
    const limit = Number(value) || this.defaultValue;

    if (limit < 1) {
      throw new BadRequestException('Limit must be at least 1');
    }

    if (limit > this.maxValue) {
      throw new BadRequestException(`Limit cannot exceed ${this.maxValue}`);
    }

    return limit;
  }
}
