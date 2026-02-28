use super::manifest::UpdateManifest;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReleaseRing {
    Stable,
    Beta,
    Canary,
}

impl ReleaseRing {
    pub fn from_env() -> Self {
        match std::env::var("TITANE_RELEASE_RING")
            .unwrap_or_else(|_| "stable".to_string())
            .to_lowercase()
            .as_str()
        {
            "beta" => Self::Beta,
            "canary" => Self::Canary,
            _ => Self::Stable,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SignedUpdatesPolicy {
    pub require_manifest_signature: bool,
    pub require_migration_signature: bool,
    pub allow_downgrade: bool,
}

impl SignedUpdatesPolicy {
    pub fn strict_for_ring(ring: &ReleaseRing) -> Self {
        Self {
            require_manifest_signature: true,
            require_migration_signature: true,
            allow_downgrade: matches!(ring, ReleaseRing::Canary),
        }
    }
}

#[derive(Debug, Clone)]
pub struct PostUpdateGatesV2 {
    pub require_non_empty_description: bool,
    pub require_files_non_empty_for_stable: bool,
}

impl Default for PostUpdateGatesV2 {
    fn default() -> Self {
        Self {
            require_non_empty_description: true,
            require_files_non_empty_for_stable: true,
        }
    }
}

#[derive(Debug, Clone)]
pub enum ReleasePolicyError {
    EmptyManifestSignature,
    MigrationSignatureRequired,
    DowngradeBlocked {
        from_version: String,
        to_version: String,
    },
    EmptyDescription,
    StableRequiresFiles,
    VersionNotUpdated {
        expected: String,
        actual: String,
    },
}

impl std::fmt::Display for ReleasePolicyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyManifestSignature => write!(f, "Manifest signature is required"),
            Self::MigrationSignatureRequired => {
                write!(f, "Migration signature must be verified when migration exists")
            }
            Self::DowngradeBlocked {
                from_version,
                to_version,
            } => {
                write!(f, "Downgrade blocked: {} -> {}", from_version, to_version)
            }
            Self::EmptyDescription => write!(f, "Manifest description must be non-empty"),
            Self::StableRequiresFiles => {
                write!(f, "Stable ring requires at least one file in update manifest")
            }
            Self::VersionNotUpdated { expected, actual } => {
                write!(f, "Version gate failed: expected {}, got {}", expected, actual)
            }
        }
    }
}

impl std::error::Error for ReleasePolicyError {}

pub fn enforce_pre_update_policy(
    ring: &ReleaseRing,
    current_version: &str,
    manifest: &UpdateManifest,
    policy: &SignedUpdatesPolicy,
) -> Result<(), ReleasePolicyError> {
    if policy.require_manifest_signature && manifest.signature.is_empty() {
        return Err(ReleasePolicyError::EmptyManifestSignature);
    }

    if !policy.allow_downgrade
        && compare_versions(&manifest.version, current_version)
            == std::cmp::Ordering::Less
    {
        return Err(ReleasePolicyError::DowngradeBlocked {
            from_version: current_version.to_string(),
            to_version: manifest.version.clone(),
        });
    }

    if matches!(ring, ReleaseRing::Stable) && manifest.description.trim().is_empty() {
        return Err(ReleasePolicyError::EmptyDescription);
    }

    Ok(())
}

pub fn enforce_post_update_gates_v2(
    ring: &ReleaseRing,
    expected_version: &str,
    actual_version: &str,
    manifest: &UpdateManifest,
    gates: &PostUpdateGatesV2,
) -> Result<(), ReleasePolicyError> {
    if expected_version != actual_version {
        return Err(ReleasePolicyError::VersionNotUpdated {
            expected: expected_version.to_string(),
            actual: actual_version.to_string(),
        });
    }

    if gates.require_non_empty_description && manifest.description.trim().is_empty() {
        return Err(ReleasePolicyError::EmptyDescription);
    }

    if gates.require_files_non_empty_for_stable
        && matches!(ring, ReleaseRing::Stable)
        && manifest.files.is_empty()
    {
        return Err(ReleasePolicyError::StableRequiresFiles);
    }

    Ok(())
}

fn compare_versions(left: &str, right: &str) -> std::cmp::Ordering {
    let left_parts = parse_semver_like(left);
    let right_parts = parse_semver_like(right);
    left_parts.cmp(&right_parts)
}

fn parse_semver_like(version: &str) -> (u64, u64, u64) {
    let clean = version.trim().trim_start_matches('v');
    let mut parts = clean.split('.');
    let major = parts.next().and_then(|v| v.parse::<u64>().ok()).unwrap_or(0);
    let minor = parts.next().and_then(|v| v.parse::<u64>().ok()).unwrap_or(0);
    let patch_str = parts.next().unwrap_or("0");
    let patch = patch_str
        .split('-')
        .next()
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(0);

    (major, minor, patch)
}

pub fn enforce_migration_signature_policy(
    manifest: &UpdateManifest,
    policy: &SignedUpdatesPolicy,
    migration_signature_verified: bool,
) -> Result<(), ReleasePolicyError> {
    if policy.require_migration_signature
        && manifest.migration_script.is_some()
        && !migration_signature_verified
    {
        return Err(ReleasePolicyError::MigrationSignatureRequired);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn manifest(version: &str) -> UpdateManifest {
        UpdateManifest {
            version: version.to_string(),
            timestamp: 0,
            description: "release".to_string(),
            files: vec![],
            migration_script: None,
            signature: vec![1, 2, 3],
        }
    }

    #[test]
    fn blocks_downgrade_on_stable() {
        let ring = ReleaseRing::Stable;
        let policy = SignedUpdatesPolicy::strict_for_ring(&ring);
        let candidate = manifest("1.0.0");

        let result = enforce_pre_update_policy(&ring, "1.1.0", &candidate, &policy);
        assert!(result.is_err());
    }

    #[test]
    fn allows_upgrade_on_stable() {
        let ring = ReleaseRing::Stable;
        let policy = SignedUpdatesPolicy::strict_for_ring(&ring);
        let candidate = manifest("1.2.0");

        let result = enforce_pre_update_policy(&ring, "1.1.0", &candidate, &policy);
        assert!(result.is_ok());
    }

    #[test]
    fn post_gate_requires_version_sync() {
        let ring = ReleaseRing::Beta;
        let gates = PostUpdateGatesV2::default();
        let candidate = manifest("1.2.0");

        let result = enforce_post_update_gates_v2(&ring, "1.2.0", "1.1.9", &candidate, &gates);
        assert!(matches!(result, Err(ReleasePolicyError::VersionNotUpdated { .. })));
    }
}
