import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/index";
import { User } from "../models/User";
import { Types } from "mongoose";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { GoogleGenAI } from "@google/genai";
import type { InngestEvent } from "../types/inngest";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "AIzaSyA_YkU0Mfu4RW8N9Ezve1twfXf7XlnneTs"
});



// create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const userId = new Types.ObjectId(req.user._id);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //generate a unique session ID
        const sessionId = uuidv4();
        const session = new ChatSession({
            sessionId,
            userId,
            startTime: new Date(),
            status: "active",
            messages: [],
          });

          await session.save();

          res.status(201).json({
            message: "Chat session created successfully",
            sessionId: session.sessionId,
          });
    } catch (error) {
        logger.error("Error creating chat session:",error);
        res.status(500).json({
            message: "Error creating chat session",
            error: error instanceof Error ? error.message : "Unkonown error",
        });
    }
};


//send a message to the chat session
export const sendMessage = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { sessionId } = req.params;
        const { message } = req.body;
        const userId = new Types.ObjectId(req.user._id);

        logger.info("Proccessing message: ",{ sessionId, message });
        const session = await ChatSession.findOne({ sessionId, userId });

        if (!session) {
            logger.warn("Session not found:", {sessionId});
            return res.status(404).json({ message: "Session not found "});
        }
        if (session.userId.toString() !== userId.toString()) {
            logger.warn("Unauthorized access attempt:", { sessionId, userId });
            return res.status(403).json({ message: "Unauthorized" });
        }
        // create inngest event for message processing
        const event: InngestEvent = {
            name: "chat/message.process",
            data: {
                message,
                history: session.messages,
                memory: {
                    userProfile: {
                        emotionalState: [],
                        riskLevel: 0,
                        preferences: {},
                    },
                    sessionContext: {
                        conversationThemes: [],
                        currentTechnique: null,
                    },
                },
                goals: [],
                systemPrompt: `You are an AI therapist assistant. Your role is to:
                1. Provide empathetic and supportive responses
                2. Use evidence-based therapeutic techniques
                3. Maintain professional boundaries
                4. Monitor for risk factors
                5. Guide users toward their therapeutic goals`,
            },
        };

        logger.info("Sending message to inngest:",{ event });
        
        await inngest.send(event);
        const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
        Message: ${message}
        Context: ${JSON.stringify({
        memory: event.data.memory,
        goals: event.data.goals,
        })}

        Required JSON structure:
        {
            "emotionalState": "string",
            "themes": ["string"],
            "riskLevel": number,
            "recommendedApproach": "string",
            "progressIndicators": ["string"]
        }`;

        const analysisResponse = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: analysisPrompt,
        });

        const analysisText = analysisResponse.text || "";
        const analysis = JSON.parse(analysisText);

        //generate therapeutic response
        const responsePrompt = `${event.data.systemPrompt}
        Based on the following context, generate a therapeutic response:
        Message: ${message}
        Analysis: ${JSON.stringify(event.data.memory)}
        Goals: ${JSON.stringify(event.data.goals)}
        
        Provide a response that:
        1. Addresses the immediate emotional needs
        2. Uses appropriate therapeutic techniques
        3. Shows empathy and understanding
        4. Maintains professional boundaries
        5. Considers safety and well-being`;

        const responseResult = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: responsePrompt,
        });

        const response_ = responseResult.text;
        logger.info("Generated response:", response_);

        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });

        session.messages.push({
            role: "assistant",
            content: response_ || "No response generated",
            timestamp: new Date(),
            metadata: {
                analysis,
                progress: {
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });

        //save updated session
        await session.save();
        logger.info("Session updated successfully:",{ sessionId });
        res.json({
            response: response_, message: response_, analysis, metadata:{
                progress:{
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });
    } catch (error) {
        logger.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Error processing message",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

};

// Get chat session history
export const getSessionHistory = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = req.user;
      const { sessionId } = req.params;
      const userId = new Types.ObjectId(user._id);
  
      const session = (await ChatSession.findById(
        sessionId
      ).exec()) as IChatSession | null;
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
  
      if (session.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      res.json({
        messages: session.messages,
        startTime: session.startTime,
        status: session.status,
      });
    } catch (error) {
      logger.error("Error fetching session history:", error);
      res.status(500).json({ message: "Error fetching session history" });
    }
  };

  export const getChatSession = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      logger.info(`Getting chat session: ${sessionId}`);
      const chatSession = await ChatSession.findOne({ sessionId });
      if (!chatSession) {
        logger.warn(`Chat session not found: ${sessionId}`);
        return res.status(404).json({ error: "Chat session not found" });
      }
      logger.info(`Found chat session: ${sessionId}`);
      res.json(chatSession);
    } catch (error) {
      logger.error("Failed to get chat session:", error);
      res.status(500).json({ error: "Failed to get chat session" });
    }
  };
  
  export const getChatHistory = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = req.user;
      const { sessionId } = req.params;
      const userId = new Types.ObjectId(user._id);
  
      // Find session by sessionId instead of _id
      const session = await ChatSession.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
  
      if (session.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      res.json(session.messages);
    } catch (error) {
      logger.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Error fetching chat history" });
    }
  };