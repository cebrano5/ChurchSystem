# Church System - Entity Relationship Diagram (ERD)

This document provides a comprehensive overview of the Church System's database architecture. The system relies heavily on a deeply nested organizational hierarchy, combined with polymorphic relationships to efficiently scope users, leaders, and events to their respective hierarchical levels.

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    %% Hierarchy Entities
    ANNUAL_CONFERENCE {
        bigint id PK
        string name
        string region
        string president_name
        string status
        decimal latitude
        decimal longitude
        timestamp deleted_at
    }

    DISTRICT {
        bigint id PK
        bigint annual_conference_id FK
        string name
        string superintendent_name
        decimal latitude
        decimal longitude
        timestamp deleted_at
    }

    LOCAL_SOCIETY {
        bigint id PK
        bigint district_id FK
        string name
        string address
        date founded_date
        string status
        decimal latitude
        decimal longitude
        timestamp deleted_at
    }

    %% Core Data Entities
    USER {
        bigint id PK
        string name
        string email
        string password
        string role "national_admin, conference_admin, district_admin, society_admin"
        string scope_type "Polymorphic: AnnualConference, District, LocalSociety"
        bigint scope_id "Polymorphic ID"
        decimal latitude
        decimal longitude
        timestamp deleted_at
    }

    PASTOR {
        bigint id PK
        string full_name
        string email
        string phone
        string role_or_position
        string status
        date assigned_at
        string scope_type "Polymorphic: AnnualConference, District, LocalSociety"
        bigint scope_id "Polymorphic ID"
        timestamp deleted_at
    }

    MEMBER {
        bigint id PK
        bigint local_society_id FK
        string first_name
        string last_name
        string gender
        date birth_date
        string status
        string member_type
        timestamp deleted_at
    }

    MINISTRY {
        bigint id PK
        bigint local_society_id FK
        string name
        string description
        bigint leader_id FK "Refers to MEMBER"
        timestamp deleted_at
    }

    EVENT {
        bigint id PK
        string name
        datetime event_date
        datetime end_date
        string location
        string organizer_type "Polymorphic: AnnualConference, District, LocalSociety"
        bigint organizer_id "Polymorphic ID"
        boolean is_recurring
        timestamp deleted_at
    }

    DONATION {
        bigint id PK
        bigint local_society_id FK
        bigint member_id FK
        decimal amount
        date donation_date
        string category
        string payment_method
        timestamp deleted_at
    }

    %% Pivot Tables
    MINISTRY_MEMBER {
        bigint ministry_id FK
        bigint member_id FK
    }

    ATTENDANCE {
        bigint event_id FK
        bigint member_id FK
        timestamp recorded_at
    }

    %% Relationships
    ANNUAL_CONFERENCE ||--o{ DISTRICT : "has many"
    DISTRICT ||--o{ LOCAL_SOCIETY : "has many"

    %% Standard Relationships
    LOCAL_SOCIETY ||--o{ MEMBER : "has many"
    LOCAL_SOCIETY ||--o{ MINISTRY : "has many"
    LOCAL_SOCIETY ||--o{ DONATION : "has many"
    
    MEMBER ||--o{ DONATION : "makes"
    MEMBER ||--o{ MINISTRY : "leads (leader_id)"
    
    %% Many-to-Many Relationships (Pivots)
    MINISTRY ||--o{ MINISTRY_MEMBER : "has"
    MEMBER ||--o{ MINISTRY_MEMBER : "joins"
    
    EVENT ||--o{ ATTENDANCE : "has"
    MEMBER ||--o{ ATTENDANCE : "attends"

    %% Polymorphic References (Visualized as dotted lines)
    USER }|..|{ ANNUAL_CONFERENCE : "scoped to"
    USER }|..|{ DISTRICT : "scoped to"
    USER }|..|{ LOCAL_SOCIETY : "scoped to"

    PASTOR }|..|{ ANNUAL_CONFERENCE : "assigned to"
    PASTOR }|..|{ DISTRICT : "assigned to"
    PASTOR }|..|{ LOCAL_SOCIETY : "assigned to"

    EVENT }|..|{ ANNUAL_CONFERENCE : "organized by"
    EVENT }|..|{ DISTRICT : "organized by"
    EVENT }|..|{ LOCAL_SOCIETY : "organized by"
```

## Explanation of the Architecture

### 1. The Core Hierarchy (The Backbone)
The system is built upon a rigid 3-tier organizational structure:
*   **Annual Conference**: The highest organizational tier.
*   **District**: A subdivision of an Annual Conference.
*   **Local Society**: The local church entity. It belongs to a District.
Most raw data (Members, Ministries, Donations) is explicitly tied to the `LOCAL_SOCIETY` via standard foreign keys (`local_society_id`).

### 2. Polymorphic Relationships (Scoping & RBAC)
To prevent massive duplication and complex pivot tables, the system leverages Laravel's polymorphic relationships (`morphTo`) for entities that can belong to *any* level of the hierarchy:
*   **Users (RBAC)**: An administrator uses `scope_type` and `scope_id` to determine their jurisdiction. A District Admin will have a `scope_type` of `App\Models\District` and the ID of their specific district. This dictates what data they can see.
*   **Pastors**: A pastor isn't strictly tied to a local church. A pastor can be assigned to a District (e.g., District Superintendent) or an Annual Conference. `scope_type` handles this cleanly.
*   **Events**: Events can be hosted by a local church (Youth Service), a District (District Convention), or a Conference (Annual General Assembly). `organizer_type` tracks exactly which hierarchical level owns the event.

### 3. Many-to-Many Relationships
*   **Ministry Members**: The `ministry_member` table allows a `Member` to join multiple `Ministries`, and a `Ministry` to hold multiple `Members`.
*   **Attendance**: The `attendance` table bridges `Members` and `Events`, allowing the system to track who showed up to which event, regardless of which hierarchical level organized the event.

### 4. Soft Deletes (The Archive)
Every primary entity in the system utilizes the `deleted_at` timestamp. When a record is deleted, it is not erased from the database but instead hidden from normal queries. The `ArchiveController` leverages this to populate the System Archive container, allowing administrators to safely restore data.

### 5. Geographical Mapping
The hierarchy entities (`AnnualConference`, `District`, `LocalSociety`) and the `User` table (specifically for National Admins) share `latitude`, `longitude`, and `location_name` columns. This allows the Church Map UI to plot nodes on the Leaflet map and establish a physical, geographical representation of the church's footprint.
