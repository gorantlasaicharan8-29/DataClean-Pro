"""Generate a realistic sample Employee dataset with intentional quality issues."""

from __future__ import annotations

import numpy as np
import pandas as pd


def generate_sample_dataset() -> pd.DataFrame:
    """Return a ~500-row Employee DataFrame with realistic data-quality problems.

    Fixed seed (42) guarantees reproducibility.
    """
    rng = np.random.RandomState(42)
    n = 500

    # ── Base columns ──────────────────────────────────────────────────────
    employee_ids = [f"EMP{str(i).zfill(3)}" for i in range(1, n + 1)]

    first_names = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Sai",
        "Arnav", "Dhruv", "Kabir", "Ananya", "Diya", "Myra", "Sara", "Aadhya",
        "Isha", "Kiara", "Riya", "Anika", "Neha", "Priya", "Rahul", "Amit",
        "Suresh", "Pooja", "Sneha", "Vikram", "Kiran", "Deepa", "Rohan",
        "Manish", "Kavita", "Sunita", "Rajesh", "Meera", "Lakshmi", "Nandini",
        "Harish", "Gauri", "Divya", "Akash", "Nikhil", "Swati", "Tanvi",
        "Varun", "Shreya", "Pranav", "Ishaan", "Ritika", "Siddharth",
    ]
    last_names = [
        "Sharma", "Patel", "Reddy", "Kumar", "Singh", "Nair", "Das",
        "Gupta", "Joshi", "Rao", "Iyer", "Mehta", "Shah", "Pillai",
        "Verma", "Desai", "Bhat", "Menon", "Srinivas", "Chatterjee",
        "Banerjee", "Mishra", "Pandey", "Agarwal", "Chopra",
    ]
    names = [
        f"{rng.choice(first_names)} {rng.choice(last_names)}" for _ in range(n)
    ]

    ages = rng.randint(22, 61, size=n).astype(float)
    # Inject outlier ages
    outlier_age_indices = rng.choice(n, 5, replace=False)
    ages[outlier_age_indices] = [5, 95, 100, 3, 88]
    # Inject missing ages
    missing_age_indices = rng.choice(
        [i for i in range(n) if i not in outlier_age_indices], 15, replace=False
    )
    ages[missing_age_indices] = np.nan

    genders = rng.choice(["Male", "Female", "Other"], size=n, p=[0.45, 0.45, 0.10])

    departments_clean = ["IT", "HR", "Finance", "Sales", "Marketing", "Operations"]
    # Introduce mixed-case issues
    departments_pool = departments_clean + [
        "  IT", "it", " HR ", "finance", "SALES", "marketing ",
        " Operations", "  Finance ", "hr",
    ]
    departments = rng.choice(departments_pool, size=n)

    experience = rng.randint(0, 36, size=n).astype(float)
    missing_exp_indices = rng.choice(n, 10, replace=False)
    experience[missing_exp_indices] = np.nan

    salary = rng.randint(25000, 150001, size=n).astype(float)
    # Inject extreme salary outliers
    outlier_sal_indices = rng.choice(n, 8, replace=False)
    salary[outlier_sal_indices] = [
        500000, 1000000, 750000, 900000, 600000, 1200000, 800000, 950000,
    ]
    missing_sal_indices = rng.choice(
        [i for i in range(n) if i not in outlier_sal_indices], 10, replace=False
    )
    salary[missing_sal_indices] = np.nan

    performance = rng.randint(1, 11, size=n).astype(float)
    missing_perf_indices = rng.choice(n, 10, replace=False)
    performance[missing_perf_indices] = np.nan

    cities_clean = [
        "Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Pune",
    ]
    cities_pool = cities_clean + [
        " Chennai", "chennai", "BENGALURU", "  Hyderabad",
        "mumbai ", " Delhi ", "pune", "  Pune ",
    ]
    cities = rng.choice(cities_pool, size=n)

    start = pd.Timestamp("2010-01-01")
    end = pd.Timestamp("2024-12-31")
    days_range = (end - start).days
    joining_dates = [
        (start + pd.Timedelta(days=int(rng.randint(0, days_range)))).strftime(
            "%Y-%m-%d"
        )
        for _ in range(n)
    ]

    # ── Build DataFrame ───────────────────────────────────────────────────
    df = pd.DataFrame(
        {
            "Employee_ID": employee_ids,
            "Name": names,
            "Age": ages,
            "Gender": genders,
            "Department": departments,
            "Experience_Years": experience,
            "Salary": salary,
            "Performance_Score": performance,
            "City": cities,
            "Joining_Date": joining_dates,
        }
    )

    # ── Inject ~20 exact duplicate rows ───────────────────────────────────
    dup_indices = rng.choice(n, 20, replace=False)
    duplicates = df.iloc[dup_indices].copy()
    df = pd.concat([df, duplicates], ignore_index=True)

    # Shuffle so duplicates are scattered
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    return df
