// Cloudflare Pages Function for Contact Form

interface Env {
  // If you use KV for rate limiting in the future, bind it here
  // RATE_LIMIT_KV: KVNamespace;
  CONTACT_WEBHOOK_URL?: string;
}

export async function onRequestPost(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  // 1. CORS Preflight / Headers
  const origin = request.headers.get("Origin") || "*";
  const headers = new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });

  if (request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);

    // 2. Validate input and check honeypot
    const { name, email, message, _honey } = data;

    if (_honey !== "" && _honey !== undefined) {
      // Bot detected! Return a fake success to deceive the bot.
      return new Response(
        JSON.stringify({ success: false, error: "Invalid submission" }),
        { status: 400, headers }
      );
    }

    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: [{ field: "name", message: "Name is required" }] }),
        { status: 400, headers }
      );
    }
    
    // Basic email regex
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: [{ field: "email", message: "Invalid email address" }] }),
        { status: 400, headers }
      );
    }

    if (!message || message.trim().length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed", details: [{ field: "message", message: "Message must be at least 10 characters" }] }),
        { status: 400, headers }
      );
    }

    // 3. Simple in-memory rate limiting could go here (Cloudflare limits per-colo),
    // or KV-based rate limiting using request.headers.get('cf-connecting-ip').
    // For MVP, we proceed directly.

    // 4. Forward to the actual webhook/email service
    const webhookUrl = env.CONTACT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn("CONTACT_WEBHOOK_URL is not configured.");
      // In development or if unconfigured, we can just return success 
      // without actually sending the email to unblock testing.
      return new Response(
        JSON.stringify({ success: true, message: "Development mode: Message received but not sent." }),
        { status: 200, headers }
      );
    }

    const forwardResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "wchen.ai contact form",
      }),
    });

    if (!forwardResponse.ok) {
      throw new Error(`Webhook responded with ${forwardResponse.status}`);
    }

    // 5. Success
    return new Response(
      JSON.stringify({ success: true, message: "Thanks for reaching out! I'll get back to you soon." }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send message. Please try again later." }),
      { status: 500, headers }
    );
  }
}
