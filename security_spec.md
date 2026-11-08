# Security Specification: WMA CARE Firestore Rules

## 1. Data Invariants

1. **Default-Deny Catch-All**: Any path not explicitly matched is strictly forbidden for all read and write operations.
2. **Authentication & Verification**: Only authenticated school staff (`request.auth != null` with `email_verified == true`) can read or write student care records.
3. **Admin Privilege Isolation**: Roles are verified against `/databases/$(database)/documents/admins/$(request.auth.uid)`. Client cannot elevate privileges or modify the `/admins` collection.
4. **Bootstrapped Admin**: `earth61024@gmail.com` is provisioned as initial system administrator.
5. **Path ID Integrity**: All document IDs (`userId`, `periodKey`, `studentId`) must be strictly validated with alphanumeric/underscore/hyphen characters and bounded lengths ($\le$ 128 chars).
6. **Student Data Integrity**: Student documents require valid `studentCode`, `name`, `classroom` (one of ป.1 - ป.6), and `periodKey`.
7. **Screening 9S Invariant**: 9S assessments require `studentId`, `periodKey`, `assessmentDate`, and `overallPositive`.
8. **SDQ Invariant**: SDQ assessments require valid `assessorType` (teacher, student, parent), `studentId`, `periodKey`, `totalDifficulties` (0-40), and valid `totalStatus` (normal, risk, problem).
9. **Relational Consistency**: Subcollection writes under `/periods/{periodKey}` must ensure `periodKey` in the incoming data matches the path `{periodKey}`.
10. **Query Enforcement**: List queries require authenticated verified users, and single get reads prevent junk/invalid IDs.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1: Unauthenticated Read/Write**
   - Attempt: Unauthenticated user accesses `/periods/2569_1/students`.
   - Expected: PERMISSION_DENIED.
2. **Payload 2: Unverified Email Write**
   - Attempt: User with `email_verified == false` tries to create student.
   - Expected: PERMISSION_DENIED.
3. **Payload 3: Self-Promotion to Admin**
   - Attempt: Regular user writes to `/admins/attacker_uid`.
   - Expected: PERMISSION_DENIED.
4. **Payload 4: ID Injection Attack**
   - Attempt: Student ID containing `../../../malicious` or > 128 characters.
   - Expected: PERMISSION_DENIED.
5. **Payload 5: Path Mismatch Spoofing**
   - Attempt: Writing a student with `periodKey: "2570_1"` under path `/periods/2569_1/students/s1`.
   - Expected: PERMISSION_DENIED.
6. **Payload 6: Invalid Classroom Grade**
   - Attempt: Creating student with `classroom: "ม.7"` (invalid enum).
   - Expected: PERMISSION_DENIED.
7. **Payload 7: Unbounded String Payload (Denial of Wallet)**
   - Attempt: Name string exceeding 200 characters.
   - Expected: PERMISSION_DENIED.
8. **Payload 8: Missing Required Student Fields**
   - Attempt: Creating student without `studentCode` or `name`.
   - Expected: PERMISSION_DENIED.
9. **Payload 9: Invalid SDQ Total Difficulties Range**
   - Attempt: Submitting SDQ score of 99 (valid range is 0 to 40).
   - Expected: PERMISSION_DENIED.
10. **Payload 10: Invalid SDQ Assessor Type**
    - Attempt: Submitting `assessorType: "bot"` (must be teacher, student, or parent).
    - Expected: PERMISSION_DENIED.
11. **Payload 11: Modifying Other Users' Profile Without Admin**
    - Attempt: Non-admin user updating `/users/other_user_id`.
    - Expected: PERMISSION_DENIED.
12. **Payload 12: Arbitrary Collection Write (Catch-all test)**
    - Attempt: Writing to `/unknown_collection/doc1`.
    - Expected: PERMISSION_DENIED.
