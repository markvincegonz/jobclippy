# smart-extractor Specification

## Purpose
Extracts structured job attributes including salary ranges, required skill keywords, company name, and job role from raw text or job descriptions.

## Requirements

### Requirement: Salary Detection
The system SHALL parse unstructured job description text and identify compensation ranges or mark salary as not listed.

#### Scenario: Explicit compensation range detected
- **WHEN** raw job description contains salary patterns like "$120,000 - $150,000" or "$60k-$80k"
- **THEN** the system extracts and formats the salary range (e.g. "$120K–$150K")

#### Scenario: No salary information present
- **WHEN** raw job description does not contain discernible compensation patterns
- **THEN** the system marks the salary attribute as "Salary not listed"

### Requirement: Skill and Keyword Extraction
The system SHALL identify relevant technical skills, tools, and methodologies from job descriptions and generate tag chips.

#### Scenario: Extracting tech stack chips
- **WHEN** a job description mentions technologies such as React, TypeScript, Python, or AWS
- **THEN** the system extracts and associates corresponding standardized skill tags with the job record
