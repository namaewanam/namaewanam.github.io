---
title: Lecture 5 - Theory of Generalization
date: 2025-10-24
description: A Complete Beginner's Guide to Understanding Generalization Theory
order: 6
---

## Table of Contents
1. [Introduction](#introduction)
2. [Key Concepts from Lecture 5](#key-concepts-from-lecture-5)
3. [Growth Function](#growth-function)
4. [Break Point](#break-point)
5. [Bounding the Growth Function](#bounding-the-growth-function)
6. [The B(N,k) Function](#the-bnk-function)
7. [Proving B(N,k) is Polynomial](#proving-bnk-is-polynomial)
8. [The VC Inequality](#the-vc-inequality)
9. [Practical Examples](#practical-examples)
10. [Why This Matters](#why-this-matters)

---

## Introduction

This lecture answers a fundamental question in machine learning: **"How can we be confident that our model will work on new, unseen data?"**

The key insight is proving that the number of effective hypotheses is **polynomial** (grows slowly) rather than **exponential** (grows explosively). This makes learning possible!

---

## Key Concepts from Lecture 5

### Dichotomies
A **dichotomy** is a way to label N data points as either +1 or -1.

**Example**: For 3 points, one dichotomy might be:
```text
Point 1: +1
Point 2: -1
Point 3: +1
```

**Think of it as**: Different ways to color points red (+1) or blue (-1).

---

## Growth Function

### Definition
The **growth function** mₕ(N) tells us: "What's the maximum number of different ways our hypothesis set H can label N points?"

### Formula
```
mₕ(N) = max_{x₁,...,xₙ} |H(x₁, ..., xₙ)|
```

**In plain English**: 
- Pick the "worst case" arrangement of N points
- Count how many different labelings your hypothesis set can produce
- That's mₕ(N)

### Example: Positive Rays
A positive ray classifies everything to the right of a point as +1, everything else as -1.

For N points on a line:
- mₕ(N) = N + 1

**Why?** You can place the dividing line in N+1 positions:
```
|  o  o  o  (N=3 points)
↑  ↑  ↑  ↑
4 possible positions for the ray
```

---

## Break Point

### Definition
A **break point** k is the first value where no arrangement of k points can be shattered by H.

**"Shattered"** means: H can produce all possible 2^k labelings of those k points.

### Example: Positive Rays
- For k=1: Can produce both labelings (+ or -) ✓
- For k=2: Can produce all 4 labelings (+−, −+, ++, −−) ✗ (Can't do +−)
  
**Break point = 2**

### Why It's Important
If H has a break point, then mₕ(N) grows **polynomially** instead of **exponentially** (2^N).

**Key Insight**: Break point → Polynomial growth → Learning is possible!

---

## Bounding the Growth Function

### The Goal
We want to show:
```text
mₕ(N) ≤ [some polynomial]
```

### The Strategy
Instead of directly bounding mₕ(N), we define:

**B(N, k)**: Maximum number of dichotomies on N points that have break point k.

Since mₕ(N) ≤ B(N, k), if we can bound B(N,k), we're done!

---

## The B(N,k) Function

### Recursive Formula
```text
B(N, k) ≤ B(N-1, k) + B(N-1, k-1)
```

### How We Derive This

Imagine a table of dichotomies with N columns (points):

```text
x₁  x₂  ...  xₙ₋₁  xₙ
+1  +1  ...   +1   +1  ← S₁ (α rows, differ on xₙ)
-1  +1  ...   +1   -1
...
+1  -1  ...   +1   +1  ← S₂⁺ (β rows, paired with S₂⁻)
-1  -1  ...   +1   +1
...
+1  -1  ...   +1   -1  ← S₂⁻ (β rows, paired with S₂⁺)
-1  -1  ...   +1   -1
...
```

**Key observations**:
1. Total rows = α + 2β (α unpaired, 2β paired)
2. So: B(N, k) = α + 2β

**Bounding α + β**:
- Looking at first N-1 columns
- We have α + β distinct patterns
- These must respect break point k
- Therefore: **α + β ≤ B(N-1, k)**

**Bounding β alone**:
- The S₂ rows (paired rows) on first N-1 columns
- These are β distinct patterns
- If we added the same xₙ to all, we'd have β identical pairs
- This is like having break point k-1 (more restrictive)
- Therefore: **β ≤ B(N-1, k-1)**

**Combining**:
```text
B(N,k) = α + 2β
       = (α + β) + β
       ≤ B(N-1, k) + B(N-1, k-1)
```

---

## Proving B(N,k) is Polynomial

### The Theorem
```text
B(N, k) ≤ Σᵢ₌₀^(k-1) (N choose i)
```

Where (N choose i) = N!/(i!(N-i)!)

### Computing the Table

| N\k | 1 | 2 | 3 | 4 | 5 |
|-----|---|---|---|---|---|
| 1   | 1 | 2 | 2 | 2 | 2 |
| 2   | 1 | 3 | 4 | 4 | 4 |
| 3   | 1 | 4 | 7 | 8 | 8 |
| 4   | 1 | 5 | 11| ? | ? |

Each cell: B(N,k) ≤ B(N-1,k) + B(N-1,k-1)

### Why It's Polynomial
The sum Σᵢ₌₀^(k-1) (N choose i) has **maximum power N^(k-1)**

For fixed k, this is a polynomial in N!

**Example**: If k=4:
```text
Σᵢ₌₀³ (N choose i) = 1 + N + N²/2 + N³/6 + ...
```
Highest power: N³ (polynomial!)

---

## The VC Inequality

### What We Started With (Hoeffding)
For a single hypothesis h:
```text
P[|Eᵢₙ(h) - Eₒᵤₜ(h)| > ε] ≤ 2e^(-2ε²N)
```

**Problem**: For M hypotheses, union bound gives:
```text
P[|Eᵢₙ(g) - Eₒᵤₜ(g)| > ε] ≤ 2Me^(-2ε²N)
```
If M = ∞ or very large, this is useless!

### What We Want
Replace M with mₕ(N):
```text
P[|Eᵢₙ(g) - Eₒᵤₜ(g)| > ε] ≤ 2mₕ(N)e^(-2ε²N)
```

### What We Actually Get (VC Inequality)
```text
P[|Eᵢₙ(g) - Eₒᵤₜ(g)| > ε] ≤ 4mₕ(2N)e^(-ε²N/8)
```

**The differences**:
- 2 → 4 (small constant)
- N → 2N (still polynomial!)
- -2ε²N → -ε²N/8 (weaker, but still exponential decay)

**Why the changes?**
- We need to deal with overlaps between hypotheses
- We use a "ghost sample" E' to bound Eₒᵤₜ
- Technical details require slightly looser bounds

---

## Practical Examples

### Example 1: Positive Rays
- Break point: k = 2
- mₕ(N) = N + 1
- Bound: Σᵢ₌₀¹ (N choose i) = 1 + N = N + 1 ✓

### Example 2: Positive Intervals
An interval classifies points inside as +1, outside as -1.

- Break point: k = 3
- mₕ(N) = ½N² + ½N + 1
- Bound: Σᵢ₌₀² (N choose i) = 1 + N + N²/2 ✓

### Example 3: 2D Perceptrons
A line in 2D space (much more powerful!)

- Break point: k = 4
- mₕ(N) = ? (unknown exactly)
- Bound: Σᵢ₌₀³ (N choose i) = 1 + N + N²/2 + N³/6

Even though we don't know the exact growth function, we know it's at most O(N³)!

---

## Why This Matters

### The Big Picture

1. **Without break point**: mₕ(N) = 2^N → Learning impossible
   - Even with billions of data points, can't guarantee generalization

2. **With break point k**: mₕ(N) = O(N^(k-1)) → Learning possible!
   - Polynomial growth means we can learn with reasonable data

### Practical Implications

**Example**: Training a model with 1000 data points

- **No break point**: Need to check 2^1000 ≈ 10^301 hypotheses (impossible!)
- **Break point k=4**: Need to check ≈ 10^9 hypotheses (feasible!)

### The Learning Guarantee

With the VC inequality:
```text
P[|Eᵢₙ(g) - Eₒᵤₜ(g)| > ε] ≤ 4mₕ(2N)e^(-ε²N/8)
```

**What this tells us**:
- If N (data size) is large enough
- And mₕ(2N) is polynomial
- Then with high probability: Eᵢₙ ≈ Eₒᵤₜ
- **Meaning**: Performance on training data ≈ Performance on new data!

---

## Summary

**The Chain of Logic**:
1. If H has a break point k → mₕ(N) is polynomial
2. If mₕ(N) is polynomial → We can bound P[|Eᵢₙ - Eₒᵤₜ| > ε]
3. If we can bound this probability → **Learning is feasible!**

**Key Takeaway**: The existence of a break point is what makes machine learning mathematically possible. It's the difference between needing infinite data and needing reasonable amounts of data.

---

## Quick Reference

### Important Formulas

| Concept | Formula |
|---------|---------|
| Growth Function | mₕ(N) = max\|H(x₁,...,xₙ)\| |
| B(N,k) Recursion | B(N,k) ≤ B(N-1,k) + B(N-1,k-1) |
| B(N,k) Bound | B(N,k) ≤ Σᵢ₌₀^(k-1) (N choose i) |
| VC Inequality | P[\|Eᵢₙ-Eₒᵤₜ\|>ε] ≤ 4mₕ(2N)e^(-ε²N/8) |

### Break Points for Common Hypotheses

| Hypothesis Set | Break Point k | Growth Function |
|----------------|---------------|-----------------|
| Positive Rays | 2 | N + 1 |
| Positive Intervals | 3 | ½N² + ½N + 1 |
| 2D Perceptrons | 4 | O(N³) |

---

**Next Steps**: In the next lectures, you'll learn about the VC dimension, which formalizes the break point concept and gives us practical tools for model selection!