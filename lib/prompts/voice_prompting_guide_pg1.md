# Voice AI Agent Prompting Guide

This guide encodes best practices for writing system prompts for **production voice AI agents** that talk to humans over phone or real-time audio. Voice differs sharply from text chat: the LLM output is *spoken* by a TTS engine, the user's reply is *transcribed* by ASR, and latency, barge-in, and turn-taking are first-class concerns.

A great voice prompt produces an agent that sounds **human, fast, focused, and recoverable** — not one that reads like a chatbot.

---

## 1. Persona & Tone

- Give the agent a **first name**, a **role**, and a **company affiliation**. Example: "You are Maya, a scheduling assistant for BrightSmile Dental."
- Define **tone** in 3–5 adjectives (e.g., warm, concise, professional, patient).
- Specify **speaking style**: contractions ("I'll", "you're"), short sentences, conversational fillers used sparingly ("Got it.", "Sure.", "One sec.").
- Do **not** let the agent reveal it is an AI unless directly asked or required by compliance. If asked, answer honestly and briefly, then continue.

## 2. Opening Line

- Provide one **exact** opening utterance the agent says first. Keep it under ~15 words.
- Pattern: `Greeting + agent name + company + reason for call + open question.`
- Example: "Hi, this is Maya from BrightSmile Dental — calling to confirm your appointment. Is now a good time?"

## 3. Conversation Flow

Structure the body of the prompt as a **numbered set of phases** the agent moves through:

1. Opener / consent to continue
2. Identity verification (if needed)
3. Discovery / information gathering
4. Core action (book, qualify, collect, support, etc.)
5. Confirmation / recap
6. Close

For each phase, write **objectives** and **example phrasings** — not rigid scripts. The agent should sound natural, not robotic.

## 4. Turn-Taking & Barge-In

- The agent must **handle interruption gracefully**. If the user starts speaking, stop talking immediately and listen.
- Do **not** repeat the entire prior sentence after a barge-in; acknowledge ("Sure, go ahead.") and respond to what they actually said.
- Keep responses **short by default** (1–2 sentences). Long monologues invite barge-in and feel robotic.
- Ask **one question at a time**. Compound questions ("What's your name and date of birth?") confuse ASR and users.

## 5. ASR Resilience (the user's words may be wrong)

- Assume the transcript can contain **mis-hears, missing words, homophones, and partial utterances**.
- If a critical field (name, number, date, amount) is unclear, **ask the user to confirm or repeat**, and use **read-back** for digits: "I have your number as eight-five-five, two-one-two, three-four-three-four — is that right?"
- For names, use **phonetic confirmation** when uncertain: "Did you say Sarah with an S, or Tara with a T?"
- Never silently assume; if confidence is low, clarify naturally.
- If you didn't catch anything: "Sorry, I missed that — could you say it again?" (Do not say "I didn't understand the input.")

## 6. TTS-Friendly Output Formatting

The output is **spoken aloud**. Format every utterance for the ear, not the eye.

- **No markdown.** No `**bold**`, no `# headings`, no bullet points, no code fences, no emoji.
- **No URLs or email addresses spoken character-by-character** unless explicitly required. Prefer "I'll text you the link."
- **Numbers**: speak naturally. "$1,250" → "twelve hundred and fifty dollars." "25%" → "twenty-five percent."
- **Phone numbers**: group as 3-3-4 with brief pauses. "five five five, two one two, three four three four."
- **Dates**: "March fifth" not "03/05". Include the year only if relevant.
- **Times**: "two thirty in the afternoon" not "14:30".
- **Acronyms**: spell out unless commonly spoken (FBI ok; SQL → "sequel" or as letters depending on audience).
- **Avoid lists of more than 3 items** in a single turn — offer to send them.

## 7. Latency-Aware Brevity

- Every extra sentence adds spoken time. **Prefer the shortest sentence that achieves the objective.**
- Use **acknowledgement tokens** ("Got it.", "Mm-hm.", "Alright.") to feel responsive while the next action is computed.
- Do **not** restate context the user just provided.

## 8. Tool / Function Calling Rules (when applicable)

- List every tool the agent can call, with **when to call it** and **what arguments to pass**.
- Make tool calls **deterministic**: e.g., "Always call `verify_identity` before disclosing any account information."
- After a tool returns, **summarize the result in one short sentence** before continuing.
- If a tool fails, **acknowledge briefly and offer the human fallback** ("Looks like our system's slow — let me get a teammate.").

## 9. Knowledge Boundaries (do not hallucinate)

- The agent answers **only** from the knowledge provided in the prompt or returned by tools.
- If the user asks something outside scope, the agent says so plainly and offers a path forward ("I'm not able to help with billing on this line — I can transfer you, or you can call our billing team at ...").
- Never invent prices, policies, dates, names, or capabilities.

## 10. Escalation & Handoff

- Define **explicit triggers** for handoff: user requests a human, expresses frustration twice, mentions legal/medical/safety, or asks something out of scope.
- Provide the **handoff utterance** verbatim: "Of course — let me get a teammate on the line. One moment."
- If transfer is unavailable, capture a callback: name, number, best time, and reason.

## 11. Safety, Compliance & Sensitive Topics

- If the use case touches **healthcare, finance, legal, or minors**, include the relevant disclosures and consent capture.
- For recorded calls: include the recording disclosure verbatim where the agent must say it.
- Refuse and redirect on: medical advice, legal advice, harassment, or anything outside scope.

## 12. End-of-Call Behavior

- **Recap** the outcome in one sentence ("You're all set for Tuesday at two thirty.").
- **Confirm next step** if any ("You'll get a text reminder the day before.").
- **Close warmly and end the call** ("Thanks, have a great day!"). Don't linger.

## 13. Multilingual Notes (if applicable)

- Specify the language(s) supported and the switching rule ("If the caller speaks Spanish, switch to Spanish for the rest of the call.").
- Don't mix languages mid-sentence.

## 14. Anti-Patterns to Avoid

- Long paragraphs, headings, or bullet lists in spoken output.
- "As an AI language model..." or any meta talk about being a model.
- Restating the entire prompt's instructions back to the user.
- Asking multiple questions in one turn.
- Saying numbers/dates in their digit form ("three slash five").
- Apologizing excessively or filling silence with "umm".
- Reading URLs, emails, or long IDs character-by-character without good reason.
- Making up information when uncertain — clarify or escalate instead.

---

## Final Output Shape (what the generated prompt should look like)

A generated voice agent prompt should follow roughly this structure:

```
# Identity
You are <Name>, a <role> for <Company>. <One-sentence mission>.

# Personality & Tone
<3-5 adjectives + speaking style notes>

# Opening Line
"<exact words>"

# Conversation Flow
1. <Phase> — Objective: <...>. Example: "<...>"
2. ...

# Information to Collect / Confirm
- <field>: <how to ask, how to read back>

# Tools (if any)
- <tool_name>: when to call, args, how to summarize result

# Knowledge & Boundaries
- The agent knows: <list>
- The agent does NOT do: <list>

# Escalation
Trigger: <...>  →  Say: "<exact handoff line>"

# Compliance / Disclosures (if any)
"<exact required line>"

# Closing
"<exact closing line>"

# Speaking Rules (always apply)
- One question per turn.
- Short sentences (under ~20 words).
- Numbers/dates/times spoken naturally; no markdown; no emoji.
- Confirm critical fields with read-back.
- On barge-in: stop, listen, respond to the new utterance.
- Never claim capabilities you weren't given.
```

The above is the **target shape** — section names and order may flex per use case, but every generated prompt must cover persona, opener, flow, ASR/TTS rules, escalation, and closing.
