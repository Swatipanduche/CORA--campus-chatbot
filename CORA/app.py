from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime, timedelta

app = Flask(__name__)

def load_json(fname):
    with open(f"data/{fname}", encoding="utf-8") as f:
        return json.load(f)

timetable = load_json("timetable.json")
teachers = load_json("teachers.json")
lunch = load_json("lunch.json")
map_data = load_json("map.json")
notices = load_json("notices.json")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/form")
def form():
    return render_template("form.html")

@app.route("/submit_grievance", methods=["POST"])
def submit_grievance():
    name = request.form['name']
    category = request.form['category']
    complaint = request.form['complaint']

    with open("data/grievances.txt", "a", encoding='utf-8') as f:
        f.write(f"{name} - {category} - {complaint}\n\n")

    return "<h3>✅ Thank you! Your grievance has been submitted.</h3>"

def parse_date(msg):
    day_names = ["monday","tuesday","wednesday","thursday","friday","saturday"]
    for d in day_names:
        if d in msg:
            return d.capitalize()
    if "tomorrow" in msg:
        return (datetime.today() + timedelta(days=1)).strftime("%A")
    return None

@app.route("/chat", methods=["POST"])
def chat():
    msg = request.json["message"].lower()
    day = parse_date(msg)
    dep = next((d for d in timetable if d.lower() in msg), None)
    yr = next((y for y in ["1st year","2nd year","3rd year","4th year"] if y in msg), None)

    if "timetable" in msg:
        if not dep:
            return jsonify({"reply": "Which department? (CSE, AIML, AIDS, Cyber Security)"})
        if not yr:
            return jsonify({"reply": f"{dep} selected. Now please mention the year (1st year/2nd year/3rd year/4th year)."})
        d = day or datetime.today().strftime("%A")
        sd = d.capitalize()
        sched = timetable.get(dep, {}).get(yr, {}).get(sd)
        if sched:
            resp = f"📅 {dep} {yr} - {sd} Timetable:\n"
            resp += "\n".join([f"{e['time']} – {e['subject']} (Room: {e['room']})" for e in sched])
            return jsonify({"reply": resp})
        return jsonify({"reply": f"No schedule found for {dep} {yr} on {sd}."})

    if "class teacher" in msg or "teacher" in msg:
        if not dep or not yr:
            return jsonify({"reply": "Mention department and year to get the class teacher."})
        teacher = teachers.get(dep, {}).get(yr)
        return jsonify({"reply": f"👩‍🏫 {dep} {yr} class teacher: {teacher}"})

    if "lunch" in msg:
        d = day or datetime.today().strftime("%A")
        menu = lunch.get(d)
        return jsonify({"reply": f"🍽️ Lunch menu for {d}:\n" + ("; ".join(menu) if menu else "No menu found.")})

    if "notice" in msg:
        return jsonify({"reply": "📢 Notices:\n" + "\n".join(notices.get("notices", []))})

    if "where is" in msg or "location" in msg:
        place = msg.split("where is")[-1].strip() or msg.split("location")[-1].strip()
        for key, val in map_data["locations"].items():
            if key.lower() in place:
                return jsonify({"reply": f"📍 {key}: {val}"})
        return jsonify({"reply": "Location not found."})

    if "grievance" in msg or "complaint" in msg:
        return jsonify({"reply": "📝 Please submit your grievance <a href='/form' target='_blank'>here</a>."})

    return jsonify({"reply": "Hi! I’m CORA 🤖. Ask me timetable, lunch, teacher, map, notices, or complaints."})

if __name__ == "__main__":
    app.run(debug=True)
