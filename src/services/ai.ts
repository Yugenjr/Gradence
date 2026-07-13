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

export const calculateHeuristicScore = (text: string): number => {
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return 0;
  
  let score = 30; // base score for entering something
  
  // Keyword lists
  const tier1 = ['react', 'vue', 'angular', 'next.js', 'node', 'express', 'django', 'spring boot', 'laravel', 'flutter', 'react native', 'fastapi'];
  const tier2 = ['typescript', 'javascript', 'python', 'java', 'c++', 'golang', 'rust', 'ruby', 'sql', 'nosql', 'postgresql', 'mongodb', 'mysql', 'redis'];
  const tier3 = ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'jenkins', 'terraform', 'graphql', 'grpc', 'websocket', 'socket.io'];
  const qualityKeywords = ['optimize', 'scale', 'reduce', 'improve', 'secure', 'deploy', 'architect', 'design', 'implement', 'lead', 'coordinate'];
  
  // Add points
  tier1.forEach(kw => { if (cleanText.includes(kw)) score += 6; });
  tier2.forEach(kw => { if (cleanText.includes(kw)) score += 4; });
  tier3.forEach(kw => { if (cleanText.includes(kw)) score += 8; });
  qualityKeywords.forEach(kw => { if (cleanText.includes(kw)) score += 3; });
  
  // Length bonus
  score += Math.min(15, Math.floor(cleanText.length / 50));
  
  // Caps
  return Math.min(98, Math.max(10, score));
};

export const extractScore = (text: string): number => {
  const scoreRegexes = [
    /SCORE:\s*(\d+)/i,
    /Score:\s*(\d+)/i,
    /score\s+is\s+(\d+)/i,
    /(\d+)\s*\/\s*100/
  ];
  
  for (const regex of scoreRegexes) {
    const match = text.match(regex);
    if (match) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        return val;
      }
    }
  }
  return 75; // Default fallback score if not found
};

function simulateResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1].content;
  const lastMessageLower = lastMessage.toLowerCase();
  
  if (lastMessageLower.includes('resume info/skills:')) {
    const match = lastMessage.match(/Resume Info\/Skills:\s*(.*?)\.?\s*University:/i);
    const resumeText = match ? match[1] : '';
    const score = calculateHeuristicScore(resumeText);
    
    const missing: string[] = [];
    const resumeLower = resumeText.toLowerCase();
    
    if (!resumeLower.includes('docker') && !resumeLower.includes('kubernetes') && !resumeLower.includes('aws') && !resumeLower.includes('gcp') && !resumeLower.includes('cloud') && !resumeLower.includes('azure')) {
      missing.push('* **Cloud & DevOps:** No Docker containerization or cloud services (AWS/GCP) listed.');
    }
    if (!resumeLower.includes('sql') && !resumeLower.includes('mongodb') && !resumeLower.includes('postgresql') && !resumeLower.includes('database') && !resumeLower.includes('redis')) {
      missing.push('* **Database Systems:** No SQL/NoSQL databases or caching systems mentioned.');
    }
    if (!resumeLower.includes('git') && !resumeLower.includes('github') && !resumeLower.includes('ci/cd')) {
      missing.push('* **Version Control:** No mention of Git version control or workflow tools.');
    }
    if (!resumeLower.includes('optimize') && !resumeLower.includes('scale') && !resumeLower.includes('reduce') && !resumeLower.includes('improve')) {
      missing.push('* **Performance Optimization:** Project descriptions lack metrics (e.g. latency, load speed improvements).');
    }
    
    if (missing.length === 0) {
      missing.push('* **Advanced Certifications:** Consider adding specialized cloud or security certifications.');
      missing.push('* **System Design:** Include microservices or advanced system design details.');
    }
    
    const actionPlan: string[] = [];
    if (resumeLower.includes('docker')) {
      actionPlan.push('1. Deploy your dockerized application to a cloud provider like AWS ECS or GCP Cloud Run.');
    } else {
      actionPlan.push('1. Containerize your key applications using Docker to ensure cross-environment consistency.');
    }
    
    if (resumeLower.includes('sql') || resumeLower.includes('mongodb') || resumeLower.includes('database')) {
      actionPlan.push('2. Implement Redis caching or database indexing to optimize query response times.');
    } else {
      actionPlan.push('2. Add a persistent database storage layer (PostgreSQL/MongoDB) to your projects.');
    }
    
    return `### 📊 Placement Readiness Feedback
**Score: ${score}/100**

**What is Missing:**
${missing.join('\n')}

**Action Plan:**
${actionPlan.join('\n')}`;
  }
  
  if (lastMessageLower.includes('resume') || lastMessageLower.includes('portfolio') || lastMessageLower.includes('readiness')) {
    return `### 📊 Placement Readiness Feedback
**Score: 78/100**

**What is Missing:**
* **Cloud Infrastructure:** No Docker containerization or cloud services (AWS/GCP) listed.
* **Impact Metrics:** Project descriptions lack quantifiable improvements.

**Action Plan:**
1. Containerize your applications using Docker.
2. Quantify achievements (e.g., "reduced query latency by 25%").`;
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
