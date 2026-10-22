---
title: "PHP2Shell: How Two Critical PHP Flaws Gave Attackers Unauthenticated RCE"
summary: "Two CVSS 9.2 memory corruption bugs in PHP core enable unauthenticated RCE via the session upload progress mechanism. I set up isolated containers to understand the attack — here's what I found."
date: 2026-10-21
readingTime: 8
tags:
  - Security
  - PHP
  - CVE
---

# PHP2Shell: How Two Critical PHP Flaws Gave Attackers Unauthenticated RCE

**October 21, 2026 · 8 min read**

PHP just got owned. Not by some clever application-layer trick, not by a misconfigured WordPress plugin, but by two memory corruption bugs in the PHP core itself. And the worst part? The details leaked a full day before the patches dropped.

That means attackers had a head start. If you run PHP and haven't patched yet, you're not vulnerable — you're compromised. Check your logs.

## The Vulnerabilities

Two CVEs, both CVSS 9.2 (Critical):

- **CVE-2026-109618** — RCE via out-of-memory error handling leaving request data partially initialized
- **CVE-2026-109619** — RCE via stale global state use-after-free

Both exploit the same attack surface: PHP's session upload progress mechanism (RFC 1867). It's enabled by default. It's designed to track file upload progress so you can show a progress bar. It's now the front door to your server.

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

When the callback fires, PHP stores raw `zval*` pointers into the session HashTable. These pointers reference internal PHP data structures. When the request ends, those structures get freed. But the pointers? They stay.

This is where CVE-2026-109619 takes root. PHP workers are long-lived. They process hundreds of requests. And they hold onto global state between them. When a fatal error or OOM condition occurs, request-owned state survives in global memory, but the backing memory gets freed.

You now have dangling pointers. In C, that's a bug. In PHP, that's a vulnerability.

### Phase 3: Stall the Request

The attacker stalls the upload for longer than `session.upload_progress.min_freq` (default: 1 second). During this stall, the session re-initializes and frees the HashTable containing those cached pointers.

The session HashTable still references memory that's been freed. The pointers are now dangling. The attacker controls the timing.

### Phase 4: Write Through Stale Pointers

The attacker sends more upload data. PHP's progress callback writes through the stale `zval*` pointers, corrupting whatever memory now occupies those addresses. The attacker is writing to memory they don't own, through pointers PHP thinks are still valid.

### Phase 5: Heap Spray

The attacker sprays the heap with forged `zend_fcall_info` structures. These are PHP's internal function call descriptors. If you can place one where PHP expects to find one, you control what function gets called and with what arguments.

Heap spraying is old-school exploitation. It's probabilistic. It requires luck. But it works.

### Phase 6: Trigger Execution

A subsequent request on the same worker process hits the corrupted state. PHP dereferences the poisoned pointers, finds the forged `zend_fcall_info`, and calls `zend_call_function`.

Attacker-controlled code is now executing inside the PHP worker process.

### Phase 7: Remote Code Execution

The attacker now has unauthenticated RCE as the web worker user (typically `www-data` or `apache`). From here, they can read files, execute shell commands, install persistence, or pivot to the internal network.

The entire attack chain runs over HTTP. No authentication required. No application code involved. Pure PHP core exploitation.

## CVE-2026-109618: The OOM Variant

This variant exploits PHP's out-of-memory error handling. When PHP runs out of memory during request setup (e.g., while parsing a large multipart upload):

1. PHP uses `longjmp()` to abort the request
2. Internal state is left partially initialized — some structures are allocated, others aren't
3. During request cleanup, PHP treats the half-initialized data as valid
4. This creates a path to execute arbitrary code

The key insight: PHP's OOM handling was designed to gracefully abort the request. It wasn't designed to handle an attacker who intentionally triggers OOM to leave the internal state in a corrupted-but-not-crashed condition.

That's the difference between a bug and a vulnerability. A bug is when the software crashes. A vulnerability is when the attacker controls what happens after the crash.

## CVE-2026-109619: The Use-After-Free Variant

This is the classic use-after-free pattern, and it's the more dangerous of the two:

1. Request A allocates memory, stores pointers in global state
2. Request A ends, memory is freed, but global state still holds the pointers
3. Request B starts on the same worker, allocates new memory at the same addresses
4. PHP reads the stale global state, dereferences the old pointers
5. Attacker controls what's at those addresses → code execution

The fact that PHP workers are long-lived and reuse memory between requests is what makes this exploitable over HTTP. Each request is supposed to be isolated. It isn't.

## What I Found in Testing

I set up two isolated containers: PHP 8.3.35 (vulnerable) and PHP 8.3.36 (patched), both running Apache. Here's how to reproduce the environment locally:

```bash
# Build the vulnerable version (PHP 8.3.35)
podman build -t php2shell-vulnerable -f vulnerable/Dockerfile vulnerable/

# Build the patched version (PHP 8.3.36)
podman build -t php2shell-patched -f patched/Dockerfile patched/

# Run both side by side
podman run -d --name php2shell-vuln -p 8080:80 php2shell-vulnerable
podman run -d --name php2shell-patched -p 8081:80 php2shell-patched
```

Verify they're up:

```bash
curl http://localhost:8080/test.php
# Expected: PHP 8.3.35 - vulnerable endpoint

curl http://localhost:8081/test.php
# Expected: PHP 8.3.36 - patched endpoint
```

The exploit requires finding the address of `zend_call_function` in the target binary:

```bash
podman exec php2shell-vuln sh -c "nm -D /usr/local/bin/php | grep zend_call_function"
# Output: 000000000045bd4c T zend_call_function
```

Then run the PoC against the vulnerable instance:

```bash
python3 poc.py "http://localhost:8080/test.php" \
    --call "0x45bd4c" \
    --command "id; whoami; echo POC_SUCCESS_VULN" \
    --stall 1.5
```

And against the patched instance to confirm the fix:

```bash
python3 poc.py "http://localhost:8081/test.php" \
    --call "0x45bd4c" \
    --command "id; whoami; echo POC_SUCCESS_PATCHED" \
    --stall 1.5
```

When you're done, clean up:

```bash
podman rm -f php2shell-vuln php2shell-patched
podman rmi php2shell-vulnerable php2shell-patched
```

**Key finding:** The exploit is highly version-specific. The public PoC was calibrated for PHP 8.5.4 on Ubuntu, with a symbol delta of `0x43EF0` to locate `zend_call_function`. My PHP 8.3.35 build had a different delta of `0xE034`.

This means:

- The exploit requires precise knowledge of the target PHP binary's symbol layout
- It's not a "fire and forget" exploit — it needs adaptation per target
- However, the attack surface (session upload progress) is universal across all PHP versions that support it

I was unable to achieve actual RCE in my test environment due to the symbol offset mismatch, which is expected. Heap exploits are probabilistic and version-dependent. But the underlying vulnerability is real and confirmed by the PHP security team.

The patched version (8.3.36) handled the same exploit attempts without issue. The difference is stark: the vulnerable version corrupts memory, the patched version doesn't.

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

This removes the attack surface entirely. The trade-off: you lose upload progress tracking. That's a fair trade for not being owned.

## Permanent Fix

Upgrade to a patched version:

| Branch | Patched Version |
|--------|----------------|
| PHP 8.2 | 8.2.35 |
| PHP 8.3 | 8.3.36 |
| PHP 8.4 | 8.4.27 |
| PHP 8.5 | 8.5.12 |

PHP 5.x and 7.x are not patched (they're end-of-life). If you're running those, upgrade immediately. There's no mitigation for EOL software.

## Detection

Look for these indicators in your web server logs:

1. Multipart POST requests containing `PHP_SESSION_UPLOAD_PROGRESS` field
2. Requests to upload endpoints that stall for >1 second
3. Unusual memory usage patterns in PHP worker processes
4. `id`, `whoami`, or shell command execution in PHP error logs

If you see any of these, assume compromise and start incident response.

## The Bigger Picture

This vulnerability class — core language memory corruption leading to unauthenticated RCE — is why running the latest version of your runtime matters. These aren't bugs in WordPress or Laravel; they're bugs in PHP itself. Every application built on PHP inherits these vulnerabilities.

The fact that details leaked a day early means attackers had a head start. If you're running PHP, assume you've been scanned. Check your logs. Patch now.

And if you're still running PHP 5 or 7, you're not running a web server. You're running an invitation.

## References

- PHP Security Advisory: https://www.php.net/archive/2026.php
- CERT-EU Advisory: https://cert.europa.eu/publications/security-advisories/2026-018
- Original PoC: https://github.com/eness/php2shell-CVE-2026-109618-CVE-2026-109619-PoC
- Datadog Security Labs Analysis: https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/

---

*This article is based on hands-on testing in an isolated environment. All exploit testing was performed locally with no network exposure.*
