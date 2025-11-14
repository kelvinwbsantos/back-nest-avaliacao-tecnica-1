import { Injectable, Logger } from '@nestjs/common';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Transaction } from '@mysten/sui/transactions';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';

@Injectable()
export class SuiService {
  private suiClient: SuiClient;
  private adminKeypair: Secp256k1Keypair;
  private packageId: string;
  private readonly logger = new Logger(SuiService.name);

  constructor() {
    // 1. Conecta na Testnet
    this.suiClient = new SuiClient({
      url: process.env.SUI_NETWORK_URL || getFullnodeUrl('testnet'),
    });

    const pkgId = process.env.SUI_PACKAGE_ID;
    if (!pkgId) {
      throw new Error('CRÍTICO: SUI_PACKAGE_ID não encontrado no arquivo .env');
    }
    this.packageId = pkgId;

    // 2. Prepara a Carteira do Admin
    try {
      const privateKey = process.env.SUI_ADMIN_PRIVATE_KEY;
      if (!privateKey) throw new Error('SUI_ADMIN_PRIVATE_KEY não definida no .env');

      const { secretKey } = decodeSuiPrivateKey(privateKey);
      this.adminKeypair = Secp256k1Keypair.fromSecretKey(secretKey);

      const adminAddress = this.adminKeypair.toSuiAddress();
      this.logger.log(`✅ Carteira Admin carregada: ${adminAddress}`);

    } catch (error) {
      this.logger.error('Erro ao carregar carteira Sui. Verifique o .env', error);
    }
  }

  async mintCertificate(params: {
    studentName: string;
    courseName: string;
    issueDate: string;
    expiresAt: string;
    certificateId: string;
    imageUrl: string;
    studentAddress: string;
  }) {
    this.logger.log(`Iniciando mint para: ${params.studentName}`);

    const tx = new Transaction();

    // 3. Define o alvo
    const target = `${this.packageId}::certificate::mint_certificate`;

    // 4. Prepara os argumentos
    tx.moveCall({
      target: target,
      arguments: [
        tx.pure.string(params.studentName),
        tx.pure.string(params.courseName),
        tx.pure.string(params.issueDate),
        tx.pure.string(params.expiresAt),
        tx.pure.string(params.certificateId),
        tx.pure.string(params.imageUrl),
        tx.pure.address(params.studentAddress),
      ],
    });

    // Dica: Se tiver erro de gás, descomente a linha abaixo:
    // tx.setGasBudget(10000000); 

    try {
      // 5. Assina e Envia
      const result = await this.suiClient.signAndExecuteTransaction({
        signer: this.adminKeypair,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      await this.suiClient.waitForTransaction({ digest: result.digest });

      const createdObject = result.objectChanges?.find(
        (change) => change.type === 'created'
      );

      // @ts-ignore
      const nftId = createdObject?.objectId;

      this.logger.log(`Sucesso! NFT ID: ${nftId} | Tx: ${result.digest}`);

      return {
        success: true,
        txHash: result.digest,
        nftId: nftId,
        explorerLink: `https://suiscan.xyz/testnet/tx/${result.digest}`,
        imageUrl: params.imageUrl // Retornamos a URL para confirmação visual
      };

    } catch (error) {
      this.logger.error(`Falha ao mintar certificado na Sui: ${error.message}`);
      throw new Error('Falha na Blockchain: ' + error.message);
    }
  }

  async validateNft(nftId: string) {
    this.logger.log(`Validando NFT na blockchain: ${nftId}`);

    try {
      const objectResponse = await this.suiClient.getObject({
        id: nftId,
        options: {
          showContent: true,
        },
      });

      if (objectResponse.error || !objectResponse.data) {
        throw new Error('Objeto NFT não encontrado na blockchain.');
      }

      const content = objectResponse.data.content;
      if (!content) {
        throw new Error('Não foi possível ler o conteúdo do objeto.');
      }

      if (content.dataType !== 'moveObject') {
        throw new Error('Este objeto não é um NFT (Move Object) válido.');
      }

      const nftType = content.type;
      const expectedType = `${this.packageId}::certificate::Certificate`;

      if (nftType !== expectedType) {
        this.logger.warn(`FALHA NA VALIDAÇÃO: Package ID não confere.
          Esperado: ${expectedType}
          Recebido: ${nftType}`);

        throw new Error('Falsificação detectada. O emissor (Package ID) deste NFT não é o oficial.');
      }

      this.logger.log(`NFT validado com sucesso. Proprietário: ${objectResponse.data.owner}`);

      return {
        isValid: true,
        message: 'Certificado autêntico, verificado na blockchain.',
        data: content.fields,
        explorerLink: `https://suiscan.xyz/testnet/object/${nftId}`,
      };

    } catch (error) {
      this.logger.error(`Erro na validação: ${error.message}`);
      return {
        isValid: false,
        message: error.message,
        data: null,
      };
    }
  }
}