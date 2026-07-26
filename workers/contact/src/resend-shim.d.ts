declare module "resend" {
  export interface SendEmailOptions {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
    html: string;
  }

  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(options: SendEmailOptions): Promise<{ error?: unknown }>;
    };
  }
}
