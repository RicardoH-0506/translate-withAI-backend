# 🌐 Translate With IA - Backend

API REST de traducción impulsada por IA construida con Node.js, Express y Clean Architecture.

## 📋 Descripción

Backend de servicio de traducción con arquitectura enterprise-grade que expone endpoints HTTP para traducir texto entre múltiples idiomas utilizando el modelo especializado de traducción de Cohere AI (`command-a-translate-08-2025`). Implementa **Clean Architecture** con separación clara de responsabilidades y **Screaming Architecture** donde la estructura del proyecto comunica su propósito. 

## ✨ Características

- 🏗️ **Clean Architecture**: Separación estricta de dominio, aplicación, infraestructura y presentación
- 📣 **Screaming Architecture**: La estructura del proyecto comunica su propósito
- 🤖 Traducción impulsada por IA usando Cohere
- 🔍 Detección automática de idioma de origen
- 🌍 Soporte para múltiples pares de idiomas
- ✅ Validación de solicitudes con Zod schemas
- 🔒 Control CORS para seguridad
- 🚦 **Rate Limiting**: Protección contra abuso con límites configurables
- ⚡ Optimización: retorna texto original si los idiomas son iguales
- 🧪 **Testing Ready**: Arquitectura testable con dependency injection
- 🔄 **Dependency Injection**: Container para gestión de dependencias
- 📊 **Enterprise Ready**: Patrón Repository, Use Cases, DTOs 

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión recomendada: LTS)
- pnpm 10.17.1+
- Clave API de Cohere

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/RicardoH-0506/translate-WithIA-backend.git
cd translate-WithIA-backend
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tu configuración
COHERE_API_KEY=tu_clave_api_aqui
PORT=1234
```

4. Inicia el servidor:
```bash
# Modo producción
pnpm start

# Modo desarrollo (con watch)
pnpm run dev

# Ejecutar tests
pnpm test

# Linting
pnpm lint
```

El servidor estará disponible en `http://localhost:1234` 

## 📡 API Endpoints

### GET /

Retorna metadatos del servicio y endpoints disponibles.

**Respuesta:**
```json
{
  "api_name": "AI-powered translation API",
  "version": "v1.0",
  "status": "online",
  "documentation": "Use the POST method on the /translate endpoint to send text and receive the translation.",
  "available_endpoints": {
    "translate": "POST /translate"
  }
}
```

### POST /translate

Traduce texto entre idiomas con rate limiting y validación.

**Request Body:**
```json
{
  "text": "Hello world",
  "fromLang": "auto",
  "toLang": "Spanish"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-traductor",
    "originalText": "Hello world",
    "translatedText": "Hola mundo",
    "fromLang": "English",
    "toLang": "Spanish",
    "status": "completed",
    "createdAt": "2025-01-22T15:00:00.000Z",
    "duration": 1.234
  }
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": {
    "text": "Text must be between 1 and 5000 characters"
  }
}
```

**Rate Limiting Headers:**
```
RateLimit-Limit: 50
RateLimit-Remaining: 45
RateLimit-Reset: 1640995200
RateLimit-Policy: 50;w=900;burst=5;w=1
```

## 🛠️ Tecnologías

### Core Framework
- **Express** 5.1.0 - Framework web minimalista
- **Node.js** - Runtime JavaScript

### IA & Traducción
- **Cohere AI** 7.19.0 - Cliente de IA para traducción
- Modelo: `command-a-translate-08-2025`

### Validación & Datos
- **Zod** 4.1.11 - Validación de esquemas TypeScript-first
- **DTOs** - Data Transfer Objects para contratos de API

### Seguridad & Performance
- **CORS** 2.8.5 - Control de acceso cross-origin
- **express-rate-limit** 8.2.1 - Rate limiting y protección contra abuso
- **dotenv** 17.2.2 - Gestión de variables de entorno

### Desarrollo & Testing
- **Vitest** 4.0.18 - Framework de testing
- **SuperTest** 7.2.2 - Testing de endpoints HTTP
- **ESLint** 9.36.0 - Linting y calidad de código
- **NeoStandard** 0.12.2 - Configuración ESLint estándar

### Arquitectura
- **Clean Architecture** - Separación de responsabilidades
- **Dependency Injection** - Container para gestión de dependencias
- **Repository Pattern** - Abstracción de datos
- **Use Case Pattern** - Lógica de negocio organizada 

## 🔒 Seguridad

- **CORS restrictivo**: Orígenes específicos (`localhost:5173` y `translate-with-ia.vercel.app`)
- **Rate Limiting**: Protección contra abuso (50 requests/15min, burst protection 5/sec)
- **Header Security**: `X-Powered-By` deshabilitado
- **Input Validation**: Validación estricta con Zod schemas
- **Error Handling**: Respuestas de error estandarizadas sin información sensible
- **Environment Variables**: Configuración sensible fuera del código

## 📁 Estructura del Proyecto (Clean Architecture)

```
google-translate-backend/
├── src/                            # Código fuente organizado por capas
│   ├── core/                       # CAPA MÁS INTERNA - Dominio Puro
│   │   ├── entities/               # Entidades del dominio
│   │   │   └── Translation.js
│   │   ├── interfaces/             # Interfaces del dominio
│   │   │   ├── translation.repository.interface.js
│   │   │   └── ai.client.interface.js
│   │   ├── usecases/               # Casos de uso del dominio
│   │   │   └── translate/
│   │   │       ├── TranslateUseCase.js
│   │   │       └── few-shot.js
│   │   ├── constants/              # Constantes del dominio
│   │   │   └── constants.js
│   │   └── errors/                 # Errores del dominio
│   │       └── TranslationError.js
│   │
│   ├── application/                # Interface Adapters - Capa Intermedia
│   │   └── translate/
│   │       ├── services/           # Application Services
│   │       │   └── TranslationService.js
│   │       └── dto/                # Data Transfer Objects
│   │           ├── TranslateRequestDTO.js
│   │           └── TranslateResponseDTO.js
│   │
│   ├── infrastructure/             # Frameworks & Drivers - CAPA EXTERNA
│   │   └── translate/
│   │       ├── repositories/       # Implementaciones de repositories
│   │       │   └── cohere.repository.js
│   │       └── clients/            # Clientes externos
│   │           └── cohere.client.js
│   │
│   ├── presentation/               # Capa de Presentación - UI/API
│   │   └── translate/
│   │       ├── controllers/        # HTTP Controllers
│   │       │   └── TranslationController.js
│   │       ├── routes/             # Definición de rutas
│   │       │   └── translation.routes.js
│   │       ├── middleware/         # Middleware Express
│   │       │   ├── cors.js
│   │       │   ├── rateLimit.js
│   │       │   └── validation.js
│   │       └── server.js          # Configuración Express
│   │
│   └── shared/                     # Cross-cutting concerns
│       └── translate/
│           └── container/
│               └── dependency.container.js
│
├── server.js                       # Punto de entrada principal
├── package.json                    # Dependencias y scripts
├── pnpm-workspace.yaml            # Configuración workspace
├── eslint.config.mjs               # Configuración ESLint
├── .env.example                    # Variables de entorno ejemplo
├── .env                           # Variables de entorno (no en repo)
├── .gitignore                     # Ignorados Git
└── README.md                      # Este archivo
```

## 🏗️ Flujo de Arquitectura

### Request Flow:
1. **Controller** (`presentation`) recibe HTTP request
2. **Middleware** valida con Zod schemas y rate limiting
3. **Controller** llama a **Application Service**
4. **Service** ejecuta **Use Case** del `core`
5. **Use Case** usa **Repository Interface**
6. **Repository Implementation** (`infrastructure`) llama a **AI Client**
7. **Response** vuelve por el mismo camino con formato estandarizado

### Dependency Inversion:
```
presentation → application → CORE ← infrastructure
```

### Principios Clave:
- **Core**: No depende de nadie, define interfaces y entidades
- **Application**: Orquesta use cases, maneja DTOs
- **Infrastructure**: Implementa interfaces del core
- **Presentation**: Controllers HTTP, middleware, routing

## 🧪 Testing

La arquitectura está diseñada para máxima testabilidad:

### Unit Tests
```bash
# Ejecutar todos los tests
pnpm test

# Modo watch
pnpm run test:watch
```

### Estructura de Tests
- **Core Tests**: Tests de entidades y use cases sin dependencias externas
- **Infrastructure Tests**: Tests de repositories y clients con mocks
- **Application Tests**: Tests de services y DTOs
- **Presentation Tests**: Tests de controllers y endpoints HTTP

### Ejemplo de Test
```javascript
// src/core/usecases/translate/__tests__/TranslateUseCase.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { TranslateUseCase } from '../TranslateUseCase.js'

describe('TranslateUseCase', () => {
  let useCase
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      translate: vi.fn()
    }
    useCase = new TranslateUseCase(mockRepository)
  })

  it('should translate text successfully', async () => {
    mockRepository.translate.mockResolvedValue('Hello world')
    
    const result = await useCase.execute({
      text: 'Hola mundo',
      fromLang: 'es',
      toLang: 'en'
    })

    expect(result.translatedText).toBe('Hello world')
  })
})
```

## � Despliegue

### Variables de Entorno
```bash
# .env
COHERE_API_KEY=your_api_key_here
PORT=1234
NODE_ENV=production
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 1234
CMD ["npm", "start"]
```

### Vercel / Railway
El proyecto está configurado para despliegue fácil en plataformas serverless.

## 📈 Monitoreo y Rate Limiting

### Límites Configurables
- **General**: 200 requests por 15 minutos
- **Traducción**: 50 requests por 15 minutos  
- **Burst Protection**: 5 requests por segundo

### Headers de Rate Limiting
```
RateLimit-Limit: 50
RateLimit-Remaining: 45
RateLimit-Reset: 1640995200
RateLimit-Policy: 50;w=900;burst=5;w=1
```

## 🔄 Roadmap

- [ ] **Cache Layer**: Redis para traducciones frecuentes
- [ ] **Multiple AI Providers**: OpenAI, Anthropic, Google Translate
- [ ] **Batch Translation**: Traducir múltiples textos en una request
- [ ] **Language Detection**: Endpoint dedicado para detección de idioma
- [ ] **Translation History**: Sistema de persistencia
- [ ] **API Versioning**: v2 con características avanzadas
- [ ] **WebSocket Support**: Traducciones en tiempo real
- [ ] **Analytics Dashboard**: Métricas de uso y rendimiento

## 📚 Recursos

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/08/Screaming-Architecture.html)
- [Zod Documentation](https://zod.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Cohere AI API](https://docs.cohere.com/reference/chat)
- [Rate Limiting Best Practices](https://konghq.com/blog/rate-limiting/)

## 🤝 Contribuciones

### Guía de Contribución
1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commits con [Conventional Commits](https://www.conventionalcommits.org/)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

### Estándar de Código
- Seguir ESLint configuration
- Tests para nuevas funcionalidades
- Documentar cambios en README
- Respetar Clean Architecture

## 📝 Licencia

Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

**Ricardo H** 
- GitHub: [@RicardoH-0506](https://github.com/RicardoH-0506)
- Proyecto: [Translate With IA](https://github.com/RicardoH-0506/translate-WithIA-backend)

---

⭐ Si este proyecto te ayuda, considera darle una estrella!
