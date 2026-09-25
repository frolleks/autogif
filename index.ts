import { Client, Events, GatewayIntentBits } from "discord.js";
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter(); // reads OPENROUTER_API_KEY

const MOODS = {
  happy: "cheerful, pleased, content, glad",
  excited: "thrilled, hyped, celebrating good news",
  love: "affection, adoration, gratitude, wholesome warmth",
  funny: "joking, laughing, amused, playful banter",
  sad: "grief, loss, disappointment, loneliness",
  angry: "frustrated, annoyed, furious, ranting",
  scared: "afraid, anxious, nervous, creeped out",
  surprised: "shocked, amazed, caught off guard",
  confused: "puzzled, lost, unsure what is going on",
  "bored/tired": "bored, sleepy, exhausted, unimpressed",
  neutral: "plain statement or question with no clear emotion",
};

export async function moodOf(text: string): Promise<string> {
  const res = await openRouter.systemOne.create({
    decisionsRequest: {
      model: "~typesafe/jev-latest",
      state: { message: text },
      questions: { mood: { type: "choice", instructions: "Which mood is the author of this chat message expressing?", criteria: MOODS } },
    },
  });
  const a = res.answers.mood;
  return a?.type === "choice" ? a.choice : "neutral";
}

export async function queryFor(text: string, mood: string): Promise<string> {
  const res = await openRouter.chat.send({
    chatRequest: {
      model: "mistralai/ministral-8b-2512",
      maxCompletionTokens: 20,
      messages: [
        { role: "system", content: "You pick reaction GIFs. Reply with ONLY a 2-5 word GIF search query that fits the message and its mood. No quotes, no explanation." },
        { role: "user", content: `Mood: ${mood}\nMessage: ${text}` },
      ],
    },
  });
  const c = "choices" in res ? res.choices[0]?.message.content : undefined;
  const out = typeof c === "string" ? c : (c ?? []).map((p) => ("text" in p ? p.text : "")).join("");
  return out.trim().replace(/^["'`]+|["'`]+$/g, "").slice(0, 100);
}

export async function searchGif(q: string): Promise<string | undefined> {
  const params = new URLSearchParams({ q, per_page: "8", content_filter: "medium" });
  const res = await fetch(`https://api.klipy.com/api/v1/${process.env.KLIPY_API_KEY}/gifs/search?${params}`);
  if (!res.ok) throw new Error(`KLIPY ${res.status}: ${await res.text()}`);
  const body: any = await res.json();
  return body.data?.data?.[0]?.file?.md?.gif?.url;
}

if (import.meta.main) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });
  client.once(Events.ClientReady, (c) => console.log(`Logged in as ${c.user.tag}`));
  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.content) return;
    try {
      const q = await queryFor(msg.content, await moodOf(msg.content));
      const url = q && (await searchGif(q));
      if (url) await msg.reply({ content: url, allowedMentions: { repliedUser: false } });
    } catch (err) {
      console.error(err);
    }
  });
  await client.login(process.env.DISCORD_TOKEN);
}
