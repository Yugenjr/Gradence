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
  if (cleanText.length < 5) return 0;
  
  let score = 30; // base score for entering something
  
  // Keyword lists
  const tier1 = ['react', 'vue', 'angular', 'next.js', 'node', 'express', 'django', 'spring boot', 'laravel', 'flutter', 'react native', 'fastapi'];
  const tier2 = ['typescript', 'javascript', 'python', 'java', 'c++', 'golang', 'rust', 'ruby', 'sql', 'nosql', 'postgresql', 'mongodb', 'mysql', 'redis'];
  const tier3 = ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'jenkins', 'terraform', 'graphql', 'grpc', 'websocket', 'socket.io'];
  const qualityKeywords = ['optimize', 'scale', 'reduce', 'improve', 'secure', 'deploy', 'architect', 'design', 'implement', 'lead', 'coordinate'];
  
  let matches = 0;
  // Add points
  tier1.forEach(kw => { if (cleanText.includes(kw)) { score += 6; matches++; } });
  tier2.forEach(kw => { if (cleanText.includes(kw)) { score += 4; matches++; } });
  tier3.forEach(kw => { if (cleanText.includes(kw)) { score += 8; matches++; } });
  qualityKeywords.forEach(kw => { if (cleanText.includes(kw)) { score += 3; matches++; } });
  
  // If no keywords match and text is short, return 0
  if (matches === 0 && cleanText.length < 15) {
    return 0;
  }
  
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

  if (lastMessageLower.includes('target role:')) {
    const match = lastMessage.match(/Target Role:\s*(.*?)\.?\s*Current Semester:/i);
    const targetRole = match ? match[1].trim() : 'Specialist';
    const targetRoleLower = targetRole.toLowerCase();
    
    if (targetRoleLower.includes('hardware') || targetRoleLower.includes('vlsi') || targetRoleLower.includes('embedded') || targetRoleLower.includes('electronics') || targetRoleLower.includes('circuit') || targetRoleLower.includes('iot')) {
      return `### 🗺️ Custom Career Roadmap: ${targetRole}
Based on your academic profile, here is your specialized path to becoming a successful ${targetRole}:

#### Phase 1: Foundational Circuit Design & Digital Logic
* Master Circuit Theory, Ohm's law, and passive components analysis.
* Deep dive into Digital Logic Design, Boolean algebra, logic gates, and multiplexers.
* Learn basic electronics test equipment (Oscilloscopes, Multimeters).

#### Phase 2: Microcontroller Architectures & Embedded C
* Learn 8051, AVR, and ARM Cortex-M architecture registers and interrupts.
* Master Embedded C programming (pointers, bit manipulation, registers configuration).
* Build simple peripheral interfaces (GPIO, UART, SPI, I2C).
* Certified Embedded Systems Professional.

#### Phase 3: Hardware Description Languages & Simulation
* Learn Verilog/VHDL for describing combinational and sequential circuits.
* Master simulation tools (ModelSim, logic analyzers) and testbench generation.
* Implement design modules on FPGA development boards.

#### Phase 4: PCB Design & Signal Integrity
* Learn schematic capture and layout design using Altium Designer or Eagle PCB.
* Master trace routing rules, ground planes, power distribution, and decoupling.
* Understand signal integrity fundamentals and EMI/EMC design practices.
* IPC PCB Design Certification.

#### Phase 5: Testing, Validation & Project Deployment
* Learn hardware debugging methods and hardware-in-the-loop (HIL) testing.
* Build and package a custom printed circuit board prototype.
* Prepare domain-specific interview topics (setup/hold times, metastability, circuit analysis).`;
    }

    if (targetRoleLower.includes('product') || targetRoleLower.includes('management') || targetRoleLower.includes('mba') || targetRoleLower.includes('analyst') || targetRoleLower.includes('consult')) {
      return `### 🗺️ Custom Career Roadmap: ${targetRole}
Based on your academic profile, here is your specialized path to becoming a successful ${targetRole}:

#### Phase 1: Product Fundamentals & Lifecycle
* Understand the Product Life Cycle (PLC) from ideation to launch and optimization.
* Learn market research methodologies, competitive analysis, and customer persona mapping.
* Learn basic UX design principles, wireframing tools (Figma, Balsamiq).

#### Phase 2: Data Analytics & SQL
* Master SQL query design (JOINs, aggregations) to analyze user behavior.
* Learn data visualization tools (Tableau, PowerBI) and key performance metrics (KPIs).
* Understand A/B testing methodologies and statistical significance concepts.
* Google Data Analytics Professional Certificate.

#### Phase 3: Product Strategy & Roadmapping
* Learn prioritization frameworks (RICE, MoSCoW, Kano model).
* Master roadmapping tools (Jira Product Board, Productboard) and release planning.
* Understand agile methodologies (Scrum product owner role, user story drafting).
* Certified Scrum Product Owner (CSPO).

#### Phase 4: Business Strategy & Growth
* Learn pricing strategies, customer acquisition cost (CAC), and customer lifetime value (LTV).
* Study product-led growth (PLG) tactics and funnel optimization models.
* Practice product case studies (design, strategy, estimation).

#### Phase 5: Mock Interviews & Portfolio Pitching
* Build a product portfolio containing product teardowns and PRDs (Product Requirement Documents).
* Practice product sense, execution, and behavioral mock interviews.
* Prepare for associate product manager (APM) recruitment cycles.`;
    }

    // Default dynamic fallback for any other role (Civil, Mechanical, Software, general engineering, etc.)
    return `### 🗺️ Custom Career Roadmap: ${targetRole}
Based on your academic profile, here is your custom path to excelling as a ${targetRole}:

#### Phase 1: Foundational Domain Knowledge
* Master core theoretical concepts, basic equations, and principles of ${targetRole}.
* Learn standard software tools used for basic drawings, simulations, or mathematical modeling.
* Study fundamental industry standards and safety regulations.

#### Phase 2: Core Practical Application & Tools
* Deep dive into specialized design tools and software packages standard in the ${targetRole} industry.
* Build small-scale functional models, blueprints, or simulations demonstrating key principles.
* Learn to document technical designs and write clean technical specifications.
* Professional entry-level industry certificate.

#### Phase 3: Intermediate Project Engineering & Analysis
* Undertake medium-complexity projects incorporating multiple subsystems or modules.
* Learn analytical validation, stress-testing, or performance testing methodologies.
* Understand project management methodologies and resource scheduling.

#### Phase 4: Advanced Systems Integration
* Integrate specialized components and design systems for high reliability.
* Focus on optimization techniques (minimizing cost, maximizing efficiency/speed).
* Understand advanced diagnostics and quality assurance guidelines.
* Advanced Professional Certification.

#### Phase 5: Career Alignment & Portfolio Presentation
* Compile your technical portfolio showcasing blueprints, models, or design projects.
* Focus on industry-specific mock interviews and case-study analysis.
* Engage in networking with certified practitioners and premium employers.`;
  }

  if (lastMessageLower.includes('roadmap') || lastMessageLower.includes('career') || lastMessageLower.includes('higher studies')) {
    return `### 🗺️ Custom Career Roadmap: Full-Stack Cloud Architect
Based on your academic profile, here is your path to becoming a Senior Engineer:

#### Phase 1: Language Mastery & Algorithms
* Deep dive into JavaScript/TypeScript (closures, event loop, promises) and Python fundamentals.
* Master basic Data Structures and Algorithms (time complexity, sorting, hash maps).
* Meta Front-End Developer Professional Certificate.

#### Phase 2: Database Systems & APIs
* Master relational databases (SQL, Postgres, transactions) and schema design.
* Build and document a RESTful API using Node.js, Express, and PostgreSQL.
* Oracle Certified Associate, Java SE 8 Programmer.

#### Phase 3: Advanced Frontend & State Management
* Learn React, React Router, and state management (Redux Toolkit or Zustand).
* Build a complex single-page dashboard with client-side routing and charts.
* AWS Certified Cloud Practitioner.

#### Phase 4: DevOps & Cloud Architecture
* Learn Docker containerization, AWS core services (EC2, S3, RDS), and Nginx load balancing.
* Containerize your application and deploy it to AWS ECS using a CI/CD pipeline.
* AWS Certified Solutions Architect - Associate.

#### Phase 5: System Design & Placement Prep
* Learn microservices architecture, horizontal vs vertical scaling, and caching using Redis.
* Design a high-throughput backend system blueprint incorporating rate-limiting and message queues (RabbitMQ/Kafka).`;
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
