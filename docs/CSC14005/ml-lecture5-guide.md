---
title: Lecture 5 - Training vs Testing - Beginner's Guide
date: 2025-10-24
description: A Complete Beginner's Guide to Understanding Training vs Testing 
order: 5
---

## Table of Contents
1. [Introduction](#introduction)
2. [Quick Review: Error Measures](#quick-review-error-measures)
3. [The Testing Problem](#the-testing-problem)
4. [The M Factor Problem](#the-m-factor-problem)
5. [Dichotomies: A Better Approach](#dichotomies-a-better-approach)
6. [Growth Function](#growth-function)
7. [Practical Examples](#practical-examples)
8. [Break Points](#break-points)
9. [Main Results](#main-results)
10. [Key Takeaways](#key-takeaways)

---

## Introduction

This lecture addresses one of the most fundamental questions in machine learning: **"How do we know our model will work on new, unseen data?"**

When we train a model, we use training data. But the real test is: will it work on new data it has never seen before? This is the **generalization** problem.

---

## Quick Review: Error Measures

### What is Error?

**Error** measures how wrong our predictions are. Think of it like grading a test:
- Perfect prediction = 0% error
- Complete failure = 100% error

### Types of Error

#### 1. **In-Sample Error (Eᵢₙ)**
Error on the **training data** we used to build the model.

**Formula:**
```text
Eᵢₙ(h) = (1/N) × Σ e(h(x_n), f(x_n))
```

**What it means:**
- `h(x_n)` = what our model predicts
- `f(x_n)` = the true answer
- `e(...)` = error function (measures the difference)
- `N` = number of training examples

**Real-world example:**
Imagine you're studying for an exam using practice problems. Your score on those practice problems is your Eᵢₙ.

#### 2. **Out-of-Sample Error (Eₒᵤₜ)**
Error on **new data** the model hasn't seen.

**Formula:**
```text
Eₒᵤₜ(h) = E_x[e(h(x), f(x))]
```

**Real-world example:**
Your score on the actual exam (with different questions) is your Eₒᵤₜ. This is what really matters!

### The Goal
We want: **Eᵢₙ ≈ Eₒᵤₜ** and **both to be small**

- If Eᵢₙ is small but Eₒᵤₜ is large → **Overfitting** (memorized training data)
- If both are large → **Underfitting** (model too simple)

---

## The Testing Problem

### The Fundamental Inequality (Single Hypothesis)

When we test ONE hypothesis on data:

```text
P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2e^(-2ε²N)
```

**What this means in plain English:**
- The probability that our training error differs from test error by more than ε is very small
- As N (training size) increases, this probability decreases exponentially
- This is called the **Hoeffding Inequality**

**Example:**
- N = 100 data points
- ε = 0.1 (10% error tolerance)
- Probability of big difference: ≤ 2e^(-2) ≈ 0.27 (27%)

With N = 1000: ≤ 2e^(-20) ≈ 0.0000000041 (basically zero!)

### The Problem with Multiple Hypotheses

In real machine learning, we don't test just ONE hypothesis. We have many hypotheses in our **hypothesis set H** and pick the best one.

```text
P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2M × e^(-2ε²N)
```

Where **M = |H|** (number of hypotheses)

**The Problem:** M can be **INFINITE!**
- A perceptron in 2D has infinite possible lines
- A neural network has infinite possible weight combinations

---

## The M Factor Problem

### Why M is Too Pessimistic

The union bound (adding probabilities) assumes worst case:

```text
P[B₁ OR B₂ OR ... OR B_M] ≤ P[B₁] + P[B₂] + ... + P[B_M]
```

Where B_m = "hypothesis m has |Eᵢₙ - Eₒᵤₜ| > ε"

**The Issue:** These events **overlap heavily!**

### Visual Intuition

Imagine two similar hypotheses (two lines very close together):
- They classify points almost identically
- If one has Eᵢₙ ≈ Eₒᵤₜ, the other probably does too
- Counting them separately is wasteful!

**Key Insight:** We don't need to count every hypothesis separately. We need to count how many **different ways** hypotheses can classify our N data points.

---

## Dichotomies: A Better Approach

### What is a Dichotomy?

**Hypothesis:** A function h: X → {-1, +1} defined over the entire input space X

**Dichotomy:** A function h: {x₁, x₂, ..., x_N} → {-1, +1} defined only on our N data points

**Analogy:**
- Hypothesis = A complete recipe book (infinite recipes)
- Dichotomy = The actual meals you cook with N ingredients (finite combinations)

### Key Differences

| Aspect | Hypotheses | Dichotomies |
|--------|-----------|-------------|
| Domain | Entire input space | Just N points |
| Count | Can be infinite | At most 2^N |
| Focus | All possible inputs | Only our data |

### Example: Two Lines, One Dichotomy

Consider two slightly different lines in 2D:
```text
Line 1: y = 2x + 1
Line 2: y = 2x + 1.001
```

On your 10 data points, they classify **exactly the same way**!
- 2 different hypotheses
- 1 dichotomy (same classification pattern)

---

## Growth Function

### Definition

The **growth function** m_H(N) counts the maximum number of dichotomies on ANY N points:

```text
m_H(N) = max{x₁,...,x_N ∈ X} |H(x₁, ..., x_N)|
```

**Properties:**
- Always: m_H(N) ≤ 2^N
- Best case: m_H(N) ≪ 2^N (much less)
- We want: m_H(N) to be **polynomial** in N

### Why Growth Function Matters

If m_H(N) is polynomial, we can replace M with m_H(N):

```text
P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2m_H(N) × e^(-2ε²N)
```

Even though m_H(N) depends on N, if it's polynomial, the exponential term dominates and the bound goes to zero!

---

## Practical Examples

### Example 1: Positive Rays

**Definition:** A positive ray is a threshold classifier on the real line.

```text
h(x) = sign(x - a) = {+1 if x ≥ a, -1 if x < a}
```

**Visual:**
```text
... -1 -1 -1 | +1 +1 +1 ...
            a
```

**Growth Function:**
```text
m_H(N) = N + 1
```

**Why?**
Given N points on a line, you can place the threshold in N+1 positions:
- Before all points: (N classifications)
- Between each pair: (N-1 classifications)  
- After all points: (1 classification)
- Total: N + 1

**Example with N=3:**
```text
Points: x₁  x₂  x₃

Possible dichotomies:
1. [+1  +1  +1]  (threshold before x₁)
2. [-1  +1  +1]  (threshold between x₁ and x₂)
3. [-1  -1  +1]  (threshold between x₂ and x₃)
4. [-1  -1  -1]  (threshold after x₃)

m_H(3) = 4 = 3 + 1 ✓
```

### Example 2: Positive Intervals

**Definition:** Classify +1 if x is within an interval, -1 otherwise.

```text
h(x) = {+1 if ℓ ≤ x ≤ r, -1 otherwise}
```

**Visual:**
```text
... -1 -1 | +1 +1 +1 | -1 -1 ...
          ℓ           r
```

**Growth Function:**
```text
m_H(N) = (N+1 choose 2) + 1 = ½N² + ½N + 1
```

**Why?**
- Choose 2 positions from N+1 slots for interval ends: C(N+1, 2)
- Plus 1 for all -1 (no interval)

**Example with N=3:**
```text
Points: x₁  x₂  x₃

Some dichotomies:
1. [-1  -1  -1]  (no interval)
2. [+1  -1  -1]  (interval at x₁)
3. [-1  +1  -1]  (interval at x₂)
4. [-1  -1  +1]  (interval at x₃)
5. [+1  +1  -1]  (interval covers x₁, x₂)
6. [-1  +1  +1]  (interval covers x₂, x₃)
7. [+1  +1  +1]  (interval covers all)

m_H(3) = 7 = ½(9) + ½(3) + 1 ✓
```

### Example 3: Convex Sets

**Definition:** Classify +1 if x is inside a convex region, -1 otherwise.

**Visual:**
```text
      +  +
   +        +
      -  -
```

**Growth Function:**
```text
m_H(N) = 2^N
```

**Why?**
For any configuration of +1/-1 labels on N points, you can draw a convex polygon around the +1 points!

This means N points are **shattered** - every possible dichotomy is achievable.

---

## Break Points

### Definition

**k is a break point** for hypothesis set H if:
- No dataset of size k can be shattered by H
- Mathematically: m_H(k) < 2^k

### What "Shattered" Means

A dataset is **shattered** if the hypothesis set can create ALL 2^N possible dichotomies.

**Example (N=2 points):**
Shattered means we can achieve:
```text
[+1  +1]
[+1  -1]
[-1  +1]
[-1  -1]
```

### Break Points for Our Examples

| Hypothesis Set | Growth Function | Break Point | Explanation |
|---------------|----------------|-------------|-------------|
| Positive Rays | N + 1 | k = 2 | Can't shatter 2 points (can't get [+1, -1]) |
| Positive Intervals | ½N² + ½N + 1 | k = 3 | Can't shatter 3 points (can't get some patterns) |
| Convex Sets | 2^N | k = ∞ | Can shatter any number of points |
| 2D Perceptrons | < 2^N for N≥4 | k = 4 | Can't shatter 4 points (e.g., XOR pattern) |

### Why Break Points Matter

**The Big Theorem:**
- **No break point** → m_H(N) = 2^N (exponential - BAD)
- **Any break point k** → m_H(N) is polynomial in N (GOOD!)

Specifically, if k is a break point:
```text
m_H(N) ≤ N^(k-1)
```

---

## Main Results

### The Fundamental Theorem

```text
If H has break point k, then:
m_H(N) is O(N^(k-1))
```

**What this means:**
- Positive rays (k=2): m_H(N) is O(N) ✓
- Positive intervals (k=3): m_H(N) is O(N²) ✓
- 2D perceptrons (k=4): m_H(N) is O(N³) ✓

### Final Generalization Bound

```text
P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2m_H(2N) × e^(-2ε²N)
```

**Implications:**
1. If m_H(N) is polynomial → bound goes to 0 as N increases
2. **Learning is possible!** (with enough data)
3. The model will generalize from training to testing

---

## Key Takeaways

### 1. The Core Problem
We train on sample data but want to perform well on unseen data.

### 2. Why It Works
- Although there are infinite hypotheses, they create finite patterns on finite data
- Growth function m_H(N) captures this

### 3. Break Points are Key
- Having ANY break point → polynomial growth function
- Polynomial growth → generalization guarantee
- No break point → can't learn reliably

### 4. Practical Implications

**Good Models (with break points):**
- Linear classifiers (perceptrons)
- Polynomial classifiers  
- Decision trees with limited depth

**Problematic Models (no break point):**
- Nearest neighbor with flexible distance
- Lookup tables
- Arbitrary memorization

### 5. The Learning Guarantee

For learning to work, you need:
1. **Enough data:** N should be large relative to m_H(N)
2. **Low training error:** Eᵢₙ should be small
3. **Break point exists:** H shouldn't be too complex

**Rule of thumb:** You need approximately 10 × d training examples, where d is related to your break point.

---

## Summary Formula Sheet

```text
In-sample error:     Eᵢₙ(h) = (1/N) Σ e(h(xₙ), yₙ)
Out-of-sample error: Eₒᵤₜ(h) = E[e(h(x), y)]

Single hypothesis:   P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2e^(-2ε²N)
Multiple hypotheses: P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2Me^(-2ε²N)
With dichotomies:    P[|Eᵢₙ - Eₒᵤₜ| > ε] ≤ 2m_H(2N)e^(-2ε²N)

Growth function:     m_H(N) = max |H(x₁,...,xₙ)|
Break point:         m_H(k) < 2^k
Polynomial bound:    m_H(N) ≤ N^(k-1) if k is break point
```

---

## Practice Questions

1. **Why can't we just use training error?**
   - Because the model might memorize training data (overfitting)

2. **What's the difference between a hypothesis and a dichotomy?**
   - Hypothesis: function over all inputs (possibly infinite)
   - Dichotomy: classification pattern on N specific points (finite)

3. **Why is a break point good?**
   - Guarantees polynomial growth function
   - Enables learning with finite data

4. **Can a neural network learn?**
   - Yes! Despite having infinite hypotheses, it has break points
   - The effective number of dichotomies grows polynomially

---

**Next Steps:** Study the VC dimension (next lecture), which formalizes the concept of model complexity!