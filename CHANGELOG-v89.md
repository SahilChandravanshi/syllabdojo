# v89 — Hide the entire exam selector while exam info is open

- Based on v88, as requested.
- When an exam info popup opens from either the Dashboard or Analytics exam selector, the full exam-selection panel (header, search, exam rows, and Done button) is hidden.
- The selector's backdrop stays mounted so the underlying app remains dimmed; the exam info popup remains visible as its own overlay.
- Closing the info popup restores the entire selector panel immediately.
- No additional dimming, blur, or popup surface styling changes.
