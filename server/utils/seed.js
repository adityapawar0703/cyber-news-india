import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Article from '../models/Article.js';
import VisitorStat from '../models/VisitorStat.js';
import Subscriber from '../models/Subscriber.js';
import { calculateReadingTime } from './readingTime.js';

const daysAgo = (days, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
};

const SEED_ARTICLES = [
  {
    title: 'Critical Linux Kernel eBPF Verifier Zero-Day Exploited in Targeted Cloud Escapes',
    slug: 'critical-linux-kernel-ebpf-verifier-zero-day-cloud-escapes',
    description:
      'Security researchers confirm active exploitation of CVE-2026-21409, a bounds-tracking flaw in the eBPF JIT compiler enabling unprivileged container escapes across multi-tenant Kubernetes clusters.',
    category: 'Vulnerabilities & CVEs',
    tags: ['Linux Kernel', 'eBPF', 'Zero-Day', 'Kubernetes', 'CVE-2026-21409'],
    cveId: 'CVE-2026-21409',
    severity: 'Critical',
    featuredImage: '/uploads/seed/hero-zero-day.jpg',
    featuredImageCaption:
      'Kernel memory isolation boundaries under inspection after widespread telemetry flagged anomalous eBPF map allocations.',
    author: {
      name: 'Elena Vance',
      role: 'Chief Vulnerability Correspondent',
      bio: 'Reports on kernel internals, zero-day disclosure, and cloud hypervisor security.',
    },
    status: 'published',
    isFeatured: true,
    isBreaking: true,
    views: 18420,
    publishedAt: daysAgo(0, 3),
    content: `
<p>A critical vulnerability inside the Linux kernel's extended Berkeley Packet Filter (eBPF) verifier is actively being weaponized against cloud-native workloads, according to joint advisories published early this morning by kernel maintainers and three independent threat intelligence teams.</p>

<p>Tracked as <strong>CVE-2026-21409</strong> with a CVSS v4.0 base score of <strong>9.3</strong>, the flaw resides in 32-bit scalar register range refinement when speculative branch pruning interacts with nested <code>BPF_ALU64</code> shift sequences. Under crafted bytecode patterns, the verifier underestimates the maximum offset of a pointer into an eBPF map value, allowing out-of-bounds kernel memory reads and writes from within restricted containers.</p>

<h2>How the Exploitation Chain Unfolds</h2>
<p>Unlike legacy kernel bugs that required direct root privileges, telemetry captured from compromised clusters shows attackers chaining an initial web-application SSRF foothold into local container execution, then loading a compact 180-instruction eBPF program where <code>kernel.unprivileged_bpf_disabled</code> remained unset or where <code>CAP_BPF</code> was inherited by observability sidecars.</p>

<blockquote>
  <p>"We observed deterministic container-to-host privilege escalation in under 400 milliseconds across unpatched 6.6 LTS and 6.12 kernels. Because the payload never drops a traditional binary to disk, legacy EDR agents missed the initial host pivot completely."</p>
</blockquote>

<h3>Affected Kernel Branches & Verification</h3>
<ul>
  <li><strong>Linux 6.1.x through 6.1.124</strong> — Vulnerable when unprivileged eBPF is enabled or delegated via <code>CAP_BPF</code>.</li>
  <li><strong>Linux 6.6.x through 6.6.78</strong> — Confirmed active exploitation in containerized CI/CD runners.</li>
  <li><strong>Linux 6.12.x through 6.12.14</strong> — Patched in upstream commit <code>b8f42e9d1a0c</code>.</li>
</ul>

<h2>Immediate Detection & Hardening Controls</h2>
<p>Operators unable to reboot production nodes immediately can drastically reduce exposure by disabling unprivileged eBPF syscalls at runtime and auditing workload capabilities across every Kubernetes namespace.</p>

<pre><code class="language-bash"># 1. Restrict unprivileged eBPF immediately on Linux hosts
sudo sysctl -w kernel.unprivileged_bpf_disabled=2
echo "kernel.unprivileged_bpf_disabled = 2" | sudo tee /etc/sysctl.d/99-hardening-bpf.conf

# 2. Audit Kubernetes pods holding CAP_BPF or CAP_SYS_ADMIN
kubectl get pods -A -o json | jq -r '
  .items[] | select(
    .spec.containers[].securityContext.capabilities.add[]? |
    test("BPF|SYS_ADMIN")
  ) | "\(.metadata.namespace)/\(.metadata.name)"
'</code></pre>

<h3>Runtime Telemetry Signature</h3>
<p>Detection engineers should monitor for non-standard processes invoking the <code>bpf()</code> syscall with <code>BPF_PROG_LOAD</code> outside verified observability daemons (such as Cilium, Falco, or Datadog agents):</p>

<pre><code class="language-yaml">rule: Suspicious_Container_BPF_Load
desc: Detect unexpected eBPF program loading inside application containers
condition: >
  evt.type = bpf and
  container.id != host and
  not proc.name in (cilium-agent, falco, otelcol, datadog-agent)
output: "Anomalous eBPF load in container (pod=%k8s.pod.name proc=%proc.name cmd=%proc.cmdline)"
priority: CRITICAL</code></pre>

<h2>Patch Timeline and Vendor Response</h2>
<p>Major cloud providers have rolled out live-patched host images for managed node groups, and Red Hat, Canonical, and Debian have all published expedited kernel updates. Security teams are advised to prioritize internet-facing workloads, shared build agents, and multi-tenant inference clusters within the next 24 hours.</p>
`,
  },
  {
    title: 'Inside the Meridian Cloud Breach: How Stolen OIDC Federation Tokens Exposed 42 Million Records',
    slug: 'meridian-cloud-breach-stolen-oidc-federation-tokens',
    description:
      'A forensic reconstruction reveals how a compromised CI/CD build runner silently minted short-lived federated cloud identities over eleven weeks before anomaly detection intervened.',
    category: 'Data Breaches',
    tags: ['Data Breach', 'OIDC', 'Supply Chain', 'Cloud IAM', 'Forensics'],
    cveId: '',
    severity: 'High',
    featuredImage: '/uploads/seed/breach-datacenter.jpg',
    featuredImageCaption:
      'Enterprise telemetry logs revealed low-and-slow exfiltration disguised as routine automated disaster-recovery snapshots.',
    author: {
      name: 'Marcus Sterling',
      role: 'Investigative Reporter',
      bio: 'Investigates large-scale corporate breaches, extortion ecosystems, and incident response.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: true,
    views: 14890,
    publishedAt: daysAgo(0, 7),
    content: `
<p>When Meridian Health Systems disclosed an unauthorized data access event earlier this week, initial regulatory filings offered few technical specifics. Now, an independent incident review shared with <strong>Cyber India News</strong> sheds light on a textbook modern identity intrusion: no static API keys were stolen, no passwords were phished, and multi-factor authentication was never bypassed.</p>

<p>Instead, the adversary abused overly broad <strong>OpenID Connect (OIDC) trust policies</strong> bridging Meridian's self-hosted CI/CD pipeline to its primary cloud analytics environment.</p>

<h2>The Anatomy of a Stateless Identity Intrusion</h2>
<p>Modern engineering teams widely adopt OIDC workload federation to eliminate long-lived secrets. While this eliminates hardcoded credentials, misconfigured subject (<code>sub</code>) claims can quietly grant any repository branch—or compromised pull request—the ability to assume production IAM roles.</p>

<ol>
  <li><strong>Initial Foothold:</strong> A third-party build action pinned to a mutable Git tag was silently overwritten with a 22-line token harvester.</li>
  <li><strong>Token Exchange:</strong> The harvester requested an OIDC JWT from the build orchestrator and exchanged it via <code>AssumeRoleWithWebIdentity</code> for temporary 60-minute cloud credentials.</li>
  <li><strong>Lateral Discovery:</strong> Because the trust policy matched <code>repo:meridian-org/*</code> without branch restrictions, the attacker pivoted into production object storage read roles.</li>
  <li><strong>Low-and-Slow Exfiltration:</strong> Over 78 days, compressed Parquet partitions were mirrored to attacker-controlled buckets in the same cloud region, avoiding egress spike alerts.</li>
</ol>

<h2>The Misconfiguration vs. Hardened Policy</h2>
<p>Below is a sanitized comparison illustrating how a single wildcard inside an IAM trust condition turned a staging runner into a production master key:</p>

<pre><code class="language-json">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.example" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.example:aud": "sts.amazonaws.com",
          "token.actions.example:sub": "repo:meridian-org/analytics-etl:environment:production"
        }
      }
    }
  ]
}</code></pre>

<blockquote>
  <p>"Short-lived tokens do not mean short-lived risk. If your trust policy trusts an entire GitHub organization instead of a protected deployment environment, an attacker can mint fresh tokens indefinitely."</p>
</blockquote>

<h2>Key Takeaways for Security Architects</h2>
<ul>
  <li>Pin every third-party CI/CD action and container base image to an immutable full-length SHA-256 commit digest.</li>
  <li>Enforce strict <code>environment:production</code> and exact branch claims on every federated IAM role.</li>
  <li>Enable VPC endpoint policies and bucket-level anomaly baselines to flag cross-account reads even within the same region.</li>
</ul>
`,
  },
  {
    title: 'Prompt-to-Shell: Researchers Demonstrate Indirect Prompt Injection Chains Against Autonomous Coding Agents',
    slug: 'prompt-to-shell-indirect-prompt-injection-autonomous-coding-agents',
    description:
      'A new benchmark study reveals how adversarial comments hidden inside open-source issue trackers and dependency READMEs can hijack AI developer assistants into executing unauthorized local commands.',
    category: 'Artificial Intelligence',
    tags: ['AI Security', 'Prompt Injection', 'LLM', 'AppSec', 'Agentic AI'],
    cveId: '',
    severity: 'High',
    featuredImage: '/uploads/seed/ai-security.jpg',
    featuredImageCaption:
      'Agentic AI workflows blur the traditional boundary between untrusted external data and privileged developer instructions.',
    author: {
      name: 'Dr. Priya Nair',
      role: 'AI Security Editor',
      bio: 'Researches adversarial machine learning, LLM sandboxing, and automated vulnerability discovery.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: true,
    views: 13240,
    publishedAt: daysAgo(1, 2),
    content: `
<p>As engineering organizations embed autonomous AI coding agents directly into local terminals and continuous integration pipelines, a classic security boundary has quietly dissolved: the line between <em>untrusted data</em> and <em>executable control instructions</em>.</p>

<p>In a peer-reviewed paper published today by the Applied Offensive AI Lab, researchers tested nine leading agentic developer tools against a suite of 140 realistic repository artifacts—including GitHub issue descriptions, compiler logs, and transitive dependency documentation—containing stealthy indirect prompt injections.</p>

<h2>Why Context Isolation Fails in Practice</h2>
<p>When an autonomous agent fetches an external stack trace or reads an untrusted pull request to diagnose a bug, that external text enters the same attention window as the developer's system directives. Even models hardened with instruction hierarchy fine-tuning showed a <strong>34% susceptibility rate</strong> when adversarial payloads were framed as synthetic unit-test fixtures or linter configuration hints.</p>

<h3>Defense-in-Depth Architecture for Agentic Tooling</h3>
<p>Security leaders emphasize that prompt filtering alone cannot solve what is fundamentally a capability-control problem. Robust deployments enforce deterministic OS-level sandboxing around tool execution:</p>

<pre><code class="language-python">from dataclasses import dataclass
import shlex

ALLOWED_READ_BINARIES = {"git", "rg", "pytest", "npm"}

@dataclass
class PolicyDecision:
    allowed: bool
    reason: str

def evaluate_agent_command(raw_cmd: str, workspace_root: str) -> PolicyDecision:
    tokens = shlex.split(raw_cmd)
    if not tokens:
        return PolicyDecision(False, "Empty command rejected")
    binary = tokens[0]
    if binary not in ALLOWED_READ_BINARIES:
        return PolicyDecision(False, f"Binary '{binary}' requires explicit human approval")
    if any(flag in tokens for flag in ("--upload-pack", "-c", "eval")):
        return PolicyDecision(False, "Dangerous execution flag blocked by policy")
    return PolicyDecision(True, f"Permitted within {workspace_root}")</code></pre>

<ul>
  <li><strong>Zero-Trust Egress:</strong> Run autonomous agent tool invocations inside network-isolated containers with deny-by-default outbound firewall rules.</li>
  <li><strong>Human-in-the-Loop Gates:</strong> Require explicit cryptographic or interactive approval before any state-mutating shell command, credential read, or external HTTP request.</li>
  <li><strong>Provenance Tagging:</strong> Visually distinguish model actions triggered after ingesting third-party web or issue-tracker content.</li>
</ul>
`,
  },
  {
    title: 'Bypassing Modern Hardware Root-of-Trust via Voltage Glitching on Commercial IoT SoCs',
    slug: 'bypassing-hardware-root-of-trust-voltage-glitching-iot-socs',
    description:
      'A step-by-step hardware red-team teardown detailing fault-injection timing windows, crowbar MOSFET rigs under $200, and silicon-level countermeasures for secure bootloaders.',
    category: 'Ethical Hacking',
    tags: ['Hardware Hacking', 'Fault Injection', 'Secure Boot', 'Embedded', 'Red Team'],
    cveId: '',
    severity: 'Medium',
    featuredImage: '/uploads/seed/ethical-hacking.jpg',
    featuredImageCaption:
      'Logic analyzer probes and sub-nanosecond crowbar circuitry targeting VDD_CORE decoupling rails.',
    author: {
      name: 'Devon K. Morales',
      role: 'Principal Red Team Analyst',
      bio: 'Specializes in hardware security, firmware reverse engineering, and adversary emulation.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 9810,
    publishedAt: daysAgo(1, 9),
    content: `
<p>Secure boot is routinely marketed as an unbreakable cryptographic guarantee for edge gateways, medical telemetry sensors, and industrial controllers. Yet in physical threat models where an adversary gains hands-on access to a deployed unit, cryptographic signatures are only as strong as the single conditional branch instruction that checks them.</p>

<p>Over the past four weeks, our hardware security lab evaluated six widely deployed ARM Cortex-M and RISC-V industrial SoCs using an open-source FPGA fault-injection controller and a low-inductance shunt MOSFET.</p>

<h2>Targeting the RSA Signature Verification Branch</h2>
<p>By capturing power-consumption side-channel traces over the core voltage rail (<code>VDD_CORE</code>), we pinpointed the exact clock cycle where the ROM bootloader finishes computing the SHA-256 digest of external SPI flash and evaluates the final comparison result.</p>

<p>Introducing a precisely timed 18-nanosecond voltage drop starves the instruction fetch pipeline just long enough to corrupt the conditional branch opcode without triggering the brown-out detector.</p>

<pre><code class="language-c">// Vulnerable single-check pattern frequently seen in ROM bootloaders
if (verify_ed25519_signature(fw_hdr, pubkey) == 0) {
    boot_application(fw_hdr->entry_point);
}

// Hardened redundant fault-resistant pattern
volatile uint32_t auth_state = 0x5A3C96C3;
if (verify_ed25519_signature(fw_hdr, pubkey) == 0xA5C3693C) {
    auth_state ^= 0xFFFFFFFF;
    random_jitter_delay();
    if (auth_state == 0xA5C3693C && verify_ed25519_signature(fw_hdr, pubkey) == 0xA5C3693C) {
        boot_application(fw_hdr->entry_point);
    }
}
trigger_tamper_lockdown();</code></pre>

<h2>Practical Mitigations for Embedded Engineers</h2>
<ul>
  <li>Avoid simple boolean <code>0</code> / <code>1</code> return codes for security-critical verification checks; use high Hamming-distance magic constants.</li>
  <li>Introduce hardware TRNG-driven random execution jitter between cryptographic verification and branch execution.</li>
  <li>Enable internal voltage-glitch detectors and active tamper meshes on mission-critical hardware revisions.</li>
</ul>
`,
  },
  {
    title: 'BlackBastion Ransomware Evolves: Rust-Based ESXi Encryptor Adopts Asynchronous io_uring Pipeline',
    slug: 'blackbastion-ransomware-rust-esxi-encryptor-io-uring',
    description:
      'Threat intelligence analysts dissect a new cross-compiled Rust variant capable of encrypting multi-terabyte virtual machine disks in minutes while evading legacy syscall monitors.',
    category: 'Malware & Ransomware',
    tags: ['Ransomware', 'Rust', 'ESXi', 'Threat Intelligence', 'YARA'],
    cveId: '',
    severity: 'Critical',
    featuredImage: '/uploads/seed/ransomware-threat.jpg',
    featuredImageCaption:
      'Hypervisor-targeted ransomware crews continue shifting toward memory-safe systems languages for rapid cross-platform deployment.',
    author: {
      name: 'Sora Takahashi',
      role: 'Threat Intelligence Lead',
      bio: 'Tracks financially motivated ransomware affiliates, malware engineering trends, and reverse engineering.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: true,
    views: 11640,
    publishedAt: daysAgo(2, 4),
    content: `
<p>A newly observed build of the <strong>BlackBastion</strong> ransomware family demonstrates a significant leap in offensive software engineering. Rewritten from C++ into statically linked Rust, the Linux/ESXi payload leverages intermittent ChaCha20 encryption paired with Linux's asynchronous <code>io_uring</code> submission queues to saturate NVMe storage arrays while bypassing traditional syscall-hooking monitors.</p>

<h2>Technical Analysis of the Encryptor</h2>
<p>Upon execution with administrative SSH access to a VMware ESXi host, the binary queries <code>esxcli vm process list</code>, cleanly terminates running virtual machines using the <code>--type=hard</code> flag to release file locks on <code>.vmdk</code> and <code>.vmem</code> volumes, and spawns worker threads pinned to physical CPU cores.</p>

<h3>Intermittent Encryption Strategy</h3>
<p>Rather than encrypting every byte of a 2-terabyte database image, BlackBastion encrypts 64 KB stripes separated by 512 KB untouched intervals—sufficient to render guest filesystems completely unrecoverable while accelerating full-host impact by nearly 7x.</p>

<pre><code class="language-yara">rule MAL_Ransom_BlackBastion_Rust_ESXi_2026 {
    meta:
        author = "Cyber India News Threat Lab"
        description = "Detects BlackBastion Rust ESXi encryptor binaries"
        severity = "critical"
    strings:
        $s1 = "esxcli vm process kill --type=hard --world-id=" ascii
        $s2 = ".bbastion_locked" ascii
        $s3 = "chacha20_uring_stripe_worker" ascii
        $s4 = "/vmfs/volumes/" ascii
    condition:
        uint32(0) == 0x464c457f and 3 of ($s*)
}</code></pre>

<h2>Defending Virtualization Infrastructure</h2>
<ul>
  <li>Isolate hypervisor management interfaces (vCenter, ESXi SSH, iDRAC/iLO) onto dedicated out-of-band management VLANs with phishing-resistant FIDO2 MFA.</li>
  <li>Disable SSH on ESXi hosts by default and enforce strict execInstalledOnly lockdown policies.</li>
  <li>Maintain immutable, air-gapped object-lock backups outside the Active Directory domain trust boundary.</li>
</ul>
`,
  },
  {
    title: 'Zero-Trust Service Mesh at Scale: Preventing East-West Lateral Movement Across Multi-Region Clouds',
    slug: 'zero-trust-service-mesh-preventing-east-west-lateral-movement',
    description:
      'How modern platform security teams combine SPIFFE workload identities, mTLS 1.3, and Layer-7 authorization policies to contain perimeter compromises.',
    category: 'Cloud & Network Security',
    tags: ['Zero Trust', 'SPIFFE', 'mTLS', 'Cloud Security', 'Kubernetes'],
    cveId: '',
    severity: 'Medium',
    featuredImage: '/uploads/seed/cloud-network.jpg',
    featuredImageCaption:
      'Cryptographic workload identity replaces fragile IP-based perimeter allowlists in ephemeral cloud topologies.',
    author: {
      name: 'Liam O\'Connor',
      role: 'Cloud Architecture Editor',
      bio: 'Covers cloud-native security architecture, network telemetry, and distributed infrastructure.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 8420,
    publishedAt: daysAgo(3, 1),
    content: `
<p>Perimeter firewalls were built for a world of static IP addresses and predictable datacenter walls. In multi-region Kubernetes environments where microservices autoscale every few seconds, IP-based network rules quickly degrade into sprawling allowlists that attackers traverse with ease.</p>

<p>Leading infrastructure security teams are replacing implicit network trust with cryptographic workload identity anchored in <strong>SPIFFE/SPIRE</strong> and enforced automatically via ambient service meshes.</p>

<h2>Enforcing Least-Privilege Layer-7 Intent</h2>
<p>Instead of permitting an entire subnet to reach a payment ledger database, an authorization policy binds exact cryptographic identities to specific HTTP methods and paths:</p>

<pre><code class="language-yaml">apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: ledger-strict-access
  namespace: payments
spec:
  selector:
    matchLabels:
      app: ledger-service
  action: ALLOW
  rules:
    - from:
        - source:
            principals:
              - "cluster.local/ns/checkout/sa/settlement-worker"
      to:
        - operation:
            methods: ["POST"]
            paths: ["/v2/entries/commit"]</code></pre>

<h2>Operational Rollout Blueprint</h2>
<ol>
  <li><strong>Shadow Mode First:</strong> Enable permissive mTLS and collect 14 days of L7 service-to-service flow graphs before writing deny policies.</li>
  <li><strong>Short-Lived SVIDs:</strong> Rotate X.509 workload certificates automatically every 60 minutes to neutralize stolen memory artifacts.</li>
  <li><strong>Egress Gateways:</strong> Funnel all outbound third-party API calls through auditable egress proxies to catch C2 beaconing immediately.</li>
</ol>
`,
  },
  {
    title: 'Post-Quantum TLS 1.3 Adoption Crosses 35% of Global Web Traffic as NIST ML-KEM Standards Stabilize',
    slug: 'post-quantum-tls-adoption-nist-ml-kem-standards',
    description:
      'Major browsers, CDNs, and enterprise VPN vendors accelerate hybrid X25519MLKEM768 key-exchange rollouts to neutralize "harvest now, decrypt later" intelligence threats.',
    category: 'Privacy & Policy',
    tags: ['Post-Quantum', 'Cryptography', 'TLS 1.3', 'ML-KEM', 'Privacy'],
    cveId: '',
    severity: '',
    featuredImage: '/uploads/seed/privacy-encryption.jpg',
    featuredImageCaption:
      'Hybrid post-quantum key exchanges protect long-lived sensitive communications against future cryptanalytic breakthroughs.',
    author: {
      name: 'Clara Lindqvist',
      role: 'Cryptography & Policy Writer',
      bio: 'Covers privacy engineering, encryption standards, and international cybersecurity regulation.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 7650,
    publishedAt: daysAgo(4, 3),
    content: `
<p>More than a third of all human-initiated HTTPS connections worldwide now negotiate post-quantum hybrid key agreements, according to aggregated telemetry released this week by three major global content delivery networks.</p>

<p>The milestone reflects rapid industry convergence around <strong>X25519MLKEM768</strong>—a hybrid construction pairing battle-tested elliptic-curve Diffie-Hellman with NIST's standardized Module-Lattice-Based Key-Encapsulation Mechanism (FIPS 203).</p>

<h2>Why Deploy Post-Quantum Cryptography Today?</h2>
<p>Even though cryptographically relevant fault-tolerant quantum computers remain years away, state-sponsored collection programs routinely archive encrypted network traffic today with the intention of decrypting sensitive diplomatic, healthcare, and intellectual property records later.</p>

<blockquote>
  <p>"Enabling hybrid ML-KEM on TLS termination edges adds less than 1.2 kilobytes to the handshake and virtually zero measurable latency on modern fiber links. Waiting is no longer a defensible risk posture."</p>
</blockquote>

<h3>Verifying Your Edge TLS Handshake</h3>
<pre><code class="language-bash"># Inspect negotiated hybrid post-quantum key exchange using OpenSSL 3.5+
openssl s_client -connect api.example.com:443 -groups X25519MLKEM768 -brief</code></pre>

<p>Enterprise network administrators should inspect legacy middleboxes and deep-packet inspection appliances before enabling hybrid groups globally, as older firewalls with rigid ClientHello packet-size assumptions occasionally drop fragmented handshakes.</p>
`,
  },
  {
    title: 'Fault-Tolerant Logical Qubits Reach New Coherence Milestone, Reshaping Cryptographic Migration Timelines',
    slug: 'fault-tolerant-logical-qubits-coherence-milestone',
    description:
      'New surface-code error correction breakthroughs demonstrate exponential error suppression across 128 logical qubits, prompting fresh urgency among hardware security vendors.',
    category: 'Technology News',
    tags: ['Quantum Computing', 'Semiconductors', 'Research', 'Cryptography', 'Deep Tech'],
    cveId: '',
    severity: '',
    featuredImage: '/uploads/seed/tech-quantum.jpg',
    featuredImageCaption:
      'Next-generation cryogenic control electronics drastically reduce thermal noise across superconducting qubit arrays.',
    author: {
      name: 'Arjun Mehta',
      role: 'Senior Technology Correspondent',
      bio: 'Reports on silicon architecture, quantum engineering, and emerging computing frontiers.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 9120,
    publishedAt: daysAgo(5, 6),
    content: `
<p>Physicists and systems engineers unveiled a landmark quantum error-correction demonstration today, sustaining entangled logical qubits below the fault-tolerance threshold across more than 10,000 consecutive syndrome extraction cycles.</p>

<p>While the system remains orders of magnitude smaller than the millions of physical qubits estimated to factor 2048-bit RSA integers via Shor's algorithm, the engineering trajectory validates modular cryogenic interconnects—allowing multiple quantum processors to link coherently across optical fibers.</p>

<h2>Key Engineering Breakthroughs</h2>
<ul>
  <li><strong>Real-Time FPGA Decoders:</strong> Syndrome decoding latency dropped under 480 nanoseconds, preventing error accumulation faster than physical decoherence.</li>
  <li><strong>Modular Cryo-Links:</strong> Microwave-to-optical transducers achieved 99.1% entanglement fidelity between adjacent dilution refrigerators.</li>
  <li><strong>Crypto-Agility Mandate:</strong> Financial regulators reiterated 2030–2033 deadlines for full migration away from classical RSA and ECDSA signatures.</li>
</ul>

<p>For CISOs and enterprise architects, the message is pragmatic rather than alarmist: begin inventorying cryptographic dependencies—especially long-lived firmware signing keys and hardware HSMs—now, while upgrade cycles remain orderly.</p>
`,
  },
  {
    title: 'Browser V8 TurboFan Type-Confusion Flaw Patched Hours After Pwn2Own Live Exploit Demo',
    slug: 'browser-v8-turbofan-type-confusion-patched-pwn2own',
    description:
      'Chromium maintainers ship an emergency out-of-band update addressing CVE-2026-19884 after researchers achieved sandboxed renderer code execution from a single malformed WebAssembly module.',
    category: 'Cybersecurity',
    tags: ['Browser Security', 'Chromium', 'V8', 'Zero-Day', 'CVE-2026-19884'],
    cveId: 'CVE-2026-19884',
    severity: 'Critical',
    featuredImage: '/uploads/seed/hero-zero-day.jpg',
    featuredImageCaption:
      'Rapid coordinated disclosure enabled an emergency browser patch within 19 hours of live proof-of-concept demonstration.',
    author: {
      name: 'Elena Vance',
      role: 'Chief Vulnerability Correspondent',
      bio: 'Reports on kernel internals, zero-day disclosure, and cloud hypervisor security.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 10340,
    publishedAt: daysAgo(6, 2),
    content: `
<p>Chromium security engineers have issued an urgent out-of-band patch fixing <strong>CVE-2026-19884</strong>, a high-impact type-confusion bug inside the V8 JavaScript and WebAssembly optimizing compiler that was demonstrated live on stage less than 24 hours earlier.</p>

<p>The bug stems from an incorrect speculative optimization assumption during Turboshaft graph lowering of resizable ArrayBuffers shared across WebAssembly linear memory instances. By triggering a garbage-collection cycle mid-optimization, an attacker could craft overlapping tagged and untagged pointer views inside the renderer process.</p>

<h2>Enterprise Remediation Guidance</h2>
<p>Although Chromium's site-isolation architecture and V8 heap sandbox prevented immediate full-system takeover without a secondary OS kernel bug, security teams should enforce automatic browser restarts across managed fleets immediately.</p>

<pre><code class="language-bash"># Verify Chromium/Chrome enterprise policy forces rapid relaunch notifications
# macOS / Linux managed policy snippet:
{
  "RelaunchNotification": 2,
  "RelaunchNotificationPeriod": 86400000
}</code></pre>

<ul>
  <li>Confirm desktop fleets update to Chromium 134.0.6998.118 or later.</li>
  <li>Audit Electron-based enterprise desktop apps (Slack, VS Code, internal tools) for bundled runtime updates.</li>
</ul>
`,
  },
  {
    title: 'Securing Sovereign AI Clusters: Architectural Lessons from 10,000-GPU Training Fabrics',
    slug: 'securing-sovereign-ai-clusters-gpu-training-fabrics',
    description:
      'Model weights are now crown-jewel intellectual property. Here is how frontier labs lock down InfiniBand fabrics, confidential GPU enclaves, and weight exfiltration channels.',
    category: 'Artificial Intelligence',
    tags: ['AI Infrastructure', 'GPU Security', 'Confidential Computing', 'InfiniBand'],
    cveId: '',
    severity: '',
    featuredImage: '/uploads/seed/ai-security.jpg',
    featuredImageCaption:
      'Hardware-attested confidential GPU compute protects proprietary weights even from compromised host hypervisors.',
    author: {
      name: 'Dr. Priya Nair',
      role: 'AI Security Editor',
      bio: 'Researches adversarial machine learning, LLM sandboxing, and automated vulnerability discovery.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 6890,
    publishedAt: daysAgo(7, 5),
    content: `
<p>Training a frontier foundation model now represents hundreds of millions of dollars in compute and curated data—yet the final result is a set of weight checkpoints portable enough to fit on a handful of NVMe drives. Protecting those weights from nation-state espionage and insider threats has birthed a specialized discipline: <strong>AI infrastructure security</strong>.</p>

<h2>Hardening the High-Speed Compute Fabric</h2>
<p>Traditional security architectures assume network traffic flows through inspectable Ethernet switches. In modern AI clusters, GPUs communicate over RDMA/InfiniBand at 400–800 Gbps per link. Any compromised training container with unrestricted host network namespaces can silently inspect peer memory or exfiltrate checkpoint shards.</p>

<ul>
  <li><strong>Confidential GPU Compute:</strong> Encrypt PCIe traffic and GPU HBM memory using hardware-backed attestation before releasing checkpoint decryption keys.</li>
  <li><strong>Dedicated Weight Vaults:</strong> Store model checkpoints behind hardware-enforced rate limits and multi-party approval workflows so no single engineer can download raw weights.</li>
  <li><strong>Air-Gapped Training Subnets:</strong> Sever direct internet egress from training nodes; route package mirrors through signed artifact proxies only.</li>
</ul>
`,
  },
  {
    title: 'Memory-Safe Systems Rewrite: Inside the Multi-Year Migration of Core Internet DNS Resolvers to Rust',
    slug: 'memory-safe-systems-rewrite-dns-resolvers-rust',
    description:
      'After two decades of parser CVEs in C-based networking daemons, major registry operators detail performance benchmarks and deployment trade-offs of memory-safe DNS infrastructure.',
    category: 'Technology News',
    tags: ['Rust', 'Memory Safety', 'DNS', 'Systems Engineering', 'Open Source'],
    cveId: '',
    severity: '',
    featuredImage: '/uploads/seed/cloud-network.jpg',
    featuredImageCaption:
      'Packet parsers sitting directly on untrusted internet sockets represent the highest-leverage targets for memory-safe rewrites.',
    author: {
      name: 'Arjun Mehta',
      role: 'Senior Technology Correspondent',
      bio: 'Reports on silicon architecture, quantum engineering, and emerging computing frontiers.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 6210,
    publishedAt: daysAgo(8, 1),
    content: `
<p>Recursive DNS resolvers process millions of malformed, untrusted UDP and TCP packets every second—making them a perennial proving ground for buffer overflows, use-after-free bugs, and amplification exploits. Over the past 18 months, two Tier-1 internet infrastructure providers have systematically replaced legacy C packet parsers with Rust implementations.</p>

<h2>Benchmark Results in Production</h2>
<p>Production telemetry across 40 global points of presence shows tail latency (p99) remaining within 0.08 milliseconds of hand-tuned C counterparts while eliminating an entire category of out-of-bounds memory defects at compile time.</p>

<pre><code class="language-rust">/// Zero-copy DNS label parser eliminating unchecked pointer arithmetic
pub fn parse_label<'a>(packet: &'a [u8], offset: usize) -> Result<(&'a [u8], usize), DnsError> {
    let len = *packet.get(offset).ok_or(DnsError::Truncated)? as usize;
    if len == 0 {
        return Ok((&[], offset + 1));
    }
    let start = offset + 1;
    let end = start.checked_add(len).ok_or(DnsError::Overflow)?;
    let label = packet.get(start..end).ok_or(DnsError::Truncated)?;
    Ok((label, end))
}</code></pre>

<p>Engineering leads note that incremental FFI boundaries—rewriting untrusted wire-format parsers first rather than attempting risky big-bang rewrites—proved decisive for maintaining 99.999% uptime during migration.</p>
`,
  },
  {
    title: 'Active Directory Certificate Services (AD CS) Abuse in 2026: Hunting ESC15 and Shadow Credential Escalations',
    slug: 'active-directory-certificate-services-hunting-esc15',
    description:
      'A practical purple-team playbook for identifying misconfigured enterprise PKI templates, auditing certificate enrollment logs, and closing silent domain-admin takeover paths.',
    category: 'Ethical Hacking',
    tags: ['Active Directory', 'PKI', 'Purple Team', 'Windows Security', 'Detection'],
    cveId: '',
    severity: 'High',
    featuredImage: '/uploads/seed/ethical-hacking.jpg',
    featuredImageCaption:
      'Enterprise PKI misconfigurations remain one of the fastest paths from standard domain user to full forest compromise.',
    author: {
      name: 'Devon K. Morales',
      role: 'Principal Red Team Analyst',
      bio: 'Specializes in hardware security, firmware reverse engineering, and adversary emulation.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 8730,
    publishedAt: daysAgo(9, 4),
    content: `
<p>Even in organizations that have locked down NTLM relay paths and deployed tiered administrative workstations, <strong>Active Directory Certificate Services (AD CS)</strong> frequently hides subtle template permissions that allow any authenticated domain user to mint a Domain Administrator authentication certificate.</p>

<h2>Auditing Vulnerable Templates Programmatically</h2>
<p>Defenders should continuously scan published certificate templates for dangerous combinations of <code>CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT</code>, weak enrollment ACLs, and Application Policy OIDs permitting Client Authentication.</p>

<pre><code class="language-powershell"># Quick defensive audit of risky AD CS templates in PowerShell
Import-Module ActiveDirectory
$configNC = (Get-ADRootDSE).configurationNamingContext
$templates = Get-ADObject -SearchBase "CN=Certificate Templates,CN=Public Key Services,CN=Services,$configNC" -Filter * -Properties 'msPKI-Certificate-Name-Flag','pKIExtendedKeyUsage','displayName'

$templates | Where-Object {
  ($_.'msPKI-Certificate-Name-Flag' -band 1) -ne 0
} | Select-Object Name, displayName, pKIExtendedKeyUsage | Format-Table -AutoSize</code></pre>

<ul>
  <li>Enable CA auditing (Event IDs <code>4886</code>, <code>4887</code>, and <code>4898</code>) and forward logs to your SIEM.</li>
  <li>Enforce strong certificate mapping (<code>StrongCertificateBindingEnforcement = 2</code>) across all Domain Controllers.</li>
  <li>Remove <code>Domain Users</code> and <code>Authenticated Users</code> enrollment rights from every template supporting Subject Alternative Names (SAN).</li>
</ul>
`,
  },
  {
    title: 'Supply-Chain Telemetry Alert: Typosquatted NPM Packages Target Developer SSH Keys and Cloud CLI Profiles',
    slug: 'supply-chain-typosquatted-npm-packages-target-developer-ssh-keys',
    description:
      'A coordinated campaign uploaded 38 malicious packages using postinstall lifecycle hooks to harvest local AWS, GCP, and Kubernetes credentials from engineering laptops.',
    category: 'Cybersecurity',
    tags: ['Supply Chain', 'NPM', 'InfoStealer', 'DevSecOps', 'Software Security'],
    cveId: '',
    severity: 'High',
    featuredImage: '/uploads/seed/breach-datacenter.jpg',
    featuredImageCaption:
      'Automated package-registry scanners flagged obfuscated postinstall payloads within hours of publication.',
    author: {
      name: 'Marcus Sterling',
      role: 'Investigative Reporter',
      bio: 'Investigates large-scale corporate breaches, extortion ecosystems, and incident response.',
    },
    status: 'published',
    isFeatured: false,
    isBreaking: false,
    views: 7410,
    publishedAt: daysAgo(10, 2),
    content: `
<p>Threat hunters tracking open-source registry abuse have uncovered a coordinated campaign publishing 38 typosquatted JavaScript packages aimed specifically at full-stack and cloud engineers.</p>

<p>Each package mimicked popular CLI scaffolding utilities and executed an obfuscated <code>postinstall</code> script that silently archived <code>~/.aws/credentials</code>, <code>~/.kube/config</code>, and unencrypted SSH private keys before exfiltrating them over DNS-over-HTTPS.</p>

<h2>Locking Down Developer Package Workflows</h2>
<pre><code class="language-bash"># Disable automatic lifecycle scripts globally and opt in explicitly when required
npm config set ignore-scripts true

# Enforce lockfile integrity in CI/CD pipelines
npm ci --ignore-scripts</code></pre>

<ul>
  <li>Use hardware-backed SSH keys (<code>ed25519-sk</code> via YubiKey/FIDO2) so stolen key stubs are useless without physical tap confirmation.</li>
  <li>Replace static cloud credentials on laptops with ephemeral SSO sessions via <code>aws sso login</code> or workload identity brokers.</li>
</ul>
`,
  },
  {
    title: 'DRAFT: Q4 Enterprise Threat Landscape Report — Emerging Identity & SaaS Attack Patterns',
    slug: 'draft-q4-enterprise-threat-landscape-report',
    description:
      'Working editorial draft compiling quarterly telemetry on OAuth consent phishing, MFA fatigue resilience, and SaaS-to-SaaS token abuse across Fortune 500 networks.',
    category: 'Cybersecurity',
    tags: ['Threat Report', 'OAuth', 'SaaS Security', 'Identity'],
    cveId: '',
    severity: 'Medium',
    featuredImage: '/uploads/seed/ransomware-threat.jpg',
    featuredImageCaption: 'Editorial review draft — pending final telemetry verification.',
    author: {
      name: 'Elena Vance',
      role: 'Chief Vulnerability Correspondent',
      bio: 'Reports on kernel internals, zero-day disclosure, and cloud hypervisor security.',
    },
    status: 'draft',
    isFeatured: false,
    isBreaking: false,
    views: 0,
    publishedAt: daysAgo(0, 1),
    content: `
<p>This quarterly briefing synthesizes anonymized telemetry from 140 enterprise security operations centers to highlight how initial access brokers are pivoting away from traditional malware attachments toward legitimate cloud identity flows.</p>

<h2>Key Preliminary Findings</h2>
<ul>
  <li>OAuth device-code phishing campaigns rose 47% quarter-over-quarter.</li>
  <li>Organizations enforcing FIDO2 / WebAuthn passkeys saw a 96% reduction in credential-stuffing and adversary-in-the-middle account takeovers.</li>
</ul>

<p><em>Editor note: Awaiting final peer-reviewed charts before publication.</em></p>
`,
  },
];

async function seed() {
  await connectDB();

  // 1. Seed default Admin account (never overwrites existing password unless missing)
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || 'editor@cyberindianews.in').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'CyberIndia#2026';

  let admin = await Admin.findOne({ $or: [{ username: adminUsername }, { email: adminEmail }] });
  if (!admin) {
    admin = await Admin.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      displayName: 'Elena Vance',
      role: 'superadmin',
    });
    console.log(`[SEED] Created admin account: ${admin.username} (${admin.email})`);
  } else if (process.argv.includes('--sync-admin')) {
    admin.password = adminPassword;
    await admin.save();
    console.log(`[SEED] Synced admin credentials from .env for: ${admin.username} (${admin.email})`);
  } else {
    console.log(`[SEED] Admin account already exists: ${admin.username} (${admin.email})`);
  }

  // 2. Seed Articles (upsert by slug so re-running seed is safe and idempotent)
  let inserted = 0;
  for (const item of SEED_ARTICLES) {
    const existing = await Article.findOne({ slug: item.slug }).select('_id').lean();
    if (!existing) {
      await Article.create({
        ...item,
        readingTime: calculateReadingTime(item.content),
        seo: {
          metaTitle: `${item.title} | Cyber India News`,
          metaDescription: item.description,
        },
      });
      inserted++;
    }
  }
  console.log(`[SEED] Inserted ${inserted} new articles (${SEED_ARTICLES.length} total in seed catalog).`);

  // 3. Seed 14 days of realistic visitor stats if collection is empty
  const existingStats = await VisitorStat.countDocuments();
  if (existingStats === 0) {
    const statsDocs = [];
    const baseVisits = [1820, 2140, 1980, 2410, 2690, 2320, 2890, 3120, 2940, 3410, 3780, 3590, 4120, 4480];
    const baseViews = [4210, 4890, 4620, 5780, 6190, 5410, 6820, 7340, 6910, 8120, 8950, 8420, 9680, 10490];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const idx = 13 - i;
      statsDocs.push({
        dateKey,
        visits: baseVisits[idx],
        articleViews: baseViews[idx],
      });
    }
    await VisitorStat.insertMany(statsDocs);
    console.log(`[SEED] Seeded 14 days of visitor analytics telemetry.`);
  }

  // 4. Seed sample newsletter subscribers if empty
  const existingSubs = await Subscriber.countDocuments();
  if (existingSubs === 0) {
    await Subscriber.insertMany([
      { email: 'ciso@northstar-infra.example' },
      { email: 'secops@helioncloud.example' },
      { email: 'threatintel@veridianbank.example' },
    ]);
    console.log(`[SEED] Seeded sample newsletter subscribers.`);
  }

  await mongoose.disconnect();
  console.log('[SEED] Database seeding complete.');
}

seed().catch((err) => {
  console.error('[SEED] Error:', err);
  process.exit(1);
});
