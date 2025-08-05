import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Invite, InviteStatus } from './entities/invite.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InvitesService {
    constructor(
        @InjectRepository(Invite)
        private inviteRepository: Repository<Invite>,
        private mailerService: MailerService,
        private readonly jwtService: JwtService,
    ) { }

    async createInvite(createInviteDto: CreateInviteDto) {
        const { email, sender } = createInviteDto;

        const existingInvite = await this.inviteRepository.findOne({
            where: { email }
        });

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
        const payload = { email, sender };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
        });

        if (existingInvite) {
            if (existingInvite.status === InviteStatus.PENDING ||
                existingInvite.status === InviteStatus.COMPLETED
            ) {
                throw new ConflictException('User already been invited.');
            }

            if (existingInvite.status === InviteStatus.EXPIRED) {
                existingInvite.token = token;
                existingInvite.status = InviteStatus.PENDING;
                existingInvite.createdAt = now;
                existingInvite.expiresAt = expiresAt;
                existingInvite.sender = sender;

                await this.inviteRepository.save(existingInvite);
                await this.mailerService.sendInvitationEmail(email, token);

                return existingInvite;
            }
        }

        const invite = this.inviteRepository.create({
            email,
            token,
            sender,
            status: InviteStatus.PENDING,
            createdAt: now,
            expiresAt,
        });

        await this.inviteRepository.save(invite);
        await this.mailerService.sendInvitationEmail(email, token);

        return invite;
    }


    async validateToken(token: string) {
        let payload: { email: string; sender: string };

        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (err) {
            throw new BadRequestException('Invalid or expired token');
        }

        const { email } = payload;

        const invite = await this.inviteRepository.findOne({ where: { email, token } });

        if (!invite) throw new NotFoundException('Invite not found');
        if (invite.status === InviteStatus.COMPLETED) throw new BadRequestException('Invite already used');

        if (new Date() > invite.expiresAt) {
            invite.status = InviteStatus.EXPIRED;
            await this.inviteRepository.save(invite);
            throw new BadRequestException('Expired invite');
        }

        return { email: invite.email, sender: invite.sender};
    }

    async completeInvite(token: string) {
        const existingInvite = await this.inviteRepository.findOne({
            where: { token }
        });

        if (!existingInvite) {
            throw new NotFoundException('Invite not found');
        }

        existingInvite.status = InviteStatus.COMPLETED;
        await this.inviteRepository.save(existingInvite);

        return existingInvite;
    }
}
