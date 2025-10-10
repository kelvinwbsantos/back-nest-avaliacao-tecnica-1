import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

interface GeneratedQuestion {
  question: string;
  answer: boolean;
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não está configurada no .env');
    }
    
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateQuestionsFromPDF(
    pdfBuffer: Buffer,
    quantity: number
  ): Promise<GeneratedQuestion[]> {
    const prompt = `
Você é um especialista em criar questões de verdadeiro ou falso.

Com base no conteúdo do PDF anexado, crie exatamente ${quantity} questões de verdadeiro/falso.

REGRAS IMPORTANTES:
1. Crie questões claras e objetivas
2. Metade das questões deve ter resposta VERDADEIRA e metade FALSA
3. As questões falsas devem conter informações sutilmente incorretas
4. Baseie-se APENAS no conteúdo do PDF fornecido
5. Retorne APENAS um JSON válido, sem explicações adicionais

FORMATO DE RESPOSTA (JSON):
[
  {
    "question": "texto da pergunta aqui",
    "answer": true
  },
  {
    "question": "texto da pergunta aqui",
    "answer": false
  }
]

Retorne apenas o array JSON com as ${quantity} questões:
`;

    try {
      // Converter o buffer do PDF para base64
      const pdfBase64 = pdfBuffer.toString('base64');

      // Enviar o PDF diretamente para o Gemini
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64
            }
          }
        ]
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error('Resposta do Gemini está vazia ou indefinida');
      }
      
      // Extrair JSON da resposta (remove markdown se houver)
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const questions: GeneratedQuestion[] = JSON.parse(jsonText);
      
      // Validação
      if (!Array.isArray(questions) || questions.length !== quantity) {
        throw new Error('Resposta inválida do Gemini: número de questões incorreto');
      }

      return questions;
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      throw new BadRequestException(
        'Erro ao gerar questões com IA. Tente novamente ou ajuste o PDF.'
      );
    }
  }
}