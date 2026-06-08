import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentsInventoryService } from './payments-inventory.service';

@Injectable()
export class ResilientReservationHelper {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: PaymentsInventoryService,
  ) {}

  /**
   * Wraps payment creation and Redis stock reservation.
   * Ensures that if the database transaction fails and rolls back, any Redis reservations are released.
   */
  async executeSafely(
    paymentId: string,
    items: any[],
    transactionCallback: (manager: any) => Promise<any>,
  ): Promise<any> {
    let redisReserved = false;
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const saved = await transactionCallback(manager);

        // Reserve transient stock in Redis inside the database transaction context
        await this.inventoryService.reserveInventoryForPayment(
          paymentId,
          items,
        );
        redisReserved = true;

        return saved;
      });
      return result;
    } catch (error) {
      if (redisReserved) {
        // Safe asynchronous rollback of Redis allocations
        await this.inventoryService
          .releaseInventoryReservation(paymentId)
          .catch(() => {});
      }
      throw error;
    }
  }
}
