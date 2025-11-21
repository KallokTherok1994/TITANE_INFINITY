pub fn build_matrix(alignment: f32, sync: f32) -> [[f32; 3]; 3] {
    [
        [alignment, sync, alignment + sync / 2.0],
        [sync, alignment, alignment * sync.sqrt()],
        [alignment + sync / 2.0, alignment * sync.sqrt(), alignment],
    ]
}
