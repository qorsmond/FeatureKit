# Verification

Run every check before calling a change done:

```sh
for check in checks/check_*.py; do python3 "$check" || exit 1; done
```

The checks call `app.api.handle` directly; no server or network is needed.
