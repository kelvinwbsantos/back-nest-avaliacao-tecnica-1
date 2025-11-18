import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false,
            auth: {
                user: 'e6f415061324b2',
                pass: '4fccb70e7222b5',
            }
        })
    }

async sendInvitationEmail(email: string, token: string): Promise<void> {
    const link = `http://mas.tiweb.app.br/invite/${token}`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você foi convidado!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1a73e8, #34a853); padding: 32px 20px;">
              <h1 style="color: white; margin: 0; font-weight: 600; font-size: 28px;">🎉 Você foi convidado!</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">Junte-se à nossa plataforma e faça parte da inovação.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Olá!<br>
                Você recebeu um convite especial para se juntar à <strong>Technology Solutions</strong>.
              </p>
              <p style="color: #5f6368; font-size: 15px; margin-top: 20px;">
                Clique no botão abaixo para aceitar o convite e criar sua conta:
              </p>

              <!-- CTA Button -->
              <div style="margin: 32px 0;">
                <a href="${link}"
                  style="display: inline-block; background-color: #1a73e8; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                  Aceitar Convite
                </a>
              </div>

              <!-- Fallback Link -->
              <p style="color: #5f6368; font-size: 13px; margin-top: 24px;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${link}" style="color: #1a73e8; word-break: break-all;">${link}</a>
              </p>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;">

              <p style="color: #80868b; font-size: 13px; line-height: 1.5;">
                Se você não solicitou este convite, por favor ignore este e-mail.<br>
                Sua segurança é nossa prioridade.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #f1f3f4; color: #5f6368; font-size: 12px;">
              <p style="margin: 4px 0;">
                © ${new Date().getFullYear()} Technology Solutions — Transformando ideias em realidade.
              </p>
              <p style="margin: 4px 0;">
                techsol@mail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
        await this.transporter.sendMail({
            from: '"Technology Solutions" <techsol@mail.com>',
            to: email,
            subject: '🎉 Você foi convidado para a Technology Solutions!',
            html: emailHtml,
        });
    } catch (error) {
        throw new InternalServerErrorException('Erro ao enviar o e-mail de convite');
    }
}
}
