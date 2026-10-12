This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



---

## Datastraw Assessment — Section 9: Tell Us How You Think

### 1. Why did you choose your particular architecture and technology stack?
I selected a modular architecture combining Next.js (App Router) with direct, native browser WebRTC media streaming lines. This removes third-party routing hops, allowing binary audio packets to flow directly from the client's microphone to the AI pipeline. This stack provides the lowest conversational latency possible while utilizing a highly secure server-side session authentication layer.

### 2. What was the most difficult part of the assignment, and how did you solve it?
The most difficult challenge was reliably handling real-time function tool invocation (`get_order_details`) over raw WebRTC data channels without causing audio stream dropouts or context state crashes. I solved this by implementing stateful message event listeners that immediately capture function callbacks, cross-reference them with the mock dataset, and feed structured text payloads back to the AI context seamlessly.

### 3. If you had one more week to work on this, what would you improve first and why?
If granted an extra development sprint, I would focus on:
* **True Interruption Handling (Barge-in):** Setting up custom Web Audio API analyzer nodes to immediately stop audio playback the millisecond a customer begins speaking.
* **Hinglish Vocabulary Mapping:** Building custom intent dictionaries to natively understand multi-lingual customer requests (e.g., combining Hindi and English phrases seamlessly).

### 4. Imagine this agent is handling 1,000 customer conversations a day. What do you think would need to change or improve?
Because the WebRTC voice processing load is offloaded to the customer's browser hardware, the frontend scales horizontally out-of-the-box. To prevent backend bottlenecks, the database lookup tool must be decoupled into an isolated serverless API layer (like Vercel Edge Functions or AWS Lambda) equipped with a Redis caching layer to handle high database query concurrency safely.
