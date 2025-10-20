---
title: Lecture 4 - Error and Noise
date: 2025-10-18
description: A Complete Beginner's Guide to Understanding Error and Noise
order: 4
---

## Table of Contents
1. [Quick Review: Linear Models](#quick-review-linear-models)
2. [Nonlinear Transformations](#nonlinear-transformations)
3. [Error Measures](#error-measures)
4. [Noisy Targets](#noisy-targets)
5. [The Two Questions of Learning](#the-two-questions-of-learning)
6. [Key Takeaways](#key-takeaways)

---

## Quick Review: Linear Models

### What is a Linear Model?

A **linear model** makes predictions using a weighted sum of input features. Think of it like a recipe where each ingredient (feature) has a specific amount (weight).

### The Signal Formula

The core formula is:

```text
signal = w₀ + w₁x₁ + w₂x₂ + ... + wₐxₐ = wᵀx
```

Where:
- **x** = input features (like age, salary, etc.)
- **w** = weights (how important each feature is)
- **wᵀx** = dot product (multiply and sum everything)

### Two Types of Linear Models

| Task | Formula | Output | Example |
|------|---------|--------|---------|
| **Classification** | h(x) = sign(wᵀx) | +1 or -1 | Email is spam (+1) or not spam (-1) |
| **Regression** | h(x) = wᵀx | Real number | Predict house price ($250,000) |

### Linear Regression Solution

The magical one-step formula to find the best weights:

```text
w = (XᵀX)⁻¹Xᵀy
```

**What this means:** Given your training data (X) and outputs (y), this formula calculates the optimal weights in one shot!

---

## Nonlinear Transformations

### The Problem

Sometimes data isn't separable with a straight line. Imagine trying to separate points in a circle pattern with a straight line - impossible!

### The Solution: Transform the Space

**Key Insight:** What's not linear in one space can become linear in another space!

### The Transformation Process (4 Steps)

```text
Step 1: Original Data in X-space
   Points: (x₁, x₂)
   Problem: Not linearly separable

Step 2: Transform to Z-space
   Apply Φ: (x₁, x₂) → (x₁², x₂²)
   Now points are in new coordinates!

Step 3: Find Linear Separator in Z-space
   Learn: g̃(z) = sign(w̃ᵀz)
   Easy because it's now linear!

Step 4: Map Back to X-space
   Final hypothesis: g(x) = g̃(Φ(x)) = sign(w̃ᵀΦ(x))
   This looks curved in original space!
```

### Example Transformation

**Original space:** Points at (x₁, x₂)

```text
Example: (2, 3)
Transform: Φ(x₁, x₂) = (x₁², x₂²)
Result: (4, 9)
```

The transformation Φ creates new features from old ones. A circle in X-space can become a line in Z-space!

### Important Properties

| Property | Explanation |
|----------|-------------|
| **Linearity preserved** | wᵀz is still linear in weights w |
| **No weights in X-space** | All weights live in Z-space |
| **y values unchanged** | Labels stay the same, only inputs transform |

---

## Error Measures

### What Does h ≈ f Mean?

We need to measure how close our hypothesis (h) is to the true function (f). This is where **error measures** come in.

### Definition

**Error Measure:** E(h, f) - tells us how wrong our model is

### Pointwise Error

Measures error for a single point:

```text
e(h(x), f(x))
```

### Two Common Pointwise Errors

#### 1. Squared Error (for Regression)

```text
e(h(x), f(x)) = (h(x) - f(x))²
```

**Example:**
- True value: f(x) = 100
- Predicted: h(x) = 95
- Error: (95 - 100)² = 25

**Why square it?** 
- Makes all errors positive
- Penalizes large errors more heavily

#### 2. Binary Error (for Classification)

```text
e(h(x), f(x)) = [h(x) ≠ f(x)]
```

This equals:
- 0 if prediction is correct
- 1 if prediction is wrong

**Example:**
- True: f(x) = +1 (spam)
- Predicted: h(x) = -1 (not spam)
- Error: 1 (wrong!)

### Overall Error: Averaging

We need to summarize errors across all points:

#### In-Sample Error (Training Error)

```text
Eᵢₙ(h) = (1/N) Σ e(h(xₙ), f(xₙ))
```

**What it means:** Average error on the training data you have

**Example with 3 points:**
```text
e(x₁) = 0, e(x₂) = 1, e(x₃) = 0
Eᵢₙ = (0 + 1 + 0)/3 = 0.33 or 33% error
```

#### Out-of-Sample Error (Test Error)

```text
Eₒᵤₜ(h) = 𝔼ₓ[e(h(x), f(x))]
```

**What it means:** Expected error on new, unseen data

This is what we **really** care about!

### Real-World Example: Fingerprint Verification

Let's say we're building a fingerprint system.

**Two types of mistakes:**

| True Identity | Prediction | Error Type | Consequence |
|--------------|------------|------------|-------------|
| You (+1) | Intruder (-1) | False Reject | Annoying |
| Intruder (-1) | You (+1) | False Accept | Dangerous |

### Application-Specific Error Measures

#### Supermarket Discount System

```text
Error Matrix:
                Predicted
              You (+1)  Intruder (-1)
True  You       0          10
      Intruder  1           0
```

**Logic:** 
- False reject (deny discount to customer): Very bad (10) - customer angry!
- False accept (give discount to intruder): Minor (1) - small loss

#### CIA Security System

```text
Error Matrix:
                Predicted
              You (+1)  Intruder (-1)
True  You       0           1
      Intruder  1000        0
```

**Logic:**
- False reject (deny employee): Tolerable (1) - try again
- False accept (let intruder in): Catastrophic (1000) - security breach!

### Take-Home Lesson

**The error measure should be specified by the user** based on the problem domain.

If you can't get user specifications:
- Use **plausible measures** (squared error for Gaussian noise)
- Use **friendly measures** (easy to optimize mathematically)

---

## Noisy Targets

### The Real World Isn't Perfect

In reality, the "target function" isn't always a function!

### Example: Credit Card Approval

Consider two customers with **identical** information:

```text
Customer A & B:
- Age: 23 years
- Salary: $30,000
- Years in residence: 1 year
- Years in job: 1 year
- Current debt: $15,000
```

**Result:**
- Customer A: Pays on time ✓
- Customer B: Defaults ✗

Same input, different output! This is **noise**.

### From Deterministic to Probabilistic

#### Old Model (Deterministic)
```text
y = f(x)
```
One input always gives one output.

#### New Model (Noisy Target)
```text
P(y | x)
```
This is a **probability distribution** - given x, what's the probability of each possible y?

### Joint Distribution

Data is now generated by:
```text
P(x, y) = P(x) × P(y | x)
```

Where:
- **P(x)**: Probability of seeing input x
- **P(y | x)**: Probability of output y given input x

### Understanding Noisy Targets

**Noisy target** = **Deterministic function** + **Noise**

```text
y = f(x) + noise
where f(x) = E(y|x)  [expected value]
```

**Example:**
```text
Given same credit profile:
- 70% chance of paying (y = +1)
- 30% chance of defaulting (y = -1)

Expected value: f(x) = 0.7(+1) + 0.3(-1) = 0.4
Noise: y - f(x)
```

### Special Case

**Deterministic target** is just a special case where:
```text
P(y | x) = 1 for y = f(x)
P(y | x) = 0 for all other y
```
No noise, perfect prediction!

### Two Distributions: Don't Confuse Them!

| Distribution | What it represents | Purpose |
|--------------|-------------------|----------|
| **P(y \| x)** | Target distribution | **What we're trying to learn** |
| **P(x)** | Input distribution | **Which inputs are important** |

**Why keep them separate?**
- P(y|x): The pattern we want to discover
- P(x): Just tells us which x values are common

Mixing them as P(x,y) loses this important distinction!

---

## The Two Questions of Learning

### The Ultimate Goal

We want:
```text
Eₒᵤₜ(g) ≈ 0
```

Our model should have near-zero error on new data!

### Breaking It Down

To achieve Eₒᵤₜ(g) ≈ 0, we need TWO things:

```text
Eₒᵤₜ(g) ≈ Eᵢₙ(g)  AND  Eᵢₙ(g) ≈ 0
    ↓                    ↓
Question 1           Question 2
```

### Question 1: Generalization

**Can we make sure Eₒᵤₜ(g) is close enough to Eᵢₙ(g)?**

**What it means:** Does training error predict test error?

**Why it matters:** If your model has 5% error on training data, will it also have ~5% on new data? Or will it jump to 50%?

**Covered in:** Lecture 2 (Hoeffding Inequality, feasibility of learning)

**Key insight:** With enough data and not-too-complex models, training error approximates test error.

### Question 2: Optimization

**Can we make Eᵢₙ(g) small enough?**

**What it means:** Can we find a hypothesis that fits our training data well?

**Why it matters:** Even if Eₒᵤₜ ≈ Eᵢₙ, if both are 40%, that's still terrible!

**Covered in:** Lecture 3 (Linear regression, optimization algorithms)

**Key insight:** We need good learning algorithms and rich enough hypothesis sets.

### The Trade-off

Here's the catch:

```text
Model Complexity ↑  →  Eᵢₙ ↓  (Good for Question 2!)
Model Complexity ↑  →  Eₒᵤₜ - Eᵢₙ ↑  (Bad for Question 1!)
```

**In plain English:**
- Complex models fit training data better
- But complex models generalize worse!

### The Big Picture

The theory will help us:

1. **Characterize feasibility** for infinite hypothesis sets (using VC dimension)
2. **Find the sweet spot** in model complexity

```text
Simple Model:     High Eᵢₙ, but Eₒᵤₜ ≈ Eᵢₙ (underfitting)
Complex Model:    Low Eᵢₙ, but Eₒᵤₜ >> Eᵢₙ (overfitting)
Optimal Model:    Balanced - minimizes Eₒᵤₜ!
```

### The Error Curve

As model complexity increases:

```text
Eᵢₙ:  Decreases continuously
Eₒᵤₜ: Decreases then increases (U-shaped)

        Error
         ↑
         |     Eₒᵤₜ (test error)
         |    /  \_
         |   /      \
         |  /   Eᵢₙ (training error)
         | /___
         |________________→
              Complexity
                  ↑
               optimal
```

---

## Key Takeaways

### 1. Nonlinear Transformations
- Linear models can solve nonlinear problems
- Transform input space to make data linearly separable
- The trick: Φ(x) creates new features

### 2. Error Measures
- Define how you measure "wrongness"
- Different applications need different error measures
- Two main types: squared error (regression), binary error (classification)
- User should specify based on real-world costs

### 3. Noisy Targets
- Real data has noise - same input can give different outputs
- Model as probability distribution P(y|x), not function f(x)
- Deterministic is just a special case with no noise

### 4. Two Questions of Learning
- **Generalization:** Does training error predict test error?
- **Optimization:** Can we minimize training error?
- Balance is key - too simple or too complex both fail!

### 5. The Learning Diagram Components

```text
Input x → Hypothesis Set H
         ↓
     Algorithm A → Final Hypothesis g
         ↑
    Training Data (x₁,y₁),...,(xₙ,yₙ)
         ↑
    P(x) × P(y|x)
         ↓
    Error Measure e(·)
```

All pieces work together to learn from data!

---

## Practice Questions to Test Understanding

1. Why can't we always use a straight line to separate data?
2. What's the difference between Eᵢₙ and Eₒᵤₜ?
3. Why would false accept be worse than false reject for CIA security?
4. Give an example of noisy targets from your daily life.
5. Why do complex models fit training data better but sometimes perform worse on test data?

**Remember:** Machine learning is about finding patterns in noisy data and making sure those patterns generalize to new situations!