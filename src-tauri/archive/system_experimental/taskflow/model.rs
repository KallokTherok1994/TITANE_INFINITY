// TITANE∞ v8.0 - Taskflow Engine: Data Models

#[derive(Clone)]
pub struct TaskflowStep {
    pub description: String,
    pub weight: f32,
}
pub struct TaskflowPlan {
    pub steps: Vec<TaskflowStep>,
impl TaskflowPlan {
    pub fn empty() -> Self {
        Self { steps: vec![] }
    }
pub struct ClarityRoute {
    pub recommended_focus: String,
    pub minimal_next_step: String,
impl ClarityRoute {
        Self {
            recommended_focus: String::new(),
            minimal_next_step: String::new(),
        }
