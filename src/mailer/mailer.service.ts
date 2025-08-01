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
        const link = `http://localhost:4200/invite/${token}`;

        try {
            await this.transporter.sendMail({
                from: '"Technology Solutions" <techsol@mail.com>',
                to: email,
                subject: 'Você foi convidado!',
                html: `
          <h2>Convite para se juntar à nossa plataforma 🎉</h2>
          <p>Clique no link abaixo para aceitar o convite:</p>
          <a href="${link}">${link}</a>
          <p>Se você não solicitou esse convite, ignore este e-mail.</p>
        `,
            });
        } catch (error) {
            throw new InternalServerErrorException('Erro ao enviar o e-mail de convite');
        }
    }
}
