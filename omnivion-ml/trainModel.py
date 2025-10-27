# ==========================
# 📦 Imports
# ==========================
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import StackingClassifier, RandomForestClassifier, ExtraTreesClassifier
from sklearn.utils.class_weight import compute_sample_weight
from imblearn.over_sampling import SMOTE

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

# ==========================
# Step 1: Data Preparation
# ==========================
X = df.drop(columns=['dropout'])
y = df['dropout']

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Handle imbalance with SMOTE
sm = SMOTE(random_state=42)
X_res, y_res = sm.fit_resample(X_scaled, y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_res, y_res, test_size=0.2, random_state=42, stratify=y_res
)

# Compute sample weights
sample_weights = compute_sample_weight(class_weight='balanced', y=y_train)

# ==========================
# Step 2: Base Models
# ==========================
xgb = XGBClassifier(
    n_estimators=600,
    learning_rate=0.03,
    max_depth=9,
    subsample=0.9,
    colsample_bytree=0.8,
    gamma=0.2,
    reg_lambda=1.5,
    eval_metric='logloss',
    random_state=42,
    tree_method='hist'
)

lgb = LGBMClassifier(
    n_estimators=600,
    learning_rate=0.03,
    max_depth=9,
    subsample=0.9,
    colsample_bytree=0.8,
    reg_lambda=1.5,
    random_state=42
)

cat = CatBoostClassifier(
    iterations=600,
    learning_rate=0.03,
    depth=9,
    l2_leaf_reg=1.5,
    verbose=0,
    random_seed=42
)

rf = RandomForestClassifier(
    n_estimators=400,
    max_depth=14,
    min_samples_split=5,
    class_weight='balanced_subsample',
    random_state=42
)

et = ExtraTreesClassifier(
    n_estimators=400,
    max_depth=14,
    min_samples_split=5,
    class_weight='balanced_subsample',
    random_state=42
)

# ==========================
# Step 3: Stacking Ensemble (Meta = XGB)
# ==========================
estimators = [
    ('xgb', xgb),
    ('lgb', lgb),
    ('cat', cat),
    ('rf', rf),
    ('et', et)
]

meta_model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=5,
    subsample=0.9,
    colsample_bytree=0.8,
    eval_metric='logloss',
    random_state=42,
    tree_method='hist'
)

stack_model = StackingClassifier(
    estimators=estimators,
    final_estimator=meta_model,
    passthrough=True,  # allows meta-model to use both base preds + features
    cv=5,
    n_jobs=-1
)

# ==========================
# Step 4: Train & Evaluate
# ==========================
stack_model.fit(X_train, y_train, sample_weight=sample_weights)
y_pred = stack_model.predict(X_test)

print("✅ Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))