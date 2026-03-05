use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, MutexGuard, TryLockError};

use super::db_migrations::apply_migrations;
use super::db_types::{DbError, DbResult};

pub struct DbState {
    connection: Mutex<Connection>,
    global_gate: Mutex<()>,
    pub db_path: PathBuf,
}

impl DbState {
    pub fn new(db_path: PathBuf) -> DbResult<Arc<Self>> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                DbError::new("DB_PATH", "Unable to create database directory")
                    .with_details(e.to_string())
            })?;
        }

        let conn = Connection::open(&db_path).map_err(DbError::from)?;
        apply_migrations(&conn)?;

        Ok(Arc::new(Self {
            connection: Mutex::new(conn),
            global_gate: Mutex::new(()),
            db_path,
        }))
    }

    pub fn try_enter(&self) -> DbResult<MutexGuard<'_, ()>> {
        self.global_gate.try_lock().map_err(|err| match err {
            TryLockError::Poisoned(_) => {
                DbError::new("DB_LOCK_POISONED", "Global DB lock is poisoned")
            }
            TryLockError::WouldBlock => {
                DbError::new("DB_BUSY", "Database is busy (sync or query in progress)")
            }
        })
    }

    pub fn with_conn<T>(&self, f: impl FnOnce(&Connection) -> DbResult<T>) -> DbResult<T> {
        let _gate = self.try_enter()?;
        let conn = self.connection.lock().map_err(|_| {
            DbError::new("DB_CONN_POISONED", "Database connection mutex is poisoned")
        })?;
        f(&conn)
    }

    pub fn with_conn_guarded<T>(
        &self,
        _gate: &MutexGuard<'_, ()>,
        f: impl FnOnce(&Connection) -> DbResult<T>,
    ) -> DbResult<T> {
        let conn = self.connection.lock().map_err(|_| {
            DbError::new("DB_CONN_POISONED", "Database connection mutex is poisoned")
        })?;
        f(&conn)
    }
}
