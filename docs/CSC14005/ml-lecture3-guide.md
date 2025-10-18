---
title: Lecture 3 - Linear Models in Machine Learning
date: 2025-10-18
description: A Complete Beginner's Guide to Understanding Linear Models in Machine Learning
---

## Table of Contents
1. [Introduction](#introduction)
2. [Input Representation](#input-representation)
   - [Raw Input vs Features](#raw-input-vs-features)
   - [Why Feature Engineering Matters](#why-feature-engineering-matters)
3. [Linear Classification](#linear-classification)
   - [The Perceptron Learning Algorithm (PLA)](#the-perceptron-learning-algorithm-pla)
   - [The Pocket Algorithm](#the-pocket-algorithm)
   - [Understanding Classification Boundaries](#understanding-classification-boundaries)
4. [Linear Regression](#linear-regression)
   - [What is Regression?](#what-is-regression)
   - [Mathematical Formulation](#mathematical-formulation)
   - [How to Measure Error](#how-to-measure-error)
   - [Finding the Best Weights](#finding-the-best-weights)
   - [The Linear Regression Algorithm](#the-linear-regression-algorithm)
   - [Using Regression for Classification](#using-regression-for-classification)
5. [Nonlinear Transformations](#nonlinear-transformations)
   - [Why Linear is Limited](#why-linear-is-limited)
   - [The Power of Feature Transformation](#the-power-of-feature-transformation)
6. [Summary](#summary)

---

## Introduction

This guide covers **Linear Models**, which are fundamental building blocks in machine learning. Think of linear models as drawing straight lines (or flat planes in higher dimensions) to separate different categories or predict values.

**Key Concept**: Even though we call them "linear," we can actually handle complex patterns by transforming our input data cleverly!

---

## Input Representation

### Raw Input vs Features

**Definition**: 
- **Raw Input**: The original data as it comes (e.g., all pixels of an image)
- **Features**: Meaningful information extracted from raw data

**Example: Digit Recognition**

Imagine you want to recognize handwritten digits (0-9):

| Approach | Representation | Size |
|----------|---------------|------|
| **Raw Input** | x = (x₀, x₁, x₂, ..., x₂₅₆) | 257 values (all pixels) |
| **Features** | x = (x₀, x₁, x₂) | 3 values (constant, intensity, symmetry) |

**Formula**:
- Raw: x = (x₀, x₁, x₂, ..., x₂₅₆) with weights (w₀, w₁, w₂, ..., w₂₅₆)
- Features: x = (x₀, x₁, x₂) with weights (w₀, w₁, w₂)

### Why Feature Engineering Matters

**Benefits**:
1. **Fewer weights to learn** → Faster training
2. **Better generalization** → Works better on new data
3. **Captures meaningful patterns** → More interpretable

**Example Features for Digit Recognition**:
- **Intensity (x₁)**: Average brightness of the image
- **Symmetry (x₂)**: How symmetric the digit is (9 is less symmetric than 8)

---

## Linear Classification

### The Perceptron Learning Algorithm (PLA)

**What it does**: Learns to separate two classes (e.g., yes/no, spam/not spam) using a straight line (or hyperplane).

**How it works**:
1. Start with random weights
2. For each misclassified point:
   - Update weights to correct the mistake
3. Repeat until no errors (if data is linearly separable)

**Formula**:
```text
h(x) = sign(w₀ + w₁x₁ + w₂x₂ + ... + wₐxₐ)
     = sign(wᵀx)
```

Where:
- **w**: weight vector
- **x**: input vector
- **sign()**: returns +1 if positive, -1 if negative

**Visual Understanding**:
- The line wᵀx = 0 is the **decision boundary**
- Points on one side → classified as +1
- Points on other side → classified as -1

### The Pocket Algorithm

**Problem with PLA**: If data is NOT perfectly linearly separable, PLA never stops!

**Solution - Pocket Algorithm**:
- Keep the **best weights** found so far in your "pocket"
- Continue searching but remember the best solution
- Stop after a fixed number of iterations

**Comparison**:

| Algorithm | Best for | Stops when |
|-----------|----------|------------|
| PLA | Linearly separable data | Perfect classification |
| Pocket | Non-separable data | Fixed iterations |

**Key Metrics**:
- **Eᵢₙ**: Error on training data
- **Eₒᵤₜ**: Error on new, unseen data

Pocket algorithm keeps the weights with lowest Eᵢₙ!

### Understanding Classification Boundaries

The decision boundary is where wᵀx = 0.

**Example in 2D**:
```text
w₀ + w₁x₁ + w₂x₂ = 0
```

This is a straight line! Different weights give different orientations and positions.

---

## Linear Regression

### What is Regression?

**Definition**: Predicting a **real-valued output** (not just yes/no).

**Classification vs Regression**:

| Task | Output | Example |
|------|--------|---------|
| Classification | Discrete (±1, yes/no) | Credit approval (yes/no) |
| Regression | Continuous (any number) | Credit line ($0 to $50,000) |

### Mathematical Formulation

**Hypothesis (prediction function)**:
```text
h(x) = w₀ + w₁x₁ + w₂x₂ + ... + wₐxₐ
     = wᵀx
```

**Example: Credit Line Prediction**

Input features:
```text
x = [
  1,              (x₀ - constant bias term)
  23,             (x₁ - age in years)
  30000,          (x₂ - annual salary)
  1,              (x₃ - years in residence)
  1,              (x₄ - years in job)
  15000,          (x₅ - current debt)
  ...
]
```

Output:
```text
h(x) = $8,500  (predicted credit line)
```

### How to Measure Error

**Squared Error** (most common for regression):
```text
Error for one point = (h(x) - y)²
```

Where:
- **h(x)**: our prediction
- **y**: actual value
- We square to make all errors positive and penalize large errors more

**In-Sample Error (Eᵢₙ)**:
```text
Eᵢₙ(w) = (1/N) Σ(h(xₙ) - yₙ)²
       = (1/N) Σ(wᵀxₙ - yₙ)²
```

This is the average squared error over all N training examples.

### Finding the Best Weights

**Goal**: Minimize Eᵢₙ(w)

**Matrix Formulation**:
```text
Eᵢₙ(w) = (1/N) ||Xw - y||²
```

Where:
```text
X = [— x₁ᵀ —]    (N × (d+1) matrix)
    [— x₂ᵀ —]
    [   ⋮   ]
    [— xₙᵀ —]

y = [y₁]         (N × 1 vector)
    [y₂]
    [⋮ ]
    [yₙ]
```text

**Finding the Minimum** (using calculus):

1. Take the gradient (derivative):
   ```text
   ∇Eᵢₙ(w) = (2/N) Xᵀ(Xw - y)
   ```

2. Set it to zero:
   ```text
   Xᵀ(Xw - y) = 0
   XᵀXw = Xᵀy
   ```

3. Solve for w:
   ```text
   w = (XᵀX)⁻¹Xᵀy = X†y
   ```

**X† is called the "pseudo-inverse"** of X.

### The Linear Regression Algorithm

**Step-by-step**:

```text
Input: Training data (x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)

Step 1: Construct matrix X and vector y
        X = [— x₁ᵀ —]        y = [y₁]
            [— x₂ᵀ —]            [y₂]
            [   ⋮   ]            [⋮ ]
            [— xₙᵀ —]            [yₙ]

Step 2: Compute pseudo-inverse
        X† = (XᵀX)⁻¹Xᵀ

Step 3: Calculate weights
        w = X†y

Output: Weight vector w
```

**Dimensions**:
- X: N × (d+1) where N = number of examples, d = number of features
- XᵀX: (d+1) × (d+1) — always square!
- (XᵀX)⁻¹: (d+1) × (d+1)
- X†: (d+1) × N
- w: (d+1) × 1

**Simple Example**:

Given 3 data points in 2D:
```text
(x₁, y₁) = ([1, 2, 3], 5)
(x₂, y₂) = ([1, 3, 4], 7)
(x₃, y₃) = ([1, 1, 2], 3)
```

```text
X = [1  2  3]        y = [5]
    [1  3  4]            [7]
    [1  1  2]            [3]

w = (XᵀX)⁻¹Xᵀy  ← This gives us optimal weights!
```

### Using Regression for Classification

**Clever Trick**: Binary classification values (±1) are also real numbers!

**Process**:
1. Treat classification labels as regression targets: y = ±1
2. Use linear regression to find w where wᵀxₙ ≈ yₙ
3. For prediction: sign(wᵀx) gives ±1 classification

**Why this works**:
- Regression finds weights that make wᵀx ≈ ±1
- If wᵀx ≈ +1, then sign(wᵀx) = +1 ✓
- If wᵀx ≈ -1, then sign(wᵀx) = -1 ✓

**Benefits**:
- **Fast**: One-step solution (no iteration needed)
- **Good initialization**: Great starting point for PLA or Pocket algorithm

---

## Nonlinear Transformations

### Why Linear is Limited

**Problem**: Not all patterns are linear!

**Example 1 - Circular Pattern**:
```text
Data points arranged in circles:
  • Inner circle: Class +1
  • Outer circle: Class -1
```

Can you separate these with a straight line? **NO!** 

**Example 2 - Credit Line**:
"Years in residence" affects credit, but not linearly:
- 0-1 years: Low credit (new, unstable)
- 1-5 years: High credit (stable)
- 5+ years: May decrease slightly (possibly older, different risk)

A straight line can't capture this U-shape!

### The Power of Feature Transformation

**Key Insight**: Linear algorithms can handle nonlinear patterns if we transform the input first!

**The Process**:
```text
Original Input → Nonlinear Transform (Φ) → Transformed Input → Linear Model
     x                                            z               h(z)
```

**Example - Making Circles Separable**:

Original space (2D):
```text
Input: (x₁, x₂)
Cannot separate circles with a line
```

Transform to new space:
```text
Φ: (x₁, x₂) → (x₁², x₂²)

New space: (z₁, z₂) = (x₁², x₂²)
Now we CAN separate with a line!
```

**Why it works**:
- Inner circle: x₁² + x₂² < r² → small z₁ + z₂
- Outer circle: x₁² + x₂² > r² → large z₁ + z₂
- A line in (z₁, z₂) space separates them!

**General Formula**:
```text
Original: x = (x₀, x₁, x₂, ..., xₐ)

Transform: z = Φ(x) = (1, x₁, x₂, x₁², x₂², x₁x₂, ...)

Linear in z-space: h(x) = wᵀΦ(x)
```

**This is still "linear"** because we're linear in the weights w!

**Common Transformations**:

| Transformation | Example | Use Case |
|---------------|---------|----------|
| Polynomial | x → (x, x², x³) | Curved relationships |
| Radial | x → exp(-||x-c||²) | Clusters around points |
| Boolean | x → [[x < 1]], [[x > 5]] | Threshold effects |

---

## Summary

### Key Takeaways

1. **Feature Engineering**:
   - Extract meaningful features from raw data
   - Reduces complexity and improves learning

2. **Linear Classification**:
   - PLA: For perfectly separable data
   - Pocket: For non-separable data, keeps best solution

3. **Linear Regression**:
   - Predicts continuous values
   - Closed-form solution: w = X†y
   - Can be used for classification initialization

4. **Nonlinear Transformations**:
   - Transform input to handle complex patterns
   - Still use linear algorithms (linear in weights!)
   - Formula: h(x) = wᵀΦ(x)

### The Big Picture

```text
Input x → [Feature Transform Φ] → Features z → [Linear Model w] → Output h(z)
```

**Remember**: 
- The algorithm is linear in the **weights**
- We can handle nonlinear patterns through feature transformation
- This combination is powerful yet computationally efficient!

### Formulas Quick Reference

| Concept | Formula |
|---------|---------|
| Linear Hypothesis | h(x) = wᵀx = Σwᵢxᵢ |
| Classification | sign(wᵀx) |
| Squared Error | (h(x) - y)² |
| In-Sample Error | Eᵢₙ(w) = (1/N)Σ(wᵀxₙ - yₙ)² |
| Optimal Weights | w = X†y = (XᵀX)⁻¹Xᵀy |
| Nonlinear Model | h(x) = wᵀΦ(x) |

---

**Next Steps**: Practice implementing these algorithms and experiment with different feature transformations to see how they affect performance!