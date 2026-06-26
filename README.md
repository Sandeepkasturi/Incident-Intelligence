# Incident Intelligence – ServiceNow Scoped Application

> Intelligent Incident Auto-Classification Engine built for the ServiceNow Platform

![Screenshots](project_s1_architecture.png)

---

# Overview

Incident Intelligence is a ServiceNow Scoped Application that automatically classifies newly created incidents using a lightweight keyword-scoring engine.

Instead of relying on Machine Learning, the application implements an explainable deterministic scoring algorithm capable of assigning:

- Category
- Subcategory
- Assignment Group
- Confidence Score

Every decision made by the engine is fully transparent and recorded as an audit work note, allowing Service Desk analysts to understand exactly why a classification occurred.

The application never overrides classifications made manually by analysts, making it safe for production environments.

---

# Scope

```
Application Scope

x_2064375_incide_0
```

---

# Features

- Automatic incident categorization
- Automatic subcategory selection
- Assignment Group routing
- Confidence score generation
- Keyword scoring engine
- Explainable AI-style decision trace
- Human override protection
- Server-side only execution
- Enterprise Business Rule pattern
- Fully scoped application

---

# Architecture

The application follows a layered ServiceNow architecture separating UI interaction, business logic and persistence.

![Architecture Diagram](project_s1_architecture.png)

---

# Execution Flow

```
User creates Incident
          │
          ▼
Before Business Rule
          │
          ▼
IncidentTagger Script Include
          │
          ▼
Keyword Scoring Engine
          │
          ▼
Classification Result Object
          │
          ├────────► GlideRecord
          │            │
          │            ▼
          │      Resolve Assignment Group
          │
          ▼
Populate current.category
Populate current.subcategory
Populate current.assignment_group
          │
          ▼
Incident inserted into Database
          │
          ▼
After Business Rule
          │
          ▼
Classification Work Note
```

---

# High-Level Component Design

## 1. Incident Form

The Incident Form is the application entry point.

When a user submits a new incident, ServiceNow initializes the **current** GlideRecord object before inserting the record.

No client-side scripting is required.

---

## 2. Before Business Rule

**Purpose**

Executes before the Incident record is written to the database.

Responsibilities

- Validate incident fields
- Skip processing if already classified
- Invoke IncidentTagger
- Apply returned values to current record

Example

```javascript
var result = new IncidentTagger().classify(current);

current.category = result.category;
current.subcategory = result.subcategory;
current.assignment_group = result.assignment_group;
```

Because this Business Rule executes before insertion, no additional database update is required.

---

## 3. IncidentTagger Script Include

The Script Include contains the application's business logic.

Responsibilities

- Normalize text
- Remove unnecessary whitespace
- Convert to lowercase
- Execute keyword scoring
- Calculate confidence
- Determine best classification
- Return structured result object

Public API

```javascript
var tagger = new IncidentTagger();
var result = tagger.classify(current);
```

Example return object

```javascript
{
    category: "Network",
    subcategory: "VPN",
    assignment_group: "Network Support",
    confidence: 91
}
```

This separation allows the engine to be independently testable and reusable.

---

## 4. Keyword Scoring Engine

The scoring engine performs deterministic keyword matching.

Example mapping

```javascript
VPN
Remote Access
Cisco

→ Network
```

Each matched keyword contributes weighted points.

Example

```
vpn          +35
remote       +25
cisco        +40
-----------------
Total        100
```

Highest score wins.

---

# Confidence Calculation

Confidence is calculated from accumulated keyword scores.

Example

```
100+
High Confidence

70–99
Medium Confidence

Below 70
Low Confidence
```

Confidence is stored only for reporting purposes and included in work notes.

---

## 5. GlideRecord Lookup

Assignment Groups are resolved dynamically.

Instead of hardcoding sys_ids, the application queries the
**sys_user_group** table.

Example

```javascript
var gr = new GlideRecord('sys_user_group');
gr.addQuery('name', groupName);
gr.setLimit(1);
gr.query();

if (gr.next()) {
    result.assignment_group = gr.sys_id.toString();
}
```

Advantages

- Environment independent
- Works across instances
- Supports Update Sets
- Production safe

---

## 6. Result Object

The Script Include returns a strongly structured object.

```javascript
{
    category: "",
    subcategory: "",
    assignment_group: "",
    confidence: 0
}
```

Using a single object keeps Business Rules simple and improves maintainability.

---

## 7. After Business Rule

Runs only after the Incident has been committed to the database.

Purpose

Generate an explainable audit trail.

Example work note

```
Incident Intelligence

Classification Successful

Category:
Network

Subcategory:
VPN

Assignment Group:
Network Support

Confidence:
91%

Matched Keywords

vpn
remote
cisco
```

---

## 8. Work Note Writer

To avoid recursive Business Rule execution, the update follows enterprise best practices.

```javascript
current.setWorkflow(false);
current.autoSysFields(false);

current.work_notes = message;
current.update();
```

This prevents

- Recursive BR execution
- Duplicate system fields
- Unnecessary audit records

---

# Database Objects

## Incident Table

Updated Fields

```
category
subcategory
assignment_group
work_notes
```

---

## sys_user_group

Queried Fields

```
name
sys_id
```

Only a single record lookup is performed using

```
setLimit(1)
```

---

# Business Rules

## IncidentTagger – Auto Tag on Create

Type

```
Before Insert
```

Responsibilities

- Execute classifier
- Populate fields
- Skip already-classified incidents

---

## IncidentTagger – Post Work Note

Type

```
After Insert
```

Responsibilities

- Generate audit log
- Write formatted work note
- Preserve classification trace

---

# Enterprise Design Decisions

## Separation of Concerns

Business Rules

Responsible only for orchestration.

Script Include

Contains all business logic.

Database

Stores only final classification.

---

## Human Override Protection

The application never overwrites manually populated fields.

Example

```javascript
if (!current.category.nil()) {
    return;
}
```

---

## Environment Independence

No hardcoded

- sys_ids
- URLs
- Instance names

Everything is resolved dynamically using GlideRecord.

---

## Performance Optimizations

- Single GlideRecord query
- setLimit(1)
- Before Insert processing
- No duplicate updates
- Lightweight keyword engine
- Scoped execution

---

# Technologies Used

- ServiceNow Scoped Applications
- Business Rules
- Script Includes
- GlideRecord API
- GlideSystem API
- Server-side JavaScript
- Class.create()
- Object-oriented scripting
- Update Sets

---

# Skills Demonstrated

## ServiceNow Development

- Scoped Application Development
- Business Rule Architecture
- Script Include Design
- Server-side JavaScript
- Update Set Packaging

---

## Platform APIs

- GlideRecord
- GlideSystem
- current
- previous
- setWorkflow(false)
- autoSysFields(false)

---

## Design Patterns

- Layered Architecture
- Separation of Concerns
- Strategy-style Classification
- Object-based Return Pattern
- Enterprise Logging

---

## Software Engineering

- Modular Design
- Maintainability
- Reusability
- Explainable Automation
- Production-safe Development

---

# Future Enhancements

- Machine Learning classification
- ServiceNow Predictive Intelligence integration
- AI Search support
- Dynamic keyword administration table
- Flow Designer integration
- REST API classification endpoint
- Multi-language keyword support
- Analytics dashboard
- Performance metrics
- Unit testing framework (ATF)

---

# Project Structure

```
Incident Intelligence
│
├── Business Rules
│     ├── Auto Tag on Create
│     └── Post Work Note
│
├── Script Includes
│     └── IncidentTagger
│
├── Keyword Engine
│     └── scoreMapping()
│
├── Database
│     ├── incident
│     └── sys_user_group
```

---

# License

This project is intended for educational, portfolio, and ServiceNow learning purposes.

---

# Author

**Sandeep Kasturi**

ServiceNow Certified System Administrator (CSA)

Founder — SKAV TECH

Focused on ServiceNow Platform Engineering, Enterprise Automation, AI-powered ITSM, and Solution Architecture.
