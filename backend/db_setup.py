import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), 'sentinel.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    conn = get_db_connection()
    cursor = conn.cursor()

    # Drop existing tables to ensure clean slate
    cursor.execute("DROP TABLE IF EXISTS employees")
    cursor.execute("DROP TABLE IF EXISTS activity_logs")
    cursor.execute("DROP TABLE IF EXISTS alerts")
    cursor.execute("DROP TABLE IF EXISTS incidents")

    # Create employees table
    cursor.execute("""
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        risk_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        last_activity TEXT,
        last_location TEXT DEFAULT 'Office'
    )
    """)

    # Create activity_logs table
    cursor.execute("""
    CREATE TABLE activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        activity TEXT NOT NULL,
        details TEXT,
        location TEXT,
        timestamp TEXT,
        risk_score_added INTEGER DEFAULT 0,
        risk_score_after INTEGER DEFAULT 0,
        risk_level TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
    """)

    # Create alerts table
    cursor.execute("""
    CREATE TABLE alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        threat_level TEXT NOT NULL,
        reason TEXT NOT NULL,
        timestamp TEXT,
        recommended_action TEXT,
        status TEXT DEFAULT 'Active',
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
    """)

    # Create incidents table
    cursor.execute("""
    CREATE TABLE incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        action_performed TEXT NOT NULL,
        timestamp TEXT,
        risk_score INTEGER NOT NULL,
        threat_level TEXT NOT NULL,
        ai_explanation TEXT,
        recommended_action TEXT,
        status TEXT DEFAULT 'New',
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
    """)

    # Seed Employees
    employees = [
        ("John Doe", "IT Support", "Employee", 10, "Active", "View Customer Records", "Office"),
        ("Sarah Jenkins", "Wealth Management", "Employee", 25, "Active", "Office Login", "Office"),
        ("Michael Chen", "Commercial Banking", "Employee", 15, "Active", "Export Excel Report", "Office"),
        ("Elena Rostova", "Treasury & FX", "Employee", 5, "Active", "Office Login", "Office"),
        ("Marcus Brody", "Retail Banking", "Employee", 45, "Flagged", "USB Device Connected", "Office"),
        ("Alice Cyber", "Cybersecurity", "Security Admin", 0, "Active", "System Monitor", "Office")
    ]

    for name, dept, role, risk, status, last_act, last_loc in employees:
        cursor.execute("""
        INSERT INTO employees (name, department, role, risk_score, status, last_activity, last_location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, dept, role, risk, status, last_act, last_loc))
    
    conn.commit()

    # Get employee IDs mapping
    cursor.execute("SELECT id, name FROM employees")
    emp_map = {row['name']: row['id'] for row in cursor.fetchall()}

    # Seed Activity Logs (Historical baseline)
    now = datetime.now()
    historical_logs = [
        ("John Doe", "Office Login", "Logged in from HQ Office IP", "Office", now - timedelta(hours=5), 0, 10, "Low"),
        ("John Doe", "View Customer Records", "Viewed customer credit profiles", "Office", now - timedelta(hours=4), 0, 10, "Low"),
        
        ("Sarah Jenkins", "Office Login", "Logged in from HQ Office IP", "Office", now - timedelta(hours=6), 0, 0, "Low"),
        ("Sarah Jenkins", "Download Customer Data", "Downloaded 120 customer data sheets", "Office", now - timedelta(hours=5), 10, 10, "Low"),
        ("Sarah Jenkins", "Export Excel Report", "Exported monthly wealth report", "Office", now - timedelta(hours=3), 15, 25, "Low"),
        
        ("Michael Chen", "Office Login", "Logged in from HQ Office IP", "Office", now - timedelta(hours=8), 0, 0, "Low"),
        ("Michael Chen", "Update Customer Information", "Updated details for Account #9872", "Office", now - timedelta(hours=7), 5, 5, "Low"),
        ("Michael Chen", "Export Excel Report", "Exported corporate accounts summary", "Office", now - timedelta(hours=4), 10, 15, "Low"),
        
        ("Elena Rostova", "Office Login", "Logged in from HQ Office IP", "Office", now - timedelta(hours=2), 0, 5, "Low"),
        
        ("Marcus Brody", "Office Login", "Logged in from HQ Office IP", "Office", now - timedelta(hours=9), 0, 0, "Low"),
        ("Marcus Brody", "USB Device Connected", "Connected unverified Kingston USB storage", "Office", now - timedelta(hours=7), 35, 35, "Medium"),
        ("Marcus Brody", "Access Database", "Queried high-net-worth customers table", "Office", now - timedelta(hours=6), 10, 45, "Medium")
    ]

    for emp_name, activity, details, loc, timestamp, added, after, lvl in historical_logs:
        emp_id = emp_map[emp_name]
        cursor.execute("""
        INSERT INTO activity_logs (employee_id, activity, details, location, timestamp, risk_score_added, risk_score_after, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (emp_id, activity, details, loc, timestamp.strftime("%Y-%m-%d %H:%M:%S"), added, after, lvl))

    # Seed Alerts for historical high activity
    cursor.execute("""
    INSERT INTO alerts (employee_id, threat_level, reason, timestamp, recommended_action, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        emp_map["Marcus Brody"], 
        "Medium", 
        "Connected unverified USB storage device", 
        (now - timedelta(hours=7)).strftime("%Y-%m-%d %H:%M:%S"), 
        "Audit USB serial number, scan device remotely.",
        "Active"
    ))

    conn.commit()
    conn.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    init_db()
