# RAG-Powered News Chatbot

A full-stack **Retrieval-Augmented Generation (RAG) chatbot** designed to answer queries over a curated news corpus. The system combines modern vector search capabilities with large language models to provide contextually accurate responses based on ingested news articles.

## 🌐 Live Demo

🚀 **Try the live application**: [http://80.225.204.112:4500](http://80.225.204.112:4500)

*Experience the RAG chatbot in action! Ask questions about news topics and get AI-powered responses with source attribution.*

## 🚀 Project Overview

This chatbot leverages RAG architecture to retrieve relevant news passages from a vector database and uses them to generate informed responses via Google's Gemini LLM. The system is built with scalability and performance in mind, featuring session management, intelligent caching, and a modern React frontend.

### Tech Stack

- **🧠 Embeddings**: Google Gemini
- **🔍 Vector Database**: Pinecone 
- **🤖 LLM API**: Google Gemini
- **⚡ Backend**: Node.js with Express.js & TypeScript
- **💾 Cache & Sessions**: Redis
- **🎨 Frontend**: React + Vite + TypeScript + SCSS
- **📊 Monitoring**: Winston Logger
- **📖 API Documentation**: Swagger

### How It Works
#### 🔄 Detailed Workflow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   📱 Frontend   │    │  ⚡ Backend API   │    │  🔍 Pinecone    │
│   (React App)  │    │   (Express.js)   │    │  Vector Store   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │ 1. User Query          │                        │
         ├──────────────────────> │                        │
         │                        │ 2. Embed Query         │
         │                        ├──────────────┐         │
         │                        │              │         │
         │                        │              ▼         │
         │                        │     ┌─────────────┐    │
         │                        │     │ 🧠 Gemini   │    │
         │                        │     │ Embeddings │    │
         │                        │     └─────────────┘    │
         │                        │              │         │
         │                        │ 3. Query Vector        │
         │                        │ <────────────┘         │
         │                        │                        │
         │                        │ 4. Vector Search       │
         │                        ├──────────────────────> │
         │                        │                        │
         │                        │ 5. Top-K Passages      │
         │                        │ <────────────────────── │
         │                        │                        │
         │                        │ 6. Build Context       │
         │                        │ ──────────────┐        │
         │                        │               │        │
         │                        │               ▼        │
         │                        │     ┌─────────────┐    │
         │                        │     │ 🤖 Gemini   │    │
         │                        │     │     LLM     │    │
         │                        │     └─────────────┘    │
         │                        │               │        │
         │                        │ 7. AI Response         │
         │                        │ <─────────────┘        │
         │                        │                        │
         │                        │ 8. Store Session       │
         │                        ├──────────────┐         │
         │                        │              │         │
         │                        │              ▼         │
         │                        │     ┌─────────────┐    │
         │                        │     │ 💾 Redis    │    │
         │                        │     │ Cache/TTL   │    │
         │                        │     └─────────────┘    │
         │                        │              │         │
         │                        │ 9. Session Updated     │
         │                        │ <────────────┘         │
         │                        │                        │
         │ 10. Response + Sources │                        │
         │     + History          │                        │
         │ <────────────────────── │                        │
         │                        │                        │
         ▼                        │                        │
┌─────────────────┐              │                        │
│ 💬 Chat UI      │              │                        │
│ - Answer        │              │                        │
│ - Sources       │              │                        │
│ - History       │              │                        │
└─────────────────┘              │                        │
```

#### 📊 Component Interaction Matrix

| Step | Component | Action | Input | Output |
|------|-----------|---------|--------|---------|
| 1 | React Frontend | Query Submission | User Input | HTTP Request |
| 2 | Express Backend | Request Processing | Query + SessionID | Processed Request |
| 3 | Gemini Embeddings | Query Vectorization | Text Query | Query Vector |
| 4 | Pinecone | Similarity Search | Query Vector | Top-K Passages |
| 5 | Context Builder | Prompt Engineering | Passages + Query | Structured Prompt |
| 6 | Gemini LLM | Answer Generation | Context Prompt | AI Response |
| 7 | Redis Cache | Session Storage | Conversation Data | Stored Session |
| 8 | Express Backend | Response Assembly | Answer + Sources | JSON Response |
| 9 | React Frontend | UI Update | Response Data | Updated Chat UI |

## ✨ Features

### Core Functionality
- **RAG Pipeline**: ~50 pre-ingested news articles with semantic search capabilities
- **Smart Retrieval**: Top-k passage retrieval with relevance scoring
- **Context-Aware Responses**: LLM generates answers based on retrieved news content
- **Source Attribution**: Each response includes relevant source articles with similarity scores

### API Endpoints
- `POST /chat/ask` - Submit queries and receive AI-generated answers
- `POST /session/start` - Initialize new chat sessions
- `GET /session/:id/history` - Retrieve conversation history
- `DELETE /session/:id/reset` - Clear session history
- `GET /api-docs` - Interactive Swagger documentation

### Performance & Reliability
- **Redis Caching**: Session storage with configurable TTLs
- **Error Handling**: Comprehensive error management and logging
- **CORS Support**: Configurable cross-origin resource sharing
- **Request Validation**: Input sanitization and validation
- **Winston Logging**: Structured logging for monitoring and debugging

### Frontend Features
- **Modern Chat UI**: Clean, responsive chat interface
- **Real-time Typing Indicators**: Visual feedback during response generation
- **Conversation History**: Persistent chat history within sessions
- **Session Management**: Easy session reset and history viewing
- **Markdown Support**: Rich text rendering for formatted responses
- **Dark/Light Theme**: Customizable UI themes

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (for Redis)
- **Pinecone Account** (for vector database)
- **Google AI API Key** (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/ajay980p/rag-based-news-chatbot.git
cd rag-based-news-chatbot
```

### 2. Backend Setup

```bash
cd rag-chatbot-backend
npm install
```

#### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5500

# API Keys
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key

# Pinecone Configuration
PINECONE_INDEX=news-index

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### Start Redis (Docker)

```bash
docker run -d --name redis-container -p 6379:6379 redis:latest
```

#### Run Backend Development Server

```bash
npm run dev
```

The backend will start on `http://localhost:5500`

### 3. Frontend Setup

```bash
cd ../rag-chatbot-frontend
npm install
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Data Ingestion (Optional)

If you need to ingest new articles into Pinecone:

```bash
cd rag-chatbot-backend
npm run build
node dist/utils/newsEmbed.js
```

## 🚀 Usage

### Starting a Chat Session

1. Open your browser to `http://localhost:5173`
2. The application will automatically create a new session
3. Start asking questions about news topics
4. View conversation history and reset sessions as needed

### API Usage Examples

#### Ask a Question

```bash
curl -X POST http://localhost:5500/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest developments in AI technology?",
    "sessionId": "your-session-id"
  }'
```

#### Start New Session

```bash
curl -X POST http://localhost:5500/session/start \
  -H "Content-Type: application/json"
```

#### Get Session History

```bash
curl -X GET http://localhost:5500/session/your-session-id/history
```

## 📋 API Documentation

Interactive API documentation is available at `http://localhost:5500/api-docs` when the backend server is running.

## 🔍 Code Walkthrough

This section provides a comprehensive technical deep-dive into the RAG chatbot implementation, covering the end-to-end flow and key architectural decisions.

### 📊 Embeddings Creation, Indexing & Storage

#### 1. News Article Ingestion Process

```typescript
// src/utils/newsEmbed.ts - Article Processing Pipeline
export class NewsEmbedder {
  async processNewsArticles() {
    // 1. Load raw news data from JSON
    const articles = await this.loadNewsData('./data/news.json');
    
    // 2. Clean and preprocess articles
    const cleanedArticles = articles.map(article => ({
      title: this.cleanText(article.title),
      content: this.extractMainContent(article.content),
      url: article.url,
      publishedAt: article.publishedAt
    }));
    
    // 3. Generate embeddings using Google Gemini
    const embeddings = await Promise.all(
      cleanedArticles.map(async (article) => {
        const combinedText = `${article.title}\n\n${article.content}`;
        return await this.geminiEmbeddings.embed(combinedText);
      })
    );
    
    // 4. Upsert to Pinecone with metadata
    await this.pineconeIndex.upsert({
      vectors: embeddings.map((embedding, idx) => ({
        id: `article-${idx}`,
        values: embedding.values,
        metadata: {
          title: cleanedArticles[idx].title,
          content: cleanedArticles[idx].content.substring(0, 1000),
          url: cleanedArticles[idx].url,
          publishedAt: cleanedArticles[idx].publishedAt
        }
      }))
    });
  }
}
```

#### 2. Vector Storage Architecture

```
Pinecone Index Structure:
┌─────────────────────────────────────────────────────────────┐
│ Index: "news-index"                                         │
│ Dimensions: 3072 (Gemini embedding size)                    │
│ Metric: Cosine Similarity                                  │
├─────────────────────────────────────────────────────────────┤
│ Vector Entry:                                               │
│ ├── id: "article-{index}"                                  │
│ ├── values: [0.123, -0.456, 0.789, ...] (3072 dimensions)  │
│ └── metadata: {                                            │
│     ├── title: "Article Title"                            │
│     ├── content: "First 1000 chars..."                    │
│     ├── url: "https://source.com/article"                 │
│     └── publishedAt: "2024-01-15T10:30:00Z"              │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Embedding Service Implementation

```typescript
// src/services/embedService.ts
export class EmbedService {
  private geminiClient: GoogleGenerativeAI;
  
  async embedQuery(query: string): Promise<number[]> {
    try {
      // Use Google Gemini text-embedding-004 model
      const model = this.geminiClient.getGenerativeModel({ 
        model: 'text-embedding-004' 
      });
      
      const result = await model.embedContent(query);
      return result.embedding.values;
    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embeddings');
    }
  }
  
  async searchSimilarArticles(queryEmbedding: number[], topK: number = 5) {
    const searchResults = await this.pineconeIndex.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      includeValues: false
    });
    
    return searchResults.matches.map(match => ({
      score: match.score,
      title: match.metadata?.title,
      content: match.metadata?.content,
      url: match.metadata?.url
    }));
  }
}
```

### 💾 Redis Caching & Session Management

#### 1. Session Architecture

```typescript
// src/services/redisService.ts
export class RedisService {
  private client: RedisClientType;
  
  // Session TTL Configuration
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours
  private readonly CACHE_TTL = 60 * 60; // 1 hour for query caching
  
  async createSession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    const sessionData = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    await this.client.setEx(
      sessionKey, 
      this.SESSION_TTL, 
      JSON.stringify(sessionData)
    );
  }
  
  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    const session = await this.getSession(sessionId);
    
    if (session) {
      session.messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      
      // Update session with new TTL
      await this.client.setEx(
        sessionKey,
        this.SESSION_TTL,
        JSON.stringify(session)
      );
    }
  }
}
```

#### 2. Caching Strategy

```
Redis Key Structure:
┌──────────────────────────────────────────────────────────┐
│ Key Patterns:                                            │
│                                                          │
│ 1. Sessions: "session:{sessionId}"                       │
│    ├── TTL: 24 hours                                    │
│    └── Value: {id, createdAt, messages[]}               │
│                                                          │
│ 2. Query Cache: "query:{hash(query)}"                   │
│    ├── TTL: 1 hour                                      │
│    └── Value: {answer, sources, timestamp}              │
│                                                          │
│ 3. Rate Limiting: "rate:{ip}:{endpoint}"                │
│    ├── TTL: 1 minute                                    │
│    └── Value: request_count                             │
└──────────────────────────────────────────────────────────┘
```

#### 3. Session History Management

```typescript
// Advanced session management with size limits
async manageSessionSize(sessionId: string): Promise<void> {
  const session = await this.getSession(sessionId);
  if (!session) return;
  
  // Keep only last 50 messages to prevent memory bloat
  const MAX_MESSAGES = 50;
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
    await this.client.setEx(
      `session:${sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(session)
    );
  }
}
```

### 🎨 Frontend API Integration & Response Handling

#### 1. API Service Layer

```typescript
// src/services/api.ts
export class ApiService {
  private readonly baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5500';
  
  async askQuestion(query: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, sessionId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Failed to get response from chatbot');
    }
  }
}
```

#### 2. Custom Hooks for State Management

```typescript
// src/hooks/useChat.ts
export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendMessage = useCallback(async (query: string, sessionId: string) => {
    // Optimistic UI update
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.askQuestion(query, sessionId);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Remove optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { messages, isLoading, error, sendMessage };
};
```

#### 3. Real-time UI Updates

```typescript
// src/components/ChatScreen.tsx
export const ChatScreen: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle message submission with error boundaries
  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;
    
    try {
      await sendMessage(query, sessionId);
    } catch (error) {
      // Error handling is managed by the hook
      console.error('Message send failed:', error);
    }
  };
  
  return (
    <div className="chat-screen">
      <div className="messages-container">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
};
```

### 🏗️ Design Decisions & Architecture

#### 1. Key Design Choices

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Pinecone over Local Vector DB** | Cloud-native, managed scaling, enterprise-grade | Cost vs. self-hosted solutions |
| **Redis for Sessions** | In-memory speed, TTL support, pub/sub capabilities | Memory usage vs. persistent storage |
| **Google Gemini over OpenAI** | Competitive pricing, multimodal capabilities | Vendor lock-in vs. flexibility |
| **TypeScript Everywhere** | Type safety, better DX, reduced runtime errors | Compilation overhead |
| **React Hooks over Redux** | Simpler state management for small app | Scalability limitations |

#### 2. Performance Optimizations

```typescript
// Debounced search to prevent excessive API calls
const useDebouncedSearch = (query: string, delay: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [query, delay]);
  
  return debouncedQuery;
};

// Query result caching with React Query pattern
const useQueryCache = () => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  const getCachedResult = (query: string) => {
    const cached = cache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };
  
  const setCachedResult = (query: string, data: any) => {
    cache.set(query, { data, timestamp: Date.now() });
  };
  
  return { getCachedResult, setCachedResult };
};
```

#### 3. Error Handling Strategy

```typescript
// Centralized error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Don't leak internal errors to client
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal server error' 
    : error.message;
  
  res.status(statusCode).json({ error: message });
};
```

### 🚀 Potential Improvements

#### 1. Short-term Enhancements
- **Streaming Responses**: Implement Server-Sent Events for real-time answer generation
- **Advanced Caching**: Add query similarity caching to serve similar questions
- **Rate Limiting**: Implement per-user rate limiting with Redis
- **Semantic Chunking**: Split long articles into semantic chunks for better retrieval

#### 2. Long-term Architectural Improvements
- **Microservices**: Split embedding, search, and LLM services
- **GraphQL API**: Replace REST with GraphQL for flexible querying
- **Vector Database Optimization**: Implement hybrid search (semantic + keyword)
- **Multi-modal Support**: Add image and document processing capabilities
- **Advanced RAG**: Implement re-ranking and query expansion techniques

#### 3. Production Readiness
- **Monitoring**: Add APM, health checks, and metrics collection
- **Security**: Implement JWT authentication, input sanitization, HTTPS
- **Scalability**: Add horizontal scaling with load balancers
- **CI/CD**: Automated testing, deployment pipelines, and rollback strategies

This walkthrough demonstrates the careful consideration of performance, scalability, and maintainability throughout the RAG chatbot implementation.

## 🏗️ Project Structure

```
rag-chatbot-backend/
├── src/
│   ├── config/          # Configuration management
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── data/                # Sample news data
├── logs/                # Application logs
└── package.json

rag-chatbot-frontend/
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── styles/          # SCSS stylesheets
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utility functions
└── package.json
```

## 🔧 Configuration

### Backend Configuration

Key configuration options in `src/config/config.ts`:

- **Port**: Server listening port (default: 5500)
- **API Keys**: Gemini and Pinecone API credentials
- **Redis URL**: Redis connection string
- **CORS Origins**: Allowed frontend origins

### Frontend Configuration

Frontend configuration in `vite.config.ts`:

- **Development Server**: Port and proxy settings
- **Build Options**: Output directory and optimization
- **Environment Variables**: API endpoint configuration

## 🚀 Production Deployment

### Docker Deployment

Build production images:

```bash
# Backend
cd rag-chatbot-backend
docker build -t rag-chatbot-backend .

# Frontend
cd rag-chatbot-frontend
docker build -t rag-chatbot-frontend .
```

### PM2 Process Manager

For production deployment with PM2:

```bash
# Backend
cd rag-chatbot-backend
npm run build
pm2 start dist/index.js --name "rag-backend"

# Frontend (after build)
cd rag-chatbot-frontend
npm run build
pm2 serve dist 3000 --name "rag-frontend"
```

## 🔍 Monitoring & Logging

### Winston Logger

The application uses Winston for structured logging:

- **Combined logs**: `logs/combined.log`
- **Error logs**: `logs/error.log`
- **Exception logs**: `logs/exceptions.log`
- **Rejection logs**: `logs/rejections.log`

### Log Levels

- `error`: Error messages and stack traces
- `warn`: Warning messages
- `info`: General application flow
- `debug`: Detailed debugging information

## 🧪 Testing

### Backend Tests

```bash
cd rag-chatbot-backend
npm test
```

### Redis Connection Test

```bash
cd rag-chatbot-backend
npm run test:redis
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis is running: `docker ps`
   - Check Redis URL in environment variables

2. **Pinecone API Error**
   - Verify API key and index name
   - Check Pinecone dashboard for index status

3. **Frontend Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **CORS Errors**
   - Update CORS_ORIGINS in backend .env file
   - Ensure frontend URL is included in allowed origins

### Debug Mode

Enable debug logging by setting environment variable:

```bash
NODE_ENV=development npm run dev
```

## 📞 Support

For questions, issues, or contributions, please:

- Open an issue on GitHub
- Check existing documentation
- Review API documentation at `/api-docs`

---

**Made with ❤️ using RAG, TypeScript, and modern web technologies**