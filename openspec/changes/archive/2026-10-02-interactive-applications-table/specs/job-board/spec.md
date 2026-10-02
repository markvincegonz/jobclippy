# Spec Delta: job-board

## ADDED Requirements

### Requirement: Cross-View Pipeline Synchronization
Stage transitions and updates executed within the Table view (single-row or batch updates) SHALL immediately reflect in the Kanban board and stage count badges without page reloads.

#### Scenario: Switching between Table and Board views after stage updates
- **WHEN** user changes an opportunity's stage in the Table view and switches to the Pipeline Board
- **THEN** the corresponding card appears in the new stage column and sidebar counters reflect the updated quantities
