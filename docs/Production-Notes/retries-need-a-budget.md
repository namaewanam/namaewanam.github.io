---
title: Retries Need a Budget
date: 2026-05-16
description: Retries are useful right up until they become a second outage. Give them a budget, not blind optimism.
tags:
  - resilience
  - distributed-systems
  - production
---

Retries are one of those patterns that look obviously correct until production
reminds you they have side effects.

A retry is not free. It spends time, queue capacity, connection slots, and often
someone else&apos;s degraded service budget.

## What a budget means

For me, a retry budget usually answers four questions up front:

- how many attempts are allowed
- which errors are actually retryable
- how long we are willing to wait in total
- when we would rather fail fast and surface the problem

That budget should be visible in code and easy to explain in a review.

## Why naive retries hurt

The classic failure mode is simple:

1. a downstream starts slowing down
2. every caller retries at the same time
3. the downstream gets even less room to recover

The original fault may have been latency. The new fault is amplification.

## Better defaults

- add jitter so callers do not synchronize
- cap total wait time, not just per-attempt timeout
- keep retries close to idempotent operations
- make fallback behavior explicit

Retries are not a resilience badge. They are traffic you are choosing to create.
Treat them like load, because production will.
