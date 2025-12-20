/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {HttpsError, onCall, onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import type {Request, Response} from "express";
import * as logger from "firebase-functions/logger";
import {GoogleGenerativeAI} from "@google/generative-ai";

setGlobalOptions({maxInstances: 10});

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

type ProfileFeedback = {
  strengths: string[];
  suggestions: string[];
  exampleRewrite: string;
};

function safeJsonParse(text: string): ProfileFeedback {
  try {
    return JSON.parse(text) as ProfileFeedback;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as ProfileFeedback;
    }
    throw new Error("Gemini response was not valid JSON");
  }
}

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

export const generateProfileFeedback = onCall(
  {secrets: [GEMINI_API_KEY]},
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const profileText =
      typeof request.data?.profileText === "string"
        ? request.data.profileText.trim()
        : "";

    if (!profileText) {
      throw new HttpsError(
        "invalid-argument",
        "profileText must be a non-empty string."
      );
    }

    const apiKey = GEMINI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = [
      "You are a career mentor and writing assistant for student profiles.",
      "Return STRICT JSON only with this exact schema:",
      '{"strengths": string[], "suggestions": string[], "exampleRewrite": string}',
      "Rules:",
      "- Identify strengths in the profile.",
      "- Suggest improvements or missing information.",
      "- Optionally include an example rewrite.",
      "- DO NOT invent skills, experience, credentials, or education.",
      "- DO NOT automate decisions.",
      "- Keep suggestions actionable and concise.",
      "Profile:",
      profileText,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    let feedback: ProfileFeedback;
    try {
      feedback = safeJsonParse(rawText);
    } catch (err) {
      throw new HttpsError(
        "internal",
        "Failed to parse Gemini JSON response.",
        String((err as Error)?.message ?? err)
      );
    }

    const strengths = Array.isArray(feedback.strengths)
      ? feedback.strengths.filter((s) => typeof s === "string")
      : [];
    const suggestions = Array.isArray(feedback.suggestions)
      ? feedback.suggestions.filter((s) => typeof s === "string")
      : [];
    const exampleRewrite =
      typeof feedback.exampleRewrite === "string" ? feedback.exampleRewrite : "";

    await admin.firestore().doc(`users/${uid}`).set(
      {
        aiProfileFeedback: {
          strengths,
          suggestions,
          exampleRewrite,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      {merge: true}
    );

    return {
      strengths,
      suggestions,
      exampleRewrite,
    } satisfies ProfileFeedback;
  }
);
