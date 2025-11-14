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

    // --- CORREÇÃO AQUI ---
    // Verificamos se a variavel existe antes de atribuir.
    // Se não existir, lançamos erro para avisar você logo que o servidor subir.
    const pkgId = process.env.SUI_PACKAGE_ID;
    
    if (!pkgId) {
      throw new Error('CRÍTICO: SUI_PACKAGE_ID não encontrado no arquivo .env');
    }
    
    this.packageId = pkgId; // Agora o TypeScript sabe que 'pkgId' é definitivamente uma string
    // ---------------------

    // 2. Prepara a Carteira do Admin
    try {
      const privateKey = process.env.SUI_ADMIN_PRIVATE_KEY;
      if (!privateKey) throw new Error('SUI_ADMIN_PRIVATE_KEY não definida no .env');

      const { secretKey } = decodeSuiPrivateKey(privateKey);
      this.adminKeypair = Secp256k1Keypair.fromSecretKey(secretKey);

      // ADICIONE ESTA LINHA:
  const adminAddress = this.adminKeypair.toSuiAddress();
  this.logger.log(`✅ Carteira Admin carregada: ${adminAddress}`);
      
    } catch (error) {
      this.logger.error('Erro ao carregar carteira Sui. Verifique o .env', error);
      // Opcional: Se sem carteira o app não deve rodar, dê um throw error aqui também
    }
  }

  async mintCertificate(params: {
    studentName: string;
    courseName: string;
    issueDate: string;
    certificateId: string;
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
        tx.pure.string(params.certificateId),  
        tx.pure.address(params.studentAddress), 
      ],
    });

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
      };

    } catch (error) {
      this.logger.error(`Falha ao mintar certificado na Sui: ${error.message}`);
      throw new Error('Falha na Blockchain: ' + error.message);
    }
  }
}