import { Inject, Injectable } from '@nestjs/common';
import { AttachPolicyCommand, AttachThingPrincipalCommand, CreateThingCommand, IoTClient } from '@aws-sdk/client-iot';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

import { clients } from '@app/client/client.schema';
import { awsArn, awsCredentials, awsKeys } from '@app/constants';
import { DB, DbType } from '@app/global/providers/db.provider';
import { printers } from '@app/printer/printer.schema';

type CreateIotThingArgType = {
  userId: string;
  printerId: string;
  clientId: string;
  certificateId: string | null;
};

@Injectable()
export class PrinterService {
  constructor(@Inject(DB) private readonly db: DbType) {}

  findAll(userId: string) {
    return this.db.select().from(printers).where(eq(printers.userId, userId)).execute();
  }

  async create(userId: string, clientId: string, hardwareId: string) {
    const printerId = createId();
    await this.db.insert(printers).values({ userId, clientId, hardwareId, id: printerId }).execute();

    const printerResponse = await this.db
      .select({
        certificateId: clients.certificateId,
      })
      .from(printers)
      .leftJoin(clients, eq(clients.id, printers.clientId))
      .where(eq(printers.id, printerId))
      .limit(1)
      .execute();

    const printer = printerResponse[0];
    const certificateId = printer.certificateId;
    await this.createIotThing({ userId, clientId, printerId, certificateId });
  }

  // #region Create IoT Thing
  /* 
    STEPS:
    Step 1: Create IoT Thing for Printer
    Step 2: Attach IoT Client Certificate to IoT Thing
    Step 3: Attach IoT Client Policy to IoT Client Certificate
  */
  async createIotThing({ userId, printerId, clientId, certificateId }: CreateIotThingArgType): Promise<void> {
    try {
      if (!certificateId) {
        console.log('[create-iot-thing] missing params', { userId, printerId, clientId, certificateId });
        return;
      }

      // Step 1: Create IoT Thing for Printer
      const iotClient = new IoTClient(awsCredentials);
      const createThingCommand = new CreateThingCommand({
        thingName: printerId,
        thingTypeName: 'printer',
      });
      const thing = await iotClient.send(createThingCommand);

      // Step 2: Attach IoT Client Certificate to IoT Thing
      const certificateArn = awsArn.iotCertificate(certificateId);
      const attachCertificateToThingCommand = new AttachThingPrincipalCommand({
        thingName: thing.thingName,
        principal: certificateArn,
      });
      await iotClient.send(attachCertificateToThingCommand);

      // Step 3: Attach IoT Client Policy to IoT Client Certificate
      const attachPolicyToThingCommand = new AttachPolicyCommand({
        policyName: awsKeys.client.iotPolicy(clientId),
        target: certificateArn,
      });
      await iotClient.send(attachPolicyToThingCommand);
    } catch (error: unknown) {
      console.log('[create-iot-thing] could not create iot thing', {
        error,
        userId,
      });
    }
  }
  // #endregion
}
