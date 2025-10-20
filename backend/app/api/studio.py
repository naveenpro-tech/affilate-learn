"""
Community AI Studio API Routes
Endpoints for image generation, prompt enhancement, and community features
"""

import logging
import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User, GeneratedImage, CommunityPost, ImageCategory, ImageTemplate
from app.schemas.studio import (
    EnhancePromptRequest, EnhancePromptResponse,
    GenerateImageRequest, GenerateImageResponse, GenerationStatusResponse,
    MyCreationsResponse, GeneratedImageDetail,
    CreditBalance,
    ImageCategoryCreate, ImageCategoryUpdate, ImageCategoryResponse, CategoriesListResponse,
    ImageTemplateCreate, ImageTemplateUpdate, ImageTemplateResponse, TemplatesListResponse,
)
from app.services.prompt_enhancement_service import get_prompt_enhancement_service
from app.services.image_generation_service import get_image_generation_service
from app.services.credit_ledger_service import CreditLedgerService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/studio", tags=["studio"])


# ============================================================================
# TEMPLATES & CATEGORIES
# ============================================================================

@router.get("/categories", response_model=CategoriesListResponse)
async def get_categories(
    db: Session = Depends(get_db),
):
    """
    Get all active image categories
    Public endpoint - no auth required
    """
    try:
        categories = db.query(ImageCategory).filter(
            ImageCategory.is_active == True
        ).order_by(ImageCategory.display_order, ImageCategory.name).all()

        return CategoriesListResponse(
            items=categories,
            total=len(categories)
        )
    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get categories"
        )


@router.get("/templates", response_model=TemplatesListResponse)
async def get_templates(
    category_id: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Get all active image templates, optionally filtered by category
    Public endpoint - no auth required
    """
    try:
        query = db.query(ImageTemplate).filter(ImageTemplate.is_active == True)

        if category_id:
            query = query.filter(ImageTemplate.category_id == category_id)

        templates = query.order_by(ImageTemplate.created_at.desc()).all()

        # Enrich with category name
        for template in templates:
            if template.category:
                template.category_name = template.category.name

        return TemplatesListResponse(
            items=templates,
            total=len(templates)
        )
    except Exception as e:
        logger.error(f"Failed to get templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get templates"
        )


@router.get("/templates/{template_id}", response_model=ImageTemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single template by ID
    Public endpoint - no auth required
    """
    try:
        template = db.query(ImageTemplate).filter(
            ImageTemplate.id == template_id,
            ImageTemplate.is_active == True
        ).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        # Enrich with category name
        if template.category:
            template.category_name = template.category.name

        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


# ============================================================================
# PROMPT ENHANCEMENT
# ============================================================================

@router.post("/enhance-prompt", response_model=EnhancePromptResponse)
async def enhance_prompt(
    request: EnhancePromptRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Enhance a prompt using AI
    POST /api/studio/enhance-prompt
    """
    try:
        enhancer = get_prompt_enhancement_service()
        enhanced = await enhancer.enhance_prompt(request.prompt)
        
        return EnhancePromptResponse(
            enhanced_prompt=enhanced,
            suggestions=None,
        )
    except Exception as e:
        logger.error(f"Prompt enhancement failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enhance prompt",
        )


# ============================================================================
# IMAGE GENERATION
# ============================================================================

@router.post("/generate", response_model=GenerateImageResponse)
async def generate_image(
    request: GenerateImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate an image from a prompt
    POST /api/studio/generate
    """
    try:
        # Step 1: Check credit balance (don't debit yet!)
        balance = CreditLedgerService.get_balance(db, current_user.id)
        tier_cost = CreditLedgerService.get_tier_cost(request.tier)

        if balance < tier_cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. Need {tier_cost}, have {balance}",
            )

        # Step 2: Enhance prompt only if requested
        if getattr(request, "enhance_prompt", False):
            enhancer = get_prompt_enhancement_service()
            enhanced_prompt = await enhancer.enhance_prompt(request.prompt)
        else:
            enhanced_prompt = request.prompt

        # Step 3: Generate image FIRST (with optional provider override)
        image_gen = get_image_generation_service()
        gen_result = await image_gen.generate_image(
            enhanced_prompt,
            request.tier,
            provider=request.provider,  # Allow UI to select provider
            user_id=current_user.id  # Pass user_id for local storage
        )

        # Step 4: Check if generation succeeded
        if gen_result["status"] == "failed":
            # Generation failed - NO credits debited!
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image generation failed: {gen_result.get('error')}",
            )

        # Step 5: Generation succeeded - NOW debit credits
        debit_result = CreditLedgerService.debit_credits(
            db,
            current_user.id,
            tier_cost,
            reason="generation",
            ref_id=f"gen-{current_user.id}-{gen_result.get('job_id')}",
        )

        if not debit_result["success"]:
            # Critical: debit failed after generation - abort save and return error
            logger.error(
                f"CRITICAL: Failed to debit credits after successful generation! "
                f"user={current_user.id}, cost={tier_cost}, reason={debit_result.get('error')}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment processing failed: {debit_result.get('error')}. Please contact support.",
            )
        
        # Save to database
        generated_image = GeneratedImage(
            user_id=current_user.id,
            prompt_text=request.prompt,
            enhanced_prompt=enhanced_prompt,
            tier=request.tier,
            image_url=gen_result.get("image_url"),
            width=gen_result.get("width", 1024),
            height=gen_result.get("height", 1024),
            provider=gen_result.get("provider", "replicate"),
            job_id=gen_result.get("job_id"),
            status=gen_result.get("status", "succeeded"),
            credits_spent=tier_cost,
        )
        db.add(generated_image)
        db.commit()
        db.refresh(generated_image)
        
        logger.info(f"Image generated: user={current_user.id}, image_id={generated_image.id}")

        return GenerateImageResponse(
            job_id=str(generated_image.id),  # Convert to string
            status=generated_image.status,
            credits_debited=tier_cost,
            estimated_time_seconds=0,  # Synchronous providers
            image_url=generated_image.image_url,  # Include image_url for immediate display
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate image",
        )


@router.get("/generate/{job_id}", response_model=GenerationStatusResponse)
async def get_generation_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get status of a generation job
    GET /api/studio/generate/{job_id}
    """
    try:
        image = db.query(GeneratedImage).filter(
            GeneratedImage.id == job_id,
            GeneratedImage.user_id == current_user.id,
        ).first()
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generation not found",
            )
        
        return GenerationStatusResponse(
            job_id=str(image.id),
            status=image.status,
            image_url=image.image_url,
            error=image.error_message,
            credits_used=image.credits_spent,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting generation status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get generation status",
        )


# ============================================================================
# MY CREATIONS
# ============================================================================

@router.get("/my-creations", response_model=MyCreationsResponse)
async def get_my_creations(
    cursor: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get user's generated images
    GET /api/studio/my-creations
    """
    try:
        # Get total count
        total = db.query(GeneratedImage).filter(
            GeneratedImage.user_id == current_user.id,
        ).count()

        # Get paginated images
        images = db.query(GeneratedImage).filter(
            GeneratedImage.user_id == current_user.id,
        ).order_by(GeneratedImage.created_at.desc()).offset(cursor).limit(limit + 1).all()

        has_next = len(images) > limit
        items = images[:limit]

        return MyCreationsResponse(
            items=[
                GeneratedImageDetail(
                    id=img.id,
                    prompt_text=img.prompt_text,
                    enhanced_prompt=img.enhanced_prompt,
                    tier=img.tier,
                    image_url=img.image_url,
                    status=img.status,
                    created_at=img.created_at,
                )
                for img in items
            ],
            total=total,
            next_cursor=cursor + limit if has_next else None,
        )
        
    except Exception as e:
        logger.error(f"Error getting my creations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get creations",
        )


@router.delete("/my-creations/{image_id}")
async def delete_creation(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a generated image
    DELETE /api/studio/my-creations/{image_id}
    """
    try:
        image = db.query(GeneratedImage).filter(
            GeneratedImage.id == image_id,
            GeneratedImage.user_id == current_user.id,
        ).first()
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found",
            )
        
        db.delete(image)
        db.commit()
        
        logger.info(f"Image deleted: user={current_user.id}, image_id={image_id}")
        
        return {"message": "Image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete image",
        )


# ============================================================================
# CREDITS & WALLET
# ============================================================================

@router.get("/credits/balance", response_model=CreditBalance)
async def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get user's credit balance
    GET /api/studio/credits/balance
    """
    try:
        balance = CreditLedgerService.get_balance(db, current_user.id)

        return CreditBalance(
            credits=balance,
            monthly_used=0,  # TODO: Calculate from ledger
            monthly_remaining=0,  # TODO: Calculate from ledger
        )

    except Exception as e:
        logger.error(f"Error getting credit balance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get credit balance",
        )


from app.core.rate_limit import limiter

@router.post("/credits/purchase")
@limiter.limit("10/minute")
async def purchase_credits(
    request: Request,
    amount: int,  # Number of credits to purchase
    idempotency_key: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Purchase credits using wallet balance
    POST /api/studio/credits/purchase?amount=10&idempotency_key=... (optional)

    Converts wallet balance (₹) to studio credits (1 credit = ₹5)
    """
    try:
        from app.models.wallet import Wallet, WalletTransaction, TransactionType, TransactionSource
        from app.core.database import engine

        if amount <= 0 or amount > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be between 1 and 10000 credits",
            )

        # Ensure tables exist
        Wallet.__table__.create(bind=engine, checkfirst=True)
        WalletTransaction.__table__.create(bind=engine, checkfirst=True)

        # Idempotency: if idempotency_key provided and we already credited, short-circuit
        ref_id = f"wallet-purchase-{current_user.id}-{idempotency_key}" if idempotency_key else f"wallet-purchase-{current_user.id}"

        # Calculate cost (1 credit = ₹5)
        cost_in_rupees = float(amount) * 5.0

        # Start atomic transaction (manual commit/rollback to avoid nested begin errors)
        try:
            # Load wallet
            wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
            if not wallet:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Wallet not found. Please contact support.",
                )

            # Prevent duplicate by checking existing wallet transaction with same reference_id
            if idempotency_key:
                existing_txn = db.query(WalletTransaction).filter(
                    WalletTransaction.wallet_id == wallet.id,
                    WalletTransaction.reference_id == ref_id,
                ).first()
                if existing_txn:
                    # Return current balances
                    new_credit_balance = CreditLedgerService.get_balance(db, current_user.id)
                    return {
                        "success": True,
                        "message": "Duplicate request ignored (idempotent)",
                        "credits_purchased": amount,
                        "cost": cost_in_rupees,
                        "new_credit_balance": new_credit_balance,
                        "new_wallet_balance": wallet.balance,
                    }

            # Balance check
            if wallet.balance < cost_in_rupees:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Insufficient wallet balance. Need ₹{cost_in_rupees}, have ₹{wallet.balance}",
                )

            # Create wallet transaction (DEBIT -> PURCHASE)
            balance_before = wallet.balance
            wallet.balance -= cost_in_rupees
            wallet.total_spent += cost_in_rupees

            # Generate unique reference_id with timestamp to avoid collisions
            if not idempotency_key:
                unique_suffix = str(uuid.uuid4())[:8]
                ref_id = f"wallet-purchase-{current_user.id}-{int(cost_in_rupees)}-{unique_suffix}"

            txn = WalletTransaction(
                wallet_id=wallet.id,
                type=TransactionType.DEBIT,
                source=TransactionSource.PURCHASE,
                amount=cost_in_rupees,
                balance_before=balance_before,
                balance_after=wallet.balance,
                description=f"Studio credits purchase ({amount} credits)",
                reference_id=ref_id,
            )
            db.add(txn)

            # Credit studio credits (idempotent internally)
            credit_result = CreditLedgerService.credit_credits(
                db,
                current_user.id,
                amount,
                reason="purchase",
                ref_id=ref_id,
            )

            if not credit_result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to credit studio credits",
                )

            db.commit()
        except:
            db.rollback()
            raise

        logger.info(
            f"Credits purchased: user={current_user.id}, amount={amount}, cost=₹{cost_in_rupees}"
        )

        return {
            "success": True,
            "message": f"Successfully purchased {amount} credits for ₹{cost_in_rupees}",
            "credits_purchased": amount,
            "cost": cost_in_rupees,
            "new_credit_balance": CreditLedgerService.get_balance(db, current_user.id),
            "new_wallet_balance": db.query(Wallet).filter(Wallet.user_id == current_user.id).first().balance,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error purchasing credits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to purchase credits",
        )

