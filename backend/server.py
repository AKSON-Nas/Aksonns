from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Cookie, Response, Depends, Header
from fastapi.responses import StreamingResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests
import base64
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    picture: str
    plan: str = "free"
    role: str = "user"  # user or admin
    created_at: str

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: str
    created_at: str

class SessionRequest(BaseModel):
    session_id: str

class PlanFeature(BaseModel):
    name: str
    enabled: bool

class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    display_name: str
    price: float
    features: List[PlanFeature]
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PlanCreate(BaseModel):
    name: str
    display_name: str
    price: float
    features: List[PlanFeature]

class PlanUpdate(BaseModel):
    display_name: Optional[str] = None
    price: Optional[float] = None
    features: Optional[List[PlanFeature]] = None
    is_active: Optional[bool] = None

class PaymentConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mercadopago_access_token: str
    webhook_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentConfigCreate(BaseModel):
    mercadopago_access_token: str
    webhook_url: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_name: str
    amount: float
    status: str = "pending"  # pending, approved, rejected
    mercadopago_payment_id: Optional[str] = None
    qr_code: Optional[str] = None
    qr_code_base64: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentCreate(BaseModel):
    plan_name: str

class CompanyInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    logo_url: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CompanyCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class BudgetItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    total: float

class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    client_id: str
    client_name: str
    items: List[BudgetItem]
    subtotal: float
    discount: float = 0
    tax: float = 0
    total: float
    notes: Optional[str] = None
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BudgetCreate(BaseModel):
    client_id: str
    items: List[BudgetItem]
    discount: float = 0
    tax: float = 0
    notes: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    quantity: float = 0
    min_quantity: float = 0
    unit_price: float = 0
    supplier_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    quantity: float = 0
    min_quantity: float = 0
    unit_price: float = 0
    supplier_id: Optional[str] = None

class Supplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SupplierCreate(BaseModel):
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    salary: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EmployeeCreate(BaseModel):
    name: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    salary: Optional[float] = None

class StockMovement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    product_name: str
    type: str
    quantity: float
    reason: Optional[str] = None
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StockMovementCreate(BaseModel):
    product_id: str
    type: str
    quantity: float
    reason: Optional[str] = None
    employee_id: Optional[str] = None

class Sale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    client_id: str
    client_name: str
    items: List[BudgetItem]
    total: float
    payment_method: str
    status: str = "completed"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SaleCreate(BaseModel):
    client_id: str
    items: List[BudgetItem]
    payment_method: str

# ==================== AUTH HELPERS ====================

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)):
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = datetime.fromisoformat(session["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user)

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def check_feature_access(user: User, feature_name: str):
    """Check if user's plan has access to a feature"""
    plan = await db.plans.find_one({"name": user.plan}, {"_id": 0})
    if not plan:
        return False
    
    for feature in plan.get("features", []):
        if feature["name"] == feature_name and feature["enabled"]:
            return True
    return False

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    session_id = request.session_id
    
    try:
        logger.info(f"Creating session for session_id: {session_id[:20]}...")
        
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        
        if auth_response.status_code != 200:
            logger.error(f"OAuth session failed: {auth_response.status_code} - {auth_response.text}")
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        data = auth_response.json()
        session_token = data["session_token"]
        
        logger.info(f"OAuth successful for user: {data['email']}")
        
        existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        
        if not existing_user:
            # Check if this is the admin email
            role = "admin" if data["email"] == "aksonns4@gmail.com" else "user"
            
            user_data = {
                "id": data["id"],
                "email": data["email"],
                "name": data["name"],
                "picture": data["picture"],
                "plan": "free",
                "role": role,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_data)
            logger.info(f"New user created: {data['email']} with role: {role}")
            user_id = data["id"]
            plan = "free"
            
            # If admin, log special message
            if role == "admin":
                logger.info(f"⭐ ADMIN USER CREATED: {data['email']}")
        else:
            user_id = existing_user["id"]
            plan = existing_user.get("plan", "free")
            role = existing_user.get("role", "user")
            logger.info(f"Existing user logged in: {data['email']}")
        
        # Delete old sessions for this user
        await db.user_sessions.delete_many({"user_id": user_id})
        
        session_data = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_data)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7*24*60*60,
            path="/",
            domain=None
        )
        
        logger.info(f"Session created successfully for user: {user_id}")
        
        # Return user data as well
        user_response = {
            "id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data["picture"],
            "plan": plan,
            "role": role
        }
        
        return {
            "success": True, 
            "session_token": session_token,
            "user": user_response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(get_current_user), session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"success": True}

@api_router.post("/auth/upgrade-plan")
async def upgrade_plan(user: User = Depends(get_current_user)):
    await db.users.update_one({"id": user.id}, {"$set": {"plan": "premium"}})
    return {"success": True, "plan": "premium"}

# ==================== ADMIN - PLAN MANAGEMENT ====================

@api_router.post("/admin/plans", response_model=Plan)
async def create_plan(plan: PlanCreate, admin: User = Depends(get_admin_user)):
    plan_data = plan.model_dump()
    plan_obj = Plan(**plan_data)
    doc = plan_obj.model_dump()
    
    # Convert features list to dict format for MongoDB
    doc["features"] = [f.model_dump() for f in plan.features]
    
    await db.plans.insert_one(doc)
    logger.info(f"Plan created by admin {admin.email}: {plan.name}")
    return plan_obj

@api_router.get("/admin/plans", response_model=List[Plan])
async def get_all_plans(admin: User = Depends(get_admin_user)):
    plans = await db.plans.find({}, {"_id": 0}).to_list(1000)
    return [Plan(**p) for p in plans]

@api_router.put("/admin/plans/{plan_id}", response_model=Plan)
async def update_plan(plan_id: str, plan_update: PlanUpdate, admin: User = Depends(get_admin_user)):
    update_data = {k: v for k, v in plan_update.model_dump().items() if v is not None}
    
    if "features" in update_data:
        update_data["features"] = [f.model_dump() for f in update_data["features"]]
    
    await db.plans.update_one({"id": plan_id}, {"$set": update_data})
    updated = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    
    logger.info(f"Plan {plan_id} updated by admin {admin.email}")
    return Plan(**updated)

@api_router.delete("/admin/plans/{plan_id}")
async def delete_plan(plan_id: str, admin: User = Depends(get_admin_user)):
    plan = await db.plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Don't allow deleting if users are using this plan
    users_count = await db.users.count_documents({"plan": plan["name"]})
    if users_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete plan. {users_count} users are using it")
    
    await db.plans.delete_one({"id": plan_id})
    logger.info(f"Plan {plan_id} deleted by admin {admin.email}")
    return {"success": True}

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0}).to_list(10000)
    return [User(**u) for u in users]

@api_router.put("/admin/users/{user_id}/plan")
async def change_user_plan(user_id: str, new_plan: str, admin: User = Depends(get_admin_user)):
    # Verify plan exists
    plan = await db.plans.find_one({"name": new_plan})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    await db.users.update_one({"id": user_id}, {"$set": {"plan": new_plan}})
    logger.info(f"Admin {admin.email} changed user {user_id} to plan {new_plan}")
    return {"success": True, "plan": new_plan}

@api_router.get("/plans/public", response_model=List[Plan])
async def get_public_plans():
    """Get all active plans (public endpoint)"""
    plans = await db.plans.find({"is_active": True}, {"_id": 0}).to_list(1000)
    return [Plan(**p) for p in plans]

@api_router.get("/plans/my-features")
async def get_my_features(user: User = Depends(get_current_user)):
    """Get current user's plan features"""
    plan = await db.plans.find_one({"name": user.plan}, {"_id": 0})
    if not plan:
        return {"features": []}
    return {"features": plan.get("features", [])}

# ==================== COMPANY ENDPOINTS ====================

@api_router.post("/company", response_model=CompanyInfo)
async def create_company(company: CompanyCreate, user: User = Depends(get_current_user)):
    company_data = company.model_dump()
    company_obj = CompanyInfo(user_id=user.id, **company_data)
    doc = company_obj.model_dump()
    await db.companies.insert_one(doc)
    return company_obj

@api_router.get("/company", response_model=CompanyInfo)
async def get_company(user: User = Depends(get_current_user)):
    company = await db.companies.find_one({"user_id": user.id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return CompanyInfo(**company)

@api_router.put("/company/{company_id}", response_model=CompanyInfo)
async def update_company(company_id: str, company: CompanyCreate, user: User = Depends(get_current_user)):
    await db.companies.update_one({"id": company_id, "user_id": user.id}, {"$set": company.model_dump()})
    updated = await db.companies.find_one({"id": company_id}, {"_id": 0})
    return CompanyInfo(**updated)

@api_router.post("/company/upload-logo")
async def upload_logo(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    logo_url = f"data:{file.content_type};base64,{base64_image}"
    
    company = await db.companies.find_one({"user_id": user.id})
    if company:
        await db.companies.update_one({"user_id": user.id}, {"$set": {"logo_url": logo_url}})
    else:
        company_data = {
            "id": str(uuid.uuid4()),
            "user_id": user.id,
            "name": "Minha Empresa",
            "logo_url": logo_url,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.companies.insert_one(company_data)
    
    return {"logo_url": logo_url}

# ==================== CLIENT ENDPOINTS ====================

@api_router.post("/clients", response_model=Client)
async def create_client(client: ClientCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    client_data = client.model_dump()
    client_obj = Client(user_id=user.id, **client_data)
    doc = client_obj.model_dump()
    await db.clients.insert_one(doc)
    return client_obj

@api_router.get("/clients", response_model=List[Client])
async def get_clients(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    clients = await db.clients.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return [Client(**c) for c in clients]

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: User = Depends(get_current_user)):
    await db.clients.delete_one({"id": client_id, "user_id": user.id})
    return {"success": True}

# ==================== BUDGET ENDPOINTS ====================

@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    client = await db.clients.find_one({"id": budget.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    subtotal = sum(item.total for item in budget.items)
    total = subtotal - budget.discount + budget.tax
    
    budget_data = budget.model_dump()
    budget_obj = Budget(
        user_id=user.id,
        client_name=client["name"],
        subtotal=subtotal,
        total=total,
        **budget_data
    )
    doc = budget_obj.model_dump()
    await db.budgets.insert_one(doc)
    return budget_obj

@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    budgets = await db.budgets.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return [Budget(**b) for b in budgets]

@api_router.get("/budgets/{budget_id}/export")
async def export_budget_pdf(budget_id: str, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    budget = await db.budgets.find_one({"id": budget_id, "user_id": user.id}, {"_id": 0})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    company = await db.companies.find_one({"user_id": user.id}, {"_id": 0})
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    
    story = []
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1e40af'), alignment=TA_CENTER)
    
    if company and company.get('logo_url'):
        try:
            if company['logo_url'].startswith('data:'):
                base64_data = company['logo_url'].split(',')[1]
                img_data = base64.b64decode(base64_data)
                img = Image(BytesIO(img_data), width=1.5*inch, height=1.5*inch)
                story.append(img)
                story.append(Spacer(1, 12))
        except:
            pass
    
    story.append(Paragraph("ORÇAMENTO", title_style))
    story.append(Spacer(1, 12))
    
    if company:
        company_info = f"<b>{company.get('name', '')}</b><br/>{company.get('address', '')}<br/>{company.get('phone', '')} | {company.get('email', '')}"
        story.append(Paragraph(company_info, styles['Normal']))
        story.append(Spacer(1, 12))
    
    client_info = f"<b>Cliente:</b> {budget['client_name']}"
    story.append(Paragraph(client_info, styles['Normal']))
    story.append(Spacer(1, 12))
    
    table_data = [['Descrição', 'Qtd', 'Preço Unit.', 'Total']]
    for item in budget['items']:
        table_data.append([
            item['description'],
            str(item['quantity']),
            f"R$ {item['unit_price']:.2f}",
            f"R$ {item['total']:.2f}"
        ])
    
    table = Table(table_data, colWidths=[3.5*inch, 1*inch, 1.2*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    story.append(Spacer(1, 12))
    
    totals_style = ParagraphStyle('Totals', parent=styles['Normal'], alignment=TA_RIGHT, fontSize=12)
    story.append(Paragraph(f"<b>Subtotal:</b> R$ {budget['subtotal']:.2f}", totals_style))
    if budget.get('discount', 0) > 0:
        story.append(Paragraph(f"<b>Desconto:</b> R$ {budget['discount']:.2f}", totals_style))
    if budget.get('tax', 0) > 0:
        story.append(Paragraph(f"<b>Impostos:</b> R$ {budget['tax']:.2f}", totals_style))
    story.append(Paragraph(f"<b>Total:</b> R$ {budget['total']:.2f}", totals_style))
    
    if budget.get('notes'):
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"<b>Observações:</b> {budget['notes']}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=orcamento_{budget_id}.pdf"})

# ==================== PRODUCT ENDPOINTS ====================

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    product_data = product.model_dump()
    product_obj = Product(user_id=user.id, **product_data)
    doc = product_obj.model_dump()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    products = await db.products.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return [Product(**p) for p in products]

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, user: User = Depends(get_current_user)):
    await db.products.update_one({"id": product_id, "user_id": user.id}, {"$set": product.model_dump()})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: User = Depends(get_current_user)):
    await db.products.delete_one({"id": product_id, "user_id": user.id})
    return {"success": True}

@api_router.get("/products/alerts")
async def get_product_alerts(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    products = await db.products.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    alerts = [p for p in products if p['quantity'] <= p['min_quantity']]
    return alerts

# ==================== SUPPLIER ENDPOINTS ====================

@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    supplier_data = supplier.model_dump()
    supplier_obj = Supplier(user_id=user.id, **supplier_data)
    doc = supplier_obj.model_dump()
    await db.suppliers.insert_one(doc)
    return supplier_obj

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    suppliers = await db.suppliers.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return [Supplier(**s) for s in suppliers]

@api_router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str, user: User = Depends(get_current_user)):
    await db.suppliers.delete_one({"id": supplier_id, "user_id": user.id})
    return {"success": True}

# ==================== EMPLOYEE ENDPOINTS ====================

@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    employee_data = employee.model_dump()
    employee_obj = Employee(user_id=user.id, **employee_data)
    doc = employee_obj.model_dump()
    await db.employees.insert_one(doc)
    return employee_obj

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    employees = await db.employees.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return [Employee(**e) for e in employees]

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, user: User = Depends(get_current_user)):
    await db.employees.delete_one({"id": employee_id, "user_id": user.id})
    return {"success": True}

# ==================== STOCK MOVEMENT ENDPOINTS ====================

@api_router.post("/stock-movements", response_model=StockMovement)
async def create_stock_movement(movement: StockMovementCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    product = await db.products.find_one({"id": movement.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    employee_name = None
    if movement.employee_id:
        employee = await db.employees.find_one({"id": movement.employee_id}, {"_id": 0})
        if employee:
            employee_name = employee["name"]
    
    new_quantity = product["quantity"]
    if movement.type == "entrada":
        new_quantity += movement.quantity
    elif movement.type == "saida":
        new_quantity -= movement.quantity
    
    await db.products.update_one({"id": movement.product_id}, {"$set": {"quantity": new_quantity}})
    
    movement_data = movement.model_dump()
    movement_obj = StockMovement(
        user_id=user.id,
        product_name=product["name"],
        employee_name=employee_name,
        **movement_data
    )
    doc = movement_obj.model_dump()
    await db.stock_movements.insert_one(doc)
    return movement_obj

@api_router.get("/stock-movements", response_model=List[StockMovement])
async def get_stock_movements(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    movements = await db.stock_movements.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [StockMovement(**m) for m in movements]

# ==================== SALE ENDPOINTS ====================

@api_router.post("/sales", response_model=Sale)
async def create_sale(sale: SaleCreate, user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    client = await db.clients.find_one({"id": sale.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    total = sum(item.total for item in sale.items)
    
    sale_data = sale.model_dump()
    sale_obj = Sale(
        user_id=user.id,
        client_name=client["name"],
        total=total,
        **sale_data
    )
    doc = sale_obj.model_dump()
    await db.sales.insert_one(doc)
    return sale_obj

@api_router.get("/sales", response_model=List[Sale])
async def get_sales(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    sales = await db.sales.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Sale(**s) for s in sales]

@api_router.get("/sales/analytics")
async def get_sales_analytics(user: User = Depends(get_current_user)):
    if user.plan == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Premium")
    
    sales = await db.sales.find({"user_id": user.id}, {"_id": 0}).to_list(10000)
    
    total_revenue = sum(s["total"] for s in sales)
    total_sales = len(sales)
    avg_ticket = total_revenue / total_sales if total_sales > 0 else 0
    
    client_totals = {}
    for sale in sales:
        client_name = sale["client_name"]
        client_totals[client_name] = client_totals.get(client_name, 0) + sale["total"]
    
    top_clients = sorted(client_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_revenue": total_revenue,
        "total_sales": total_sales,
        "avg_ticket": avg_ticket,
        "top_clients": [{"name": name, "total": total} for name, total in top_clients]
    }

from datetime import timedelta

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()