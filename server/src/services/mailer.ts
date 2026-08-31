export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

const inbox = new Map<string, MailMessage>();

export const logMailer: Mailer = {
  async send(message) {
    inbox.set(message.to.toLowerCase(), message);
    console.log(`[mailer:dev] to=${message.to} subject=${message.subject}\n${message.text}\n`);
  },
};

export function lastDevMessage(email: string): MailMessage | undefined {
  return inbox.get(email.toLowerCase());
}
