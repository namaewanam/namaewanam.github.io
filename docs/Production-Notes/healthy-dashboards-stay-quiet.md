---
title: Healthy Dashboards Stay Quiet
date: 2026-05-12
description: A good dashboard should narrow your search space quickly, not wallpaper the screen with permanent anxiety.
tags:
  - observability
  - dashboards
  - production
---

One smell I keep noticing in internal tools is the dashboard that never looks healthy.
Half the widgets are yellow, one chart is always noisy, and someone eventually stops
seeing any of it.

That is not observability. That is decoration with CPU usage.

## A dashboard should answer a question

When I open an operational dashboard, I want it to help with one of these:

- Is the system healthy right now?
- Where is the bottleneck?
- Which dependency is the most suspicious?

If the page cannot narrow the search space in under a minute, it is carrying too much.

## Quiet is a feature

Quiet does not mean empty. It means the baseline is understandable.

- thresholds are meaningful
- colors are earned
- error rates are contextualized against traffic
- long-term trend charts do not fight incident charts for attention

## What I remove first

If I need to clean up a dashboard, I usually remove:

- vanity metrics with no operator action behind them
- duplicate charts with different time windows
- widgets that are permanently amber

The goal is not beauty. It is trust.

A healthy dashboard should make you faster when things go wrong, and almost invisible
when they do not.
