---
title: Java Streams API Guide
date: 2025-10-17
description: Master the Java Streams API for functional-style operations on collections
---

## What are Streams?

A stream is a sequence of elements supporting sequential and parallel aggregate operations. Streams don't store data; they convey elements from a source through a pipeline of operations.

## Creating Streams

### From Collections

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
Stream<String> stream = names.stream();
```

### From Arrays

```java
String[] array = {"Apple", "Banana", "Cherry"};
Stream<String> stream = Arrays.stream(array);
```

### Using Stream.of()

```java
Stream<Integer> numbers = Stream.of(1, 2, 3, 4, 5);
```

## Common Stream Operations

### Filter

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
// Result: [2, 4, 6]
```

### Map

```java
List<String> names = Arrays.asList("alice", "bob", "charlie");
List<String> upperNames = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
// Result: ["ALICE", "BOB", "CHARLIE"]
```

### Reduce

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
    .reduce(0, Integer::sum);
// Result: 15
```

### Collect

```java
List<Person> people = getAll();
Map<String, List<Person>> byCity = people.stream()
    .collect(Collectors.groupingBy(Person::getCity));
```

## Practical Example

Here's a complete example demonstrating multiple stream operations:

```java
public class StreamExample {
    public static void main(String[] args) {
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", 30, 50000),
            new Employee("Bob", 25, 45000),
            new Employee("Charlie", 35, 60000),
            new Employee("David", 28, 48000)
        );

        // Get names of employees over 28, sorted by salary
        List<String> result = employees.stream()
            .filter(e -> e.getAge() > 28)
            .sorted(Comparator.comparing(Employee::getSalary))
            .map(Employee::getName)
            .collect(Collectors.toList());

        System.out.println(result); // [Alice, Charlie]
    }
}
```

## Best Practices

1. **Use method references** when possible for cleaner code
2. **Avoid side effects** in stream operations
3. **Consider parallel streams** for large datasets
4. **Don't reuse streams** - they can only be used once

## Conclusion

The Streams API is a powerful tool for processing collections in a functional style. It makes code more readable and often more efficient, especially with parallel processing.

## Further Reading

- [Official Java Streams Documentation](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)
- Java 8 in Action by Raoul-Gabriel Urma