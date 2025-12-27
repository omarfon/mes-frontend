import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MessageBroker {
  id: number;
  name: string;
  type: 'Kafka' | 'RabbitMQ' | 'ActiveMQ';
  host: string;
  port: number;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

interface TopicQueue {
  id: number;
  name: string;
  type: 'TOPIC' | 'QUEUE';
  broker: string;
  messageCount: number;
  consumers: number;
}

interface MessageFlow {
  id: number;
  name: string;
  source: string;
  destination: string;
  messageType: string;
  active: boolean;
}

@Component({
  selector: 'app-messaging-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging-integration.html',
})
export class MessagingIntegrationComponent {
  activeTab: 'BROKERS' | 'TOPICS' | 'FLOWS' = 'BROKERS';

  brokers: MessageBroker[] = [
    { id: 1, name: 'Kafka Production', type: 'Kafka', host: 'kafka.company.com', port: 9092, status: 'CONNECTED' },
    { id: 2, name: 'RabbitMQ Main', type: 'RabbitMQ', host: 'rabbitmq.company.com', port: 5672, status: 'CONNECTED' },
  ];

  topicsQueues: TopicQueue[] = [
    { id: 1, name: 'mes.production.orders', type: 'TOPIC', broker: 'Kafka Production', messageCount: 1245, consumers: 3 },
    { id: 2, name: 'mes.quality.results', type: 'TOPIC', broker: 'Kafka Production', messageCount: 856, consumers: 2 },
    { id: 3, name: 'mes.alerts', type: 'QUEUE', broker: 'RabbitMQ Main', messageCount: 45, consumers: 1 },
    { id: 4, name: 'mes.maintenance.events', type: 'TOPIC', broker: 'Kafka Production', messageCount: 234, consumers: 2 },
  ];

  messageFlows: MessageFlow[] = [
    { id: 1, name: 'Production Events', source: 'MES', destination: 'mes.production.orders', messageType: 'ProductionOrder', active: true },
    { id: 2, name: 'Quality Events', source: 'MES', destination: 'mes.quality.results', messageType: 'QualityResult', active: true },
    { id: 3, name: 'Alert Notifications', source: 'MES', destination: 'mes.alerts', messageType: 'Alert', active: true },
  ];

  editingBroker: MessageBroker | null = null;
  brokerForm: Partial<MessageBroker> = {};
  editingTopic: TopicQueue | null = null;
  topicForm: Partial<TopicQueue> = {};
  editingFlow: MessageFlow | null = null;
  flowForm: Partial<MessageFlow> = {};

  newBroker() {
    this.editingBroker = { id: 0, name: '', type: 'Kafka', host: '', port: 9092, status: 'DISCONNECTED' };
    this.brokerForm = { ...this.editingBroker };
  }

  editBroker(broker: MessageBroker) {
    this.editingBroker = broker;
    this.brokerForm = { ...broker };
  }

  saveBroker() {
    if (!this.brokerForm.name || !this.brokerForm.host) return;
    if (this.editingBroker?.id === 0) {
      const newId = Math.max(...this.brokers.map(b => b.id), 0) + 1;
      this.brokers.push({ ...this.brokerForm as MessageBroker, id: newId });
    } else {
      const idx = this.brokers.findIndex(b => b.id === this.editingBroker?.id);
      if (idx !== -1) this.brokers[idx] = { ...this.brokerForm as MessageBroker };
    }
    this.cancelBroker();
  }

  cancelBroker() {
    this.editingBroker = null;
    this.brokerForm = {};
  }

  deleteBroker(id: number) {
    this.brokers = this.brokers.filter(b => b.id !== id);
  }

  newTopic() {
    this.editingTopic = { id: 0, name: '', type: 'TOPIC', broker: '', messageCount: 0, consumers: 0 };
    this.topicForm = { ...this.editingTopic };
  }

  editTopic(topic: TopicQueue) {
    this.editingTopic = topic;
    this.topicForm = { ...topic };
  }

  saveTopic() {
    if (!this.topicForm.name || !this.topicForm.broker) return;
    if (this.editingTopic?.id === 0) {
      const newId = Math.max(...this.topicsQueues.map(t => t.id), 0) + 1;
      this.topicsQueues.push({ ...this.topicForm as TopicQueue, id: newId });
    } else {
      const idx = this.topicsQueues.findIndex(t => t.id === this.editingTopic?.id);
      if (idx !== -1) this.topicsQueues[idx] = { ...this.topicForm as TopicQueue };
    }
    this.cancelTopic();
  }

  cancelTopic() {
    this.editingTopic = null;
    this.topicForm = {};
  }

  deleteTopic(id: number) {
    this.topicsQueues = this.topicsQueues.filter(t => t.id !== id);
  }

  newFlow() {
    this.editingFlow = { id: 0, name: '', source: 'MES', destination: '', messageType: '', active: true };
    this.flowForm = { ...this.editingFlow };
  }

  editFlow(flow: MessageFlow) {
    this.editingFlow = flow;
    this.flowForm = { ...flow };
  }

  saveFlow() {
    if (!this.flowForm.name || !this.flowForm.destination || !this.flowForm.messageType) return;
    if (this.editingFlow?.id === 0) {
      const newId = Math.max(...this.messageFlows.map(f => f.id), 0) + 1;
      this.messageFlows.push({ ...this.flowForm as MessageFlow, id: newId });
    } else {
      const idx = this.messageFlows.findIndex(f => f.id === this.editingFlow?.id);
      if (idx !== -1) this.messageFlows[idx] = { ...this.flowForm as MessageFlow };
    }
    this.cancelFlow();
  }

  cancelFlow() {
    this.editingFlow = null;
    this.flowForm = {};
  }

  deleteFlow(id: number) {
    this.messageFlows = this.messageFlows.filter(f => f.id !== id);
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      CONNECTED: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      DISCONNECTED: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      ERROR: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20'
    };
    return map[status] || 'ui-badge';
  }
}
