import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { injectable } from "inversify";
import { auditLogService } from "./auditLogService.js";
import type { AuditEvent } from "../../domain/models/audit.js";
import { logAuditDebug } from "../../shared/utils/debug.js";

@injectable()
export class AuditConsumerService {
  private connectionPromise: Promise<ChannelModel | null> | null = null;
  private channelPromise: Promise<Channel | null> | null = null;
  private started = false;

  public async start() {
    if (this.started) {
      logAuditDebug("consumer start skipped because it is already running");
      return;
    }

    const channel = await this.getChannel();

    if (!channel) {
      logAuditDebug("consumer start skipped because RabbitMQ channel is unavailable");
      return;
    }

    const queueName = this.getQueueName();

    await channel.consume(queueName, async (message) => {
      if (!message) {
        return;
      }

      await this.processMessage(channel, message);
    });

    logAuditDebug("consumer subscribed", { queueName });
    this.started = true;
  }

  private async processMessage(channel: Channel, message: ConsumeMessage) {
    try {
      const event = JSON.parse(message.content.toString()) as AuditEvent;
      logAuditDebug("consumer received message", {
        routingKey: message.fields.routingKey,
        deliveryTag: message.fields.deliveryTag,
        entityId: event.entityId,
        actorId: event.actor?.id ?? null,
      });
      await auditLogService.insert(event, message.fields.routingKey);
      channel.ack(message);
      logAuditDebug("consumer acknowledged message", {
        routingKey: message.fields.routingKey,
        deliveryTag: message.fields.deliveryTag,
      });
    } catch (error) {
      console.error("Audit message processing failed", error);
      channel.nack(message, false, false);
    }
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
      logAuditDebug("consumer channel not created because RabbitMQ connection is unavailable");
      return null;
    }

    const channel = await connection.createChannel();
    const exchangeName = this.getExchangeName();
    const queueName = this.getQueueName();

    await channel.assertExchange(exchangeName, "topic", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, "feedback.feedback.*");
    await channel.prefetch(10);

    logAuditDebug("consumer channel ready", {
      exchangeName,
      queueName,
      bindingPattern: "feedback.feedback.*",
      prefetch: 10,
    });

    return channel;
  }

  private async getConnection() {
    const url = process.env.RABBITMQ_URL;

    if (!url) {
      logAuditDebug("consumer connection skipped because RABBITMQ_URL is not set");
      return null;
    }

    if (!this.connectionPromise) {
      logAuditDebug("connecting RabbitMQ consumer", { url });
      this.connectionPromise = amqp.connect(url).catch((error: unknown) => {
        console.error("RabbitMQ consumer connection failed", error);
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

export const auditConsumerService = new AuditConsumerService();
