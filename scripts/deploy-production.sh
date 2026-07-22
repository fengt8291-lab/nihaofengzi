#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

readonly EXPECTED_BRANCH='main'
readonly EXPECTED_ORIGIN_URL='git@github.com:fengt8291-lab/nihaofengzi.git'
readonly REMOTE_TARGET='root@47.250.37.93'
readonly PRODUCTION_ORIGIN='https://nihaofengzi.top'
readonly REMOTE_BASE='/var/www/nihaofengzi'
readonly REMOTE_CURRENT="${REMOTE_BASE}/dist"
readonly REMOTE_LOCK="${REMOTE_BASE}/.deploy-production.lock"
readonly BACKUP_KEEP_COUNT=3

DRY_RUN=0
PROJECT_ROOT=''
DIST_DIR=''
FULL_SHA=''
SHORT_SHA=''
DEPLOY_TIMESTAMP=''
REMOTE_NEXT=''
REMOTE_BACKUP=''
REMOTE_FAILED=''
LOCK_TOKEN=''
PRODUCTION_ASSET_PATH=''
REMOTE_NEXT_CREATED=0
REMOTE_LOCK_MAYBE_ACQUIRED=0
SWITCH_ATTEMPTED=0
DEPLOY_SUCCEEDED=0

log() {
  printf '[deploy] %s\n' "$*"
}

warn() {
  printf '[deploy] WARNING: %s\n' "$*" >&2
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  return 1
}

usage() {
  cat <<'USAGE'
Usage: bash scripts/deploy-production.sh [--dry-run]

  --dry-run  Inspect local preconditions and print the deployment plan.
             It never fetches, pushes, builds, connects to SSH, uploads,
             runs production curl, or modifies files.
  -h, --help Show this help message.
USAGE
}

parse_args() {
  while (($# > 0)); do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        fail "Unknown argument: $1"
        ;;
    esac
    shift
  done
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command is unavailable: $1"
}

assert_nonempty() {
  local label="$1"
  local value="$2"
  [[ -n "$value" ]] || fail "$label must not be empty."
}

assert_remote_path() {
  local path="$1"
  local required_prefix="$2"

  assert_nonempty 'Remote path' "$path"
  [[ "$REMOTE_BASE" == '/var/www/nihaofengzi' ]] || fail 'Unexpected remote base directory.'
  [[ "$path" == "${REMOTE_BASE}/"* ]] || fail "Remote path escaped the deployment base: $path"
  [[ "$path" == "${required_prefix}"* ]] || fail "Remote path has an unexpected prefix: $path"
  [[ "$path" != '/' && "$path" != '/var' && "$path" != '/var/www' && "$path" != "$REMOTE_BASE" ]] ||
    fail "Refusing unsafe remote path: $path"
}

initialize_context() {
  local invocation_dir
  local script_dir
  local git_root

  invocation_dir="$(pwd -P)"
  script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
  PROJECT_ROOT="$(cd -- "${script_dir}/.." && pwd -P)"
  DIST_DIR="${PROJECT_ROOT}/dist"

  [[ "$invocation_dir" == "$PROJECT_ROOT" ]] ||
    fail "Run this command from the project root: $PROJECT_ROOT"

  cd -- "$PROJECT_ROOT"

  [[ -f 'package.json' && -f 'astro.config.mjs' && -d '.git' ]] ||
    fail "Expected project files were not found in: $PROJECT_ROOT"

  git_root="$(git rev-parse --show-toplevel)"
  [[ "$git_root" == "$PROJECT_ROOT" ]] ||
    fail "Script must run from the nihaofengzi repository root: $PROJECT_ROOT"

  FULL_SHA="$(git rev-parse HEAD)"
  SHORT_SHA="$(git rev-parse --short=12 HEAD)"
  DEPLOY_TIMESTAMP="$(date -u '+%Y%m%dT%H%M%SZ')"

  [[ "$FULL_SHA" =~ ^[0-9a-f]{40}$ ]] || fail 'HEAD is not a valid full Git SHA.'
  [[ "$SHORT_SHA" =~ ^[0-9a-f]{7,12}$ ]] || fail 'HEAD is not a valid short Git SHA.'
  [[ "$DEPLOY_TIMESTAMP" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || fail 'Deployment timestamp is invalid.'

  REMOTE_NEXT="${REMOTE_BASE}/dist_next_${DEPLOY_TIMESTAMP}_${SHORT_SHA}"
  REMOTE_BACKUP="${REMOTE_BASE}/dist_backup_${DEPLOY_TIMESTAMP}_${SHORT_SHA}"
  REMOTE_FAILED="${REMOTE_BASE}/dist_failed_${DEPLOY_TIMESTAMP}_${SHORT_SHA}"
  LOCK_TOKEN="${DEPLOY_TIMESTAMP}_${FULL_SHA}_$$"

  assert_remote_path "$REMOTE_CURRENT" "${REMOTE_BASE}/dist"
  assert_remote_path "$REMOTE_NEXT" "${REMOTE_BASE}/dist_next_"
  assert_remote_path "$REMOTE_BACKUP" "${REMOTE_BASE}/dist_backup_"
  assert_remote_path "$REMOTE_FAILED" "${REMOTE_BASE}/dist_failed_"
  [[ "${REMOTE_NEXT##*/}" =~ ^dist_next_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]] ||
    fail 'Remote next release name is invalid.'
  [[ "${REMOTE_BACKUP##*/}" =~ ^dist_backup_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]] ||
    fail 'Remote backup name is invalid.'
  [[ "${REMOTE_FAILED##*/}" =~ ^dist_failed_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]] ||
    fail 'Remote failed-release name is invalid.'
  [[ "$REMOTE_LOCK" == '/var/www/nihaofengzi/.deploy-production.lock' ]] ||
    fail 'Remote deployment lock path is invalid.'
  [[ "$LOCK_TOKEN" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]] ||
    fail 'Deployment lock token is invalid.'
}

local_preflight() {
  local branch
  local origin_url
  local status_output

  branch="$(git branch --show-current)"
  origin_url="$(git remote get-url origin 2>/dev/null || true)"
  status_output="$(git status --porcelain=v1 --untracked-files=all)"

  [[ "$branch" == "$EXPECTED_BRANCH" ]] || fail "Current branch is '$branch'; expected '$EXPECTED_BRANCH'."
  [[ "$origin_url" == "$EXPECTED_ORIGIN_URL" ]] ||
    fail "origin is '$origin_url'; expected '$EXPECTED_ORIGIN_URL'."
  [[ -z "$status_output" ]] || fail 'Git working tree is not clean. Commit or discard changes before production deployment.'
}

tracking_status() {
  local counts
  local ahead
  local behind

  git show-ref --verify --quiet "refs/remotes/origin/${EXPECTED_BRANCH}" ||
    fail "Local tracking ref origin/${EXPECTED_BRANCH} is missing."

  counts="$(git rev-list --left-right --count "HEAD...origin/${EXPECTED_BRANCH}")"
  ahead="$(printf '%s' "$counts" | awk '{print $1}')"
  behind="$(printf '%s' "$counts" | awk '{print $2}')"

  [[ "$ahead" =~ ^[0-9]+$ && "$behind" =~ ^[0-9]+$ ]] ||
    fail 'Unable to determine ahead/behind status.'

  printf '%s %s\n' "$ahead" "$behind"
}

print_dry_run() {
  local branch
  local origin_url
  local status_output
  local tracking
  local ahead='unknown'
  local behind='unknown'
  local blocker_count=0

  branch="$(git branch --show-current)"
  origin_url="$(git remote get-url origin 2>/dev/null || true)"
  status_output="$(git status --porcelain=v1 --untracked-files=all)"

  log 'DRY RUN — no files will be modified and no network connection will be made.'
  log "Project root: $PROJECT_ROOT"
  log "HEAD: $FULL_SHA"
  log "Branch: ${branch:-<detached>}"
  log "origin: ${origin_url:-<missing>}"
  log "Target: $REMOTE_TARGET"
  log "Next release: $REMOTE_NEXT"
  log "Backup: $REMOTE_BACKUP"

  if [[ "$branch" != "$EXPECTED_BRANCH" ]]; then
    warn "Formal deployment would stop: expected branch '$EXPECTED_BRANCH'."
    blocker_count=$((blocker_count + 1))
  fi
  if [[ "$origin_url" != "$EXPECTED_ORIGIN_URL" ]]; then
    warn 'Formal deployment would stop: origin URL does not match the pinned repository.'
    blocker_count=$((blocker_count + 1))
  fi
  if [[ -n "$status_output" ]]; then
    warn 'Formal deployment would stop: Git working tree is not clean.'
    blocker_count=$((blocker_count + 1))
    printf '%s\n' "$status_output" | sed 's/^/[deploy]   /'
  else
    log 'Git working tree: clean'
  fi

  if git show-ref --verify --quiet "refs/remotes/origin/${EXPECTED_BRANCH}"; then
    tracking="$(tracking_status)"
    ahead="$(printf '%s' "$tracking" | awk '{print $1}')"
    behind="$(printf '%s' "$tracking" | awk '{print $2}')"
    log "Cached origin/main comparison: ahead=$ahead behind=$behind"
    if [[ "$ahead" != '0' && "$behind" != '0' ]]; then
      warn 'Formal deployment would stop after fetching because local main and origin/main are currently diverged.'
      blocker_count=$((blocker_count + 1))
    elif [[ "$behind" != '0' ]]; then
      warn 'Formal deployment would stop after fetching because local main is currently behind the cached origin/main ref.'
      blocker_count=$((blocker_count + 1))
    fi
  else
    warn 'Cached origin/main ref is missing; formal deployment would fetch it before comparison.'
  fi

  cat <<EOF
[deploy] Formal deployment plan:
[deploy]   1. Re-check root, branch, origin and clean working tree.
[deploy]   2. git fetch --prune origin main; reject a behind/diverged main.
[deploy]   3. npm run check; npm run build; validate pages and a safe /_astro/ asset.
[deploy]   4. git push origin main only after all local quality gates pass.
[deploy]   5. Atomically acquire the fixed server deployment lock.
[deploy]   6. Create deployment metadata and rsync to: $REMOTE_NEXT
[deploy]   7. Validate files, permissions and www-data readability; run nginx -t.
[deploy]   8. Rename current dist to: $REMOTE_BACKUP
[deploy]   9. Rename the validated next directory to: $REMOTE_CURRENT
[deploy]  10. Verify four cache-busted HTTPS routes, homepage identity, the built asset and SEO resources.
[deploy]  11. Roll back on verification failure; keep the newest $BACKUP_KEEP_COUNT backups.
[deploy]  12. Release only the deployment lock owned by this run.
EOF

  if ((blocker_count > 0)); then
    warn "Dry run completed with $blocker_count condition(s) that would block a formal deployment."
  else
    log 'Dry run completed; cached local preconditions are ready.'
  fi
  log 'No fetch, push, check, build, SSH, rsync, production curl or cleanup command was executed.'
}

validate_local_build() {
  local required_file

  for required_file in \
    "$DIST_DIR/index.html" \
    "$DIST_DIR/about/index.html" \
    "$DIST_DIR/work/index.html" \
    "$DIST_DIR/work/daily-tasks/index.html"; do
    [[ -f "$required_file" ]] || fail "Required build output is missing: $required_file"
  done

  PRODUCTION_ASSET_PATH="$({
    grep -Eo '/_astro/[A-Za-z0-9][A-Za-z0-9._-]*\.(css|js)' "$DIST_DIR/index.html" || true
  } | sed -n '1p')"

  [[ -n "$PRODUCTION_ASSET_PATH" ]] ||
    fail 'No CSS or JavaScript asset under /_astro/ was found in dist/index.html.'
  [[ "$PRODUCTION_ASSET_PATH" =~ ^/_astro/[A-Za-z0-9][A-Za-z0-9._-]*\.(css|js)$ ]] ||
    fail "Unsafe production asset path extracted from dist/index.html: $PRODUCTION_ASSET_PATH"
  [[ -f "${DIST_DIR}${PRODUCTION_ASSET_PATH}" ]] ||
    fail "Extracted production asset is missing locally: ${DIST_DIR}${PRODUCTION_ASSET_PATH}"

  log "Validated production asset: $PRODUCTION_ASSET_PATH"
}

remote_prepare() {
  # These flags mean "possibly created". Cleanup still requires the exact
  # ownership token, so an interrupted SSH call cannot remove another run.
  REMOTE_NEXT_CREATED=1
  REMOTE_LOCK_MAYBE_ACQUIRED=1
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_CURRENT" "$REMOTE_NEXT" "$REMOTE_LOCK" "$LOCK_TOKEN" <<'REMOTE'
set -Eeuo pipefail
base="$1"
current="$2"
next="$3"
lock="$4"
lock_token="$5"
lock_created=0

cleanup_prepare_failure() {
  trap - ERR
  set +e

  if [[ -d "$next" && -f "${next}/.deploy-token" ]] &&
    grep -Fqx -- "$lock_token" "${next}/.deploy-token"; then
    rm -rf -- "$next"
  fi

  if ((lock_created == 1)) && [[ -f "${lock}/owner" ]] &&
    grep -Fqx -- "$lock_token" "${lock}/owner"; then
    rm -- "${lock}/owner"
    rmdir -- "$lock"
  fi
}

trap cleanup_prepare_failure ERR

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$current" == "${base}/dist" ]]
[[ "$next" == "${base}/dist_next_"* ]]
[[ "${next##*/}" =~ ^dist_next_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "$lock" == "${base}/.deploy-production.lock" ]]
[[ "$lock_token" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]
[[ -d "$base" ]]
[[ -d "$current" ]]
[[ ! -e "$next" ]]

if ! mkdir -- "$lock"; then
  printf 'Another production deployment holds: %s\n' "$lock" >&2
  if [[ -f "${lock}/owner" ]]; then
    printf 'Lock owner token: ' >&2
    cat -- "${lock}/owner" >&2
  else
    printf 'The lock has no owner token. Inspect it manually before removing it.\n' >&2
  fi
  printf 'Do not delete the lock until confirming no deployment is active.\n' >&2
  exit 73
fi
lock_created=1
printf '%s\n' "$lock_token" >"${lock}/owner"
chmod 0600 -- "${lock}/owner"

mkdir -- "$next"
printf '%s\n' "$lock_token" >"${next}/.deploy-token"
trap - ERR
REMOTE
}

upload_release() {
  rsync -az --delete -e 'ssh -o BatchMode=yes -o ConnectTimeout=10' -- \
    "${DIST_DIR}/" "${REMOTE_TARGET}:${REMOTE_NEXT}/"
}

remote_validate_release() {
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_NEXT" "$REMOTE_LOCK" "$FULL_SHA" "$LOCK_TOKEN" <<'REMOTE'
set -Eeuo pipefail
base="$1"
next="$2"
lock="$3"
expected_sha="$4"
lock_token="$5"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$next" == "${base}/dist_next_"* ]]
[[ "${next##*/}" =~ ^dist_next_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "$lock" == "${base}/.deploy-production.lock" ]]
[[ "$expected_sha" =~ ^[0-9a-f]{40}$ ]]
[[ "$lock_token" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]
[[ -d "$next" ]]
[[ -f "${lock}/owner" ]]

for relative in index.html about/index.html work/index.html work/daily-tasks/index.html; do
  [[ -f "${next}/${relative}" ]] || {
    printf 'Missing uploaded file: %s\n' "${next}/${relative}" >&2
    exit 1
  }
done

grep -Fqx -- "$expected_sha" "${next}/.deploy-commit"
grep -Fqx -- "$lock_token" "${next}/.deploy-token"
grep -Fqx -- "$lock_token" "${lock}/owner"

chown -R root:www-data -- "$next"
find "$next" -type d -exec chmod 0755 -- {} +
find "$next" -type f -exec chmod 0644 -- {} +

command -v runuser >/dev/null 2>&1
for relative in index.html about/index.html work/index.html work/daily-tasks/index.html; do
  runuser -u www-data -- test -r "${next}/${relative}"
done

if command -v nginx >/dev/null 2>&1; then
  nginx -t
elif [[ -x /usr/sbin/nginx ]]; then
  /usr/sbin/nginx -t
else
  printf 'nginx executable was not found.\n' >&2
  exit 1
fi
REMOTE
}

remote_switch_release() {
  SWITCH_ATTEMPTED=1
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_CURRENT" "$REMOTE_NEXT" "$REMOTE_BACKUP" "$REMOTE_LOCK" "$LOCK_TOKEN" <<'REMOTE'
set -Eeuo pipefail
base="$1"
current="$2"
next="$3"
backup="$4"
lock="$5"
lock_token="$6"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$current" == "${base}/dist" ]]
[[ "$next" == "${base}/dist_next_"* ]]
[[ "$backup" == "${base}/dist_backup_"* ]]
[[ "$lock" == "${base}/.deploy-production.lock" ]]
[[ "${next##*/}" =~ ^dist_next_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "${backup##*/}" =~ ^dist_backup_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "$lock_token" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]
[[ -d "$current" ]]
[[ -d "$next" ]]
[[ ! -e "$backup" ]]
[[ -f "${lock}/owner" ]]
grep -Fqx -- "$lock_token" "${lock}/owner"
grep -Fqx -- "$lock_token" "${next}/.deploy-token"

mv -- "$current" "$backup"
if ! mv -- "$next" "$current"; then
  mv -- "$backup" "$current"
  printf 'Release switch failed; previous dist was restored.\n' >&2
  exit 1
fi
REMOTE
  REMOTE_NEXT_CREATED=0
}

verify_production() {
  local asset_status
  local asset_url
  local homepage_body
  local homepage_url
  local path
  local sitemap_body
  local sitemap_url
  local url
  local status
  local -a curl_options=(
    --fail
    --silent
    --show-error
    --location
    --connect-timeout 10
    --max-time 60
    --retry 3
    --retry-delay 2
  )
  local -a paths=(
    '/'
    '/about/'
    '/work/'
    '/work/daily-tasks/'
  )
  local -a seo_resource_paths=(
    '/robots.txt'
    '/sitemap-index.xml'
    '/favicon.svg'
  )

  for path in "${paths[@]}"; do
    url="${PRODUCTION_ORIGIN}${path}?deploy=${SHORT_SHA}"
    status="$(curl "${curl_options[@]}" --output /dev/null --write-out '%{http_code}' -- "$url")"
    [[ "$status" == '200' ]] || fail "Production verification failed for $url (HTTP $status)."
    log "Verified $url (HTTP $status)"
  done

  homepage_url="${PRODUCTION_ORIGIN}/?deploy=${SHORT_SHA}"
  homepage_body="$(curl "${curl_options[@]}" -- "$homepage_url")"
  [[ "$homepage_body" == *'你好丰子'* ]] ||
    fail 'Production homepage does not contain the expected brand text: 你好丰子'
  [[ "$homepage_body" != *'你好疯子个人主页建设中'* ]] ||
    fail 'Production homepage still contains the retired construction placeholder.'
  log 'Verified production homepage brand text and absence of the retired placeholder.'

  [[ "$PRODUCTION_ASSET_PATH" =~ ^/_astro/[A-Za-z0-9][A-Za-z0-9._-]*\.(css|js)$ ]] ||
    fail 'Production asset path was not safely validated before the production request.'
  asset_url="${PRODUCTION_ORIGIN}${PRODUCTION_ASSET_PATH}?deploy=${SHORT_SHA}"
  asset_status="$(curl "${curl_options[@]}" --output /dev/null --write-out '%{http_code}' -- "$asset_url")"
  [[ "$asset_status" == '200' ]] ||
    fail "Production asset verification failed for $asset_url (HTTP $asset_status)."
  log "Verified built asset $asset_url (HTTP $asset_status)"

  for path in "${seo_resource_paths[@]}"; do
    url="${PRODUCTION_ORIGIN}${path}?deploy=${SHORT_SHA}"
    status="$(curl "${curl_options[@]}" --output /dev/null --write-out '%{http_code}' -- "$url")"
    [[ "$status" == '200' ]] || fail "Production SEO resource verification failed for $url (HTTP $status)."
    log "Verified SEO resource $url (HTTP $status)"
  done

  sitemap_url="${PRODUCTION_ORIGIN}/sitemap-index.xml?deploy=${SHORT_SHA}"
  sitemap_body="$(curl "${curl_options[@]}" -- "$sitemap_url")"
  [[ "$sitemap_body" == *'<sitemapindex'* ]] ||
    fail 'Production sitemap index does not contain the expected sitemap marker.'
  log 'Verified production sitemap index content marker.'
}

rollback_remote() {
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_CURRENT" "$REMOTE_BACKUP" "$REMOTE_FAILED" "$FULL_SHA" <<'REMOTE'
set -Eeuo pipefail
base="$1"
current="$2"
backup="$3"
failed="$4"
new_sha="$5"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$current" == "${base}/dist" ]]
[[ "$backup" == "${base}/dist_backup_"* ]]
[[ "$failed" == "${base}/dist_failed_"* ]]
[[ "${backup##*/}" =~ ^dist_backup_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "${failed##*/}" =~ ^dist_failed_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "$new_sha" =~ ^[0-9a-f]{40}$ ]]

if [[ -f "${current}/.deploy-commit" ]] && grep -Fqx -- "$new_sha" "${current}/.deploy-commit"; then
  [[ -d "$backup" ]]
  [[ ! -e "$failed" ]]
  mv -- "$current" "$failed"
  if ! mv -- "$backup" "$current"; then
    mv -- "$failed" "$current" || true
    printf 'CRITICAL: automatic rollback could not restore the previous dist.\n' >&2
    exit 1
  fi
  printf 'Previous production dist restored. Failed release retained at: %s\n' "$failed"
else
  printf 'No switched release matching %s was detected; production dist was left unchanged.\n' "$new_sha"
fi
REMOTE
}

cleanup_remote_next() {
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_NEXT" "$LOCK_TOKEN" <<'REMOTE'
set -Eeuo pipefail
base="$1"
next="$2"
lock_token="$3"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$next" == "${base}/dist_next_"* ]]
[[ "${next##*/}" =~ ^dist_next_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
[[ "$lock_token" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]
[[ "$next" != "$base" && "$next" != '/' ]]

if [[ -d "$next" ]]; then
  if [[ -f "${next}/.deploy-token" ]] &&
    grep -Fqx -- "$lock_token" "${next}/.deploy-token"; then
    rm -rf -- "$next"
  else
    printf 'Refusing to remove a temporary directory not owned by this deployment: %s\n' "$next" >&2
    exit 1
  fi
fi
REMOTE
}

release_remote_lock() {
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$REMOTE_LOCK" "$LOCK_TOKEN" <<'REMOTE'
set -Eeuo pipefail
base="$1"
lock="$2"
lock_token="$3"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$lock" == "${base}/.deploy-production.lock" ]]
[[ "$lock_token" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]

if [[ ! -d "$lock" ]]; then
  exit 0
fi

if [[ ! -f "${lock}/owner" ]] || ! grep -Fqx -- "$lock_token" "${lock}/owner"; then
  printf 'Refusing to release a deployment lock not owned by this run: %s\n' "$lock" >&2
  exit 1
fi

rm -- "${lock}/owner"
rmdir -- "$lock"
REMOTE
}

prune_old_backups() {
  ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$REMOTE_TARGET" bash -s -- \
    "$REMOTE_BASE" "$BACKUP_KEEP_COUNT" <<'REMOTE'
set -Eeuo pipefail
base="$1"
keep="$2"

[[ "$base" == '/var/www/nihaofengzi' ]]
[[ "$keep" =~ ^[0-9]+$ ]]
((keep >= 1))

mapfile -d '' backups < <(
  find "$base" -mindepth 1 -maxdepth 1 -type d -name 'dist_backup_*' -print0 | sort -z
)

remove_count=$((${#backups[@]} - keep))
if ((remove_count <= 0)); then
  exit 0
fi

for ((index = 0; index < remove_count; index++)); do
  candidate="${backups[$index]}"
  candidate_name="${candidate##*/}"

  [[ "$(dirname -- "$candidate")" == "$base" ]]
  [[ "$candidate_name" =~ ^dist_backup_[0-9]{8}T[0-9]{6}Z_[0-9a-f]{7,12}$ ]]
  [[ "$candidate" != "$base" && "$candidate" != '/' ]]

  rm -rf -- "$candidate"
  printf 'Removed old validated backup: %s\n' "$candidate"
done
REMOTE
}

on_error() {
  local exit_code="$1"
  local line_number="$2"

  trap - ERR INT TERM
  set +e
  printf '[deploy] ERROR: deployment stopped at line %s (exit %s).\n' "$line_number" "$exit_code" >&2

  if ((DRY_RUN == 0 && DEPLOY_SUCCEEDED == 0)); then
    if ((SWITCH_ATTEMPTED == 1)); then
      warn 'A production switch was attempted; checking whether rollback is required.'
      rollback_remote
    elif ((REMOTE_NEXT_CREATED == 1)); then
      warn 'Removing the validated deployment temporary directory after failure.'
      cleanup_remote_next
    fi
  fi

  if ((DRY_RUN == 0 && REMOTE_LOCK_MAYBE_ACQUIRED == 1)); then
    warn 'Releasing the deployment lock only if its owner token matches this run.'
    if release_remote_lock; then
      REMOTE_LOCK_MAYBE_ACQUIRED=0
    else
      warn "The deployment lock could not be safely released. Inspect $REMOTE_LOCK manually."
    fi
  fi

  exit "$exit_code"
}

main() {
  local tracking
  local ahead
  local behind

  parse_args "$@"
  require_command git
  require_command awk
  require_command sed
  require_command date
  initialize_context

  if ((DRY_RUN == 1)); then
    print_dry_run
    return 0
  fi

  require_command npm
  require_command ssh
  require_command rsync
  require_command curl
  require_command grep

  local_preflight

  log 'Refreshing origin/main before deployment.'
  git fetch --prune origin "$EXPECTED_BRANCH"

  tracking="$(tracking_status)"
  ahead="$(printf '%s' "$tracking" | awk '{print $1}')"
  behind="$(printf '%s' "$tracking" | awk '{print $2}')"
  if [[ "$ahead" != '0' && "$behind" != '0' ]]; then
    fail "Local main and origin/main have diverged (ahead=$ahead behind=$behind); reconcile them manually."
  fi
  [[ "$behind" == '0' ]] ||
    fail "Local main is behind origin/main by $behind commit(s); update it before deploying."

  log "Git comparison: ahead=$ahead behind=$behind"
  log 'Running Astro and TypeScript checks.'
  npm run check

  log 'Building the static production site.'
  npm run build

  validate_local_build

  log 'Pushing the exact local main commit only after local quality gates passed.'
  git push origin "$EXPECTED_BRANCH"

  printf '%s\n' "$FULL_SHA" >"${DIST_DIR}/.deploy-commit"
  printf '%s\n' "$DEPLOY_TIMESTAMP" >"${DIST_DIR}/.deploy-time"
  printf '%s\n' "$LOCK_TOKEN" >"${DIST_DIR}/.deploy-token"

  log "Acquiring the production lock and creating remote temporary release: $REMOTE_NEXT"
  remote_prepare

  log 'Uploading dist with rsync.'
  upload_release

  log 'Validating remote files, Nginx readability and configuration.'
  remote_validate_release

  log "Switching production dist; previous version will become: $REMOTE_BACKUP"
  remote_switch_release

  log 'Verifying production routes.'
  verify_production

  DEPLOY_SUCCEEDED=1
  log "Pruning validated backups; keeping the newest $BACKUP_KEEP_COUNT."
  prune_old_backups

  log 'Releasing the production deployment lock.'
  release_remote_lock
  REMOTE_LOCK_MAYBE_ACQUIRED=0

  log 'Production deployment completed successfully.'
  log "Commit: $FULL_SHA"
  log "Time (UTC): $DEPLOY_TIMESTAMP"
  log "Target: $REMOTE_TARGET:$REMOTE_CURRENT"
  log "Verification: four pages, homepage identity, $PRODUCTION_ASSET_PATH and SEO resources passed."
}

trap 'on_error $? $LINENO' ERR
trap 'on_error 130 $LINENO' INT
trap 'on_error 143 $LINENO' TERM

main "$@"
