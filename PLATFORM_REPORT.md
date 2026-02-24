# ChainVolio: Technical Platform & Trust Architecture Report

## 1. Platform Overview
ChainVolio is a trust-minimized, non-custodial infrastructure for verifiable professional history and high-signal hiring. The platform addresses the systemic issues of resume inflation, unverifiable professional claims, and automated hiring spam by replacing reputation-based trust with architectural enforcement.

The core guiding principle of the platform is: 
"Trust is enforced by architecture, not reputation."

ChainVolio is specifically engineered to be:
*   A cryptographically verifiable record of professional milestones.
*   A non-custodial gateway for professional identity.
*   A secure environment for recruiters to collect immutable candidate snapshots.

ChainVolio is not a social network, a custodial service, or a traditional unstructured resume database.

## 2. User Roles and Actors
The system architecture defines three primary actors with strictly separated privileges and responsibilities.

### 2.1 Talent (User)
The Talent actor represents the individual professional. 
*   Identity: Controlled exclusively through a non-custodial wallet (e.g., Solana).
*   Authentication: Every state-changing action requires a unique cryptographic signature.
*   Data Ownership: Users maintain their own professional record which remains under their control until snapshotted for a specific hiring context.
*   Verification: Users can request third-party attestations which, once verified, become immutable components of their profile.

### 2.2 Recruiter
The Recruiter actor manages the collection and evaluation of talent. 
*   Collections: Recruiters create isolated hiring collections bound to specific roles.
*   Hiring Links: Unique, context-aware links are generated for talent sourcing.
*   Snapshots: Recruiters receive immutable "snapshots" of candidate profiles at the moment of submission. This ensures historical accuracy even if the user subsequently modifies their public profile.
*   Isolation: Recruiters have zero visibility into other recruiters' data or cross-collection analytics.

### 2.3 Platform (ChainVolio)
The Platform acts as the stateless verifier and enforcement layer.
*   Verification: Validates wallet signatures against the requested action and context.
*   Invariants: Enforces database-level constraints that prevent the alteration of historical records.
*   Zero-Trust Assumption: The platform operates under the assumption that the frontend interface can be compromised; therefore, all security logic is enforced server-side and at the database level.

## 3. Core Features and Implementation Status
The following features are currently implemented and functional within the production-oriented architecture.

### 3.1 Professional CV and Attestations
Profiles are composed of structured Proof of Work entries. When an entry is marked as "Attested", the system records a cryptographic signature from a third-party verifier. Once this attestation is processed, the specific work record is locked against manual modification by the user, preserving the integrity of the verified claim.

### 3.2 Immutable CV Snapshots
Upon submission to a hiring collection, the platform captures a full snapshot of the candidate's CV. This snapshot includes all work history, attestations, and evidence links at that specific point in time. The snapshot is stored in a dedicated table with strict immutability constraints, ensuring recruiters evaluate candidates based on fixed historical evidence rather than dynamic profiles.

### 3.3 Context-Bound Hiring Links
Hiring links are not generic URL redirects. They are cryptographically bound to a specific collection and recruiter. Submission through these links requires the user to sign a message that includes the unique collection identifier, preventing the harvesting of submissions for unauthorized use.

### 3.4 Server-Side Eligibility Gates
Security gates (such as deadline checks, role-specific requirements, or submission limits) are implemented in the API layer and the database. Frontend visibility of these gates is for UX purposes only; the system rejects any transaction that fails server-side validation, even if the frontend has been manipulated to bypass local checks.

## 4. System Flow and Verification
The end-to-end user flow is designed to be verifiable and traces through the following stages:

1.  Wallet Connection: The user establishes a session via a non-custodial wallet provider. Identity is derived from the public key.
2.  Signature Request: For any data modification (e.g., submitting a CV), the server provides a specific message for the user to sign.
3.  Context-Bound Signing: The user signs a payload containing the action name (e.g., "submit_cv"), the target ID (e.g., "collection_abc"), and a timestamp/nonce.
4.  Server Verification: The API validates the signature against the user's public key and ensures the nonce/timestamp is within the valid window to prevent replay.
5.  Database Validation: Row-Level Security (RLS) policies and database triggers check that the user has the right to perform the move (e.g., "Is this collection still open?").
6.  Immutable Storage: Validated data is committed. For submissions, this triggers the snapshotting process.

## 5. Security Model
The security posture of ChainVolio is defined by three layers of defensive engineering.

### 5.1 Cryptographic Guarantees
The system relies on Ed25519 signatures (via Solana) for all critical paths. 
*   Replay Protection: Each signed action is valid only once and within a strictly defined time threshold.
*   Non-Custodial Identity: Private keys never leave the user's local device or hardware wallet. The platform only stores the resulting signature as a proof of intent.

### 5.2 Data Integrity and Immutability
Historical integrity is preserved through database-level enforcement:
*   Triggers: Automated scripts prevent the UPDATE or DELETE of rows in tables marked as immutable (e.g., `cv_snapshots`, `attestations`).
*   Audit Logs: Critical state changes are recorded with metadata linking them to a verified wallet signature.

### 5.3 Data Isolation (RLS)
ChainVolio uses Supabase Row-Level Security (RLS) to enforce strict multitenancy. Recruiter A cannot query or even acknowledge the existence of Recruiter B's hiring collections. This isolation is enforced by the database engine, meaning even a compromised API key would still be restricted by the RLS policies tied to the current authenticated context.

### 5.4 Abuse Prevention
The platform implements multiple anti-abuse mechanisms:
*   Wallet Cooldowns: Enforces a delay between submissions from the same wallet.
*   IP-Hash Rate Limiting: Limits connection attempts from specific network nodes without storing raw IP addresses.
*   Eligibility Cost: By requiring a wallet signature for every meaningful action, the platform increases the computational and logistical cost of coordinating automated spam.

## 6. Trust Invariants
The following invariants are hard-coded into the system and cannot be violated by the platform or its users:
1.  Attested Professional Records: Once a third party signs a work entry, the record cannot be modified or deleted.
2.  Snapshot Integrity: A CV snapshot, once recorded, can never be altered by the talent or the recruiter.
3.  Cross-Recruiter Privacy: No recruiter can access, view, or modify data belonging to another recruiter.
4.  Non-Assumption of Frontend Trust: All permissions and validations are re-checked at the database boundary.

## 7. Non-Custodial Architecture
ChainVolio does not custody user assets or private keys. The platform functions as a database of verifiable proofs. 
*   Identity resides with the user's wallet.
*   Signatures provide the proof of authorization.
*   Platform failure or compromise does not lead to the loss of user identity, as the root of trust is managed by independent wallet providers.

## 8. Failure Modes and Limitations

### 8.1 System Outages
During a partial outage of the database or API layer, the system is designed to "fail closed." This means if verification cannot be completed, the action is rejected rather than allowed to proceed without proof.

### 8.2 Scope Limitations
ChainVolio manages professional history and trust signals but does not currently:
*   Perform automated background checks (it only provides the infrastructure for others to vouch for data).
*   Enforce on-chain financial settlements.
*   Support recovery of lost wallets (as it is strictly non-custodial).

### 8.3 Remaining Risks
While the system is resilient against replay and tampering, it cannot prevent:
*   Collusion between two parties to sign a false attestation (mitigated by the transparency of the attester's own identity).
*   Compromise of the underlying blockchain or wallet provider infrastructure.

## 9. Localhost Verification Statement
All behaviors, security policies, and invariants described in this report can be observed and verified within a local development environment.
*   Database RLS policies are viewable in the SQL schema.
*   Signature verification logs are accessible in the server-side console.
*   Immutability constraints can be tested by attempting manual data overrides in the database console.
No feature relies on undocumented backend services or private business logic.

## 10. Conclusion
ChainVolio is a production-oriented platform that has successfully moved beyond reputation-based hiring into a trust-minimized, architecturally enforced model. By leveraging cryptographic verification and database-level immutability, the platform provides high-signal professional data that is resistant to the common pitfalls of modern recruitment. 

The system is ready for high-consequence hiring use cases where the integrity of historical data is the primary requirement.
