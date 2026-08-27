# syntax=docker/dockerfile:1.12

ARG NODE_IMAGE=node@sha256:80f12a4030a00d8f78ebc4602bc3ef0f984932f498649b8ed3c0a740a6dff4a8
ARG RUNTIME_IMAGE=gcr.io/distroless/cc-debian13@sha256:a77defd6fedbb3392b175ba8ea3d1c22be963c1597c248c3ba987ddd80bfb512
ARG IOTERAX_DEPENDENCY_CHANNEL=stable
ARG PATCHED_LIBSSL_VERSION=3.5.7-1~deb13u2

FROM ${NODE_IMAGE} AS toolchain

ARG IOTERAX_NPM_REGISTRY=https://npm.pkg.github.com
ARG IOTERAX_DEPENDENCY_CHANNEL
ARG PATCHED_LIBSSL_VERSION
ENV IOTERAX_NPM_REGISTRY=${IOTERAX_NPM_REGISTRY}

WORKDIR /app

COPY .yarn/releases/yarn-4.18.0.cjs /opt/yarn/yarn.cjs
RUN chmod 0555 /opt/yarn/yarn.cjs && \
    ln -s /opt/yarn/yarn.cjs /usr/local/bin/yarn

RUN set -eu; \
    export DEBIAN_FRONTEND=noninteractive; \
    apt-get update; \
    apt-get install --yes --no-install-recommends binutils; \
    cd /tmp; \
    apt-get download "libssl3t64=${PATCHED_LIBSSL_VERSION}"; \
    libssl_package="$(find /tmp -maxdepth 1 -type f -name 'libssl3t64_*.deb' -print -quit)"; \
    test -n "${libssl_package}"; \
    mkdir -p /runtime-security-overlay/var/lib/dpkg/status.d; \
    dpkg-deb --extract "${libssl_package}" /runtime-security-overlay; \
    dpkg-deb --field "${libssl_package}" > /runtime-security-overlay/var/lib/dpkg/status.d/libssl3t64; \
    mkdir -p /node-runtime /node-runtime-libs; \
    libatomic_path="$(ldconfig -p | sed -n '/^[[:space:]]*libatomic\.so\.1 / { s/.*=> //; p; q; }')"; \
    test -n "${libatomic_path}"; \
    cp --dereference "${libatomic_path}" /node-runtime-libs/libatomic.so.1; \
    cp /usr/local/bin/node /node-runtime/node; \
    strip --strip-unneeded /node-runtime/node; \
    /node-runtime/node --version | grep -Fx 'v26.6.0'; \
    rm -rf /var/lib/apt/lists/*

COPY .yarn/patches ./.yarn/patches
COPY package.json yarn.lock tsconfig.json nest-cli.json register-path-alias.cjs ./
COPY scripts/docker/prepare-dependency-channel.cjs ./scripts/docker/prepare-dependency-channel.cjs
COPY scripts/docker/install-dependency-channel.sh ./scripts/docker/install-dependency-channel.sh

RUN printf '%s\n' \
    'nodeLinker: pnp' \
    'pnpMode: strict' \
    'compressionLevel: 9' \
    'enableGlobalCache: false' \
    'enableImmutableInstalls: false' \
    'enableScripts: false' \
    'globalFolder: /yarn/global' \
    'networkConcurrency: 16' \
    'logFilters:' \
    '  - code: YN0004' \
    '    level: discard' \
    '  - code: YN0092' \
    '    level: discard' \
    'npmAuditRegistry: "https://registry.npmjs.org"' \
    'npmRegistryServer: "https://registry.npmjs.org"' \
    'npmScopes:' \
    '  ioterax:' \
    '    npmRegistryServer: "${IOTERAX_NPM_REGISTRY}"' \
    '    npmAlwaysAuth: true' \
    '    npmAuthToken: "${YARN_NPM_AUTH_TOKEN-}"' \
    > .yarnrc.yml

RUN IOTERAX_DEPENDENCY_CHANNEL="${IOTERAX_DEPENDENCY_CHANNEL}" \
    node scripts/docker/prepare-dependency-channel.cjs

FROM toolchain AS builder

ARG IOTERAX_DEPENDENCY_CHANNEL

RUN --mount=type=cache,id=api-region-yarn-global,target=/yarn/global,sharing=locked \
    --mount=type=secret,id=ioterax_npm_token,required=true \
    YARN_NPM_AUTH_TOKEN="$(cat /run/secrets/ioterax_npm_token)" \
    IOTERAX_DEPENDENCY_CHANNEL="${IOTERAX_DEPENDENCY_CHANNEL}" \
    sh scripts/docker/install-dependency-channel.sh full

COPY src ./src

RUN yarn build

FROM toolchain AS production-dependencies

ARG IOTERAX_DEPENDENCY_CHANNEL

RUN --mount=type=cache,id=api-region-yarn-global,target=/yarn/global,sharing=locked \
    --mount=type=secret,id=ioterax_npm_token,required=true \
    YARN_NPM_AUTH_TOKEN="$(cat /run/secrets/ioterax_npm_token)" \
    IOTERAX_DEPENDENCY_CHANNEL="${IOTERAX_DEPENDENCY_CHANNEL}" \
    sh scripts/docker/install-dependency-channel.sh production

FROM ${RUNTIME_IMAGE} AS runtime

ENV NODE_ENV=production \
    SERVICE_NAME=api-region \
    LISTEN_PORT=3903 \
    MONGODB_DATABASE=foundation_central \
    LD_LIBRARY_PATH=/usr/local/lib \
    NODE_OPTIONS="--enable-source-maps --require=/app/.pnp.cjs --require=/app/register-path-alias.cjs"

WORKDIR /app

COPY --from=toolchain /runtime-security-overlay /
COPY --from=toolchain /node-runtime/node /usr/local/bin/node
COPY --from=toolchain /node-runtime-libs/libatomic.so.1 /usr/local/lib/libatomic.so.1
COPY --from=production-dependencies --chown=65532:65532 /app/package.json ./package.json
COPY --from=production-dependencies --chown=65532:65532 /app/.pnp.cjs ./.pnp.cjs
COPY --from=production-dependencies --chown=65532:65532 /app/.pnp.loader.mjs ./.pnp.loader.mjs
COPY --from=production-dependencies --chown=65532:65532 /app/.yarn/cache ./.yarn/cache
COPY --from=builder --chown=65532:65532 /app/register-path-alias.cjs ./register-path-alias.cjs
COPY --from=builder --chown=65532:65532 /app/dist ./dist

USER 65532:65532

EXPOSE 3903

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD ["/usr/local/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||process.env.LISTEN_PORT||'3903')+'/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["dist/main.js"]
