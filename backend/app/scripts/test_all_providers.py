"""
Test all image generation providers
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.services.image_generation_service import (
    MockImageGenerationAdapter,
    HuggingFaceAdapter,
    OpenAIDALLEAdapter,
    GeminiNanoBananaAdapter,
    ReplicateAdapter,
)


async def test_provider(name: str, adapter, prompt: str, tier: str = "standard", user_id: int = 1):
    """Test a single provider"""
    print(f"\n{'='*60}")
    print(f"Testing {name}")
    print(f"{'='*60}")
    print(f"Prompt: {prompt}")
    print(f"Tier: {tier}")
    
    try:
        result = await adapter.generate(prompt, tier, user_id)
        
        print(f"✅ SUCCESS")
        print(f"Job ID: {result.get('job_id')}")
        print(f"Status: {result.get('status')}")
        print(f"Image URL: {result.get('image_url')}")
        print(f"Credits: {result.get('credits_used')}")
        
        if result.get('error'):
            print(f"⚠️  Error: {result.get('error')}")
        
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Test all providers"""
    test_prompt = "a beautiful sunset over mountains with vibrant colors"
    
    results = {}
    
    # Test Mock Provider
    print("\n" + "="*60)
    print("PROVIDER TESTING SUITE")
    print("="*60)
    
    # 1. Mock Provider (should always work)
    mock_adapter = MockImageGenerationAdapter()
    results['Mock'] = await test_provider(
        "Mock Provider",
        mock_adapter,
        test_prompt,
        tier="standard",
        user_id=1
    )
    
    # 2. HuggingFace Provider
    hf_adapter = HuggingFaceAdapter()
    results['HuggingFace'] = await test_provider(
        "HuggingFace Provider",
        hf_adapter,
        test_prompt,
        tier="standard",
        user_id=1
    )
    
    # 3. OpenAI DALL-E 3 Provider
    dalle_adapter = OpenAIDALLEAdapter()
    results['OpenAI DALL-E 3'] = await test_provider(
        "OpenAI DALL-E 3 Provider",
        dalle_adapter,
        test_prompt,
        tier="standard",
        user_id=1
    )
    
    # 4. Gemini Nano Banana Provider
    gemini_adapter = GeminiNanoBananaAdapter()
    results['Gemini Nano Banana'] = await test_provider(
        "Gemini Nano Banana Provider",
        gemini_adapter,
        test_prompt,
        tier="standard",
        user_id=1
    )
    
    # 5. Replicate Provider
    try:
        replicate_adapter = ReplicateAdapter()
        results['Replicate'] = await test_provider(
            "Replicate Provider",
            replicate_adapter,
            test_prompt,
            tier="standard",
            user_id=1
        )
    except ValueError as e:
        print(f"\n{'='*60}")
        print(f"Testing Replicate Provider")
        print(f"{'='*60}")
        print(f"⚠️  SKIPPED: {e}")
        results['Replicate'] = None  # Skipped
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for provider, success in results.items():
        if success is None:
            status = "⚠️  SKIP"
        elif success:
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        print(f"{provider:30} {status}")

    total = len([v for v in results.values() if v is not None])
    passed = sum(1 for v in results.values() if v is True)
    skipped = sum(1 for v in results.values() if v is None)
    failed = total - passed

    print(f"\nTotal: {total} | Passed: {passed} | Failed: {failed} | Skipped: {skipped}")
    if total > 0:
        print(f"Success Rate: {(passed/total)*100:.1f}%")


if __name__ == "__main__":
    asyncio.run(main())

