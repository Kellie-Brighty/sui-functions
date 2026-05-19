# Shared Workspace Projects: Multi-Entity Orchestration on Sui

Sui-Functions utilizes an on-chain **Shared Workspace Object** pattern to enable decentralized, automated, and secure serverless executions. This document details why this model was chosen, its product value, and how on-chain security is enforced.

---

## 1. The Architectural Shift: Owned vs. Shared Objects

In Sui's object model, objects can be either **owned** (accessible only by a single private key signature) or **shared** (accessible by any transaction, with logic-level access control).

### The Limitation of Owned Workspaces
Previously, when a workspace project was created, it was transferred directly to the creator's wallet as an owned object:
```rust
transfer::public_transfer(project, owner);
```
Under this model, **only the owner** could sign transactions referencing that project object. When the off-chain **Runner Daemon** (which uses a separate hot-wallet keypair for automated execution and gas payment) attempted to call `submit_result` or `confirm_verification`, the transaction failed with an on-chain ownership error:
`Transaction was not signed by the correct sender`

### The Solution: Shared Projects
To support automation where third-party or platform-managed runners sign and pay for gas to write back function execution results, the workspace project is shared upon creation:
```rust
transfer::public_share_object(project);
```

---

## 2. Product & Developer Value

The Shared Object model unlocks significant functional and economic benefits for both platform developers and enterprise clients:

* **Zero-Configuration Managed Mode**: Users can delegate function execution to the default Sui-Functions shared runner fleet. The platform runner executes the code sandboxes and pays on-chain gas fees automatically, offering a true Web2-like serverless experience.
* **Shared Runner Fleets (VPS Optimization)**: Platforms can host a single running daemon on a single VPS server to handle execution tasks across hundreds of different user projects. There is no longer a need for "VPS sprawl" or spawning new virtual machines for every individual project.
* **Granular Sovereignty (Self-Hosting)**: Users who require absolute privacy and dedicated compute can switch their workspace to **Self-Hosted** mode, update their project's authorized `runner_address` on-chain, and point it to a runner they run on their own VPS.

---

## 3. Cryptographic Security Model

Sharing a project object does not compromise security. While anyone can include a shared project object in a transaction block, the Sui Move smart contract strictly guards all mutating entry points using logical assertions:

### On-Chain Access Controls
| Move Endpoint | Authorized Caller | Security Enforcement |
| :--- | :--- | :--- |
| `set_runner_address` | **Project Owner** | `assert!(project.owner == sender, ENotOwner);` |
| `register_function` | **Project Owner** | `assert!(project.owner == sender, ENotOwner);` |
| `update_function` | **Project Owner** | `assert!(project.owner == sender, ENotOwner);` |
| `delete_function` | **Project Owner** | `assert!(project.owner == sender, ENotOwner);` |
| `delete_project` | **Project Owner** | `assert!(project.owner == sender, ENotOwner);` |
| `confirm_verification` | **Authorized Runner** | `assert!(project.runner_address == sender, ENotAuthorizedRunner);` |
| `submit_result` | **Authorized Runner** | `assert!(project.runner_address == sender, ENotAuthorizedRunner);` |

### Result Spoofing Protection
Because the `submit_result` function enforces that the transaction signer matches the project's configured `runner_address`, malicious actors cannot spoof execution outputs, inject false inputs, or hijack event logs. If an unauthorized wallet attempts to call `submit_result` for a workspace, the transaction aborts and reverts on-chain.

---

## 4. Off-Chain Optimization: Runner Event Filtering
To prevent shared runners from wasting CPU and network bandwidth downloading/executing functions for projects where they are not authorized, the runner daemon implements a local verification check before booting the V8 sandbox:

```typescript
async function isRunnerAuthorized(projectId: string): Promise<boolean> {
    if (!keypair) return false;
    const runnerAddress = keypair.toSuiAddress();
    
    // Check cached authorization to avoid RPC spam
    const cached = projectRunnerCache.get(projectId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.runnerAddress === runnerAddress;
    }

    try {
        const projectObj = await client.getObject({ id: projectId, options: { showContent: true } });
        const configuredRunner = (projectObj.data?.content as any)?.fields?.runner_address;
        
        if (configuredRunner) {
            projectRunnerCache.set(projectId, { runnerAddress: configuredRunner, timestamp: Date.now() });
            return configuredRunner === runnerAddress;
        }
    } catch (e) {
        console.warn("[Listener] Failed to verify runner authorization:", e.message);
    }
    return false;
}
```
This local cache optimization guarantees maximum execution throughput and minimizes gas wastage.
