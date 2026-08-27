#!/bin/sh

set -eu

install_mode="${1:-}"
dependency_channel="${IOTERAX_DEPENDENCY_CHANNEL:-}"

case "${install_mode}" in
  full | production) ;;
  *)
    echo "Unsupported dependency install mode: ${install_mode}" >&2
    exit 64
    ;;
esac

case "${dependency_channel}" in
  stable)
    lock_check_directory="$(mktemp -d)"
    sed '/^  cacheKey:/d' yarn.lock > "${lock_check_directory}/before.lock"
    YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --mode=update-lockfile
    sed '/^  cacheKey:/d' yarn.lock > "${lock_check_directory}/after.lock"
    if ! cmp -s "${lock_check_directory}/before.lock" "${lock_check_directory}/after.lock"; then
      echo 'Docker cache compression attempted to change dependency resolutions' >&2
      exit 65
    fi
    ;;
  dev | local)
    if [ "${install_mode}" = production ]; then
      yarn up -R '@ioterax/*' --mode=update-lockfile
    else
      yarn up -R '@ioterax/*'
    fi
    ;;
  *)
    echo "Unsupported ioterax dependency channel: ${dependency_channel}" >&2
    exit 64
    ;;
esac

if [ "${install_mode}" = full ]; then
  yarn install --immutable --mode=skip-build
else
  YARN_ENABLE_IMMUTABLE_INSTALLS=true yarn workspaces focus --production
fi
