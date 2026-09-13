import { env } from "../config/env.js";

export interface SmsMessage {
  to: string;
  text: string;
}

export interface WhatsAppMessage {
  to: string;
  text: string;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<void>;
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<void>;
}

const inbox = new Map<string, { sms?: SmsMessage; whatsapp?: WhatsAppMessage }>();

export const logSmsProvider: SmsProvider = {
  async send(message) {
    const existing = inbox.get(message.to) || {};
    inbox.set(message.to, { ...existing, sms: message });
    console.log(`[sms:dev] to=${message.to}\n${message.text}\n`);
  },
};

export const logWhatsAppProvider: WhatsAppProvider = {
  async send(message) {
    const existing = inbox.get(message.to) || {};
    inbox.set(message.to, { ...existing, whatsapp: message });
    console.log(`[whatsapp:dev] to=${message.to}\n${message.text}\n`);
  },
};

export function lastDevMessage(phone: string): { sms?: SmsMessage; whatsapp?: WhatsAppMessage } | undefined {
  return inbox.get(phone);
}

// Twilio SMS Provider
let twilioClient: any = null;

function createTwilioClient(): any {
  if (!env.twilioAccountSid || !env.twilioAuthToken) {
    return null;
  }
  try {
    const twilio = require("twilio");
    return twilio(env.twilioAccountSid, env.twilioAuthToken);
  } catch {
    return null;
  }
}

export const twilioSmsProvider: SmsProvider = {
  async send(message) {
    if (!twilioClient) {
      twilioClient = createTwilioClient();
    }

    if (!twilioClient) {
      throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.");
    }

    try {
      await twilioClient.messages.create({
        body: message.text,
        from: env.twilioPhoneNumber,
        to: message.to,
      });
    } catch (error) {
      console.error("[sms:twilio] Failed to send SMS:", error);
      throw new Error("Failed to send SMS. Please try again later.");
    }
  },
};

// MSG91 SMS Provider (popular in India)
let msg91Client: any = null;

function createMsg91Client(): any {
  if (!env.msg91AuthKey) {
    return null;
  }
  try {
    const msg91 = require("msg91");
    return new msg91(env.msg91AuthKey);
  } catch {
    return null;
  }
}

export const msg91SmsProvider: SmsProvider = {
  async send(message) {
    if (!msg91Client) {
      msg91Client = createMsg91Client();
    }

    if (!msg91Client) {
      throw new Error("MSG91 is not configured. Please set MSG91_AUTH_KEY environment variable.");
    }

    try {
      await msg91Client.send(message.to, env.msg91SenderId || "Tessera", message.text);
    } catch (error) {
      console.error("[sms:msg91] Failed to send SMS:", error);
      throw new Error("Failed to send SMS. Please try again later.");
    }
  },
};

// Twilio WhatsApp Provider
export const twilioWhatsAppProvider: WhatsAppProvider = {
  async send(message) {
    if (!twilioClient) {
      twilioClient = createTwilioClient();
    }

    if (!twilioClient) {
      throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.");
    }

    try {
      await twilioClient.messages.create({
        body: message.text,
        from: `whatsapp:${env.twilioWhatsAppNumber}`,
        to: `whatsapp:${message.to}`,
      });
    } catch (error) {
      console.error("[whatsapp:twilio] Failed to send WhatsApp message:", error);
      throw new Error("Failed to send WhatsApp message. Please try again later.");
    }
  },
};

// Meta WhatsApp Business API Provider
let metaWhatsAppClient: any = null;

function createMetaWhatsAppClient(): any {
  if (!env.metaWhatsAppAccessToken || !env.metaWhatsAppPhoneNumberId) {
    return null;
  }
  return {
    send: async (to: string, text: string) => {
      const response = await fetch(`https://graph.facebook.com/v18.0/${env.metaWhatsAppPhoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.metaWhatsAppAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          text: { body: text },
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Meta WhatsApp API error: ${error}`);
      }
    },
  };
}

export const metaWhatsAppProvider: WhatsAppProvider = {
  async send(message) {
    if (!metaWhatsAppClient) {
      metaWhatsAppClient = createMetaWhatsAppClient();
    }

    if (!metaWhatsAppClient) {
      throw new Error("Meta WhatsApp is not configured. Please set META_WHATSAPP_ACCESS_TOKEN and META_WHATSAPP_PHONE_NUMBER_ID environment variables.");
    }

    try {
      await metaWhatsAppClient.send(message.to, message.text);
    } catch (error) {
      console.error("[whatsapp:meta] Failed to send WhatsApp message:", error);
      throw new Error("Failed to send WhatsApp message. Please try again later.");
    }
  },
};

export function getSmsProvider(): SmsProvider {
  // Priority: Twilio > MSG91 > logSmsProvider (development)
  if (env.twilioAccountSid && env.twilioAuthToken) {
    return twilioSmsProvider;
  }
  if (env.msg91AuthKey) {
    return msg91SmsProvider;
  }
  return logSmsProvider;
}

export function getWhatsAppProvider(): WhatsAppProvider {
  // Priority: Meta WhatsApp > Twilio WhatsApp > logWhatsAppProvider (development)
  if (env.metaWhatsAppAccessToken && env.metaWhatsAppPhoneNumberId) {
    return metaWhatsAppProvider;
  }
  if (env.twilioAccountSid && env.twilioAuthToken && env.twilioWhatsAppNumber) {
    return twilioWhatsAppProvider;
  }
  return logWhatsAppProvider;
}

export async function sendOtpToPhone(phone: string, otp: string): Promise<{ smsSent: boolean; whatsappSent: boolean }> {
  const smsProvider = getSmsProvider();
  const whatsappProvider = getWhatsAppProvider();
  
  const message = `Your TesseraCareerBridge verification code is ${otp}. It expires in 10 minutes.`;
  
  let smsSent = false;
  let whatsappSent = false;
  
  try {
    await smsProvider.send({ to: phone, text: message });
    smsSent = true;
  } catch (error) {
    console.error("[messaging] SMS delivery failed:", error);
  }
  
  try {
    await whatsappProvider.send({ to: phone, text: message });
    whatsappSent = true;
  } catch (error) {
    console.error("[messaging] WhatsApp delivery failed:", error);
  }
  
  return { smsSent, whatsappSent };
}
