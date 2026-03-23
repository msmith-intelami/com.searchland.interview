import amqp, { type Channel, type ChannelModel } from "amqplib";
import { injectable } from "inversify";
import type { AuthUser } from "../models/auth.js";
import type { AuditAction, AuditEntity, AuditEvent } from "../models/audit.js";

@injectable()
export class AuditService {
  private connectionPromise: Promise<ChannelModel | null> | null = null;
  private channelPromise: Promise<Channel | null> | null = null;

  public async publish(input: {
    action: AuditAction;
    entity: AuditEntity;
    entityId: number;
    actor: AuthUser | null;
    metadata?: Record<string, unknown>;
  }) {
    const channel = await this.getChannel();

    if (!channel) {
      return;
    }

    const event: AuditEvent = {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      actor: input.actor
        ? {
            id: input.actor.id,
            email: input.actor.email,
            name: input.actor.name,
          }
        : null,
      timestamp: new Date().toISOString(),
      metadata: input.metadata,
    };

    channel.publish(
      this.getExchangeName(),
      `${input.entity}.${input.action}`,
      Buffer.from(JSON.stringify(event)),
      {
        contentType: "application/json",
        persistent: true,
      },
    );
  }

  private async getChannel() {
    if (!this.channelPromise) {
      this.channelPromise = this.createChannel();
    }

    return this.channelPromise;
  }

  private async createChannel() {
    const connection = await this.getConnection();

    if (!connection) {
      return null;
    }

    const channel = await connection.createChannel();
    const exchangeName = this.getExchangeName();
    const queueName = this.getQueueName();

    await channel.assertExchange(exchangeName, "topic", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, "feedback.feedback.*");

    return channel;
  }

  private async getConnection() {
    const url = process.env.RABBITMQ_URL;

    if (!url) {
      return null;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = amqp.connect(url).catch((error: unknown) => {
        console.error("RabbitMQ connection failed", error);
        this.connectionPromise = null;
        return null;
      });
    }

    return this.connectionPromise;
  }

  private getExchangeName() {
    return process.env.RABBITMQ_AUDIT_EXCHANGE ?? "audit.events";
  }

  private getQueueName() {
    return process.env.RABBITMQ_AUDIT_QUEUE ?? "audit.feedback";
  }
}

export const auditService = new AuditService();
