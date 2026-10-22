---
title: "PHP2Shell: How Two Critical PHP Flaws Gave Attackers Unauthenticated RCE"
summary: "On October 20, 2026, two critical remote code execution vulnerabilities in PHP leaked online before coordinated disclosure. I set up a local demonstration environment to understand exactly how they work. Here's what I found — and what you need to do if you run PHP."
date: "2026-10-21"
readingTime: "8 min"
tags: ["Security", "PHP", "CVE"]
---

On October 20, 2026, details of two critical remote code execution vulnerabilities in PHP leaked online a day before coordinated disclosure. Within hours, PHP released emergency patches. By the next morning, the first in-the-wild attacks were already emerging.

These aren't application-layer bugs. They're in the PHP core itself — meaning every website, API, and service running unpatched PHP is exposed. No login. No authentication. Just a crafted HTTP request.

I set up a local demonstration environment to understand exactly how these vulnerabilities work. Here's what I found.

## The Vulnerabilities

Two CVEs, both CVSS 9.2 (Critical):

- **CVE-2026-109618** — RCE via out-of-memory error handling leaving request data partially initialized
- **CVE-2026-109619** — RCE via stale global state use-after-free

Both exploit PHP's session upload progress mechanism (RFC 1867), which is enabled by default. This feature tracks the progress of file uploads via a session variable — useful for progress bars, but also a perfect attack surface.

## How the Attack Works

The exploit flow has seven phases:

### Phase 1: Trigger the Progress Callback

The attacker sends a multipart POST request containing a `PHP_SESSION_UPLOAD_PROGRESS` field. This is a legitimate PHP feature — when this field is present, PHP's `php_session_rfc1867_callback` function starts tracking the upload progress.

```http
POST /upload.php HTTP/1.1
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="PHP_SESSION_UPLOAD_PROGRESS"

abc123
------Boundary
```

### Phase 2: Cache Poisoned Pointers

When the progress callback fires, PHP stores raw `zval*` pointers into the session HashTable. These pointers reference internal PHP data structures that will be freed when the request ends.

This is where CVE-2026-109619 takes root: PHP workers retain global state between requests. When a fatal error or OOM condition occurs, request-owned state survives in global memory, but the backing memory gets freed.

### Phase 3: Stall the Request

The attacker stalls the upload for longer than `session.upload_progress.min_freq` (default: 1 second). During this stall, the session re-initializes and frees the HashTable containing those cached pointers.

Now we have dangling pointers — the session HashTable still references memory that's been freed.

### Phase 4: Write Through Stale Pointers

The attacker sends more upload data. PHP's progress callback writes through the stale `zval*` pointers, corrupting whatever memory now occupies those addresses.

### Phase 5: Heap Spray

The attacker sprays the heap with forged `zend_fcall_info` structures. These are PHP's internal function call descriptors — if you can place one where PHP expects to find one, you can control what function gets called and with what arguments.

### Phase 6: Trigger Execution

A subsequent request on the same worker process hits the corrupted state. PHP dereferences the poisoned pointers, finds the forged `zend_fcall_info`, and calls `zend_call_function` — executing attacker-controlled code.

### Phase 7: Remote Code Execution

The attacker now has unauthenticated RCE as the web worker user (typically `www-data` or `apache`). From here, they can read files, execute shell commands, install persistence, or pivot to the internal network.

## CVE-2026-109618: The OOM Variant

This variant exploits PHP's out-of-memory error handling. When PHP runs out of memory during request setup (e.g., while parsing a large multipart upload):

1. PHP uses `longjmp()` to abort the request
2. Internal state is left partially initialized — some structures are allocated, others aren't
3. During request cleanup, PHP treats the half-initialized data as valid
4. This creates a path to execute arbitrary code

The key insight: PHP's OOM handling was designed to gracefully abort the request, but it didn't account for an attacker intentionally triggering OOM to leave the internal state in a corrupted-but-not-crashed condition.

## CVE-2026-109619: The Use-After-Free Variant

This is the classic use-after-free pattern:

1. Request A allocates memory, stores pointers in global state
2. Request A ends, memory is freed, but global state still holds the pointers
3. Request B starts on the same worker, allocates new memory at the same addresses
4. PHP reads the stale global state, dereferences the old pointers
5. Attacker controls what's at those addresses → code execution

The fact that PHP workers are long-lived and reuse memory between requests is what makes this exploitable over HTTP.

## What I Found in Testing

I set up two isolated containers: PHP 8.3.35 (vulnerable) and PHP 8.3.36 (patched), both running Apache.

**Key finding:** The exploit is highly version-specific. The public PoC was calibrated for PHP 8.5.4 on Ubuntu, with a symbol delta of `0x43EF0` to locate `zend_call_function`. My PHP 8.3.35 build had a different delta of `0xE034`.

This means:

- The exploit requires precise knowledge of the target PHP binary's symbol layout
- It's not a "fire and forget" exploit — it needs adaptation per target
- However, the attack surface (session upload progress) is universal across all PHP versions that support it

I was unable to achieve actual RCE in my test environment due to the symbol offset mismatch, which is expected. Heap exploits are probabilistic and version-dependent. But the underlying vulnerability is real and confirmed by the PHP security team.

## Immediate Mitigation

If you can't patch right now, disable the session upload progress feature:

```ini
; php.ini
session.upload_progress.enabled = Off
```

For PHP-FPM:

```ini
; pool.d/www.conf
php_admin_flag[session.upload_progress.enabled] = off
```

This removes the attack surface entirely. The trade-off: you lose upload progress tracking.

## Permanent Fix

Upgrade to a patched version:

| Branch | Patched Version |
|--------|----------------|
| PHP 8.2 | 8.2.35 |
| PHP 8.3 | 8.3.36 |
| PHP 8.4 | 8.4.27 |
| PHP 8.5 | 8.5.12 |

PHP 5.x and 7.x are not patched (they're end-of-life). If you're running those, upgrade immediately.

## Detection

Look for these indicators in your web server logs:

1. Multipart POST requests containing `PHP_SESSION_UPLOAD_PROGRESS` field
2. Requests to upload endpoints that stall for >1 second
3. Unusual memory usage patterns in PHP worker processes
4. `id`, `whoami`, or shell command execution in PHP error logs

## The Bigger Picture

This vulnerability class — core language memory corruption leading to unauthenticated RCE — is why running the latest version of your runtime matters. These aren't bugs in WordPress or Laravel; they're bugs in PHP itself. Every application built on PHP inherits these vulnerabilities.

The fact that details leaked a day early means attackers had a head start. If you're running PHP, assume you've been scanned. Check your logs. Patch now.

## References

- PHP Security Advisory: https://www.php.net/archive/2026.php
- CERT-EU Advisory: https://cert.europa.eu/publications/security-advisories/2026-018
- Original PoC: https://github.com/eness/php2shell-CVE-2026-109618-CVE-2026-109619-PoC
- Datadog Security Labs Analysis: https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/

---

*This article is based on hands-on testing in an isolated environment. All exploit testing was performed locally with no network exposure.*
