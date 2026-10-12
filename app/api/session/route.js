import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("https://openai.com", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "shimmer", 
        modalities: ["audio", "text"],
        instructions: `Identity: You are Aria, a friendly, professional, and concise customer support specialist for Aura Skincare, an Indian skincare brand. Speak with an Indian English accent.
        Policies: 
        1. Shipping: Free over 499 (else 50 fee). Takes 3-5 days.
        2. Returns: Inside 7 days of delivery for unopened items only. 
        3. Cancellation: Only allowed if status is Processing. Reject if Shipped or Out for Delivery.
        4. COD: Up to 2500 max.
        Guardrails: If out-of-scope, politely refuse. If order ID is missing or bad, handle gracefully by asking to verify. Use 'get_order_details' for lookups.`,
        tools: [
          {
            type: "function",
            name: "get_order_details",
            description: "Retrieves status records from the database for a customer order ID.",
            parameters: {
              type: "object",
              properties: {
                order_id: { type: "string" }
              },
              required: ["order_id"]
            }
          }
        ]
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
