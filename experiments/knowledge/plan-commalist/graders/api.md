---
type: llm
---
Pass only if the plan subclasses ParamType from src/click/types.py, implements convert (reporting invalid input through self.fail), and implements shell_complete returning click.shell_completion.CompletionItem objects, citing Choice as an example of shell_complete.
