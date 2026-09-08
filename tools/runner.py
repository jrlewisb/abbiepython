"""Execute a snippet the way the workbook does and report back as JSON."""
import sys, json, io, os, shutil, tempfile, contextlib, traceback

payload = json.load(sys.stdin)

# Lessons from chapter 15 onwards write and read real files. Run every snippet
# in a throwaway directory so they cannot litter (or overwrite) the repo, and so
# each run starts with an empty filesystem the way Pyodide's does.
_sandbox = tempfile.mkdtemp(prefix="workbook-")
os.chdir(_sandbox)

ns = {}
buf = io.StringIO()
err = None
with contextlib.redirect_stdout(buf):
    try:
        exec(payload["code"], ns)
    except Exception:
        err = traceback.format_exc()

out = {"stdout": buf.getvalue(), "error": err}

expr = payload.get("expr")
if expr is not None:
    try:
        try:
            val = eval(expr, ns)
        except SyntaxError:
            exec(expr, ns)
            val = None
        json.dumps(val)          # only report JSON-able values
        out["value"] = val
        out["ok"] = True
    except Exception:
        out["ok"] = False

print(json.dumps(out, default=str))

shutil.rmtree(_sandbox, ignore_errors=True)
