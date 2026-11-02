# v68 — Custom selective reset dialog

- Replaced the browser-native confirmation prompt with a SyllabDojo-styled modal.
- Added an All exams option and individual checkboxes for each exam.
- Reset action stays disabled until at least one exam is selected.
- Partial reset clears selected exam topic completions and that exam's activity history.
- Resetting a shared topic also clears it wherever it appears in other exams, consistent with the app's shared-topic completion model.
- Legacy global activity is cleared during partial resets because it cannot be reliably attributed to a particular exam.
- Cancel and outside-click dismiss the dialog without changing progress.
