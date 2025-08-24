# seed_machines()
from models import db, Machine

def seed_machines():
    machines = [
        Machine(machine_id="MX100", name="Compact Power Unit", type="Electrical", status="available"),
        Machine(machine_id="MX200", name="Thermal Scanner", type="Diagnostic", status="operational"),
        Machine(machine_id="MX201", name="Smart Control Panel", type="Control", status="maintenance"),
        Machine(machine_id="MX202", name="Signal Converter", type="Communication", status="available"),
        Machine(machine_id="MX300", name="Onsite Voltage Monitor", type="Power", status="operational"),
        Machine(machine_id="MX301", name="Data Logger", type="Monitoring", status="operational"),
        Machine(machine_id="MX302", name="Environment Sensor", type="Sensor", status="available"),
        Machine(machine_id="MX303", name="Remote Relay Module", type="Automation", status="maintenance"),
        Machine(machine_id="MX304", name="Field Network Gateway", type="Networking", status="available"),
        Machine(machine_id="MX305", name="Multiport Switch", type="Network", status="operational")
    ]
    db.session.add_all(machines)