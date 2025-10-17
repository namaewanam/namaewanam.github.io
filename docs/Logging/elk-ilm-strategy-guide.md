---
title: ELK Index Lifecycle Management (ILM) Strategy Guide
date: 2025-10-17
description: A comprehensive guide to managing log indices in an ELK stack using Index Lifecycle Management
---

## Table of Contents
1. [Introduction](#introduction)
2. [Index Rotation Strategies](#index-rotation-strategies)
3. [ILM Lifecycle Phases](#ilm-lifecycle-phases)
4. [Logstash Configuration](#logstash-configuration)
5. [ILM Policy Configuration](#ilm-policy-configuration)
6. [Complete Implementation Examples](#complete-implementation-examples)
7. [Management Operations](#management-operations)
8. [Best Practices](#best-practices)

---

## Introduction

Index Lifecycle Management (ILM) is a feature in Elasticsearch that automates the management of indices throughout their lifecycle. It helps optimize storage, performance, and costs by automatically transitioning indices through different phases based on age, size, or other criteria.

### Key Concepts

- **Index**: A collection of documents with similar characteristics
- **Shard**: A partition of an index distributed across cluster nodes
- **Alias**: A virtual name that points to one or more indices
- **Write Alias**: A special alias that designates the active index for write operations
- **Rollover**: The process of creating a new index when certain conditions are met

---

## Index Rotation Strategies

There are three main strategies for rotating indices in Elasticsearch:

### 1. Time-Based Rotation

#### Daily Rotation

**When to Use:**
- High volume log ingestion (millions of documents per day)
- Need for fine-grained time-based queries
- Compliance requirements for daily data segregation

**Advantages:**
- Simple to understand and implement
- Easy to identify data by date
- Simple deletion of old data

**Disadvantages:**
- Can create many small indices (shard sprawl)
- Inconsistent index sizes (weekends vs. weekdays)
- Higher management overhead

**Logstash Configuration:**
```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.MM.dd}"  # Creates: webnc-logs-2025.10.16
	}
}
```

**Index Examples:**
- `webnc-logs-2025.10.16`
- `webnc-logs-2025.10.17`
- `webnc-logs-2025.10.18`

#### Weekly Rotation

**When to Use:**
- Moderate log volume (thousands to millions of documents per day)
- Balance between too many and too few indices
- Reduced index count vs. daily rotation

**Advantages:**
- Fewer indices to manage than daily rotation
- Balanced index sizes (7 days of data)
- Reduced cluster overhead

**Disadvantages:**
- Less granular than daily rotation
- Week boundaries might not align with business needs

**Logstash Configuration:**
```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.ww}"  # Creates: webnc-logs-2025.42
	}
}
```

**Index Examples:**
- `webnc-logs-2025.42` (Week 42 of 2025)
- `webnc-logs-2025.43` (Week 43 of 2025)

#### Monthly Rotation

**When to Use:**
- Low to moderate log volume
- Long-term data retention
- Simplified management

**Logstash Configuration:**
```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.MM}"  # Creates: webnc-logs-2025.10
	}
}
```

### 2. Size-Based Rotation (Rollover)

**When to Use:**
- Variable data volumes
- Need to maintain optimal shard sizes (10-50GB recommended)
- Performance optimization is critical
- Want consistent query performance

**Advantages:**
- Consistent index sizes
- Optimal shard sizes for performance
- Better resource utilization
- Automatic management by ILM

**Disadvantages:**
- More complex initial setup
- Requires understanding of aliases
- Cannot be controlled directly from Logstash

**How It Works:**
1. Logstash writes to a write alias (e.g., `webnc-logs-write`)
2. The alias points to the current active index (e.g., `webnc-logs-000001`)
3. When the index reaches the size threshold, ILM automatically:
	 - Creates a new index with incremented number (e.g., `webnc-logs-000002`)
	 - Updates the write alias to point to the new index
	 - Marks the old index as read-only

**Logstash Configuration:**
```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-write"  # Write to alias, not index
	}
}
```

### 3. Hybrid Rotation

Combines time and size constraints for maximum flexibility.

**Example:**
- Rollover when index reaches 50GB OR 30 days
- Whichever condition is met first triggers rollover

---

## ILM Lifecycle Phases

ILM manages indices through distinct phases, each optimized for different access patterns and storage requirements.

### Phase Overview

```
HOT → WARM → COLD → FROZEN → DELETE
```

### 1. Hot Phase

**Purpose:** Active indexing and frequent queries

**Characteristics:**
- High-performance hardware (SSD)
- Active write operations
- Frequent read queries
- Only phase that supports rollover

**Typical Duration:** 0-7 days

**Common Actions:**
- `rollover`: Create new index based on conditions
- `set_priority`: Set recovery priority (usually high, e.g., 100)
- `forcemerge`: Reduce number of segments
- `shrink`: Reduce number of shards

**Example Configuration:**
```json
"hot": {
	"min_age": "0ms",
	"actions": {
		"rollover": {
			"max_primary_shard_size": "50gb",
			"max_age": "7d",
			"max_docs": 1000000000
		},
		"set_priority": {
			"priority": 100
		}
	}
}
```

### 2. Warm Phase

**Purpose:** No longer actively written to, but still queried regularly

**Characteristics:**
- Medium-performance hardware (HDD acceptable)
- Read-only operations
- Less frequent queries than hot
- Data can be optimized for storage

**Typical Duration:** 7-30 days after rollover

**Common Actions:**
- `set_priority`: Lower priority (e.g., 50)
- `shrink`: Reduce shard count to minimize overhead
- `forcemerge`: Merge segments for better compression
- `allocate`: Move to specific node types

**Example Configuration:**
```json
"warm": {
	"min_age": "7d",
	"actions": {
		"set_priority": {
			"priority": 50
		},
		"shrink": {
			"number_of_shards": 1
		},
		"forcemerge": {
			"max_num_segments": 1
		}
	}
}
```

### 3. Cold Phase

**Purpose:** Rarely accessed data, optimized for cost

**Characteristics:**
- Low-cost storage hardware
- Infrequent queries (acceptable slower performance)
- Highly compressed
- Minimal resource consumption

**Typical Duration:** 30-90 days after rollover

**Common Actions:**
- `set_priority`: Lowest priority (e.g., 0)
- `freeze`: Minimize memory footprint
- `searchable_snapshot`: Move to snapshot repository
- `allocate`: Move to cold tier nodes

**Example Configuration:**
```json
"cold": {
	"min_age": "30d",
	"actions": {
		"set_priority": {
			"priority": 0
		},
		"freeze": {},
		"allocate": {
			"require": {
				"data": "cold"
			}
		}
	}
}
```

### 4. Frozen Phase

**Purpose:** Extremely rare access, maximum cost savings

**Characteristics:**
- Snapshot-based storage
- Very slow query performance (acceptable for rare access)
- Minimal local storage
- Lowest cost

**Typical Duration:** 90+ days

**Common Actions:**
- `searchable_snapshot`: Store in snapshot repository
- Data is restored on-demand for queries

**Example Configuration:**
```json
"frozen": {
	"min_age": "90d",
	"actions": {
		"searchable_snapshot": {
			"snapshot_repository": "found-snapshots"
		}
	}
}
```

### 5. Delete Phase

**Purpose:** Remove data that's no longer needed

**Characteristics:**
- Permanent deletion
- Free up storage space
- Comply with data retention policies

**Common Actions:**
- `delete`: Remove index entirely
- `wait_for_snapshot`: Ensure backup exists before deletion

**Example Configuration:**
```json
"delete": {
	"min_age": "365d",
	"actions": {
		"wait_for_snapshot": {
			"policy": "daily-snapshots"
		},
		"delete": {}
	}
}
```

---

## Logstash Configuration

### Input Configurations

#### 1. TCP Input with JSON Lines

**Use Case:** Application sends structured JSON logs over TCP

```ruby
input {
	tcp {
		port => 5000
		codec => json_lines  # Each line is a separate JSON object
		type => "app-logs"
	}
}
```

#### 2. Multiple TCP Inputs with Different Types

**Use Case:** Multiple applications sending logs to different ports

```ruby
input {
	tcp {
		port => 5001
		codec => json_lines
		type => "spring-boot-log"
	}
	
	tcp {
		port => 5002
		codec => json_lines
		type => "nestjs-log"
	}
	
	tcp {
		port => 5003
		codec => plain
		type => "nginx-log"
	}
}
```

#### 3. File Input

**Use Case:** Reading logs from files

```ruby
input {
	file {
		path => "/var/log/app/*.log"
		start_position => "beginning"
		sincedb_path => "/dev/null"  # For testing; use proper path in production
		codec => json_lines
		type => "file-log"
	}
}
```

### Filter Configurations

#### 1. Type-Based Conditional Processing

```ruby
filter {
	if [type] == "spring-boot-log" {
		# Spring Boot specific processing
		grok {
			match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} ..." }
		}
		date {
			match => ["timestamp", "ISO8601"]
			target => "@timestamp"
		}
	}
	else if [type] == "nestjs-log" {
		# NestJS already sends JSON, minimal processing needed
		mutate {
			add_field => { "application" => "nestjs-app" }
		}
	}
	else if [type] == "nginx-log" {
		# Parse nginx access logs
		grok {
			match => { "message" => "%{COMBINEDAPACHELOG}" }
		}
		geoip {
			source => "clientip"
			target => "geoip"
		}
	}
}
```

#### 2. GeoIP Enrichment

```ruby
filter {
	geoip {
		source => "client_ip"
		target => "geoip"
		fields => ["city_name", "country_name", "location"]
	}
}
```

### Output Configurations

#### 1. Daily Rotation Output

```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.MM.dd}"
		user => "elastic"
		password => "changeme"
	}
	
	# For debugging
	stdout {
		codec => rubydebug
	}
}
```

#### 2. Rollover-Based Output

```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-write"  # Write to alias
		ilm_enabled => true
		ilm_rollover_alias => "webnc-logs-write"
		ilm_pattern => "000001"
		ilm_policy => "webnc-logs-policy"
	}
}
```

#### 3. Multiple Outputs with Conditionals

```ruby
output {
	if [level] == "ERROR" or [level] == "FATAL" {
		elasticsearch {
			hosts => ["http://elasticsearch:9200"]
			index => "errors-%{+YYYY.MM.dd}"
		}
	}
	
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "all-logs-%{+YYYY.MM.dd}"
	}
	
	# Always output to stdout for monitoring
	stdout {
		codec => rubydebug
	}
}
```

---

## ILM Policy Configuration

### Time-Based Deletion Policy

**Use Case:** Keep logs for a specific period, then delete

```json
PUT _ilm/policy/time_based_deletion
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {}
			},
			"delete": {
				"min_age": "30d",  // Delete after 30 days
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

### Size-Based Rollover Policy

**Use Case:** Maintain optimal index sizes

```json
PUT _ilm/policy/size_based_rollover
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {
					"rollover": {
						"max_primary_shard_size": "50gb",
						"max_age": "30d"
					}
				}
			},
			"delete": {
				"min_age": "90d",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

### Multi-Phase Production Policy

**Use Case:** Enterprise-grade log management with tiered storage

```json
PUT _ilm/policy/production_logs_policy
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {
					"rollover": {
						"max_primary_shard_size": "50gb",
						"max_age": "7d"
					},
					"set_priority": {
						"priority": 100
					}
				}
			},
			"warm": {
				"min_age": "7d",
				"actions": {
					"set_priority": {
						"priority": 50
					},
					"shrink": {
						"number_of_shards": 1
					},
					"forcemerge": {
						"max_num_segments": 1
					}
				}
			},
			"cold": {
				"min_age": "30d",
				"actions": {
					"set_priority": {
						"priority": 0
					},
					"freeze": {}
				}
			},
			"delete": {
				"min_age": "365d",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

### Fast Deletion Policy (Testing Only)

**Use Case:** Testing ILM behavior quickly

⚠️ **WARNING:** Never use in production!

```json
PUT _ilm/policy/delete_logs_after_1_min
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "1m",
				"actions": {}
			},
			"delete": {
				"min_age": "0ms",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

---

## Complete Implementation Examples

### Example 1: Daily Rotation with 30-Day Retention

**Scenario:** Simple daily logs with automatic deletion after 30 days

**Step 1: Create ILM Policy**
```json
PUT _ilm/policy/daily_30_day_retention
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {
					"set_priority": {
						"priority": 100
					}
				}
			},
			"delete": {
				"min_age": "30d",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

**Step 2: Create Index Template**
```json
PUT _index_template/daily_logs_template
{
	"index_patterns": ["webnc-logs-*"],
	"template": {
		"settings": {
			"index.lifecycle.name": "daily_30_day_retention",
			"number_of_shards": 1,
			"number_of_replicas": 1
		}
	}
}
```

**Step 3: Configure Logstash**
```ruby
input {
	tcp {
		port => 5000
		codec => json_lines
	}
}

output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.MM.dd}"
	}
}
```

**Step 4: Apply Policy to Existing Indices**
```json
PUT /webnc-logs-*/_settings
{
	"index": {
		"lifecycle": {
			"name": "daily_30_day_retention"
		}
	}
}
```

### Example 2: Size-Based Rollover with Multi-Tier Storage

**Scenario:** Production environment with optimal performance and cost

**Step 1: Create ILM Policy**
```json
PUT _ilm/policy/production_rollover_policy
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {
					"rollover": {
						"max_primary_shard_size": "50gb",
						"max_age": "30d"
					},
					"set_priority": {
						"priority": 100
					}
				}
			},
			"warm": {
				"min_age": "30d",
				"actions": {
					"set_priority": {
						"priority": 50
					},
					"shrink": {
						"number_of_shards": 1
					},
					"forcemerge": {
						"max_num_segments": 1
					}
				}
			},
			"cold": {
				"min_age": "90d",
				"actions": {
					"set_priority": {
						"priority": 0
					}
				}
			},
			"delete": {
				"min_age": "365d",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

**Step 2: Create Initial Index with Write Alias**
```json
PUT /webnc-logs-000001
{
	"aliases": {
		"webnc-logs-write": {
			"is_write_index": true
		}
	}
}
```

**Step 3: Create Index Template**
```json
PUT _index_template/production_logs_template
{
	"index_patterns": ["webnc-logs-*"],
	"template": {
		"settings": {
			"index.lifecycle.name": "production_rollover_policy",
			"index.lifecycle.rollover_alias": "webnc-logs-write",
			"number_of_shards": 3,
			"number_of_replicas": 1
		}
	}
}
```

**Step 4: Configure Logstash**
```ruby
input {
	tcp {
		port => 5000
		codec => json_lines
	}
}

filter {
	# Add any necessary filters here
	date {
		match => ["timestamp", "ISO8601"]
		target => "@timestamp"
	}
}

output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-write"
	}
}
```

### Example 3: Weekly Rotation with GeoIP Enhancement

**Scenario:** Weekly logs with geographic information

**Step 1: Create ILM Policy**
```json
PUT _ilm/policy/weekly_90_day_retention
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "0ms",
				"actions": {}
			},
			"delete": {
				"min_age": "90d",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

**Step 2: Create Index Template**
```json
PUT _index_template/weekly_logs_template
{
	"index_patterns": ["webnc-logs-*"],
	"template": {
		"settings": {
			"index.lifecycle.name": "weekly_90_day_retention"
		},
		"mappings": {
			"properties": {
				"geoip": {
					"properties": {
						"location": {
							"type": "geo_point"
						}
					}
				}
			}
		}
	}
}
```

**Step 3: Configure Logstash**
```ruby
input {
	tcp {
		port => 5000
		codec => json_lines
	}
}

filter {
	# Extract IP address if needed
	if [client_ip] {
		geoip {
			source => "client_ip"
			target => "geoip"
		}
	}
}

output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-%{+YYYY.ww}"
	}
}
```

---

## Management Operations

### Checking ILM Status

#### Get Detailed ILM Explain
```json
GET /webnc-logs-*/_ilm/explain
```

**Response Interpretation:**
- `"managed": true` - Index is managed by ILM
- `"policy": "policy_name"` - Shows which policy is applied
- `"phase": "hot"` - Current lifecycle phase
- `"age": "15d"` - Time since index creation
- `"step": "complete"` - Current step in phase

#### Check Index Settings
```json
GET /webnc-logs-*/_settings
```

Look for `index.lifecycle.name` to verify policy assignment.

#### Check Index Template
```json
GET /_index_template/webnc_logs_template
```

#### List All Indices
```json
GET /_cat/indices/webnc-logs-*?v
```

### Modifying ILM Behavior

#### Change Poll Interval (For Testing)

**Check Current Value:**
```json
GET _cluster/settings?include_defaults=true&filter_path=**.lifecycle.poll_interval
```

**Set to 10 seconds (Testing Only):**
```json
PUT _cluster/settings
{
	"transient": {
		"indices.lifecycle.poll_interval": "10s"
	}
}
```

**Reset to Default:**
```json
PUT _cluster/settings
{
	"transient": {
		"indices.lifecycle.poll_interval": null
	}
}
```

#### Remove ILM Policy from Indices

**Remove from All Matching Indices:**
```json
POST /webnc-logs-*/_ilm/remove
```

**Response:**
```json
{
	"has_failures": false,
	"failed_indexes": []
}
```

#### Delete Index Template
```json
DELETE /_index_template/webnc_logs_template
```

#### Delete ILM Policy
```json
DELETE _ilm/policy/policy_name
```

### Applying Policy to Existing Indices

**Apply to All Matching Indices:**
```json
PUT /webnc-logs-*/_settings
{
	"index": {
		"lifecycle": {
			"name": "your_policy_name"
		}
	}
}
```

**Apply to Specific Index:**
```json
PUT /webnc-logs-2025.10.16/_settings
{
	"index": {
		"lifecycle": {
			"name": "your_policy_name"
		}
	}
}
```

---

## Best Practices

### 1. Index Sizing

**Recommended Shard Sizes:**
- **Optimal:** 10-50 GB per shard
- **Maximum:** 50-100 GB per shard
- **Minimum:** Avoid shards smaller than 1 GB

**Number of Shards:**
- Start with 1 shard for indices < 50 GB
- Use multiple shards for larger indices or distributed workload
- Over-sharding hurts performance more than under-sharding

### 2. Retention Policies

**Development/Testing:**
- Retention: 7-14 days
- Quick deletion for rapid iteration

**Staging:**
- Retention: 30-60 days
- Similar to production for realistic testing

**Production:**
- **Hot:** 7-30 days
- **Warm:** 30-90 days
- **Cold:** 90-365 days
- **Delete:** After 365+ days (or per compliance requirements)

### 3. Choosing Rotation Strategy

**Use Daily Rotation When:**
- High volume (millions of events per day)
- Need fine-grained time-based queries
- Regulatory requirements for daily segregation

**Use Weekly Rotation When:**
- Moderate volume (thousands to millions per day)
- Want fewer indices to manage
- Balance between granularity and management overhead

**Use Size-Based Rollover When:**
- Variable data volumes
- Performance is critical
- Want consistent shard sizes
- Enterprise production environment

### 4. Performance Optimization

**Disable Replicas During Bulk Indexing:**
```json
PUT /my-index/_settings
{
	"index.number_of_replicas": 0
}
```

Re-enable after indexing completes.

**Use Bulk API:**
Configure Logstash with appropriate batch sizes:
```ruby
output {
	elasticsearch {
		hosts => ["http://elasticsearch:9200"]
		index => "webnc-logs-write"
		flush_size => 500
		idle_flush_time => 5
	}
}
```

**Force Merge Read-Only Indices:**
Only for indices that won't receive more writes:
```json
POST /webnc-logs-2025.10.01/_forcemerge?max_num_segments=1
```

### 5. Monitoring and Alerting

**Key Metrics to Monitor:**
- Index size and document count
- Shard distribution across nodes
- ILM policy execution status
- Indexing and search latency
- Cluster health status

**Set Up Alerts For:**
- Failed ILM policy transitions
- Indices not being deleted as expected
- Disk space approaching limits
- Unusual index growth patterns

### 6. Testing ILM Policies

**Always Test First:**
1. Create test indices with sample data
2. Apply policy with short timeframes (e.g., 1-5 minutes)
3. Adjust `poll_interval` to `10s` for faster testing
4. Verify behavior with `_ilm/explain` API
5. Reset to production values after testing

**Example Test Policy:**
```json
PUT _ilm/policy/test_policy
{
	"policy": {
		"phases": {
			"hot": {
				"min_age": "2m",
				"actions": {}
			},
			"delete": {
				"min_age": "0ms",
				"actions": {
					"delete": {}
				}
			}
		}
	}
}
```

### 7. Security Considerations

**Use Authentication:**
```ruby
output {
	elasticsearch {
		hosts => ["https://elasticsearch:9200"]
		user => "logstash_writer"
		password => "${LOGSTASH_PASSWORD}"
		ssl => true
		cacert => "/path/to/ca.crt"
	}
}
```

**Separate User Roles:**
- **Logstash User:** Write-only permissions to indices
- **ILM Management User:** Manage ILM policies and templates
- **Read-Only Users:** Query indices without modification rights

### 8. Disaster Recovery

**Always Configure Snapshots:**
```json
PUT _ilm/policy/policy_with_snapshot
{
	"policy": {
		"phases": {
			"delete": {
				"min_age": "30d",
				"actions": {
					"wait_for_snapshot": {
						"policy": "daily-snapshots"
					},
					"delete": {}
				}
			}
		}
	}
}
```

**Regular Backup Schedule:**
- Daily snapshots for critical data
- Weekly snapshots for less critical data
- Store snapshots in remote repository (S3, GCS, etc.)

### 9. Common Pitfalls to Avoid

❌ **Don't:**
- Use extremely short retention in production (< 7 days)
- Create too many small shards (< 1 GB)
- Apply rollover to time-based indices from Logstash
- Delete data without snapshots
- Use the same policy for all use cases
- Forget to test policies before production

✅ **Do:**
- Plan retention based on actual needs
- Monitor index and shard sizes
- Use rollover with write aliases
- Regular backups before deletion
- Tailor policies to specific use cases
- Test thoroughly with short timeframes

### 10. Capacity Planning

**Estimate Storage Requirements:**
```
Daily Storage = (Events per Day) × (Avg Event Size) × (1 + Overhead)
								× (Replication Factor)

Example:
10M events/day × 1KB/event × 1.25 (25% overhead) × 2 (1 replica)
= 25 GB/day = 750 GB/month = 9 TB/year
```

**Plan for Growth:**
- Add 20-30% buffer for unexpected growth
- Monitor trends and adjust capacity proactively
- Consider data compression in warm/cold phases

---

## Conclusion

Effective ILM strategy requires understanding your data patterns, access requirements, and organizational needs. Start simple with time-based rotation and basic retention, then evolve to more sophisticated strategies like size-based rollover with multi-tier storage as your requirements grow.

Remember:
- **Test thoroughly** before production deployment
- **Monitor continuously** to ensure policies work as expected
- **Adjust based on actual usage** patterns and performance metrics
- **Document your policies** for team knowledge sharing

For more information, refer to the official Elasticsearch documentation:
- https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html
- https://www.elastic.co/guide/en/logstash/current/index.html
- https://www.elastic.co/docs/reference/logstash
- https://github.com/mareZ-noob/ptudwnc