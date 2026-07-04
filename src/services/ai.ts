// Service to interact with the Groq Cloud API for academic guidance and mentoring.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function askGroq(
  messages: ChatMessage[],
  apiKey: string | null
): Promise<string> {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GROQ_API_KEY') {
    // Elegant simulation fallback if no key is entered
    return simulateResponse(messages);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API Error Response:', errBody);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated from Groq.';
  } catch (error) {
    console.error('Failed fetching from Groq:', error);
    return `[System Connection Error]: ${error instanceof Error ? error.message : String(error)}. Falling back to simulation:\n\n${simulateResponse(messages)}`;
  }
}

function simulateResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  if (lastMessage.includes('resume') || lastMessage.includes('portfolio') || lastMessage.includes('readiness')) {
    return `### 📊 AI Placement Readiness & Resume Evaluation
**Overall Score:** 78/100 (High Potential)

**Strengths identified:**
* Strong structural layout with clear headings.
* Demonstrates good proficiency with React, TypeScript, and modern state management.

**Weaknesses & Gaps:**
1. **Cloud & Deployments:** Missing AWS, Docker, or CI/CD pipelines.
2. **Metrics:** Needs quantified impact (e.g., "optimized query speeds by 30%").
3. **Coding Profiles:** GitHub activity link is present, but missing Leetcode/Codeforces metrics.

**Recommended Actions:**
1. Add a production project utilizing PostgreSQL and Docker.
2. Complete 50 more LeetCode medium questions focusing on graphs & dynamic programming.`;
  }

  if (lastMessage.includes('roadmap') || lastMessage.includes('career') || lastMessage.includes('higher studies')) {
    return `### 🗺️ Custom Career Roadmap: Full-Stack Cloud Architect
Based on your academic profile, here is your path to becoming a Senior Engineer:

#### Phase 1: Core Fundamentals (Months 1-3)
* **Action:** Master TypeScript and relational database design.
* **Milestone:** Build a secure REST API with FastAPI and PostgreSQL using docker-compose.
* **Suggested Certification:** AWS Certified Cloud Practitioner.

#### Phase 2: Advanced Backend & Performance (Months 4-6)
* **Action:** Implement Redis caching, rate limiters, and message queues (RabbitMQ/Kafka).
* **Milestone:** Deploy a scalable web server cluster behind an Nginx load balancer.

#### Phase 3: Placement Prep (Months 7-9)
* **Action:** Resume parsing optimization, mock interviewing, and domain specialization.`;
  }

  if (lastMessage.includes('summarize') || lastMessage.includes('notes') || lastMessage.includes('study')) {
    return `### 📝 Smart Study Guide & Summary
Here is your study outline based on the input text:

1. **Key Concepts:**
   * **Time Complexity:** Measures the execution time growth rate of an algorithm.
   * **Space Complexity:** Focuses on memory usage overhead during runtime.
2. **Crucial Formulas:**
   * Master Theorem: $T(n) = aT(n/b) + f(n)$
3. **Practice Questions:**
   * Explain how hash tables handle collisions using chaining vs open addressing.
   * Compare worst-case complexity of Quicksort vs Mergesort.`;
  }

  return `### 🤖 Gradence AI Assistant
I am online and ready to assist you. To unlock real-time intelligence with lightning-fast llama3.3 inference, please add your **Groq API Key** in the **Settings** screen.

**How I can help you today:**
* **Analyze Resume:** Analyze placement compatibility and identify skill gaps.
* **Resume Rescue:** Build an action plan to rescue attendance in low-performing classes.
* **Smart Simulator:** Predict cumulative GPA under different academic constraints.
* **Domain Mentor:** Draft specialized roadmaps for SWE, Product Management, AI, or Higher Studies.`;
}
