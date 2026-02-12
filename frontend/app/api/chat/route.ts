import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant for the Gangas-River flood management system. You help citizens with flood alerts, safe routes, and reporting incidents. Keep your answers concise and helpful."
                },
                {
                    role: "user",
                    content: message,
                }
            ],
            model: "llama3-8b-8192", // Fast and efficient
            temperature: 0.7,
            max_tokens: 154,
            top_p: 1,
            stream: false,
            stop: null,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't understand that.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Groq API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
