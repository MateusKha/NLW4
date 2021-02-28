import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";

class SendEmailService {
  private client: Transporter;

  constructor() {
    nodemailer.createTestAccount().then((account) => {
      let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.client = transporter;
    });
  }
  async execute(to: string, subject: string, variables: object, path: string) {
    const templateFileContent = fs.readFileSync(path).toString("utf8");

    const emailTemplateParse = handlebars.compile(templateFileContent);
    const html = emailTemplateParse(variables);

    const massage = await this.client.sendMail({
      to,
      subject,
      html,
      from: "NPS <norepley@nps.com.br>",
    });

    console.log("Message sent: %sw", massage.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(massage));
  }
}

export default new SendEmailService();
