---
title: 7 Authentication Concepts
date: 2026-06-21
description: A comprehensive guide to understanding various authentication concepts, including Basic Authentication, Digest Authentication, API Key Authentication, Session-Based Authentication, JWT (JSON Web Token) Authentication, OAuth 2.0 & OpenID Connect, and Single Sign-On (SSO).
order: 1
---

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Authentication](#basic-authentication)
3. [Session-Based Authentication](#session-based-authentication)
4. [Digest Authentication](#digest-authentication)
5. [API Key Authentication](#api-key-authentication)
6. [JWT (JSON Web Token) Authentication](#jwt-json-web-token-authentication)
7. [OAuth 2.0 & OpenID Connect](#oauth-20--openid-connect)
8. [Single Sign-On (SSO)](#single-sign-on-sso)
9. [Key Takeaways](#key-takeaways)
10. [Glossary](#glossary)
11. [References](#references)

---

## 1. Introduction

In this post, we'll explore various authentication concepts and their applications in web development. We'll understand the importance of authentication and how it helps secure web applications.

### What is Authentication?

Authentication is the process of verifying the identity of a user or a device. It ensures that only authorized users can access certain resources.

We'll cover the following authentication methods:

- Basic Authentication
- Digest Authentication
- Session-Based Authentication
- API Key Authentication
- JWT (JSON Web Token) Authentication
- OAuth 2.0 & OpenID Connect
- Single Sign-On (SSO)

### Authentication Methods vs Authorization Frameworks

In summary, authentication methods are the actual methods used to verify the identity of a user, while authorization frameworks are frameworks or tools that help implement authentication methods. Some authentication methods, like Basic Authentication, are simple and easy to implement, while others, like OAuth 2.0, are more complex and require additional tools and frameworks.

## 2. Basic Authentication

### What is Basic Authentication?

Basic Authentication is a simple authentication scheme built into the HTTP protocol. It involves sending the username and password encoded in Base64 format in the HTTP header. For example, the header might look like this:

```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ= // This is the Base64 encoded string of "username:password"
```

### Is Basic Authentication secure?

Basic Authentication is not considered to be a secure authentication method because the credentials are sent in an easily decodable format (Base64) and can be intercepted by attackers if the connection is not encrypted (e.g., using HTTPS). Therefore, it is recommended to use Basic Authentication only over secure connections and for simple applications where security is not a concern.

### Realm and Charset Parameters in Basic Authentication

In HTTP Basic Authentication, when a server denies access due to missing or invalid credentials, it returns a 401 Unauthorized status code along with a special header called WWW-Authenticate. This header contains two critical parameters that instruct the client (browser or application) on what to do next: realm (Required) and charset (Optional).

```
For instance:
    HTTP/1.1 401 Unauthorized
    Date: Mon, 04 Feb 2014 16:50:53 GMT
    WWW-Authenticate: Basic realm="WallyWorld", charset="UTF-8"
```

#### The realm parameter
The realm is a string that defines the "protection space" the user is attempting to access.

- **Function**: It tells the user which specific area of the system they are logging into. More importantly, web browsers use the realm string combined with the domain name to accurately save and autofill passwords. If a website has two different realms (e.g., "Admin Area" and "Partner API"), the browser will manage and prompt for separate credentials for each area.

- **Display**: When a browser receives this header, it triggers the default login popup window and displays the realm text inside it (e.g., "The server says: Admin Dashboard").

#### The charset Parameter
The charset parameter tells the client which character encoding standard to use when packaging the username and password.

- **Function**: Historically, HTTP Basic Auth defaulted to the ISO-8859-1 character set. This older standard does not support modern Unicode characters (like accented letters, Asian characters, or Emojis). By explicitly declaring charset="UTF-8", the server forces the browser to encode the password using UTF-8 before converting it into a Base64 string.

- **Importance**: This allows users to safely use complex passwords containing their native languages or special symbols without causing decoding errors on the server side.

### Flows of Basic Authentication:

```puml
@startuml
actor "User" as User
participant "Web Browser\n(Client)" as Client
participant "Backend Server\n(API)" as Server
database "User Database" as DB

== Phase 1: The Initial Request ==

Client -> Server: GET /protected-data HTTP/1.1
activate Server
Note over Server
  Endpoint requires authentication.
  Checks for 'Authorization' header.
  Header is missing.
end Note
Server --> Client: 401 Unauthorized\nWWW-Authenticate: Basic realm="Secure Area"
deactivate Server

== Phase 2: Credential Encoding ==

Client -> User: Show native login prompt\n(Title: "Secure Area")
User --> Client: Enters username & password

Note over Client
  Browser concatenates:
  "username:password"
  
  Browser encodes to Base64:
  e.g., btoa("admin:pass123")
  -> "YWRtaW46cGFzczEyMw=="
end Note

== Phase 3: The Authenticated Request ==

Client -> Server: GET /protected-data HTTP/1.1\nAuthorization: Basic [Base64_String]
activate Server

Note over Server
  Extracts the Base64 string.
  Decodes Base64 back to "username:password".
  Splits into 'username' and 'password'.
end Note

Server -> DB: Query database for 'username'
activate DB
DB --> Server: Return hashed password (or user not found)
deactivate DB

== Phase 4: Validation ==

alt Valid Credentials
    
    Note over Server
      Server compares provided password
      with the database record.
      **Match Successful!**
    end Note
    Server --> Client: 200 OK\n(Returns the requested JSON/HTML)
    
else Invalid Credentials
    
    Note over Server
      Server compares provided password
      with the database record.
      **Match Failed!** (or user not found)
    end Note
    Server --> Client: 401 Unauthorized\nWWW-Authenticate: Basic realm="Secure Area"
    Note right of Client
      Browser will typically prompt
      the user to try entering 
      credentials again.
    end Note
    
end

deactivate Server
@enduml
```

### Pros and Cons of Basic Authentication

**Pros**:
- Simple to implement and use.
- Supported by most web servers and clients.
- No need for cookies, session identifiers, or login pages.

**Cons**:
- Credentials are sent in an easily decodable format (Base64).
- Vulnerable to interception if not used over HTTPS.
- Does not provide any mechanism for session management or logout.
- Not suitable for applications that require high security.

## 3. Digest Authentication

### What is Digest Authentication?
Digest Authentication is an improvement over Basic Authentication. It uses a more secure method of transmitting credentials by hashing the username and password with a nonce (a unique value) before sending it to the server. This makes it more resistant to interception and replay attacks.


## Glossary
- **Authentication**: The process of verifying the identity of a user or device.
- **Authorization**: The process of determining what resources a user or device is allowed to access.
- **Base64**: A method of encoding binary data into ASCII characters, often used in Basic Authentication to encode credentials.
- **Nonce**: A unique value used in Digest Authentication to prevent replay attacks.
- **Realm**: A string that defines the protection space the user is attempting to access.
- **Charset**: A parameter that tells the client which character encoding standard to use when packaging the username and password.
- **HTTP Header**: A component of the HTTP protocol that contains metadata about the request or response, such as authentication information.
- **HTTPS**: A secure version of HTTP that uses encryption to protect data transmitted between the client and server.
- **Front-Channel**: The communication channel between the client and server, where authentication credentials are transmitted.
- **Back-Channel**: The communication channel between the server and an authentication provider (e.g., OAuth provider) that is not exposed to the client.
- **Token**: A piece of data that represents the user's identity and permissions, often used in token-based authentication methods like JWT.
- **JWT (JSON Web Token)**: A compact, URL-safe token format used for securely transmitting information between parties as a JSON object.
- **ID Token**: A type of token used in OpenID Connect that contains information about the authenticated user.
- **Access Token**: A token that grants access to protected resources, often used in OAuth 2.0.
- **Refresh Token**: A token used to obtain a new access token without requiring the user to re-authenticate, often used in OAuth 2.0.

## References

- [RFC 7617 - The 'Basic' HTTP Authentication Scheme](https://datatracker.ietf.org/doc/html/rfc7617)