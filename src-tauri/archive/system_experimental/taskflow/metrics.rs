// TITANE∞ v10.4 - Taskflow Engine: Metrics (f32 normalized)

pub struct TaskflowMetrics {
    pub activity: f32,
    pub clarity: f32,
    pub complexity: f32,
}
pub fn clamp01(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
