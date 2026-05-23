---
title: "ADR-0001: Use Spring Boot for Payment Microservices"
date: "2025-11-01"
status: "accepted"
deciders: ["nam"]
---

## Context

The MPGS payment gateway needs reliable, maintainable microservices with strong ecosystem support for enterprise-grade auth, observability, and data access.

## Decision

Use **Spring Boot 3** with **Spring Data JPA** (PostgreSQL), **Spring Security**, and **Spring Actuator** for all payment service components.

## Consequences

- ✅ Strong ecosystem: Spring Security, Actuator, Testcontainers
- ✅ Native Keycloak integration via Spring Security OAuth2
- ✅ Production-grade defaults: connection pooling, health checks
- ⚠️ Higher JVM startup time vs. Go/Rust for serverless scenarios
- ⚠️ More boilerplate for simple CRUD vs. FastAPI/Gin
