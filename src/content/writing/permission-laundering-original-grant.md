*By Arun Sanna*

![Conceptual illustration of a document moving through gates with a separate connection to a privileged gate.](/article-assets/bran-012/permission-laundering/header.png)

*Conceptual illustration of an authorization handoff, not evidence of a recorded incident.*

An agent says the user approved publication. A receiving agent has credentials that can publish. The API accepts the credential.

The approval may still be missing.

That is the authorization gap in a claimed-approval handoff. The receiving workflow must distinguish what another agent says was granted from what the original actor actually granted for this action.

## The illustrative mechanism

Imagine an agent restricted from publishing a document without approval. It delegates the work to a privileged receiver and claims that approval exists. If the receiver treats that statement as authority, the original restriction can be bypassed even though neither agent acquired a new permission.

The mechanism requires a receiver with useful privileges and a workflow that accepts forwarded approval without checking its source. It does not establish prevalence or show that every agent behaves this way.

I used “permission laundering” for this claimed-approval handoff in a July 22, 2026 post [1]. It is a framing of the failure mechanism, not a naming-priority claim.

## Credential authorization is only one boundary

A publishing API can correctly authorize the receiving agent's credential. That verifies the credential's ability to publish. The tool also needs a trusted record showing that the original user authorized the action, resource and destination within the requested scope.

An injection could persuade a planner to forward a claim of approval. The exploit still depends on the receiver's trust decision. A message that appears internal is an input crossing a boundary, not a replacement for the original grant.

OWASP LLM01:2025 and LLM06:2025 discuss untrusted instructions reaching privileged functions and recommend limited permissions and approval controls [2, 3]. The 2026 agentic taxonomy identifies cross-agent trust exploitation as a confused-deputy case under ASI03, Identity and Privilege Abuse [4]. Microsoft's AI agent shared-responsibility guidance also treats inter-agent messages as trust boundaries and calls for per-action authorization [6].

## Derived checklist for the receiving tool

Resolve authority from a trusted grant record, rather than asking a model whether the forwarded message sounds approved. Bind it to the original actor, actual grant, action, resource, destination, scope and current validity.

![Recommended authorization lineage: an unverified forwarded claim is separated from checks of the original actor, actual grant and requested scope. Valid authority allows only actions within the grant; missing or mismatched authority is denied.](/article-assets/bran-012/permission-laundering/authorization-lineage.png)

*Derived recommendation: verify the original actor, actual grant, action, resource, destination, scope and current validity before acting. A handoff claim is unverified input. This diagram is not a measured implementation or a security guarantee.*

| Check | Trusted evidence required | Boundary to preserve |
| --- | --- | --- |
| Original actor | Authenticated approver and actual grant record | A forwarding agent's statement cannot create approval |
| Requested action | Grant matching the action, resource and destination | Preparation cannot silently expand into publication |
| Requested scope | Action inside the granted limits | A child assignment cannot widen the parent's authority |
| Current validity | Grant duration and current revocation state | Expired, revoked or mismatched authority stops the action |
| Delegation lineage | Permission for the child scope being assigned | Missing provenance requires a new decision |

This checklist is derived engineering guidance. A diagram and a prompt do not demonstrate that a control is implemented across every tool path. Keep the identity evaluated, decision reason and actual grant with the action's evidence.

## What the retained observations support

Recorded September 2026 task-workflow probes describe protected writes rejecting a different lease owner, review rejecting an identity indistinguishable from the author, and an author-close guard applying on its tested review path. Separate delegation probes recorded narrowed child scopes and rejection of an unauthorized forwarding role.

These are bounded results for specific paths. They do not prove that every API, task state or runtime prevents self-closure or privilege widening. The action boundary and evaluated identity must stay visible in the claim.

## The generated fixture measures a different threat

A retained November 2025 AgentMesh record reports 279 blocked and 21 missed attacks in a generated fixture of 300 malicious MCP/JSON-RPC cases. The blocked proportion is 93.0%.

![Reported AgentMesh generated malicious fixture of 300 cases with 279 blocked and 21 missed, or 93.0% blocked. This fixture did not directly test claimed-approval handoffs.](/article-assets/bran-012/permission-laundering/reported-security-evaluation.png)

*One retained generated malicious fixture: 279 blocked, 21 missed, 300 total, 93.0% blocked. It did not test forged approval handoffs. This is a scoped reported result, not a live-product ranking or universal security guarantee.*

That fixture did not test whether a child agent would accept a forged upstream grant. Blocking malicious tool arguments and verifying the original user's authorization answer different questions. The fixture is not evidence that the proposed authorization checklist has been evaluated end to end.

## Distinguish the earlier composition-safety usage

ChainCaps, first submitted in May 2026, uses “permission laundering” for individually permitted tool calls composing into an unauthorized end-to-end effect [5]. It predates my July post.

The claimed-approval handoff here is distinct: the receiving workflow turns a statement about authorization into authority. Neither a claim to coin the term nor a claim that the two mechanisms are identical is needed to explain the boundary.

Delegation can move work while preserving the limits of the original grant. Before a privileged action, verify that a trusted record authorizes this actor, this action, this resource and this destination within scope, here and now.

## Sources

1. [Arun Sanna, July 22, 2026](https://x.com/thisiz_A/status/2079905309959594148)
2. [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
3. [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
4. [OWASP Top 10 for Agentic Applications 2026, ASI03](https://genai.owasp.org/download/52117/)
5. [ChainCaps, arXiv:2605.26542](https://arxiv.org/abs/2605.26542)
6. [Microsoft AI agent shared responsibility model](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent)

Evaluation provenance: retained November 2025 AgentMesh experiment records. Workflow and delegation provenance: retained September 2026 probes. These historical records support the scoped statements above; no new benchmark or live-system test is claimed.
