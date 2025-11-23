// TITANE∞ v8.0 - Taskflow Engine: Plan Generation

use super::model::{TaskflowPlan, TaskflowStep};
pub fn generate_plan(activity: f32, clarity: f32, complexity: f32) -> TaskflowPlan {
    let mut steps = vec![];
    if clarity > 0.6 {
        steps.push(TaskflowStep {
            description: "Consolider la direction actuelle".to_string(),
            weight: 0.4,
        });
    }
    if activity > 0.5 {
            description: "Activer une micro-séquence productive".to_string(),
            weight: 0.35,
    if complexity > 0.6 {
            description: "Réduire la charge cognitive et simplifier".to_string(),
            weight: 0.25,
    TaskflowPlan { steps }
}
