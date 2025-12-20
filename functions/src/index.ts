/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import type {Request, Response} from "express";
import * as logger from "firebase-functions/logger";
import {GoogleGenerativeAI} from "@google/generative-ai";

setGlobalOptions({maxInstances: 10});

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const testGemini = onRequest(
  {secrets: [GEMINI_API_KEY]},
  async (_req: Request, res: Response) => {
    try {
      const apiKey = GEMINI_API_KEY.value();
      if (!apiKey) {
        res.json({error: "GEMINI_API_KEY is not set"});
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(
        "Say: Gemini API is working correctly"
      );

      res.json({
        ok: true,
        output: result.response.text(),
      });
    } catch (err: unknown) {
      const message =
        typeof (err as any)?.message === "string"
          ? (err as any).message
          : "Gemini request failed";

      logger.error("testGemini error", err);
      res.status(500).json({error: message});
    }
  }
);