---
title: ELK Logging Strategy
date: 2025-10-15
description: Master the ELK logging strategy for centralized logging in Spring Boot applications
---


# Spring Boot Elasticsearch Logging Deployment Patterns

## Overview
This guide covers various approaches to integrate Spring Boot applications with Elasticsearch for centralized logging.

---

## Pattern 1: Direct Logback to Elasticsearch (Logstash Appender)

### Architecture Flow
```
Spring Boot App → Logback → Logstash Appender → Elasticsearch → Kibana
```

### Dependencies (pom.xml)
```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

### Configuration (logback-spring.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>localhost:5000</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"app":"my-spring-boot-app"}</customFields>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="LOGSTASH" />
    </root>
</configuration>
```

### Logstash Configuration (logstash.conf)
```conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  # Add custom filters if needed
  mutate {
    add_field => { "[@metadata][index]" => "springboot-logs-%{+YYYY.MM.dd}" }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "%{[@metadata][index]}"
  }
  stdout { codec => rubydebug }
}
```

### Pros & Cons
- ✅ Real-time logging
- ✅ Low latency
- ❌ Network dependency
- ❌ Potential log loss if connection fails

---

## Pattern 2: ELK Stack (Filebeat + Logstash)

### Architecture Flow
```
Spring Boot App → Log File → Filebeat → Logstash → Elasticsearch → Kibana
```

### Spring Boot Configuration (application.yml)
```yaml
logging:
  file:
    name: logs/application.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  level:
    root: INFO
```

### Logback Configuration (logback-spring.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="logs/application.log"/>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application-%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

### Filebeat Configuration (filebeat.yml)
```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/logs/application*.log
    json.keys_under_root: true
    json.add_error_key: true
    fields:
      app: my-spring-boot-app
      environment: production

output.logstash:
  hosts: ["localhost:5044"]
```

### Logstash Configuration (logstash.conf)
```conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [app] == "my-spring-boot-app" {
    json {
      source => "message"
    }
    
    date {
      match => ["@timestamp", "ISO8601"]
      target => "@timestamp"
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "springboot-%{[app]}-%{+YYYY.MM.dd}"
  }
}
```

### Pros & Cons
- ✅ Decoupled from application
- ✅ No network dependency in app
- ✅ Log buffering and retry
- ❌ Slight delay in log availability
- ❌ Additional file I/O

---

## Pattern 3: Direct Filebeat to Elasticsearch (No Logstash)

### Architecture Flow
```
Spring Boot App → Log File → Filebeat → Elasticsearch → Kibana
```

### Spring Boot Configuration
Same as Pattern 2 (file-based logging)

### Filebeat Configuration (filebeat.yml)
```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/logs/application*.log
    json.keys_under_root: true
    json.add_error_key: true
    fields:
      app: my-spring-boot-app
      environment: production

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~
  - add_docker_metadata: ~

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "springboot-%{[fields.app]}-%{+yyyy.MM.dd}"
  
setup.template.name: "springboot"
setup.template.pattern: "springboot-*"
setup.ilm.enabled: false
```

### Pros & Cons
- ✅ Simpler architecture
- ✅ Lower resource usage
- ✅ Good for basic use cases
- ❌ Limited log transformation capabilities

---

## Pattern 4: HTTP Appender (Direct to Elasticsearch)

### Architecture Flow
```
Spring Boot App → Logback HTTP Appender → Elasticsearch → Kibana
```

### Dependencies (pom.xml)
```xml
<dependency>
    <groupId>com.internetitem</groupId>
    <artifactId>logback-elasticsearch-appender</artifactId>
    <version>1.6</version>
</dependency>
```

### Logback Configuration (logback-spring.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="ELASTIC" class="com.internetitem.logback.elasticsearch.ElasticsearchAppender">
        <url>http://localhost:9200/_bulk</url>
        <index>springboot-logs-%date{yyyy-MM-dd}</index>
        <type>_doc</type>
        <loggerName>es-logger</loggerName>
        <errorLoggerName>es-error-logger</errorLoggerName>
        <connectTimeout>30000</connectTimeout>
        <errorsToStderr>false</errorsToStderr>
        <includeCallerData>false</includeCallerData>
        <logsToStderr>false</logsToStderr>
        <maxQueueSize>104857600</maxQueueSize>
        <maxRetries>3</maxRetries>
        <readTimeout>30000</readTimeout>
        <sleepTime>250</sleepTime>
        <rawJsonMessage>false</rawJsonMessage>
        <includeMdc>true</includeMdc>
        <excludedMdcKeys></excludedMdcKeys>
        <authentication class="com.internetitem.logback.elasticsearch.config.BasicAuthentication">
            <username>elastic</username>
            <password>changeme</password>
        </authentication>
    </appender>

    <appender name="ASYNC_ELASTIC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="ELASTIC" />
        <queueSize>500</queueSize>
        <discardingThreshold>0</discardingThreshold>
    </appender>

    <root level="INFO">
        <appender-ref ref="ASYNC_ELASTIC" />
    </root>
</configuration>
```

### Pros & Cons
- ✅ No intermediate components
- ✅ Real-time logging
- ✅ Simple setup
- ❌ Tight coupling
- ❌ No buffering benefits
- ❌ Potential performance impact

---

## Pattern 5: Fluentd Pattern

### Architecture Flow
```
Spring Boot App → Log File → Fluentd → Elasticsearch → Kibana
```

### Spring Boot Configuration
File-based logging (same as Pattern 2)

### Fluentd Configuration (fluent.conf)
```conf
<source>
  @type tail
  path /path/to/logs/application*.log
  pos_file /var/log/fluentd/springboot.pos
  tag springboot.logs
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%L%z
  </parse>
</source>

<filter springboot.logs>
  @type record_transformer
  <record>
    app "my-spring-boot-app"
    environment "production"
    hostname "#{Socket.gethostname}"
  </record>
</filter>

<match springboot.logs>
  @type elasticsearch
  host localhost
  port 9200
  logstash_format true
  logstash_prefix springboot
  include_tag_key true
  type_name _doc
  tag_key @log_name
  <buffer>
    flush_interval 10s
    flush_thread_count 2
  </buffer>
</match>
```

### Pros & Cons
- ✅ Powerful data transformation
- ✅ Multiple input/output plugins
- ✅ Good for complex pipelines
- ❌ Additional component to manage

---

## Pattern 6: Cloud-Native (AWS CloudWatch + Lambda)

### Architecture Flow
```
Spring Boot App → CloudWatch Logs → Lambda → Elasticsearch
```

### Spring Boot Configuration (application.yml)
```yaml
logging:
  level:
    root: INFO
    com.amazonaws: WARN
```

### Dependencies (pom.xml)
```xml
<dependency>
    <groupId>ca.pjer</groupId>
    <artifactId>logback-awslogs-appender</artifactId>
    <version>1.6.0</version>
</dependency>
```

### Logback Configuration (logback-spring.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="AWS_LOGS" class="ca.pjer.logback.AwsLogsAppender">
        <layout>
            <pattern>%d{yyyyMMdd'T'HHmmss} %thread %level %logger{15} %msg%n</pattern>
        </layout>
        <logGroupName>/aws/springboot/my-app</logGroupName>
        <logStreamName>instance-1</logStreamName>
        <logRegion>us-east-1</logRegion>
        <maxBatchLogEvents>50</maxBatchLogEvents>
        <maxFlushTimeMillis>30000</maxFlushTimeMillis>
        <maxBlockTimeMillis>5000</maxBlockTimeMillis>
    </appender>

    <root level="INFO">
        <appender-ref ref="AWS_LOGS" />
    </root>
</configuration>
```

### Lambda Function (Node.js example)
```javascript
const { Client } = require('@elastic/elasticsearch');
const zlib = require('zlib');

const client = new Client({ node: 'https://your-es-endpoint' });

exports.handler = async (event) => {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const logs = JSON.parse(zlib.gunzipSync(payload).toString('utf8'));
    
    const body = logs.logEvents.flatMap(log => [
        { index: { _index: 'springboot-logs' } },
        {
            timestamp: new Date(log.timestamp),
            message: log.message,
            logGroup: logs.logGroup,
            logStream: logs.logStream
        }
    ]);
    
    await client.bulk({ body });
};
```

---

## Pattern 7: Kafka + Logstash

### Architecture Flow
```
Spring Boot App → Kafka → Logstash → Elasticsearch → Kibana
```

### Dependencies (pom.xml)
```xml
<dependency>
    <groupId>com.github.danielwegener</groupId>
    <artifactId>logback-kafka-appender</artifactId>
    <version>0.2.0</version>
</dependency>
```

### Logback Configuration (logback-spring.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="KAFKA" class="com.github.danielwegener.logback.kafka.KafkaAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
        <topic>springboot-logs</topic>
        <keyingStrategy class="com.github.danielwegener.logback.kafka.keying.NoKeyKeyingStrategy" />
        <deliveryStrategy class="com.github.danielwegener.logback.kafka.delivery.AsynchronousDeliveryStrategy" />
        <producerConfig>bootstrap.servers=localhost:9092</producerConfig>
        <producerConfig>acks=0</producerConfig>
        <producerConfig>linger.ms=1000</producerConfig>
        <producerConfig>max.block.ms=0</producerConfig>
    </appender>

    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="KAFKA" />
    </appender>

    <root level="INFO">
        <appender-ref ref="ASYNC" />
    </root>
</configuration>
```

### Logstash Configuration (logstash.conf)
```conf
input {
  kafka {
    bootstrap_servers => "localhost:9092"
    topics => ["springboot-logs"]
    codec => json
    group_id => "logstash-consumer"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "springboot-kafka-%{+YYYY.MM.dd}"
  }
}
```

### Pros & Cons
- ✅ High throughput
- ✅ Decoupled architecture
- ✅ Log buffering and replay
- ❌ Complex infrastructure
- ❌ Higher operational cost

---

## Pattern 8: Sidecar Container (Kubernetes)

### Architecture Flow
```
Spring Boot Container → Shared Volume → Filebeat Sidecar → Elasticsearch
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: springboot-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: springboot
  template:
    metadata:
      labels:
        app: springboot
    spec:
      containers:
      - name: springboot
        image: my-springboot-app:latest
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
          
      - name: filebeat
        image: docker.elastic.co/beats/filebeat:8.11.0
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: filebeat-config
          mountPath: /usr/share/filebeat/filebeat.yml
          subPath: filebeat.yml
          
      volumes:
      - name: logs
        emptyDir: {}
      - name: filebeat-config
        configMap:
          name: filebeat-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: log
      paths:
        - /app/logs/*.log
      json.keys_under_root: true
      
    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
      index: "springboot-k8s-%{+yyyy.MM.dd}"
```

---

## Comparison Matrix

| Pattern | Complexity | Performance | Resilience | Use Case |
|---------|-----------|-------------|------------|----------|
| Logstash Appender | Low | High | Medium | Real-time needs |
| ELK Stack | Medium | Medium | High | Production standard |
| Filebeat Direct | Low | Medium | High | Simple deployments |
| HTTP Direct | Low | Medium | Low | Development/Testing |
| Fluentd | Medium | Medium | High | Complex transformations |
| CloudWatch | Medium | Medium | High | AWS environments |
| Kafka | High | Very High | Very High | High-volume systems |
| Sidecar | Medium | Medium | High | Kubernetes/containers |

---

## Best Practices

### 1. Structured Logging
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import net.logstash.logback.argument.StructuredArguments;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    public void processUser(String userId) {
        log.info("Processing user", 
            StructuredArguments.kv("userId", userId),
            StructuredArguments.kv("action", "process"));
    }
}
```

### 2. MDC (Mapped Diagnostic Context)
```java
import org.slf4j.MDC;

@Component
public class LoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        MDC.put("requestId", UUID.randomUUID().toString());
        MDC.put("userId", getCurrentUserId());
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### 3. Log Levels Strategy
- **ERROR**: System errors requiring immediate attention
- **WARN**: Potential issues, degraded functionality
- **INFO**: Important business events
- **DEBUG**: Detailed diagnostic information
- **TRACE**: Very detailed diagnostic information

### 4. Index Management
```json
PUT _index_template/springboot-logs
{
  "index_patterns": ["springboot-*"],
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "index.lifecycle.name": "springboot-ilm-policy"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "logger_name": { "type": "keyword" },
        "message": { "type": "text" },
        "thread_name": { "type": "keyword" },
        "stack_trace": { "type": "text" }
      }
    }
  }
}
```

---

## Recommendations by Scenario

- **Small Applications**: Pattern 3 (Filebeat Direct)
- **Enterprise Applications**: Pattern 2 (ELK Stack)
- **Microservices**: Pattern 8 (Sidecar) or Pattern 7 (Kafka)
- **Cloud-Native**: Pattern 6 (CloudWatch)
- **High-Volume**: Pattern 7 (Kafka)
- **Development**: Pattern 4 (HTTP Direct)