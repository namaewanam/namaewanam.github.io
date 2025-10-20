---
title: Lecture 1 - The Learning Problem
date: 2025-10-18
description: A comprehensive beginner's guide to understanding the learning problem in machine learning, covering key concepts, types of learning, feasibility, error measures, and practical exercises.
order: 1
---

## Table of Contents
1. [What is Machine Learning?](#what-is-machine-learning)
2. [Core Components of Learning](#core-components-of-learning)
3. [The Perceptron Model](#the-perceptron-model)
4. [Learning Algorithm (PLA)](#learning-algorithm-pla)
5. [Types of Machine Learning](#types-of-machine-learning)
6. [Key Takeaways](#key-takeaways)

---

## What is Machine Learning?

### The Three Essential Conditions

Machine learning is applicable when **ALL three** conditions are met:

1. **A pattern exists** - There's some underlying relationship in the data
2. **We cannot pin it down mathematically** - The pattern is too complex to write as a simple formula
3. **We have data on it** - We have examples/observations of the pattern

### Real-World Example: Movie Rating Prediction

**Problem**: Predict how a viewer will rate a movie (Netflix Prize - $1 million!)

**Why use ML?**
- Pattern exists: People's preferences are consistent (if you like action movies, you'll probably like similar ones)
- Too complex to write manually: You can't write a simple formula for "Does John like this movie?"
- We have data: Historical ratings from millions of users

**Traditional Approach** (doesn't work well):
```text
IF movie has Tom Cruise AND user likes action THEN rating = 5
```
Too many factors to consider manually!

**ML Approach**: Let the algorithm learn from data which factors matter and how much they contribute.

---

## Core Components of Learning

### Real-World Metaphor: Credit Card Approval

Imagine you work at a bank and need to decide whether to approve credit cards.

### The Components

#### 1. **Input: x**
The information you have about the applicant:
```text
x = {
    age: 23,
    gender: male,
    annual_salary: $30,000,
    years_in_residence: 1,
    years_in_job: 1,
    current_debt: $15,000
}
```

#### 2. **Output: y**
What you're trying to predict:
```text
y = approved or denied (good customer or bad customer)
y = +1 (good) or -1 (bad)
```

#### 3. **Target Function: f**
The **ideal formula** that perfectly predicts credit worthiness:
```text
f: X → Y
f(x) = ideal decision for applicant x
```
**Problem**: We don't know what f is! That's why we need machine learning.

#### 4. **Training Data: D**
Historical records of past customers:
```text
D = {(x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)}
```
Example:
```text
(x₁, y₁) = ({age: 25, salary: $40k, ...}, approved)
(x₂, y₂) = ({age: 19, salary: $15k, ...}, denied)
...
```

#### 5. **Hypothesis Set: H**
The set of **candidate formulas** your learning algorithm can choose from:
```text
H = {h₁, h₂, h₃, ...}
```
Think of it as your "toolbox" of possible formulas.

#### 6. **Learning Algorithm: A**
The process that picks the best hypothesis from H using the training data:
```text
A: (D, H) → g
```
It searches through H to find g that works best on the data.

#### 7. **Final Hypothesis: g**
The formula you'll actually use (your learned model):
```text
g: X → Y
g(x) ≈ f(x)  (hopefully!)
```

### The Learning Diagram

```text
Unknown Target Function (f)
         ↓ generates
    Training Data (D)
         ↓ used by
   Learning Algorithm (A)
         ↓ picks from
    Hypothesis Set (H)
         ↓ produces
  Final Hypothesis (g)
```

**Goal**: Make g as close to f as possible!

---

## The Perceptron Model

### What is a Perceptron?

A **perceptron** is one of the simplest machine learning models. It makes decisions using a **weighted sum**.

### The Basic Idea

For credit approval, give each factor a **weight** (importance):

```text
Decision = w₁ × (age) + w₂ × (salary) + w₃ × (debt) + ...
```

- If Decision > threshold → Approve
- If Decision < threshold → Deny

### Mathematical Formula

```text
h(x) = sign(Σ wᵢxᵢ - threshold)
       i=1 to d
```

Where:
- **x** = input features (age, salary, etc.)
- **w** = weights (how important each feature is)
- **d** = number of features
- **sign()** = returns +1 if positive, -1 if negative

### Simplified Notation

Introduce x₀ = 1 (artificial coordinate) to absorb the threshold:

```text
h(x) = sign(Σ wᵢxᵢ)  = sign(w₀ + w₁x₁ + w₂x₂ + ... + wₐxₐ)
       i=0 to d
```

In vector form:
```text
h(x) = sign(wᵀx)
```

### Geometric Interpretation

The perceptron creates a **line** (or hyperplane in higher dimensions) that separates two classes:

```text
        +  +  +
      +  +    +
   _______________  ← Decision boundary (wᵀx = 0)
        -  -  -
      -  -    -
```

- Points on one side: +1 (approve)
- Points on other side: -1 (deny)

### Example: Simple Credit Approval

Let's say we only consider **salary** (x₁) and **debt** (x₂):

```text
h(x) = sign(w₀ + w₁ × salary + w₂ × debt)
```

If we learn:
```text
w₀ = 5
w₁ = 0.001   (positive = more salary is good)
w₂ = -0.002  (negative = more debt is bad)
```

For an applicant with salary = $50,000 and debt = $10,000:
```text
h(x) = sign(5 + 0.001×50,000 + (-0.002)×10,000)
     = sign(5 + 50 - 20)
     = sign(35)
     = +1 (APPROVE)
```

---

## Learning Algorithm (PLA)

### PLA = Perceptron Learning Algorithm

**Goal**: Find weights (w) that correctly classify the training data.

### The Algorithm (Step-by-Step)

1. **Start** with random weights: w = [0, 0, 0, ...]

2. **Repeat** until all points are correctly classified:
   - Pick a **misclassified point** (xₙ, yₙ) where:
     ```text
     sign(wᵀxₙ) ≠ yₙ
     ```
   - **Update** the weights:
     ```text
     w ← w + yₙxₙ
     ```

3. **Stop** when no misclassified points remain

### Why Does This Update Work?

The update `w ← w + yₙxₙ` moves the decision boundary toward the misclassified point.

**Case 1**: Point should be +1 but predicted -1
```text
w_new = w_old + (+1) × x = w_old + x
```
This makes wᵀx larger (more positive) next time!

**Case 2**: Point should be -1 but predicted +1
```text
w_new = w_old + (-1) × x = w_old - x
```
This makes wᵀx smaller (more negative) next time!

### Visual Example

```text
Iteration 1:
  +  +  +
+  +    +
___________ ← current boundary (wrong!)
  -  -  X  ← misclassified (should be -)
    -  -

Update w, boundary rotates:

Iteration 2:
  +  +  +
+  +    +
    -  -  -
  -  --------- ← new boundary (better!)
      -  
```

### PLA Example (Detailed)

**Training Data**:
```text
(x₁, y₁) = ([3, 2], +1)
(x₂, y₂) = ([1, 1], +1)
(x₃, y₃) = ([-1, 2], -1)
```

**Iteration 1**: Start w = [0, 0]
- Check x₁: sign(0×3 + 0×2) = 0 ≠ +1 ✗ Misclassified!
- Update: w = [0,0] + 1×[3,2] = [3, 2]

**Iteration 2**: w = [3, 2]
- Check x₁: sign(3×3 + 2×2) = sign(13) = +1 ✓
- Check x₂: sign(3×1 + 2×1) = sign(5) = +1 ✓
- Check x₃: sign(3×(-1) + 2×2) = sign(1) = +1 ≠ -1 ✗
- Update: w = [3,2] + (-1)×[-1,2] = [4, 0]

**Iteration 3**: w = [4, 0]
- Check all points... (continue until all correct)

---

## Types of Machine Learning

### 1. Supervised Learning

**Definition**: Learning from labeled data (you know the correct answers)

**Format**: (input, correct output) pairs

**Example**: Coin recognition in vending machines
```text
Training Data:
(mass=5g, size=21mm) → 25 cent coin
(mass=2g, size=17mm) → 5 cent coin
(mass=8g, size=24mm) → 10 cent coin
```

**Applications**:
- Email spam detection (email → spam/not spam)
- Medical diagnosis (symptoms → disease)
- House price prediction (features → price)

### 2. Unsupervised Learning

**Definition**: Learning from unlabeled data (no correct answers given)

**Format**: (input, ?) - just inputs, no labels

**Example**: Customer segmentation
```text
Data: Customer purchase histories
Goal: Group similar customers together
No one tells you what the groups should be!
```

**Common Task**: **Clustering**
```text
     x  x      o o
   x  x  x    o o o
     x  x      o o
   
   Group 1    Group 2
```

**Applications**:
- Customer segmentation
- Anomaly detection
- Data compression

### 3. Reinforcement Learning

**Definition**: Learning from feedback (rewards/penalties)

**Format**: (input, some output, grade for this output)

**Example**: Game playing (Backgammon)
```text
State: Current board position
Action: Make a move
Reward: Win (+1), Lose (-1), or Continue (0)
```

**Key Difference**: You don't know the *correct* move, only whether you eventually won or lost!

**Applications**:
- Game AI (Chess, Go, video games)
- Robot control
- Self-driving cars
- Trading algorithms

---

## Key Takeaways

### When to Use Machine Learning

✅ Use ML when:
1. Pattern exists in data
2. Cannot write explicit rules
3. Have sufficient data

❌ Don't use ML when:
- Simple rules work fine
- No data available
- Need 100% accuracy with explanation

### The Learning Process

```text
Data → Learning Algorithm → Model → Predictions
```

### Important Concepts

1. **Hypothesis Set (H)**: Your model's expressiveness
   - Too simple: Can't capture pattern
   - Too complex: Memorizes noise

2. **Learning Algorithm (A)**: How you find the best hypothesis
   - Must converge to a good solution
   - Should be computationally efficient

3. **Training vs Reality**: 
   - g works on training data
   - We hope g ≈ f on new data!

### Questions to Keep in Mind

1. **Can we learn?** (Is learning feasible?)
2. **Can we learn something useful?** (Generalization)
3. **How complex should our model be?** (Model selection)
4. **How much data do we need?** (Sample complexity)

These questions will be answered in future lectures!

---

## Practice Problems

### Problem 1: Identify the Components

For spam email detection, identify:
- Input (x):
- Output (y):
- Target function (f):
- Hypothesis (g):

### Problem 2: Perceptron Calculation

Given w = [1, 2, -1] and x = [1, 3, 2]:
- Calculate wᵀx
- What is h(x)?

### Problem 3: PLA Update

Current weights: w = [1, 1]
Misclassified point: x = [2, 3], y = -1
What are the new weights?

---

## Additional Resources

- Practice implementing perceptron from scratch
- Visualize decision boundaries with plotting libraries
- Try PLA on simple 2D datasets
- Explore scikit-learn for practical implementations

**Remember**: Machine learning is about finding patterns in data that are too complex to write by hand. Start simple, understand the basics, then move to complex models!