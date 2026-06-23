# Security Specification: Coroado Comunicação

This security specification verifies the attribute-based access control (ABAC) architecture of "Coroado Comunicação", establishing robust, Zero-Trust firestore security guards to prevent privilege escalation, data leakage, and orphaned states.

## 1. Data Invariants

1. **Strict Identity Ownership**: Personal records (e.g., devotional answers, lesson progress, attendance RSVPs) must have their `userId` or `ownerId` match the authenticated user's standard Firebase context `request.auth.uid`.
2. **The Pendency Gatekeeper**: Users with `status = "pendente"` are strictly isolated and cannot query lessons, modules, devotionals, support files, or meetings.
3. **Role Immutable Self-Promotion Prevention**: No client is allowed to self-modify their role from `servo` to `lider` or `admin`, nor are they allowed to elevate their own `status` directly to `ativo` once it is in a pending or blocked state.
4. **PII and Counsel Note Isolation**: Confidential notes written by shepherds/leaders (`leaderNotes`) and private field structures must be inaccessible to standard `servo` accounts, preventing security leakage of counselor-student records.
5. **Progress Chronological Validity**: Progress and status metrics are safeguarded from retrospective deletion by students.

## 2. The "Dirty Dozen" Poison Payloads

Here are twelve payloads designed to bypass client-side parameters, each of which must return `PERMISSION_DENIED` at the Firestore layer:

1. **Self-Promotion Payload**: A standard user attempting to write or update `/users/{uid}` with `role: "admin"` to escalate permissions.
2. **Auto-Aproval Payload**: A pending user trying to bypass pastoral moderation by setting their `status: "ativo"`.
3. **Ghost Answer Hijack**: User authenticated as `uid_abc` attempting to write a devotional answer under `userId: "uid_xyz"`.
4. **Counsel Leak Attack**: A student attempting to query the `/leaderNotes` collection to read a counselor's private notes about them or another servo.
5. **Private Material Scrape**: A servo trying to fetch or query documents in `/supportMaterials` where `visibility == "lideres"` or `visibility == "admins"`.
6. **Double-Voting Attendance Fraud**: A user attempting to override another student's meeting presence by editing a `/meetingAttendance/{id}` doc with `userId: "other_uid"`.
7. **Junk Character ID Attack**: Injecting a 50KB binary string as a document ID key (e.g. `modules/{projectId}`) to waste cloud resources.
8. **Shadow Field Injection**: Writing to `/platformSettings/config` with custom fields like `isPubliclyHackable: true` or modifying colors as a non-admin.
9. **Devotional Answer Overwrite**: A user trying to set a terminal state review parameter `status: "acompanhada"` on an answer without leader permissions.
10. **Pre-dated Timestamp Injection**: Forging `createdAt` with a historical client timestamp instead of enforcing server-authoritative `request.time`.
11. **Content Erasure / Destruction**: A servo sending a `delete` signal to a module `/modules/theme_1` or a lesson `/lessons/lesson_1`.
12. **Status Loop Hijack**: Altering progress records back to un-started or injecting arbitrary completion values (`percent: 9999`) to bypass requirements.

## 3. Test Verification Plan

All security operations are gated under strict ABAC helpers:
- `isAuthed()`: checks authentication state.
- `getUser()`: extracts the live Firestore profile of the user to check roles and status.
- `isServoAprovado()`: checks if user has `role = "servo"` (or higher) and `status = "ativo"`.
- `isLiderOrAdmin()`: checks for counselor/admin permissions.
- `isAdmin()`: checks for highest privileges.

These rules will be translated mathematically into `firestore.rules`.
