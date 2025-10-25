#!/usr/bin/env python3
"""
Generate Secure Secrets for Production Deployment

This script generates secure random secrets for:
- JWT SECRET_KEY
- KEY_ENCRYPTION_SECRET

Usage:
    python generate_secrets.py
"""

import secrets
import string


def generate_secret(length=64):
    """Generate a secure random secret"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_hex_secret(length=32):
    """Generate a secure random hex secret"""
    return secrets.token_hex(length)


def main():
    print("=" * 70)
    print("SECURE SECRETS GENERATOR")
    print("=" * 70)
    print()
    print("Generating secure secrets for production deployment...")
    print()
    
    # Generate secrets
    jwt_secret = generate_hex_secret(32)
    encryption_secret = generate_hex_secret(32)
    
    print("✅ Secrets generated successfully!")
    print()
    print("-" * 70)
    print("JWT SECRET_KEY:")
    print("-" * 70)
    print(jwt_secret)
    print()
    print("-" * 70)
    print("KEY_ENCRYPTION_SECRET:")
    print("-" * 70)
    print(encryption_secret)
    print()
    print("=" * 70)
    print()
    print("📋 INSTRUCTIONS:")
    print()
    print("1. Copy the secrets above")
    print("2. Add them to your Render environment variables:")
    print("   - SECRET_KEY = <JWT SECRET_KEY>")
    print("   - KEY_ENCRYPTION_SECRET = <KEY_ENCRYPTION_SECRET>")
    print()
    print("3. DO NOT commit these secrets to Git")
    print("4. Store them securely (password manager, secure notes)")
    print()
    print("⚠️  WARNING: Keep these secrets safe!")
    print("   - Never share them publicly")
    print("   - Never commit them to version control")
    print("   - Store them in a secure location")
    print()
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()

