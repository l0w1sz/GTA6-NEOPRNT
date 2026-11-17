import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import {
  buildGtaViImagePrompt,
  buildGtaViSpec,
  type GtaViArtDirectionTuning,
} from "./src/utils/specBuilder.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IMAGE_MODEL = "gemini-3.1-flash-lite-image";
const METADATA_MODEL = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const err = new Error(
      "Chave GEMINI_API_KEY não configurada no ambiente do servidor. Configure-a no painel Settings > Secrets."
    ) as Error & { statusCode?: number; code?: string };
    err.statusCode = 500;
    err.code = "MISSING_API_KEY";
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseApiError(error: unknown): {
  status: number;
  message: string;
  code: string;
} {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "Erro desconhecido");
  const statusCode =
    typeof (error as { statusCode?: number }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 500;

  if (
    rawMessage.includes("MISSING_API_KEY") ||
    rawMessage.includes("GEMINI_API_KEY")
  ) {
    return {
      status: 500,
      code: "MISSING_API_KEY",
      message:
        "Chave GEMINI_API_KEY não configurada no servidor. Verifique a aba Settings > Secrets.",
    };
  }
  if (
    statusCode === 403 ||
    rawMessage.includes("PERMISSION_DENIED") ||
    rawMessage.includes("API_KEY_INVALID")
  ) {
    return {
      status: 403,
      code: "AUTH_OR_PERMISSION",
      message:
        "Permissão negada ou chave inválida na API Gemini. Verifique sua chave ou faturamento no painel Settings > Secrets.",
    };
  }
  if (statusCode === 429 || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      code: "QUOTA_EXCEEDED",
      message:
        "Limite de cota atingido na API Gemini (429). Aguarde alguns instantes ou verifique o plano de faturamento em Settings > Secrets.",
    };
  }
  if (statusCode === 404 || rawMessage.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "MODEL_NOT_FOUND",
      message: `Modelo de geração não encontrado ou indisponível para a chave atual (${IMAGE_MODEL}).`,
    };
  }
  return {
    status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    code: "GEMINI_PIPELINE_ERROR",
    message: rawMessage,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));

  app.get("/api/health", (_req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      status: "ok",
      geminiConfigured: Boolean(key && key !== "MY_GEMINI_API_KEY"),
      models: {
        image: IMAGE_MODEL,
        metadata: METADATA_MODEL,
      },
    });
  });

  app.post("/api/generate-key-art", async (req, res) => {
    try {
      const { imageBase64, mimeType, tuning } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        tuning?: GtaViArtDirectionTuning;
      };

      if (!imageBase64 || typeof imageBase64 !== "string") {
        res.status(400).json({
          code: "INVALID_INPUT",
          error: "Envie uma imagem válida em base64 para processamento.",
        });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
      const safeMime =
        typeof mimeType === "string" && mimeType.startsWith("image/")
          ? mimeType
          : "image/jpeg";

      if (cleanBase64.length < 32) {
        res.status(400).json({
          code: "INVALID_IMAGE",
          error: "Arquivo de imagem vazio ou corrompido.",
        });
        return;
      }

      const ai = getGeminiClient();
      const imagePrompt = buildGtaViImagePrompt(tuning);

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: safeMime,
        },
      };

      // Stage 1 & Stage 2 in parallel: generate 3:4 GTA VI Vice City Key Art + extract structured user features
      const [imageResult, metadataResult] = await Promise.all([
        ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: {
            parts: [imagePart, { text: imagePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "3:4",
            },
          },
        }),
        ai.models.generateContent({
          model: METADATA_MODEL,
          contents: {
            parts: [
              imagePart,
              {
                text: "Analise a foto enviada e descreva objetivamente em português (até 28 palavras) os traços visíveis da pessoa: tom de pele, cor dos olhos, formato/cor das sobrancelhas, cabelo (comprimento, cor, textura, divisão), barba (ou 'sem barba') e vestimenta principal.",
              },
            ],
          },
          config: {
            systemInstruction:
              "Você é um Diretor de Arte e Engenheiro de Pré-Impressão. Retorne apenas JSON válido contendo a descrição fiel dos traços visíveis da foto original.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detected_user_features: {
                  type: Type.STRING,
                  description:
                    "Descrição concisa de traços faciais, olhos, cabelo, barba e vestimenta detectados na foto original.",
                },
              },
              required: ["detected_user_features"],
            },
          },
        }),
      ]);

      let generatedImageDataUrl: string | null = null;
      const parts = imageResult.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          generatedImageDataUrl = `data:${outMime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!generatedImageDataUrl) {
        res.status(502).json({
          code: "NO_IMAGE_RETURNED",
          error:
            "O modelo de imagem não retornou dados binários de imagem na resposta. Tente outra foto frontal com boa nitidez.",
        });
        return;
      }

      let detectedFeatures =
        "traços faciais, olhos, cabelo e vestimenta preservados da foto original";
      try {
        const parsed = JSON.parse((metadataResult.text ?? "{}").trim()) as {
          detected_user_features?: string;
        };
        if (
          parsed.detected_user_features &&
          parsed.detected_user_features.trim().length > 2
        ) {
          detectedFeatures = parsed.detected_user_features.trim();
        }
      } catch {
        // Keep safe descriptive fallback if JSON text parsing fails
      }

      const spec = buildGtaViSpec(detectedFeatures);

      res.json({
        generatedImageDataUrl,
        spec,
        models: {
          image: IMAGE_MODEL,
          metadata: METADATA_MODEL,
        },
      });
    } catch (error) {
      const parsed = parseApiError(error);
      res.status(parsed.status).json({
        code: parsed.code,
        error: parsed.message,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Liberty Pre-Press Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
