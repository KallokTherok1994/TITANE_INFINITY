#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_input_validation() {
        let validator = InputValidator::default();
        
        // Valid message
        assert!(validator.validate_message("Hello, TITANE!").is_ok());
        
        // Empty message
        assert!(validator.validate_message("").is_err());
        
        // XSS attempt
        assert!(validator.validate_message("<script>alert('xss')</script>").is_err());
        
        // SQL injection attempt
        assert!(validator.validate_message("'; DROP TABLE users; --").is_err());
    }
    
    #[tokio::test]
    async fn test_rate_limiting() {
        let limiter = RateLimiter::new(3, 1);
        
        // First 3 requests should succeed
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        
        // 4th request should fail
        assert!(limiter.check("user1").await.is_err());
        
        // Different user should succeed
        assert!(limiter.check("user2").await.is_ok());
    }
    
    #[test]
    fn test_encryption() {
        let key: [u8; 32] = [0u8; 32];
        let encryptor = Encryptor::new(&key);
        
        let data = b"Sensitive data";
        let encrypted = encryptor
            .encrypt(data)
            .expect("encryption should succeed in test");
        let decrypted = encryptor
            .decrypt(&encrypted)
            .expect("decryption should recover plaintext");
        
        assert_eq!(data, &decrypted[..]);
        assert_ne!(data, &encrypted[..]);
    }
}
