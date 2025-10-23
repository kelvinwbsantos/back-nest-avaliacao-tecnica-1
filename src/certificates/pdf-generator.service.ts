import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';

@Injectable()
export class PdfGeneratorService {
  async generate(pdfData: any): Promise<Buffer> {
    // Carregar o PDF existente
    const existingPdfBytes = fs.readFileSync('src/certificates/certificate-templates/certificado_modelo.pdf');

    // Carregar o documento PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Acessar a primeira página do PDF (ou outra página, se necessário)
    const page = pdfDoc.getPages()[0];

    // Obter as dimensões da página
    const { width, height } = page.getSize(); // Obtém width e height dinamicamente

    // Embutir fontes
    const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
    const fontRegular = await pdfDoc.embedFont('Helvetica');

    // Função para centralizar o texto
    const getCenteredPosition = (text: string, font: any, fontSize: number): number => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return (width - textWidth) / 2;
    };

    // Adicionar o nome do usuário (centrado)
    const nameX = getCenteredPosition(pdfData.name, fontBold, 24);
    page.drawText(pdfData.name, {
      x: nameX,
      y: height / 2 + 24,
      size: 24,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Adicionar o nome do curso (centrado)
    const certificationNameX = getCenteredPosition(pdfData.certificationName, fontRegular, 18);
    page.drawText(pdfData.certificationName, {
      x: certificationNameX,
      y: height - 350,
      size: 18,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    // Adicionar o id da certificação (centrado)
    const certificateIdX = getCenteredPosition(pdfData.certificateId, fontRegular, 12);
    page.drawText(pdfData.certificateId, {
      x: certificateIdX,
      y: 100,
      size: 12,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    // Adicionar a data de emissão (centrado)
    const issueDateX = getCenteredPosition(`Data de Emissão: ${pdfData.issueDate}`, fontRegular, 12);
    page.drawText(`Data de Emissão: ${pdfData.issueDate}`, {
      x: issueDateX,
      y: 80,
      size: 12,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    // Gerar o PDF modificado como buffer
    const pdfBytes = await pdfDoc.save();

    // Retornar o PDF como Buffer
    return Buffer.from(pdfBytes);
  }
}
