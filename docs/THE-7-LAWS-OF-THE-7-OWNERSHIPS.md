# The 7 Laws of the 7 Ownerships

## Why this exists

This project is built around one central belief:

**if ownership is unclear, the system will eventually lie about what it is.**

Most architectural decay does not start when code is written.
It starts when responsibility drifts.

A layer begins carrying meaning it was never meant to own.
A bridge becomes a governor.
A storage system starts quietly defining truth.
A host layer becomes a junk drawer.
A workflow engine starts pretending it owns the objects it merely uses.

This file exists to prevent that.

It defines:

* the **7 Ownerships**: the seven major ownership territories that together are meant to span the whole system
* the **7 Laws**: the rules for deciding what belongs where, how those owners interact, and how architectural purity is protected over time

These are not naming preferences.
They are structural rules for preserving truth, scale, and clarity.

---

# Part I - The 7 Ownerships

## 1. Framework

### What it is

Framework is the **host-level substrate**.

It owns the structural conditions that allow the whole system to exist and operate at all.

Framework owns:

* startup and shutdown
* lifecycle bootstrapping
* composition and registration
* foundational contracts and invariants
* host-level identity, health, diagnostics, config, validation
* minimal base protocols and types
* the bare substrate necessary for the host to stand up

### Why it is shaped this way

Framework is intentionally designed to be **small, strict, and impersonal**.

Why?

Because the center of the system is the most dangerous place to let ambiguity accumulate.

If Framework becomes:

* a convenience layer
* a shared utilities swamp
* a place where "things everyone needs" get dumped
* a silent owner of cross-domain logic

then the system loses its ability to explain itself.

Framework is shaped narrowly because the substrate must remain pure.
Its purpose is not to do interesting work.
Its purpose is to make **other owners possible without becoming them**.

### What failure mode this shape prevents

This shape prevents:

* central blob growth
* host-layer semantic drift
* "shared logic" becoming hidden ownership
* every domain quietly depending on a vague god-layer

### What it explicitly does not own

Framework does **not** own:

* business meaning
* domain meaning
* package meaning
* agent behavior
* environment logic
* execution semantics
* storage meaning

Framework is structure, not authorship.

---

## 2. Integration Layer

### What it is

Integration Layer is the **governed boundary for external crossing**.

It owns how things enter and leave the system from the outside world.

Integration owns:

* inbound normalization
* outbound shaping and dispatch
* external endpoint selection
* protocol adaptation
* safe re-intake of external results
* external crossing rules

### Why it is shaped this way

Integration is shaped as a **boundary owner** because external crossing is a real category of work that is neither domain meaning nor mere transport.

The system must be able to:

* speak to outside things
* receive from outside things
* reshape outside data into internal form
* reshape internal intent into outside-compatible form

without letting the outside world distort internal ownership.

Integration is deliberately separated because the system needs a place that owns the crossing itself while remaining neutral about the semantic meaning of what crosses.

### What failure mode this shape prevents

This shape prevents:

* external APIs becoming hidden domain owners
* connectors smuggling semantics into the wrong layer
* inbound/outbound protocol handling being scattered through every domain
* external crossing logic being confused with internal object truth

### What it explicitly does not own

Integration does **not** own:

* the meaning of the thing being crossed for
* internal package ontology
* agent semantics
* environment semantics
* storage semantics

It owns the crossing, not the crossed-for thing.

---

## 3. Capability Platform

### What it is

Capability Platform is the **semantic owner of first-class packageable capability objects**.

It owns the meaning and lifecycle of capabilities as governed objects.

Capability Platform owns:

* what a capability/package is
* package structure and surfaces
* source truth of capability implementation
* validation
* publish
* history and rollback meaning
* published forms
* capability-specific observability
* capability-specific gating and policy

### Why it is shaped this way

Capability Platform is shaped as a **platform** rather than a mere folder of functions because packageable objects are not just code.

Once something becomes first-class and packageable, it needs:

* lifecycle
* source truth
* published/read-only states
* observability
* version/history
* rollback
* gates
* multiple surfaces for multiple consumers

That is more than "a function."
That is a governed object domain.

This ownership is shaped this way because first-class packageable things require a real semantic owner that can define:

* what they are
* how they change
* how they are exposed
* how they are published
* how they are controlled

### What failure mode this shape prevents

This shape prevents:

* capabilities being reduced to loose scripts or raw functions
* consumers quietly becoming the owners of package meaning
* publish/history/gating logic being smeared across routes or workflows
* package truth being confused with storage records or runtime projections

### What it explicitly does not own

Capability Platform does **not** own:

* downstream workflow semantics
* consumer retrieval mechanics
* execution semantics outside its boundary
* durable custody itself
* external transport

It owns capability meaning, not every use of capability outputs.

---

## 4. Agents Domain

### What it is

Agents Domain is the ownership area for **bounded operating entities**.

These are not generic "agents" in the casual market sense.
They are resident digital operators with continuity, remit, roles, internal policy, permissions, workflows, and outputs.

Agents own:

* agent identity
* agent remit
* agent workflows
* agent-side policy and governance
* decision flow
* tool/capability use after access is granted
* agent outputs and action logic

### Why it is shaped this way

Agents are shaped as a unified ownership because **doing** belongs together.

If an agent is a real operator, then the following things are not truly separate owners:

* what it is for
* how it chooses
* what workflows it runs
* how it uses granted capabilities
* how it behaves over time

Those all belong to the bounded doer.

This area is shaped around the idea that the actor should own its own operating logic.
Splitting workflow, role, permission use, and action into fake separate owners would fracture a single real entity into abstract pieces that do not actually exist independently.

### What failure mode this shape prevents

This shape prevents:

* workflows floating ownerlessly through the system
* agents becoming mere wrappers around somebody else's logic
* capability-use rules being confused with capability meaning
* bounded actors dissolving into task soup

### What it explicitly does not own

Agents do **not** own:

* what capabilities are
* package ontology
* environment ontology
* external integration ownership
* storage meaning

Agents are doers, not tool ontology owners.

---

## 5. Execution Environment Domain

### What it is

Execution Environment Domain owns **bounded operating contexts**.

An environment is a first-class place in which work occurs under specific rules, state, lifecycle, and conditions.

Environment Domain owns:

* environment structure
* environment rules
* environment state
* environment lifecycle
* readiness conditions
* the fact that a given environment is a real operating context

Examples can include:

* workspaces
* editors
* review surfaces
* capability environments
* other bounded operational places

### Why it is shaped this way

This ownership exists because **places are real**.

A workspace is not merely UI.
A review area is not merely a page.
An editor is not merely a view.

An environment is a bounded context with:

* rules
* state
* constraints
* readiness
* permitted actions

It must be architected as a real owned thing, otherwise UI projections start pretending to own the places they merely render.

This area is shaped this way to preserve the distinction between:

* the environment as truth
* the UI as one possible surface over that truth

### What failure mode this shape prevents

This shape prevents:

* screen layouts becoming semantic owners
* context/state/rules being scattered through view code
* real operating places collapsing into route/page abstractions
* environment identity being lost under UI convenience

### What it explicitly does not own

Environment Domain does **not** own:

* capability meaning
* agent identity/remit
* external crossing semantics
* durable custody meaning
* host substrate meaning

It owns operating contexts, not everything that happens inside them.

---

## 6. Coordination Layer

### What it is

Coordination Layer is the **thin bridge of handoff and routing** between true owners.

It owns:

* domain-to-domain handoff seams
* routing
* transport metadata
* orchestration glue that has no semantic ownership of its own

### Why it is shaped this way

Coordination is intentionally shaped to be **thin and non-sovereign**.

Why?

Because systems frequently let "the thing that connects" become "the thing that rules."

That is architectural poison.

Something has to bridge:

* consumers and Capability Platform
* domains and domains
* requests and owners

But the bridge is not supposed to decide what the thing **means**.

This area is shaped this way to preserve that distinction:

* bridges carry
* owners define

### What failure mode this shape prevents

This shape prevents:

* transport seams becoming semantic owners
* "orchestration" becoming a hidden blob layer
* multi-domain convenience logic swallowing true ownership
* handoff code becoming the place where truth is secretly decided

### What it explicitly does not own

Coordination does **not** own:

* capability meaning
* agent meaning
* environment meaning
* storage meaning
* host-level truth

A bridge is not a kingdom.

---

## 7. Storage Substrate

### What it is

Storage Substrate owns **durable custody**.

It keeps records and artifacts alive, retrievable, and addressable over time.

Storage owns:

* persistence mechanics
* indexing
* retrieval
* durable addressing
* artifact and record custody

### Why it is shaped this way

Storage is shaped as a **substrate** because it must remain beneath semantic meaning, not above it.

The reason for this design is simple:

the thing that keeps a record should not become the thing that defines what the record means.

Otherwise:

* tables become ontology
* schemas become domain owners
* artifacts silently redefine the objects they merely store

Storage is intentionally separated from semantic ownership so that domains can define meaning while Storage preserves that meaning durably.

### What failure mode this shape prevents

This shape prevents:

* DB/schema-first ownership drift
* persistence mechanics silently becoming domain truth
* artifact custody being mistaken for semantic authorship
* storage models dictating domain models

### What it explicitly does not own

Storage does **not** own:

* package meaning
* publish meaning
* policy meaning
* history meaning
* lifecycle meaning
* routing meaning

It owns custody, not interpretation.

---

# Part II - The 7 Laws

## Law 1: Ownership is determined by meaning, not proximity

A thing belongs to the area that defines what it **is**, not to the area that happens to be touching it.

A router touching capability data does not own capability meaning.
Storage holding package artifacts does not own package meaning.
Coordination carrying an agent request does not own the request's semantics.

Touch is not ownership.
Meaning is ownership.

---

## Law 2: Crossing does not imply ownership

When something passes across a seam, the seam does not become the owner of the thing.

Integration does not own what it carries.
Coordination does not own what it bridges.
Storage does not own what it persists.

A crossing is a crossing.
Ownership remains with the true semantic owner.

---

## Law 3: The center must stay pure

The more central a layer is, the more dangerous it is to pollute it.

Framework, Coordination, and other shared-looking areas must not become junk drawers for broadly useful logic.

If the center becomes impure:

* ambiguity accumulates
* boundaries blur
* ownership becomes unverifiable
* the whole system becomes harder to reason about than to build

Purity at the center protects truth everywhere else.

---

## Law 4: Prefer extension over centralization

If something can live as:

* a package
* an adapter
* a capability
* a domain-owned component
* an environment-owned component

without harming system integrity, it should not be pulled inward into the center.

Core is the exception, not the destination.

This law exists because centralization is the default temptation of growing systems.

---

## Law 5: Owners define meaning; other layers may only project, transport, store, or consume

A true owner defines what something means.

Other layers may:

* project it
* transport it
* persist it
* request it
* consume it

But they must not silently become semantic co-owners.

This law protects against hidden authorship drift.

---

## Law 6: Boundaries outrank convenience

If convenience conflicts with clean ownership, convenience loses.

Almost all structural corruption begins as:

* "just for now"
* "just keep the old path"
* "just let this layer do it"
* "just patch compatibility"

Those shortcuts become architecture if left alive.

This system is built on the opposite principle:

**it is better to break a connection now than to preserve a lie in the ownership model.**

---

## Law 7: New inventory must not require rebuilding the factory

A healthy system does not require structural rewrites every time a new instance appears.

New:

* packages
* agents
* environments
* tools
* forms
* surfaces

should be inventory changes, not factory changes.

The backend should know the rules of the owner domain, not the specifics of every future object it may contain.

That is what makes clean scale possible.

---

# Part III - How to use this

When placing a responsibility, ask:

1. What is this thing, semantically?
2. Which ownership defines what it is?
3. Am I placing it here because it belongs here, or because it is convenient?
4. Am I mistaking transport, projection, or storage for true ownership?
5. Will this choice preserve boundaries as the system grows?
6. Am I adding inventory, or secretly rebuilding the factory?

If there is doubt, bias toward the more specific true owner, not the more central convenient one.

---

# Part IV - Practical ownership order

When ownership is unclear, resolve it outward-in, not inward-out.

A useful priority is:

1. **Integration Layer** - if it is fundamentally about external crossing
2. **Capability Platform** - if it is fundamentally about first-class packageable objects
3. **Agents Domain** - if it is fundamentally about bounded doers, remit, workflow, or capability use
4. **Execution Environment Domain** - if it is fundamentally about a bounded operating place/context
5. **Coordination Layer** - if it is only a handoff or routing seam
6. **Storage Substrate** - if it is only durable custody
7. **Framework** - only if it is truly host-level substrate or invariant material

This order exists to stop the center from swallowing everything.

---

# Final declaration

The point of this architecture is not to create categories for their own sake.
The point is to preserve truth.

A system with unclear ownership will eventually:

* duplicate meaning
* fuse layers
* hide authority
* scale badly
* become harder to repair than to replace

The 7 Ownerships define where meaning lives.
The 7 Laws define how meaning is protected.

Everything in this project is intended to be built under those rules.
