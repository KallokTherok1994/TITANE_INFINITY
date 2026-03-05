use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct DbError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

impl DbError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: None,
        }
    }

    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }
}

impl From<rusqlite::Error> for DbError {
    fn from(value: rusqlite::Error) -> Self {
        Self::new("DB_SQLITE", "SQLite operation failed").with_details(value.to_string())
    }
}

pub type DbResult<T> = Result<T, DbError>;

#[derive(Debug, Clone, Serialize)]
pub struct IpcResponse<T>
where
    T: Serialize,
{
    pub ok: bool,
    pub content: Option<T>,
    pub error: Option<DbError>,
}

impl<T> IpcResponse<T>
where
    T: Serialize,
{
    pub fn success(content: T) -> Self {
        Self {
            ok: true,
            content: Some(content),
            error: None,
        }
    }

    pub fn failure(error: DbError) -> Self {
        Self {
            ok: false,
            content: None,
            error: Some(error),
        }
    }
}
