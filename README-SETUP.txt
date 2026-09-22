FASQOO AI NETWORK TECHNICIAN - SETUP

Files
-----
1. Upload faq.html to the website root and replace the existing FAQ file.
2. Upload fasqoo-ai.js to /api/fasqoo-ai.js on the Vercel project.

Vercel Environment Variable
---------------------------
Name:  OPENAI_API_KEY
Value: your OpenAI API key
Environment: Production (and Preview if you want to test there)

Important
---------
- Never put OPENAI_API_KEY inside faq.html or browser JavaScript.
- The browser calls /api/fasqoo-ai; the API key stays on the Vercel server.
- The old GEMINI_API_KEY is no longer required for this version.
- Redeploy the Vercel project after adding/changing the environment variable.

What this version does
----------------------
- Fasqoo-branded AI Network Technician.
- Uses the OpenAI Responses API with GPT-5.6 Luna.
- Replies in the language selected on the FAQ page.
- Keeps the existing Fasqoo FAQ design and chat layout.
- Uses conversation history for follow-up questions.
- Can analyze visitor-provided download, upload, ping, jitter and packet-loss values.
- Separates known values, likely causes, next diagnostic tests and practical fixes.
- Never exposes the server-side API key to visitors.
- Does not invent ISP phone numbers, measurements, outages or live device/network access.

HTML FIX INCLUDED
-----------------
The uploaded faq.html contained an early </body></html> before the rest of the FAQ page.
That invalid structure has been corrected without changing the existing Fasqoo page design.
