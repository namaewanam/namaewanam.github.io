export interface Snippet {
	id: string;
	title: string;
	description: string;
	tags: string[];
	content: string;
}

export const SNIPPETS: Snippet[] = [
	{
		id: 'docker-compose-postgres-redis',
		title: 'PostgreSQL + Redis Docker Compose',
		description:
			'A standard docker-compose setup for local development with Postgres and Redis, including persistence and healthchecks.',
		tags: ['docker', 'postgres', 'redis', 'devops'],
		content: `\`\`\`yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: devdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d devdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
\`\`\``,
	},
	{
		id: 'react-use-debounce',
		title: 'React useDebounce Hook',
		description:
			'A simple, type-safe debounce hook for React. Great for search inputs or rate-limiting API calls.',
		tags: ['react', 'typescript', 'hooks'],
		content: `\`\`\`typescript
import { useState, useEffect } from 'react';

/**
 * Hook to debounce a rapidly changing value.
 * @param value The value to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}
\`\`\``,
	},
	{
		id: 'go-worker-pool',
		title: 'Go Worker Pool Pattern',
		description:
			'A clean implementation of the worker pool concurrency pattern in Go using channels and WaitGroups.',
		tags: ['go', 'concurrency', 'patterns'],
		content: `\`\`\`go
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		fmt.Printf("Worker %d processing job %d\\n", id, j)
		time.Sleep(time.Second) // Simulate expensive task
		results <- j * 2
	}
}

func main() {
	const numJobs = 10
	const numWorkers = 3

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	// Start workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// Send jobs
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs) // No more jobs

	// Wait for all workers to finish
	wg.Wait()
	close(results) // Close results channel

	// Collect results
	for result := range results {
		fmt.Println("Result:", result)
	}
}
\`\`\``,
	},
];
