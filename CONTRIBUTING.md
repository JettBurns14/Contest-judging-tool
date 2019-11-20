# How to contribute

Thanks for stopping by! Please follow these guidelines for contributing so it's easy for us to review your work.

## General:

- If you have a Feature Request, Idea, or found a Bug, check if it's already in [our list](https://github.com/JettBurns14/Contest-judging-tool/issues) of issues.
If it's not there, go ahead and create one.

- If you want to write some code, please find an open issue you want to work on and ask to be assigned.
After that, make a new branch or branch on your fork for the change.
Your initials should precede its title (e.g. jb-fix-header).
Make a new pull request, referencing the issue and describing what you worked on.


## Commits:

Commits should follow our standards, most of which are borrowed from [this guide](https://chris.beams.io/posts/git-commit/), a great read for any dev.
(Commit templates will be added in the future to make some of this easier to remember and perform.)

- Please commit frequently as you work!
It's very hard to understand a commit if multiple unrelated changes where committed together, rather than committed separately.
If you did something, commit it! A good little guide on this is [here](https://www.freshconsulting.com/atomic-commits/).

- Please include a descriptive yet short commit title/subject that's under 50 characters, which summarizes your main changes.
It should be **capitalized** with **no periods** at the end, and in the **imperative mood** (e.g. "Fix the broken header").
A great way to word a title is to fill in this sentence: "If applied, this commit will **\<your title here\>**"

- Add a blank line between the commit title and body.

- Commit messages should wrap at 72 characters.
They should explain _what_ changed and _why_ the change happened, not _how_ things were changed, the code explains that.
If you want to list out stuff, use a **hyphen**, followed by a **space**, and the **capitalized** item, separated from each other with **blank lines**.

- If your work is related to an open issue, please reference it at the end of the commit like shown below.


Example commit:
```
Title under 50 chars

More detailed body, if necessary. Wrap at 72 chars.

- List item one

- List item two

- List item three

Resolves: #19
```
