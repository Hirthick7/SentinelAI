import sqlite3
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'sentinel.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Helper function to classify risk levels
def get_risk_level(score):
    if score <= 30:
        return 'Low'
    elif score <= 60:
        return 'Medium'
    elif score <= 80:
        return 'High'
    else:
        return 'Critical'

# AI Explanation Generator
def generate_ai_explanation(employee, activity, location, details, current_score, prev_score):
    name = employee['name']
    dept = employee['department']
    role = employee['role']
    time_str = datetime.now().strftime("%I:%M %p")
    
    # Base facts for mock normal profile
    normal_times = "9:00 AM and 6:00 PM"
    normal_loc = "HQ Office (Chennai)"
    normal_volume = "fewer than 20 files per day"
    
    explanations = []
    
    if location != 'Office':
        explanations.append(f"the account logged in from an unknown location ({location}) at {time_str}")
    
    if "Download" in activity:
        explanations.append(f"downloaded an unusually high volume of customer records ({details})")
    
    if "Delete" in activity:
        explanations.append("attempted to delete core customer database entries")
    
    if "Escalation" in activity or "Permissions" in activity:
        explanations.append("attempted unauthorized permission escalation to Administrator level")
        
    if "USB" in activity:
        explanations.append("connected an unverified USB mass storage device to a terminal containing sensitive customer data")
        
    if "Failed" in activity:
        explanations.append("exhibited multiple consecutive failed login attempts indicating potential brute-force or credential stuffing")
        
    if "Database" in activity:
        explanations.append("attempted direct SQL query modifications on the production database")

    # Combine into a premium human-readable summary
    if not explanations:
        explanations.append(f"performed '{activity}' action ({details})")

    explanation_str = " and ".join(explanations)
    
    summary = (
        f"{name} usually logs in from {normal_loc} between {normal_times} and accesses {normal_volume}. "
        f"Today, {explanation_str}. "
        f"This behavior is highly abnormal for a {role} in the {dept} department. "
        f"The threat level has escalated to {get_risk_level(current_score)} with a risk score of {current_score}/100."
    )
    return summary

# Recommended Action Generator
def get_recommended_action(activity, risk_level):
    if risk_level == 'Critical':
        return "IMMEDIATE ACTION: Revoke all Active Directory permissions, terminate active sessions, block remote IP address, and notify Security Operations Center (SOC) on-duty manager."
    elif risk_level == 'High':
        return "URGENT: Flag account for review, temporarily suspend database access keys, and mandate multi-factor re-verification."
    elif risk_level == 'Medium':
        return "Monitor closely. Log all subsequent actions, trigger visual alerts on SOC dashboards, and run automated anti-malware scan."
    else:
        return "Log action and update user profile baseline. No immediate intervention required."

@app.route('/api/employees', methods=['GET'])
def get_employees():
    conn = get_db_connection()
    employees = conn.execute('SELECT * FROM employees').fetchall()
    conn.close()
    return jsonify([dict(emp) for emp in employees])

@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = get_db_connection()
    query = """
        SELECT l.*, e.name as employee_name, e.department, e.role 
        FROM activity_logs l
        JOIN employees e ON l.employee_id = e.id
        ORDER BY l.id DESC
    """
    logs = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(log) for log in logs])

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    query = """
        SELECT a.*, e.name as employee_name, e.department, e.role
        FROM alerts a
        JOIN employees e ON a.employee_id = e.id
        ORDER BY a.id DESC
    """
    alerts = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(alert) for alert in alerts])

@app.route('/api/alerts/resolve/<int:alert_id>', methods=['POST'])
def resolve_alert(alert_id):
    conn = get_db_connection()
    conn.execute("UPDATE alerts SET status = 'Resolved' WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    conn = get_db_connection()
    query = """
        SELECT i.*, e.name as employee_name, e.department, e.role
        FROM incidents i
        JOIN employees e ON i.employee_id = e.id
        ORDER BY i.id DESC
    """
    incidents = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(inc) for inc in incidents])

@app.route('/api/incidents/update-status/<int:incident_id>', methods=['POST'])
def update_incident_status(incident_id):
    status = request.json.get('status', 'Investigating')
    conn = get_db_connection()
    conn.execute("UPDATE incidents SET status = ? WHERE id = ?", (status, incident_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/simulate-action', methods=['POST'])
def simulate_action():
    data = request.get_json() or {}
    employee_id = data.get('employee_id')
    activity = data.get('activity')
    location = data.get('location', 'Office')
    details = data.get('details', '')
    
    # Custom handles for attack simulator
    is_simulator = data.get('is_simulator', False)
    simulation_score = data.get('simulation_score', None)

    if not employee_id or not activity:
        return jsonify({"error": "Missing employee_id or activity"}), 400

    conn = get_db_connection()
    employee = conn.execute('SELECT * FROM employees WHERE id = ?', (employee_id,)).fetchone()
    if not employee:
        conn.close()
        return jsonify({"error": "Employee not found"}), 404

    # 403 Lockout check
    # Check if employee is flagged or score >= 100
    # Bypass check if it is a simulator resetting to a baseline score (< 100)
    is_reset = is_simulator and simulation_score is not None and simulation_score < 100
    if (employee['status'] == 'Flagged' or employee['risk_score'] >= 100) and not is_reset:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Employee account locked due to critical insider threat."
        }), 403

    prev_score = employee['risk_score']

    # AI Threat Engine Risk Logic
    points_to_add = 0
    
    # 1. Location points
    if location == 'Remote VPN':
        points_to_add += 10
    elif location == 'Unknown Location':
        points_to_add += 30
    elif location in ['Chennai Head Office', 'Bangalore Branch', 'Mumbai Branch', 'Hyderabad Branch', 'Office']:
        points_to_add += 0
    else:
        # Fallback for simulator locations or custom strings
        if 'VPN' in location or 'Tor' in location or 'Remote' in location:
            points_to_add += 10
        elif 'Unknown' in location:
            points_to_add += 30
        else:
            points_to_add += 0
        
    # 2. Timing (Late night check)
    is_late_night = data.get('is_late_night', False)
    if is_late_night:
        points_to_add += 20
        
    # 3. Action weightings
    if activity == "Download Customer Data":
        records = data.get('records_count', 0)
        if records > 500:
            points_to_add += 30
        else:
            points_to_add += 10
    elif activity == "Delete Customer Records":
        points_to_add += 40
    elif activity == "Failed Login":
        points_to_add += 20
    elif activity == "Change Permissions" or activity == "Privilege Escalation":
        points_to_add += 50
    elif activity == "USB Device Connected":
        points_to_add += 35
    elif activity == "Access Database":
        points_to_add += 25
    elif activity == "Update Customer Information":
        points_to_add += 10
    elif activity == "Export Excel Report":
        points_to_add += 15
    elif activity == "Login":
        points_to_add = 0
    elif activity == "Logout":
        points_to_add = 0

    if is_simulator and simulation_score is not None:
        new_score = simulation_score
        points_added = new_score - prev_score
    else:
        # Normal score increments, capped at 100, minimum 0
        new_score = min(max(prev_score + points_to_add, 0), 100)
        points_added = new_score - prev_score

    threat_level = get_risk_level(new_score)
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Location to IP mapping update
    loc_ip_map = {
        'Chennai Head Office': '10.10.20.14',
        'Bangalore Branch': '10.10.30.22',
        'Mumbai Branch': '10.10.40.45',
        'Hyderabad Branch': '10.10.50.12',
        'Remote VPN': '172.16.8.102',
        'Unknown Location': '198.51.100.74'
    }
    ip_address = loc_ip_map.get(location, employee['ip_address'] or '10.10.20.14')

    # Update last login time
    last_login = employee['last_login']
    if activity == "Login":
        last_login = timestamp_str

    # Update Lock metadata if flagged/locked
    new_status = 'Flagged' if new_score >= 60 else 'Active'
    lock_reason = employee['lock_reason']
    lock_time = employee['lock_time']
    if new_status == 'Flagged' or new_score >= 100:
        if not lock_reason:
            lock_time = timestamp_str
            lock_reason = f"Threat score of {new_score}/100 reached via '{activity}' activity."
            if activity == "USB Device Connected":
                lock_reason = "Unverified USB mass storage device connected."
            elif activity == "Failed Login":
                lock_reason = "Multiple consecutive authentication failures detected."
            elif activity == "Download Customer Data" and data.get('records_count', 0) > 500:
                lock_reason = f"Mass data extraction: Downloaded {data.get('records_count')} records."
            elif activity == "Change Permissions" or activity == "Privilege Escalation":
                lock_reason = "Unauthorized permission escalation attempt."

    # Update Employee
    conn.execute("""
        UPDATE employees 
        SET risk_score = ?, last_activity = ?, last_location = ?, status = ?, 
            ip_address = ?, lock_reason = ?, lock_time = ?, last_login = ?
        WHERE id = ?
    """, (new_score, activity, location, new_status, ip_address, lock_reason, lock_time, last_login, employee_id))

    # Insert Activity Log
    conn.execute("""
        INSERT INTO activity_logs (employee_id, activity, details, location, timestamp, risk_score_added, risk_score_after, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (employee_id, activity, details or f"Performed {activity} activity", location, timestamp_str, points_added, new_score, threat_level))

    # Trigger Alerts automatically (Risk score increased, or exceeds Medium range)
    if new_score >= 31 and points_added > 0:
        alert_reason = f"Unusual activity '{activity}' leading to {threat_level} risk score ({new_score})."
        if activity == "USB Device Connected":
            alert_reason = "Unverified USB mass storage device connected."
        elif activity == "Failed Login":
            alert_reason = "Multiple consecutive authentication failures detected."
        elif activity == "Download Customer Data" and data.get('records_count', 0) > 500:
            alert_reason = f"Mass data extraction: Downloaded {data.get('records_count')} records."

        conn.execute("""
            INSERT INTO alerts (employee_id, threat_level, reason, timestamp, recommended_action, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (employee_id, threat_level, alert_reason, timestamp_str, get_recommended_action(activity, threat_level), 'Active'))

    # Generate Incident Report if Risk Score exceeds 70
    if new_score >= 71:
        # Create AI explanation
        ai_exp = generate_ai_explanation(employee, activity, location, details, new_score, prev_score)
        rec_act = get_recommended_action(activity, threat_level)
        
        conn.execute("""
            INSERT INTO incidents (employee_id, action_performed, timestamp, risk_score, threat_level, ai_explanation, recommended_action, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (employee_id, activity, timestamp_str, new_score, threat_level, ai_exp, rec_act, 'New'))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "new_score": new_score,
        "threat_level": threat_level,
        "points_added": points_added
    })

@app.route('/api/employees/unlock/<int:employee_id>', methods=['POST'])
def unlock_employee(employee_id):
    try:
        conn = get_db_connection()
        conn.execute("""
            UPDATE employees 
            SET status = 'Active', risk_score = 0, lock_reason = NULL, lock_time = NULL 
            WHERE id = ?
        """, (employee_id,))
        
        timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute("""
            INSERT INTO activity_logs (employee_id, activity, details, location, timestamp, risk_score_added, risk_score_after, risk_level)
            VALUES (?, 'Account Unlocked', 'Security Admin manually unlocked the account.', 'Security Control Center', ?, 0, 0, 'Low')
        """, (employee_id, timestamp_str))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Employee successfully unlocked."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_system():
    # Re-initialize DB to original values
    try:
        from db_setup import init_db
        init_db()
        return jsonify({"success": True, "message": "System database reset successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Ensure database exists
    if not os.path.exists(DB_PATH):
        print("Database not found. Creating and seeding...")
        from db_setup import init_db
        init_db()
    
    app.run(port=5000, debug=True)
