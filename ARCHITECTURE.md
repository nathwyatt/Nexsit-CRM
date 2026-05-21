# Nexsit CRM — Architecture Blueprint
> Real Estate CRM · Laravel 11 + Inertia.js + React · Single Repo
> Version 1.1 — Updated with full flexibility system

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Flexibility System — How configurable things work](#2-flexibility-system)
3. [Database Schema](#3-database-schema)
4. [API Endpoint Map](#4-api-endpoint-map)
5. [Key Model Relationships](#5-key-model-relationships)
6. [Roles & Permissions Matrix](#6-roles--permissions-matrix)
7. [Core Laravel Packages](#7-core-laravel-packages)
8. [Environment Variables](#8-environment-variables)
9. [Development Phases](#9-development-phases)

---

## 1. Folder Structure

```
nexsit-crm/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── SendTenancyRenewalReminders.php
│   │       ├── ExportPortalFeed.php
│   │       └── ProcessAutomationRules.php
│   ├── Events/
│   │   ├── LeadCreated.php
│   │   ├── LeadConverted.php
│   │   ├── DealStageChanged.php
│   │   ├── DealWon.php
│   │   ├── DealLost.php
│   │   ├── PropertyPublished.php
│   │   └── TenancyExpiring.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Api/                        # Public REST API (website + portals)
│   │   │   │   ├── PropertyController.php
│   │   │   │   ├── LeadController.php
│   │   │   │   └── FeedController.php      # XML/JSON portal feeds
│   │   │   └── Crm/                        # Inertia controllers (internal)
│   │   │       ├── DashboardController.php
│   │   │       ├── LeadController.php
│   │   │       ├── DealController.php
│   │   │       ├── ContactController.php
│   │   │       ├── PropertyController.php
│   │   │       ├── TaskController.php
│   │   │       ├── DocumentController.php
│   │   │       ├── TenancyController.php
│   │   │       ├── ReportController.php
│   │   │       └── Settings/
│   │   │           ├── PipelineController.php
│   │   │           ├── PipelineStageController.php
│   │   │           ├── LeadSourceController.php
│   │   │           ├── PropertyTypeController.php
│   │   │           ├── AmenityController.php
│   │   │           ├── CustomFieldController.php
│   │   │           ├── AutomationController.php
│   │   │           ├── TeamController.php
│   │   │           └── GeneralSettingsController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasRole.php
│   │   │   └── HandleInertiaRequests.php
│   │   ├── Requests/                       # FormRequest per module
│   │   │   ├── Lead/
│   │   │   ├── Deal/
│   │   │   ├── Contact/
│   │   │   ├── Property/
│   │   │   └── Settings/
│   │   └── Resources/                      # API JSON resources (public)
│   ├── Jobs/
│   │   ├── SendLeadNotification.php
│   │   ├── SendTenancyRenewalReminder.php
│   │   ├── ExportListingFeed.php
│   │   └── RunAutomationAction.php
│   ├── Listeners/
│   │   ├── LogActivityOnDealChange.php
│   │   ├── RunAutomationsOnLeadCreated.php
│   │   └── NotifyAgentOnAssignment.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Team.php
│   │   ├── Lead.php
│   │   ├── LeadSource.php                  # Flexible — admin managed
│   │   ├── Deal.php
│   │   ├── Pipeline.php                    # Flexible — admin managed
│   │   ├── PipelineStage.php               # Flexible — admin managed
│   │   ├── Contact.php
│   │   ├── ContactRole.php
│   │   ├── Property.php
│   │   ├── PropertyType.php                # Flexible — admin managed
│   │   ├── PropertyUnit.php
│   │   ├── PropertyOwner.php
│   │   ├── Amenity.php                     # Flexible — admin managed
│   │   ├── Task.php
│   │   ├── TaskType.php                    # Flexible — admin managed
│   │   ├── Activity.php
│   │   ├── Document.php
│   │   ├── DocumentType.php                # Flexible — admin managed
│   │   ├── Tenancy.php
│   │   ├── TenancyPayment.php
│   │   ├── CustomField.php                 # Flexible — admin managed
│   │   ├── CustomFieldValue.php
│   │   └── AutomationRule.php
│   ├── Notifications/
│   │   ├── LeadAssigned.php
│   │   ├── DealStageChanged.php
│   │   └── TenancyExpiring.php
│   ├── Observers/
│   │   ├── DealObserver.php
│   │   ├── LeadObserver.php
│   │   └── PropertyObserver.php
│   ├── Policies/
│   │   ├── LeadPolicy.php
│   │   ├── DealPolicy.php
│   │   ├── ContactPolicy.php
│   │   ├── PropertyPolicy.php
│   │   └── TenancyPolicy.php
│   └── Services/
│       ├── LeadService.php
│       ├── DealService.php
│       ├── PropertyService.php
│       ├── TenancyService.php
│       ├── AutomationService.php
│       ├── CustomFieldService.php
│       └── FeedExportService.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DefaultPipelineSeeder.php       # Seeds Sales + Rental pipelines with stages
│       ├── DefaultLeadSourceSeeder.php
│       ├── DefaultAmenitySeeder.php
│       └── RolesAndPermissionsSeeder.php
├── resources/
│   ├── js/
│   │   ├── app.jsx
│   │   ├── Components/
│   │   │   ├── UI/                         # Buttons, badges, inputs, modals, toasts
│   │   │   ├── Pipeline/
│   │   │   │   ├── KanbanBoard.jsx          # Drag-drop board
│   │   │   │   ├── KanbanColumn.jsx
│   │   │   │   ├── DealCard.jsx
│   │   │   │   └── StageEditor.jsx         # Add/edit/reorder stages inline
│   │   │   ├── Property/
│   │   │   │   ├── PropertyCard.jsx
│   │   │   │   ├── MediaUploader.jsx
│   │   │   │   └── AmenityPicker.jsx       # Flexible amenity selector
│   │   │   ├── CustomFields/
│   │   │   │   ├── CustomFieldRenderer.jsx  # Renders any field type dynamically
│   │   │   │   └── CustomFieldBuilder.jsx   # Admin: build new fields
│   │   │   └── Layout/
│   │   │       ├── AppLayout.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Breadcrumbs.jsx
│   │   └── Pages/
│   │       ├── Auth/
│   │       ├── Dashboard/
│   │       ├── Leads/
│   │       ├── Deals/
│   │       ├── Contacts/
│   │       ├── Properties/
│   │       ├── Tasks/
│   │       ├── Tenancies/
│   │       ├── Reports/
│   │       └── Settings/
│   │           ├── Pipelines/              # Pipeline + stage manager UI
│   │           ├── CustomFields/
│   │           ├── LeadSources/
│   │           ├── Automations/
│   │           └── General/
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── web.php                             # CRM Inertia routes
│   ├── api.php                             # Public API routes
│   └── console.php
└── config/
    └── nexsit.php                          # App-level config
```

---

## 2. Flexibility System

> This section defines how every configurable part of Nexsit CRM works.
> The goal: admins can extend the system from the Settings UI without any code changes.

### 2.1 Pipelines & Stages — fully user-managed

Pipelines and their stages are stored in the database, not hardcoded in config or enums.
An admin can at any time:
- Create a new pipeline (e.g. "Off-Plan Sales", "Commercial Leasing")
- Add, rename, reorder, or delete stages within any pipeline
- Set a color per stage (for the kanban board)
- Mark a stage as "won" or "lost" (terminal stages)
- Set one pipeline as the default for new deals

```
pipelines
─────────────────────────────────
id                  PK
name                varchar        e.g. "Sales Pipeline"
type                enum: sale | rental | other
description         text nullable
is_default          bool  default false
is_active           bool  default true
position            tinyint        sort order in sidebar
created_by          FK → users
created_at / updated_at

pipeline_stages
─────────────────────────────────
id                  PK
pipeline_id         FK → pipelines  (cascade delete)
name                varchar        e.g. "Viewing Scheduled"
description         text nullable
color               varchar(7)     hex color for kanban column e.g. "#6366F1"
position            tinyint        sort order (drag-reorderable)
is_won_stage        bool  default false   deals moved here → status = won
is_lost_stage       bool  default false   deals moved here → status = lost
probability         tinyint nullable      % chance of closing (0-100)
created_at / updated_at
```

**Stage reorder API:** `PATCH /settings/pipelines/{id}/stages/reorder`
Body: `{ "stages": [3, 1, 4, 2] }` — array of stage IDs in new order.
The controller updates `position` for each in a single transaction.

**Business rule:** Every pipeline must have at least one active stage.
Deleting a stage with deals on it is blocked — the UI prompts to move those deals first.

---

### 2.2 Lead Sources — user-managed list

Instead of a hardcoded enum, lead sources are a managed table:

```
lead_sources
─────────────────────────────────
id                  PK
name                varchar        e.g. "Property Finder", "Walk-in", "Referral"
slug                varchar unique auto-generated from name
icon                varchar nullable  (lucide icon name)
is_active           bool  default true
position            tinyint
created_at / updated_at
```

Admins add/rename/deactivate sources in Settings → Lead Sources.
Old leads keep their `lead_source_id` FK; deactivated sources are hidden from new-lead forms only.

---

### 2.3 Property Types & Amenities — user-managed lists

```
property_types
─────────────────────────────────
id                  PK
name                varchar        e.g. "Apartment", "Penthouse", "Chalet"
slug                varchar unique
icon                nullable
is_active           bool  default true
position            tinyint
created_at / updated_at

amenities
─────────────────────────────────
id                  PK
name                varchar        e.g. "Swimming Pool", "Covered Parking"
icon                nullable
category            varchar nullable  e.g. "Building", "Unit", "Community"
is_active           bool  default true
position            tinyint
created_at / updated_at

property_amenity   (pivot)
─────────────────────────────────
property_id         FK → properties
amenity_id          FK → amenities
```

Admins can add new property types (e.g. "Floating Villa") and amenities
(e.g. "EV Charging") without any code changes.

---

### 2.4 Task Types & Document Types — user-managed lists

```
task_types
─────────────────────────────────
id                  PK
name                varchar        e.g. "Viewing", "Call", "Snagging Inspection"
icon                nullable
is_active           bool  default true
position            tinyint
created_at / updated_at

document_types
─────────────────────────────────
id                  PK
name                varchar        e.g. "Tenancy Agreement", "NOC", "Floor Plan"
requires_expiry     bool  default false   shows expiry date field if true
is_active           bool  default true
position            tinyint
created_at / updated_at
```

---

### 2.5 Custom Fields — per-module extensibility

Admins can add extra fields to any core module (Leads, Deals, Contacts, Properties)
without touching the database schema.

```
custom_fields
─────────────────────────────────
id                  PK
module              enum: lead | deal | contact | property | tenancy
label               varchar        e.g. "RERA Number", "Mortgage Pre-approval"
key                 varchar        snake_case, unique per module
type                enum: text | number | date | select | multiselect |
                          boolean | url | textarea
options             json nullable  for select/multiselect: ["Option A","Option B"]
is_required         bool  default false
is_shown_in_list    bool  default false   show as column in index table
position            tinyint
is_active           bool  default true
created_at / updated_at

custom_field_values
─────────────────────────────────
id                  PK
custom_field_id     FK → custom_fields
entity_id           bigint         the ID of the lead/deal/contact/property
entity_type         varchar        polymorphic type
value               text nullable
created_at / updated_at

UNIQUE INDEX (custom_field_id, entity_id, entity_type)
```

**How it works on the frontend:** The `CustomFieldRenderer` React component receives
the list of active custom fields for the current module and dynamically renders
the appropriate input (text box, date picker, dropdown, etc.).
The form submits `custom_fields: { rera_number: "...", mortgage_approved: true }` as
a nested object, which the controller passes to `CustomFieldService::save()`.

---

### 2.6 Automation Rules — no-code workflow engine

```
automation_rules
─────────────────────────────────
id                  PK
name                varchar
description         text nullable
trigger             enum:
                      lead_created
                      lead_assigned
                      lead_status_changed
                      deal_created
                      deal_stage_changed
                      deal_won
                      deal_lost
                      property_published
                      tenancy_expiring_30d
                      tenancy_expiring_7d
                      task_overdue
conditions          json nullable
                      e.g. [
                        {"field": "source_id", "op": "=",  "value": 3},
                        {"field": "purpose",   "op": "=",  "value": "rent"}
                      ]
actions             json
                      e.g. [
                        {"type": "assign_agent",    "value": "round_robin"},
                        {"type": "create_task",     "task_type_id": 2, "due_in_hours": 2},
                        {"type": "send_email",      "template": "new_lead_agent"},
                        {"type": "send_whatsapp",   "template": "new_lead_client"},
                        {"type": "move_stage",      "stage_id": 5},
                        {"type": "add_tag",         "tag": "hot_lead"},
                        {"type": "notify_manager"}
                      ]
is_active           bool  default true
run_count           bigint default 0   (how many times it has fired)
last_run_at         timestamp nullable
created_by          FK → users
created_at / updated_at
```

---

## 3. Database Schema

### 3.1 Users & Teams

```
teams
─────────────────────────────────
id                  PK
name
slug                unique
settings            json nullable   (team-level config overrides)
created_at / updated_at

users
─────────────────────────────────
id                  PK
team_id             FK → teams
name
email               unique
password
avatar              nullable
phone               nullable
role                enum: admin | manager | agent
is_active           bool  default true
last_login_at       timestamp nullable
created_at / updated_at
```

---

### 3.2 Contacts

```
contacts
─────────────────────────────────
id                  PK
first_name
last_name
email               nullable
phone               nullable
phone_2             nullable
nationality         nullable
id_type             enum: passport | emirates_id | national_id | other nullable
id_number           nullable
address             text nullable
notes               text nullable
tags                json nullable      array of tag strings
assigned_to         FK → users nullable
created_by          FK → users
created_at / updated_at

contact_roles       (pivot — a contact can be buyer + owner simultaneously)
─────────────────────────────────
contact_id          FK → contacts
role                enum: buyer | tenant | owner
notes               text nullable
created_at
```

---

### 3.3 Properties

```
properties
─────────────────────────────────
id                  PK
reference           varchar unique   auto-generated: NST-XXXXXX
title
description         text nullable
property_type_id    FK → property_types   (flexible, not enum)
purpose             enum: sale | rent | both
status              enum: available | under_offer | reserved | sold | rented | off_market
bedrooms            tinyint nullable
bathrooms           tinyint nullable
area_sqm            decimal(10,2) nullable
floor               smallint nullable
total_floors        smallint nullable
building            varchar nullable
community           varchar nullable
city
country             default 'AE'
latitude            decimal(10,7) nullable
longitude           decimal(10,7) nullable
price               decimal(14,2) nullable      sale price
rent_price          decimal(14,2) nullable      annual rent
rent_frequency      enum: monthly | quarterly | yearly nullable
service_charge      decimal(14,2) nullable      annual, per sqm
is_furnished        bool nullable
is_published        bool default false
published_at        timestamp nullable
featured_until      timestamp nullable           for homepage spotlight
permit_number       varchar nullable             e.g. RERA permit
meta_title          varchar nullable
meta_description    text nullable
assigned_to         FK → users nullable
created_by          FK → users
created_at / updated_at

property_owners     (junction — supports co-ownership)
─────────────────────────────────
id                  PK
property_id         FK → properties
contact_id          FK → contacts
ownership_pct       decimal(5,2) default 100.00
is_primary          bool default false
notes               text nullable
created_at

property_amenity    (pivot)
─────────────────────────────────
property_id         FK → properties
amenity_id          FK → amenities

property_units      (for buildings with multiple individual units)
─────────────────────────────────
id                  PK
property_id         FK → properties
unit_number
floor               smallint nullable
bedrooms            tinyint nullable
bathrooms           tinyint nullable
area_sqm            decimal nullable
status              enum: available | occupied | reserved
rent_price          decimal nullable
notes               text nullable
created_at / updated_at
```

---

### 3.4 Leads

```
leads
─────────────────────────────────
id                  PK
reference           varchar unique   auto-generated: LEAD-XXXXXX
contact_id          FK → contacts nullable   linked after contact created
lead_source_id      FK → lead_sources        (flexible, not enum)
source_detail       varchar nullable          portal listing ID, referrer etc.
status              enum: new | contacted | qualified | converted | lost
property_id         FK → properties nullable  which listing triggered enquiry
purpose             enum: buy | rent
budget_min          decimal nullable
budget_max          decimal nullable
bedrooms_wanted     tinyint nullable
message             text nullable
assigned_to         FK → users nullable
converted_at        timestamp nullable
converted_to_deal   FK → deals nullable
lost_reason         text nullable
created_at / updated_at
```

---

### 3.5 Deals

```
deals
─────────────────────────────────
id                  PK
reference           varchar unique   auto-generated: DEAL-XXXXXX
pipeline_id         FK → pipelines
stage_id            FK → pipeline_stages
contact_id          FK → contacts
property_id         FK → properties nullable
lead_id             FK → leads nullable
title               varchar          auto-filled: "Contact - Property" if blank
type                enum: sale | rental
status              enum: open | won | lost | on_hold
value               decimal(14,2) nullable
commission_pct      decimal(5,2) nullable
commission          decimal(14,2) nullable    (computed or manual override)
currency            varchar(3) default 'AED'
expected_close_date date nullable
closed_at           timestamp nullable
lost_reason         text nullable
assigned_to         FK → users
created_by          FK → users
created_at / updated_at
```

---

### 3.6 Tasks & Activities

```
tasks
─────────────────────────────────
id                  PK
task_type_id        FK → task_types   (flexible, not enum)
title
description         text nullable
due_at              datetime nullable
completed_at        datetime nullable
priority            enum: low | medium | high  default medium
status              enum: pending | done | cancelled
assigned_to         FK → users
created_by          FK → users
taskable_id         bigint nullable    polymorphic subject
taskable_type       varchar nullable   (App\Models\Lead | Deal | Contact | Property)
created_at / updated_at

activities          (immutable audit log — never updated, only inserted)
─────────────────────────────────
id                  PK
user_id             FK → users nullable   null = system/automation
action              varchar    e.g. stage_changed | note_added | published | assigned
description         text
old_values          json nullable    before state
new_values          json nullable    after state
subject_id          bigint
subject_type        varchar
ip_address          varchar nullable
created_at          (no updated_at — immutable)
```

---

### 3.7 Documents

```
documents
─────────────────────────────────
id                  PK
document_type_id    FK → document_types   (flexible, not enum)
name
disk                varchar    s3 | local
path                varchar
size                bigint     bytes
mime_type           varchar
uploaded_by         FK → users
documentable_id     bigint     polymorphic
documentable_type   varchar
expires_at          date nullable
notes               text nullable
created_at / updated_at
```

---

### 3.8 Tenancies

```
tenancies
─────────────────────────────────
id                  PK
reference           varchar unique   auto-generated: TEN-XXXXXX
property_id         FK → properties
unit_id             FK → property_units nullable
tenant_id           FK → contacts
deal_id             FK → deals nullable
start_date          date
end_date            date
rent_amount         decimal(14,2)
rent_frequency      enum: monthly | quarterly | yearly
deposit_amount      decimal(14,2) nullable
deposit_returned_at timestamp nullable
status              enum: pending | active | expired | terminated
auto_renew          bool default false
renewal_notice_days smallint default 90
termination_date    date nullable
termination_reason  text nullable
notes               text nullable
created_by          FK → users
created_at / updated_at

tenancy_payments
─────────────────────────────────
id                  PK
tenancy_id          FK → tenancies
amount              decimal(14,2)
due_date            date
paid_date           date nullable
status              enum: pending | paid | overdue | partial | cancelled
payment_method      enum: bank_transfer | cheque | cash | card nullable
reference           varchar nullable   cheque number, transaction ID
notes               text nullable
recorded_by         FK → users nullable
created_at / updated_at
```

---

## 4. API Endpoint Map

### 4.1 Public API  `GET /api/v1/` — no auth, rate limited, for website

```
GET    /api/v1/properties                List published properties
         ?type=apartment
         &purpose=rent
         &city=Dubai
         &bedrooms=2
         &price_min=500000
         &price_max=1500000
         &q=marina                      full-text search
         &per_page=20
         &sort=price_asc

GET    /api/v1/properties/{reference}    Single property detail
GET    /api/v1/properties/featured       Featured/homepage listings
GET    /api/v1/properties/map            Lightweight list (id, lat, lng, price) for map view

POST   /api/v1/leads                     Submit enquiry → creates Lead in CRM
POST   /api/v1/leads/valuation           Property valuation request

GET    /api/v1/feed/bayut.xml            Bayut XML feed
GET    /api/v1/feed/propertyfinder.xml   Property Finder XML feed
GET    /api/v1/feed/listings.json        Generic JSON feed
```

---

### 4.2 CRM Routes `web.php` — session auth (Inertia)

#### Auth
```
GET    /login
POST   /login
POST   /logout
GET    /forgot-password
POST   /forgot-password
GET    /reset-password/{token}
POST   /reset-password
```

#### Dashboard
```
GET    /dashboard
```

#### Leads
```
GET    /leads                            Index
GET    /leads/create
GET    /leads/{id}
POST   /leads
PUT    /leads/{id}
DELETE /leads/{id}
POST   /leads/{id}/convert               Convert → creates Deal + Contact
PATCH  /leads/{id}/assign
PATCH  /leads/{id}/status
```

#### Deals
```
GET    /deals                            Index (list or kanban view)
GET    /deals/create
GET    /deals/{id}
POST   /deals
PUT    /deals/{id}
DELETE /deals/{id}
PATCH  /deals/{id}/stage                 Move stage (kanban drag or dropdown)
PATCH  /deals/{id}/status                won / lost / on_hold
```

#### Contacts
```
GET    /contacts
GET    /contacts/create
GET    /contacts/{id}
POST   /contacts
PUT    /contacts/{id}
DELETE /contacts/{id}
POST   /contacts/{id}/roles
DELETE /contacts/{id}/roles/{role}
```

#### Properties
```
GET    /properties
GET    /properties/create
GET    /properties/{id}
POST   /properties
PUT    /properties/{id}
DELETE /properties/{id}
PATCH  /properties/{id}/publish          Toggle is_published
POST   /properties/{id}/media            Upload (handled by Spatie MediaLibrary)
DELETE /properties/{id}/media/{mediaId}
PATCH  /properties/{id}/media/reorder
POST   /properties/{id}/owners
DELETE /properties/{id}/owners/{contactId}
POST   /properties/{id}/units
PUT    /properties/{id}/units/{unitId}
DELETE /properties/{id}/units/{unitId}
```

#### Tasks
```
GET    /tasks                            My tasks + team tasks + overdue
POST   /tasks
PUT    /tasks/{id}
PATCH  /tasks/{id}/complete
DELETE /tasks/{id}
```

#### Tenancies
```
GET    /tenancies
GET    /tenancies/{id}
POST   /tenancies
PUT    /tenancies/{id}
PATCH  /tenancies/{id}/terminate
GET    /tenancies/{id}/payments
POST   /tenancies/{id}/payments
PATCH  /tenancies/{id}/payments/{pid}
```

#### Documents
```
POST   /documents
GET    /documents/{id}/download
DELETE /documents/{id}
```

#### Reports
```
GET    /reports/pipeline
GET    /reports/revenue
GET    /reports/leads
GET    /reports/properties
GET    /reports/tenancies
```

#### Settings (admin only)
```
-- Pipelines & Stages
GET    /settings/pipelines
POST   /settings/pipelines
PUT    /settings/pipelines/{id}
DELETE /settings/pipelines/{id}
POST   /settings/pipelines/{id}/stages
PUT    /settings/pipelines/{id}/stages/{stageId}
DELETE /settings/pipelines/{id}/stages/{stageId}
PATCH  /settings/pipelines/{id}/stages/reorder      body: { stages: [id, id, id] }

-- Lead Sources
GET    /settings/lead-sources
POST   /settings/lead-sources
PUT    /settings/lead-sources/{id}
DELETE /settings/lead-sources/{id}
PATCH  /settings/lead-sources/reorder

-- Property Types
GET    /settings/property-types
POST   /settings/property-types
PUT    /settings/property-types/{id}
DELETE /settings/property-types/{id}

-- Amenities
GET    /settings/amenities
POST   /settings/amenities
PUT    /settings/amenities/{id}
DELETE /settings/amenities/{id}
PATCH  /settings/amenities/reorder

-- Task Types
GET    /settings/task-types
POST   /settings/task-types
PUT    /settings/task-types/{id}
DELETE /settings/task-types/{id}

-- Document Types
GET    /settings/document-types
POST   /settings/document-types
PUT    /settings/document-types/{id}
DELETE /settings/document-types/{id}

-- Custom Fields
GET    /settings/custom-fields
POST   /settings/custom-fields
PUT    /settings/custom-fields/{id}
DELETE /settings/custom-fields/{id}
PATCH  /settings/custom-fields/reorder

-- Automation Rules
GET    /settings/automations
POST   /settings/automations
PUT    /settings/automations/{id}
DELETE /settings/automations/{id}
PATCH  /settings/automations/{id}/toggle

-- Team & Users
GET    /settings/team
POST   /settings/team/invite
PUT    /settings/team/{userId}
DELETE /settings/team/{userId}

-- General
GET    /settings/general
PUT    /settings/general
```

---

## 5. Key Model Relationships

```
User
  belongsTo    Team
  hasMany      Leads           (assigned_to)
  hasMany      Deals           (assigned_to)
  hasMany      Tasks           (assigned_to)
  hasMany      Activities

Team
  hasMany      Users

Contact
  hasManyThrough  contact_roles
  hasMany      Leads
  hasMany      Deals
  belongsToMany  Properties    (via property_owners)
  hasMany      Tenancies       (as tenant)
  morphMany    Tasks
  morphMany    Documents
  morphMany    Activities

Property
  belongsTo    PropertyType    (flexible)
  belongsToMany  Contacts      (via property_owners, supports co-ownership)
  belongsToMany  Amenities     (via property_amenity, flexible)
  hasMany      PropertyUnits
  hasMany      Deals
  hasMany      Tenancies
  morphMany    Tasks
  morphMany    Documents
  morphMany    Activities
  morphMany    Media           (Spatie MediaLibrary)

Lead
  belongsTo    Contact
  belongsTo    LeadSource      (flexible)
  belongsTo    Property        optional — which listing triggered enquiry
  belongsTo    User            assigned_to
  hasOne       Deal            converted_to_deal

Pipeline
  hasMany      PipelineStages  (ordered by position, drag-reorderable)
  hasMany      Deals

PipelineStage
  belongsTo    Pipeline
  hasMany      Deals

Deal
  belongsTo    Pipeline
  belongsTo    PipelineStage
  belongsTo    Contact
  belongsTo    Property
  belongsTo    Lead            (origin)
  belongsTo    User            assigned_to
  hasOne       Tenancy         (created when rental deal is won)
  morphMany    Tasks
  morphMany    Documents
  morphMany    Activities

Task
  belongsTo    TaskType        (flexible)
  belongsTo    User            assigned_to
  morphTo      taskable        (Lead | Deal | Contact | Property)

Tenancy
  belongsTo    Property
  belongsTo    PropertyUnit    optional
  belongsTo    Contact         tenant
  belongsTo    Deal
  hasMany      TenancyPayments
  morphMany    Documents
  morphMany    Activities

Document
  belongsTo    DocumentType    (flexible)
  belongsTo    User            uploaded_by
  morphTo      documentable    (Lead | Deal | Contact | Property | Tenancy)

CustomField
  hasMany      CustomFieldValues
  -- scoped by module (lead | deal | contact | property | tenancy)
```

---

## 6. Roles & Permissions Matrix

| Permission                      | Admin | Manager | Agent |
|---------------------------------|:-----:|:-------:|:-----:|
| View all leads                  |  ✓    |   ✓     | own   |
| Create / edit lead              |  ✓    |   ✓     |  ✓    |
| Delete lead                     |  ✓    |   ✓     |  —    |
| Convert lead to deal            |  ✓    |   ✓     |  ✓    |
| View all deals                  |  ✓    |   ✓     | own   |
| Create / edit deal              |  ✓    |   ✓     |  ✓    |
| Move deal stage                 |  ✓    |   ✓     |  ✓    |
| Mark deal won / lost            |  ✓    |   ✓     |  ✓    |
| Delete deal                     |  ✓    |   ✓     |  —    |
| View all contacts               |  ✓    |   ✓     | own   |
| Create / edit contact           |  ✓    |   ✓     |  ✓    |
| Delete contact                  |  ✓    |   ✓     |  —    |
| View all properties             |  ✓    |   ✓     |  ✓    |
| Create / edit property          |  ✓    |   ✓     |  ✓    |
| Publish / unpublish property    |  ✓    |   ✓     |  —    |
| Delete property                 |  ✓    |   ✓     |  —    |
| View all tasks                  |  ✓    |   ✓     | own   |
| Create / complete task          |  ✓    |   ✓     |  ✓    |
| View / manage tenancies         |  ✓    |   ✓     | own   |
| Record tenancy payments         |  ✓    |   ✓     |  ✓    |
| View reports                    |  ✓    |   ✓     |  —    |
| Manage pipelines & stages       |  ✓    |   —     |  —    |
| Manage lead sources             |  ✓    |   —     |  —    |
| Manage property types           |  ✓    |   —     |  —    |
| Manage amenities                |  ✓    |   —     |  —    |
| Manage custom fields            |  ✓    |   —     |  —    |
| Manage automation rules         |  ✓    |   —     |  —    |
| Manage team / users             |  ✓    |   —     |  —    |
| Access public API config        |  ✓    |   —     |  —    |

---

## 7. Core Laravel Packages

### Backend (Composer)
```
laravel/sanctum                     Public API token auth
inertiajs/inertia-laravel           Inertia.js server adapter
tightenco/ziggy                     Named routes available in React
spatie/laravel-permission           RBAC (roles + permissions)
spatie/laravel-medialibrary         Property photos, documents, media library
spatie/laravel-activitylog          Immutable activity / audit log
spatie/laravel-sluggable            Auto-slug for pipelines, sources etc.
laravel/scout                       Unified search abstraction
meilisearch/meilisearch-php         Search engine (self-hosted, fast, free)
league/flysystem-aws-s3-v3          S3 / Cloudflare R2 storage
barryvdh/laravel-dompdf             PDF generation (contracts, statements)
```

### Frontend (npm)
```
@inertiajs/react                    Inertia React adapter
react  react-dom
@vitejs/plugin-react
@tanstack/react-query               Server-state management
@dnd-kit/core  @dnd-kit/sortable    Kanban board + list reordering
react-hook-form  zod                Forms + schema validation
tailwindcss  @tailwindcss/forms
shadcn/ui                           Component library (via CLI)
lucide-react                        Icon set
date-fns                            Date formatting / manipulation
recharts                            Charts for reports / dashboard
```

---

## 8. Environment Variables

```env
APP_NAME="Nexsit CRM"
APP_ENV=production
APP_URL=https://crm.nexsit.com

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nexsit_crm
DB_USERNAME=
DB_PASSWORD=

# Storage (Cloudflare R2 or AWS S3)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET=nexsit-media
AWS_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com

# Queues
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS="noreply@nexsit.com"
MAIL_FROM_NAME="Nexsit CRM"

# SMS / WhatsApp (Twilio)
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Search
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=

# Vite
VITE_APP_URL="${APP_URL}"
```

---

## 9. Development Phases

| Phase | Module / Scope                                          | Est. weeks |
|-------|---------------------------------------------------------|-----------|
| 1     | Laravel scaffold, auth, users, teams, RBAC              | 1–2       |
| 2     | Flexibility system: pipelines, sources, types, amenities| 1–2       |
| 3     | Properties module (CRUD, media, publish toggle)         | 2–3       |
| 4     | Contacts module (unified, roles, custom fields)         | 1–2       |
| 5     | Leads module + public enquiry API                       | 1–2       |
| 6     | Deals + Kanban pipeline board                           | 2–3       |
| 7     | Tasks + Activity log (polymorphic)                      | 1         |
| 8     | Public API + website listing pages (SSR)                | 2         |
| 9     | Tenancies + payment schedules                           | 2         |
| 10    | Documents module                                        | 1         |
| 11    | Reports + dashboard charts                              | 2         |
| 12    | Automation rules engine                                 | 2         |
| 13    | Portal feed exports (Bayut, Property Finder XML)        | 1–2       |
| 14    | WhatsApp / SMS notifications (Twilio)                   | 1         |

**Total estimate: 22–30 weeks** for full feature set.
Build phases 1–7 first for a working internal CRM MVP (≈10–12 weeks).

---

*Nexsit CRM · Architecture Blueprint v1.1*
*Laravel 11 + Inertia.js + React · Single Repo*