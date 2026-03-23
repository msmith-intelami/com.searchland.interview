import amqp, { type Channel, type ChannelModel } from "amqplib";
import { injectable } from "inversify";
import type { AuthUser } from "../models/auth.js";
import type { AuditAction, AuditEntity, AuditEvent } from "../models/audit.js";
import { logAuditDebug } from "../utils/debug.js";

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
      logAuditDebug("publish skipped because RabbitMQ channel is unavailable");
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

    const routingKey = `${input.entity}.${input.action}`;
    const published = channel.publish(
      this.getExchangeName(),
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        contentType: "application/json",
        persistent: true,
      },
    );

    logAuditDebug("published audit event", {
      exchange: this.getExchangeName(),
      queue: this.getQueueName(),
      routingKey,
      published,
      entityId: input.entityId,
      actorId: input.actor?.id ?? null,
    });
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
      logAuditDebug("publisher channel not created because RabbitMQ connection is unavailable");
      return null;
    }

    const channel = await connection.createChannel();
    const exchangeName = this.getExchangeName();
    const queueName = this.getQueueName();

    await channel.assertExchange(exchangeName, "topic", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, "feedback.feedback.*");

    logAuditDebug("publisher channel ready", {
      exchangeName,
      queueName,
      bindingPattern: "feedback.feedback.*",
    });

    return channel;
  }

  private async getConnection() {
    const url = process.env.RABBITMQ_URL;

    if (!url) {
      logAuditDebug("publisher connection skipped because RABBITMQ_URL is not set");
      return null;
    }

    if (!this.connectionPromise) {
      logAuditDebug("connecting RabbitMQ publisher", { url });
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
