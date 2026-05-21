---
title: Build the Incident Timeline Before the Fix
date: 2026-05-18
description: The fastest way to waste incident time is to optimize the wrong story. Write the timeline first.
tags:
  - incident-response
  - production
  - debugging
---

When production feels chaotic, the temptation is to jump straight into the fix.
That usually creates a second problem: we start repairing the version of the outage
that exists in our head, not the one that actually happened.

My default move is simple: build the timeline first.

## What goes on the timeline

- first alert time
- first user-facing symptom
- deploys, config changes, and dependency incidents nearby
- error-rate spikes
- mitigation attempts and their effects

This sounds almost too basic, but it changes the quality of the conversation.
A timeline forces sequence back into the room. It separates cause from coincidence.

## Why it matters

Without the timeline, teams overfit to the loudest clue:

- the last commit
- the most visible error message
- the service that is currently red

With the timeline, you can ask better questions:

- Did the database saturation start before the API timeout storm?
- Did the rollback help, or did traffic simply fall off at the same time?
- Did retries turn a slow dependency into a full outage?

## The practical payoff

A clean timeline makes the postmortem sharper too. You get:

- a clearer root-cause path
- a better view of which mitigation actually helped
- less blame-shaped storytelling

If I only get five calm minutes during an incident, I want them spent on this.
Fixes are easier to trust when the story underneath them is stable.
