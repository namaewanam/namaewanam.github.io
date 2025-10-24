---
title: Lecture 8 - Bias-Variance Tradeoff
date: 2025-10-24
description: A Complete Beginner's Guide to Understanding Bias-Variance Tradeoff
order: 8
---

## Table of Contents
1. [Introduction](#introduction)
2. [Key Concepts Review](#key-concepts-review)
3. [The Approximation-Generalization Tradeoff](#the-approximation-generalization-tradeoff)
4. [Understanding Bias and Variance](#understanding-bias-and-variance)
5. [Mathematical Decomposition](#mathematical-decomposition)
6. [The Bias-Variance Tradeoff](#the-bias-variance-tradeoff)
7. [Practical Example: Sine Function](#practical-example-sine-function)
8. [Learning Curves](#learning-curves)
9. [Key Takeaways](#key-takeaways)
10. [Summary Table](#summary-table)

---

## Introduction

When building machine learning models, we face a fundamental challenge: **how complex should our model be?** This lecture explores the bias-variance tradeoff, which helps us understand this question.

**The Big Question:** Should we use a simple model or a complex model?
- **Simple models** might not capture all patterns (high bias)
- **Complex models** might fit noise in the data (high variance)

---

## Key Concepts Review

### VC Dimension
- **Definition:** The maximum number of points a hypothesis set H can shatter (perfectly classify in all possible ways)
- **Notation:** d_v(H)
- **Rule of Thumb:** You need approximately N ≥ 10 × d_v training examples

### Generalization Bound
The VC analysis gives us:

```text
Eₒᵤₜ ≤ Eᵢₙ + Ω
```

Where:
- **Eₒᵤₜ**: Out-of-sample error (error on new, unseen data)
- **Eᵢₙ**: In-sample error (error on training data)
- **Ω**: Generalization penalty (increases with model complexity)

---

## The Approximation-Generalization Tradeoff

### The Core Problem

To achieve small Eₒᵤₜ (good performance on new data), we need two things:

1. **Good Approximation:** Our hypothesis set H should be able to approximate the true function f
2. **Good Generalization:** Our model should work well on unseen data

### The Tradeoff

| Model Complexity | Approximation | Generalization |
|-----------------|---------------|----------------|
| More complex H | ✅ Better chance of approximating f | ❌ Worse generalization |
| Less complex H | ❌ Worse approximation of f | ✅ Better generalization |

**Ideal Scenario:** H = {f} (we know the exact function) - like winning the lottery! But this never happens in practice.

---

## Understanding Bias and Variance

### Intuitive Definitions

**Bias** (Approximation Error)
- How far off is your model *on average* from the true function?
- Measures the **fundamental limitation** of your model
- "Am I aiming at the right target?"

**Variance** (Generalization Error)
- How much does your model change when trained on different datasets?
- Measures the **sensitivity to training data**
- "How stable are my predictions?"

### Visual Analogy: Dartboard

Think of throwing darts at a bullseye:

```text
Low Bias, Low Variance    |  Low Bias, High Variance
    (IDEAL)               |    (Overfitting)
        •                 |      • •
        •••               |    •   •
        •                 |      • •
                          |
High Bias, Low Variance   |  High Bias, High Variance
    (Underfitting)        |      (WORST)
                          |
      ••• (off target)    |    •  • (scattered & off)
      •••                 |  •       •
```

---

## Mathematical Decomposition

### The Average Hypothesis

For a given point x, we define the **average hypothesis** ḡ(x):

```text
ḡ(x) = E_D[g^(D)(x)]
```

**What does this mean?**
- Imagine training your model on many different datasets D₁, D₂, ..., D_K
- For each dataset, you get a hypothesis g^(D₁), g^(D₂), ...
- ḡ(x) is the average prediction across all these hypotheses

**Approximation:**
```text
ḡ(x) ≈ (1/K) × Σ g^(D_k)(x)
```

### Expected Out-of-Sample Error

Starting with the basic definition:

```text
Eₒᵤₜ(g^(D)) = E_x[(g^(D)(x) - f(x))²]
```

Taking expectation over all datasets D:

```text
E_D[Eₒᵤₜ(g^(D))] = E_x[E_D[(g^(D)(x) - f(x))²]]
```

### The Clever Trick: Adding and Subtracting ḡ(x)

We add and subtract ḡ(x) (which equals zero):

```text
(g^(D)(x) - f(x))² = (g^(D)(x) - ḡ(x) + ḡ(x) - f(x))²
```

Expanding this squared term:

```text
= (g^(D)(x) - ḡ(x))² + (ḡ(x) - f(x))² + 2(g^(D)(x) - ḡ(x))(ḡ(x) - f(x))
```

**Important:** The cross term disappears when we take the expectation!

```text
E_D[2(g^(D)(x) - ḡ(x))(ḡ(x) - f(x))] = 0
```

### Final Decomposition

```text
E_D[(g^(D)(x) - f(x))²] = E_D[(g^(D)(x) - ḡ(x))²] + (ḡ(x) - f(x))²
                           \_____________/      \____________/
                              var(x)              bias²(x)
```

**Therefore:**

```text
E_D[Eₒᵤₜ(g^(D))] = E_x[bias²(x) + var(x)]
                   = bias + var
```

### Component Definitions

**Bias:**
```text
bias = E_x[(ḡ(x) - f(x))²]
```
- Measures how far the average hypothesis is from the true function
- **Doesn't depend on any specific dataset**, only on H and f

**Variance:**
```text
var = E_x[E_D[(g^(D)(x) - ḡ(x))²]]
```
- Measures how much individual hypotheses deviate from the average
- Shows **sensitivity to the training data**

---

## The Bias-Variance Tradeoff

### How Complexity Affects Bias and Variance

| When Model Complexity | Bias | Variance | Explanation |
|-----------------------|------|----------|-------------|
| **Increases** (H grows) | ↓ Decreases | ↑ Increases | More complex models can fit f better (lower bias) but are more sensitive to data (higher variance) |
| **Decreases** (H shrinks) | ↑ Increases | ↓ Decreases | Simpler models can't fit f well (higher bias) but are more stable (lower variance) |

### The Sweet Spot

The optimal model complexity minimizes:

```text
Total Error = bias + var
```

There's always a **sweet spot** where the sum is minimized!

```text
Error
  |     
  |    \           Total Error
  |     \         /‾‾\
  |      \       /    \
  |   Bias \    /      \  Variance
  |         \  /        \____
  |          \/              ‾‾‾‾
  |__________________________ Model Complexity
       Simple              Complex
```

---

## Practical Example: Sine Function

### Setup

**Target Function:** f(x) = sin(πx) on interval [-1, 1]

**Training Data:** Only N = 2 examples! (Very limited)

**Two Models:**
1. **H₀**: h(x) = b (horizontal line - constant model)
2. **H₁**: h(x) = ax + b (linear model)

### Model H₀: Constant Model

**Description:** h(x) = b (just a horizontal line)

**Best Approximation:**
- The best constant is b = 0 (the average of sin(πx))
- Eₒᵤₜ = 0.50

**Characteristics:**
- **Bias = 0.50** (can't capture the sine curve at all)
- **Variance = 0.25** (very stable - always predicts near 0)
- **Total = 0.75**

**Why low variance?**
- No matter what 2 points you pick, the average is usually near 0
- The model doesn't change much between datasets

### Model H₁: Linear Model

**Description:** h(x) = ax + b (a straight line)

**Best Approximation:**
- Can fit the middle portion of sine reasonably well
- Eₒᵤₜ ≈ 0.20 for best fit

**Characteristics:**
- **Bias = 0.21** (linear fits sine better than constant)
- **Variance = 1.69** (very unstable with only 2 points!)
- **Total = 1.90**

**Why high variance?**
- With only 2 points, the line can swing wildly
- Different pairs of points give very different lines
- The model is "overfitting" to the specific 2 points

### The Winner

**H₀ wins!** (0.75 < 1.90)

Even though H₁ can approximate sin(x) better in theory, with only N=2 examples, the high variance ruins everything.

### Key Lesson

> **Match the model complexity to your data resources, NOT to the target complexity!**

Even if you know the target is complex (like sin(x)), if you have limited data, use a simpler model!

---

## Learning Curves

### What Are Learning Curves?

Learning curves show how **expected errors** change as we collect more training data (N increases).

### Two Key Curves

1. **Eᵢₙ**: Expected in-sample error (error on training data)
2. **Eₒᵤₜ**: Expected out-of-sample error (error on test data)

### Behavior as N Increases

**For Simple Models:**
```text
Eₒᵤₜ ────────────  (stays relatively flat, higher)
           ╲
            ╲
Eᵢₙ ─────────╲──── (increases slowly, approaches Eₒᵤₜ)
```

- **Eᵢₙ** starts low, increases gradually
- **Eₒᵤₜ** starts high, decreases slowly
- **Gap** is small (good generalization)
- **Both** converge to a moderate value (limited by bias)

**For Complex Models:**
```text
Eₒᵤₜ ────╲
          ╲
           ╲
            ╲
Eᵢₙ ───────────────  (stays low)
```

- **Eᵢₙ** starts very low, increases slowly
- **Eₒᵤₜ** starts very high, decreases rapidly
- **Large gap** initially (poor generalization)
- **Both** eventually converge to a low value (if enough data)

### VC Analysis vs Bias-Variance View

**VC Analysis Perspective:**
```text
Eₒᵤₜ = Eᵢₙ + Ω(N)
```
- Gap is the "generalization error" (Ω)
- Decreases with more data

**Bias-Variance Perspective:**
```text
Eₒᵤₜ = bias + var(N)
```
- **bias**: horizontal line (doesn't change with N)
- **var**: decreases as N increases
- Eₒᵤₜ approaches bias asymptotically

### Linear Regression Learning Curves

For linear regression with d+1 parameters and noise σ²:

**Best Approximation Error:**
```text
σ²  (the irreducible error from noise)
```

**Expected In-Sample Error:**
```text
Eᵢₙ = σ²(1 - (d+1)/N)
```

**Expected Out-of-Sample Error:**
```text
Eₒᵤₜ = σ²(1 + (d+1)/N)
```

**Generalization Error:**
```text
Eₒᵤₜ - Eᵢₙ = 2σ²(d+1)/N
```

### Key Insights

1. **As N → ∞**: Both Eᵢₙ and Eₒᵤₜ → σ² (the noise level)
2. **When N = d+1**: Eᵢₙ = 0 (perfect fit on training data!)
3. **When N < d+1**: The model is underdetermined
4. **The gap** decreases as 1/N

---

## Key Takeaways

### 1. The Fundamental Decomposition
```text
Expected Error = bias + variance
```

### 2. Bias vs Variance

| Aspect | Bias | Variance |
|--------|------|----------|
| **Measures** | Approximation capability | Sensitivity to data |
| **Depends on** | Model class H and target f | Training set D |
| **Changes with more data?** | No | Yes (decreases) |
| **Changes with complexity?** | Yes (decreases) | Yes (increases) |

### 3. Model Selection Rules

- **Small dataset** → Use simpler models (accept higher bias to reduce variance)
- **Large dataset** → Can use complex models (variance becomes small)
- **High noise** → Simpler models (complex models will fit noise)
- **Complex target** → Need complex models (but only if you have enough data!)

### 4. Warning Signs

**Underfitting (High Bias):**
- Poor performance on both training and test data
- Model is "too simple"
- Solution: Increase model complexity

**Overfitting (High Variance):**
- Great performance on training data
- Poor performance on test data
- Solution: Get more data or reduce model complexity

### 5. The Practical Strategy

1. Start with a simple model
2. Gradually increase complexity
3. Monitor both Eᵢₙ and Eₒᵤₜ
4. Stop when Eₒᵤₜ stops improving (or starts getting worse)
5. Use validation sets or cross-validation to make this decision

---

## Summary Table

### Complete Comparison

| Characteristic | Simple Model | Complex Model |
|----------------|--------------|---------------|
| **Bias** | High | Low |
| **Variance** | Low | High |
| **Eᵢₙ** | Higher | Lower |
| **Eₒᵤₜ (small N)** | Better | Worse |
| **Eₒᵤₜ (large N)** | Worse | Better |
| **Stability** | High | Low |
| **Risk** | Underfitting | Overfitting |
| **Best for** | Small datasets, noisy data | Large datasets, clean data |

### Formula Reference

| Concept | Formula |
|---------|---------|
| **Average hypothesis** | ḡ(x) = E_D[g^(D)(x)] |
| **Bias** | bias = E_x[(ḡ(x) - f(x))²] |
| **Variance** | var = E_x[E_D[(g^(D)(x) - ḡ(x))²]] |
| **Decomposition** | E_D[Eₒᵤₜ] = bias + var |
| **VC bound** | Eₒᵤₜ ≤ Eᵢₙ + Ω |
| **Linear regression Eᵢₙ** | σ²(1 - (d+1)/N) |
| **Linear regression Eₒᵤₜ** | σ²(1 + (d+1)/N) |

---

## Final Thoughts

The bias-variance tradeoff is one of the most important concepts in machine learning. It explains why:

- Simple models sometimes outperform complex ones
- More data allows more complex models
- There's no "best" model - only the best model for your data

**Remember:** Always match your model complexity to your data resources, not to your target complexity!
