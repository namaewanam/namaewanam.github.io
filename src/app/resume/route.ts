import { NextResponse } from 'next/server';

const RESUME_TEXT = `
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  Nguyen Thanh Nam \u2014 Backend Engineer            \u2502
\u2502  namisme16052004@gmail.com                      \u2502
\u2502  github.com/ntnam1605 \u00b7 linkedin.com/in/ntnam   \u2502
\u2502  Ho Chi Minh City, Vietnam                      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

EXPERIENCE
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  Junior Software Engineer \u2014 Endava Vietnam
  Feb 2026 \u2013 Present | Ho Chi Minh City

  \u2022 Developing MPGS (Mastercard Payment Gateway Services)
    microservices for high-throughput payment processing
  \u2022 Spring Boot + PostgreSQL, data consistency across
    distributed payment workflows
  \u2022 Jenkins CI/CD on Linux infrastructure
  \u2022 Structured logging + monitoring for observability

  Java Software Developer Intern \u2014 Endava Vietnam
  Nov 2025 \u2013 Jan 2026 | Ho Chi Minh City

  \u2022 Internal financial management system
  \u2022 Spring Boot, Keycloak, Apache POI, PostgreSQL
  \u2022 Docker Compose + GitLab CI/CD pipelines

EDUCATION
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  B.Sc. Information Technology \u2014 GPA: 3.57/4.0 (8.3/10)
  VNUHCM \u2014 University of Science
  Oct 2022 \u2013 Present

  Coursework: Software Architecture, Data Structures &
  Algorithms, Database Systems, DevOps Fundamentals

PROJECTS
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  Bainansu \u2014 Financial Analysis Platform
  Jul 2025 \u2013 Sep 2025 | Lead Backend Developer
  github.com/ntnam1605/bainansu

  \u2022 8+ microservices with Spring Boot + FastAPI
  \u2022 Real-time pipeline: Apache Kafka + WebSocket + Binance API
  \u2022 Celery + RabbitMQ + Redis async task queue
  \u2022 Eureka, API Gateway, Keycloak, PostgreSQL
  \u2022 Payment: VNPay, Stripe
  \u2022 Full stack: Docker Compose

TECHNICAL SKILLS
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  Languages:   Java, Python, C/C++
  Frameworks:  Spring Boot, FastAPI
  Databases:   PostgreSQL, MySQL, Redis
  DevOps:      Linux, Docker, Jenkins, GitLab CI, Git
  Auth:        Keycloak, JWT, OAuth2
  Messaging:   Apache Kafka
  Languages:   English (IELTS 6.5)

LINKS
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  Web:      https://namaewanam.github.io
  Blog:     https://namaewanam.github.io/blog
  GitHub:   https://github.com/ntnam1605
  LinkedIn: https://linkedin.com/in/ntnam

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  PDF resume: https://namaewanam.github.io/cv.pdf
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
`.trim();

export function GET(request: Request) {
	const ua = request.headers.get('user-agent') ?? '';
	// If not a browser, return plain text (curl, wget, httpie, etc.)
	const isBrowser = /mozilla|chrome|safari|opera|edge/i.test(ua);

	if (isBrowser) {
		// Redirect browsers to the PDF
		return NextResponse.redirect(new URL('/cv.pdf', request.url));
	}

	return new NextResponse(RESUME_TEXT + '\n', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}
