---
name: validate-feature
description: Map feature acceptance criteria to actual test and runtime evidence, including platform and hardware gaps. Use when planning verification or deciding whether implementation, a bug fix, or a prototype is proven; use verify-tests separately for test quality.
metadata:
  featurekit-version: "0.10.1"
---

# Validate Feature

Establish what the evidence proves in the project's actual runtime. The primary agent owns the overall completion decision; neither a worker result nor a successful build makes that decision.

## Select Proof

1. Read the approved scope or prototype question and relevant `docs/agents/verification.md`, stack/security guidance, and available commands. Discover missing facts from manifests, CI and existing tests before asking. Do not assume runtime validation means a browser.
2. Map each affected acceptance criterion to the narrowest adequate evidence. Distinguish static checks, behavioral tests, integration/runtime checks and manual/physical evidence. During planning, record required environments and known gaps; planning a check is not executing it.
3. Select affected platforms based on the requirement and changed path. Shared mobile/native code may need Android and iOS; justify exclusions. A docs-only edit does not require launching every runtime.
4. Reuse evidence only when its code, configuration, environment and dependencies still apply. Record the commit plus relevant working-tree changes or another reproducible snapshot. Worker evidence from before integration cannot establish the final tree without checking whether the integration invalidated it.

| Project / change | Evidence to consider |
| --- | --- |
| Web UI | Relevant browser interaction/state/accessibility and service behavior; screenshots alone may not prove the interaction. |
| Backend/service/job | Real protocol, process, data or queue behavior with suitable fixtures; no browser needed unless the requirement crosses a UI. |
| React Native / Expo | Affected Android/iOS emulator, simulator or device and the app build/runtime that supports the native modules. A web preview or Expo runtime missing a module does not prove native behavior. |
| Native iOS / Android | Applicable OS/version, app build, lifecycle and platform integration; record simulator/emulator vs physical device. |
| Desktop | Relevant OS and application process/window/system integration. |
| Hardware/platform behavior | Decide what automation/simulation can prove and what needs a physical device or real service. NFC, camera, Bluetooth, biometrics, permissions, notifications, keyboards, lifecycle, location and native modules may expose gaps. |

## Run And Evaluate

- Run narrow checks first, then required broader checks once the change is stable. Use direct tools for deterministic commands; apply `orchestrate-work` only when substantive investigation or independent execution is useful.
- Use `tdd` for implementation and regression loops, `verify-tests` for weak/generated/high-risk tests, and the existing security/review skills for their gates. This skill does not create a second test-quality or security-review process.
- Compare observed results with acceptance criteria, including relevant negative/error paths. Test quality matters: a mock can prove a boundary contract without proving real hardware behavior.
- Do not invent commands, dependencies, devices, credentials or manual results. If the necessary runtime is unavailable, mark the criterion `blocked` or `not run`, explain the prerequisite and exact remaining procedure, and continue independent checks. Obtain actual human/device evidence before recording a manual pass.
- Report a failed check as `failed`. Separate an established unrelated baseline failure with evidence; do not reclassify a new failure as unrelated merely to finish.

## Evidence And Completion

Extend the existing verification section or slice ledger; create no separate report for a trivial change unless useful:

| Criterion | Code / runtime / platform | Command or procedure | Result | Evidence / limitation |
| --- | --- | --- | --- | --- |
| Observable requirement | Revision + relevant working changes; device/simulator where applicable | Actual check, or remaining procedure | passed / failed / blocked / not run | Output/artifact or observed result; what remains unproven |

Keep planned checks separate from executed checks. A successful build proves buildability, tests prove their exercised behavior, and a simulator proves only what it represents. Do not promote one into stronger evidence.

Conclude with `validated`, `failed`, or `validation incomplete`, tied to the acceptance criteria. Implementation can be finished while validation is incomplete. The primary can call the feature complete only when its required criteria have adequate current evidence; otherwise carry the gaps and owner/next action into `handoff`. A user may explicitly defer a check, but that does not turn it into a pass or a fully validated claim.
